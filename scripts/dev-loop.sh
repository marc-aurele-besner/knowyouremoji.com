#!/bin/bash
# dev-loop.sh - Continuous development loop using Claude Code
#
# Runs build (issue implementation) and merge (PR review/merge) commands
# in a continuous loop with streaming output.
#
# Usage:
#   ./scripts/dev-loop.sh              # Run both build and merge in loop
#   ./scripts/dev-loop.sh --build      # Run only build phase
#   ./scripts/dev-loop.sh --merge      # Run only merge phase
#   ./scripts/dev-loop.sh --once       # Run one cycle then exit
#   ./scripts/dev-loop.sh --delay 10   # Set delay between cycles (default: 5s)
#   ./scripts/dev-loop.sh --max-failures 5  # Exit after N consecutive failures (default: 3)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMMANDS_DIR="$PROJECT_ROOT/.claude/commands"
LOGS_DIR="$PROJECT_ROOT/.claude/.logs"
DELAY_SECONDS=5
RUN_BUILD=true
RUN_MERGE=true
SINGLE_CYCLE=false
MAX_CONSECUTIVE_FAILURES=3

# Track if we're currently running a command (for signal handling)
CURRENT_PID=""
CURRENT_SESSION_ID=""

# Ensure logs directory exists
ensure_logs_dir() {
    mkdir -p "$LOGS_DIR"
}

# Generate a unique session ID
generate_session_id() {
    local phase="$1"
    local timestamp
    timestamp=$(date '+%Y%m%d_%H%M%S')
    local random_suffix
    random_suffix=$(head -c 4 /dev/urandom | xxd -p)
    echo "${timestamp}_${phase}_${random_suffix}"
}

# Print banner
print_banner() {
    echo ""
    echo -e "${MAGENTA}${BOLD}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}${BOLD}║      Dev Loop - Continuous Development    ║${NC}"
    echo -e "${MAGENTA}${BOLD}╚═══════════════════════════════════════════╝${NC}"
    echo ""
}

# Print help
print_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Runs Claude Code commands in a continuous development loop."
    echo ""
    echo "Options:"
    echo "  --build          Run only the build (issue implementation) phase"
    echo "  --merge          Run only the merge (PR review/merge) phase"
    echo "  --once           Run one cycle then exit (no loop)"
    echo "  --delay N        Delay N seconds between cycles (default: 5)"
    echo "  --max-failures N Exit after N consecutive failures (default: 3)"
    echo "  -h, --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                       # Full loop: build -> merge -> repeat"
    echo "  $0 --build --once        # Single build cycle"
    echo "  $0 --merge               # Continuous merge loop"
    echo "  $0 --delay 30            # 30 second delay between cycles"
    echo "  $0 --max-failures 5      # Allow up to 5 consecutive failures"
    echo ""
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --build)
                RUN_BUILD=true
                RUN_MERGE=false
                shift
                ;;
            --merge)
                RUN_BUILD=false
                RUN_MERGE=true
                shift
                ;;
            --once)
                SINGLE_CYCLE=true
                shift
                ;;
            --delay)
                DELAY_SECONDS="$2"
                shift 2
                ;;
            --max-failures)
                MAX_CONSECUTIVE_FAILURES="$2"
                shift 2
                ;;
            -h|--help)
                print_help
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                print_help
                exit 1
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    echo -e "${CYAN}Checking prerequisites...${NC}"

    # Check for Claude CLI
    if ! command -v claude &> /dev/null; then
        echo -e "${RED}Error: Claude CLI not found${NC}"
        echo "Install with: npm install -g @anthropic-ai/claude-code"
        exit 1
    fi

    # Check for command files
    if [[ "$RUN_BUILD" == true && ! -f "$COMMANDS_DIR/build.md" ]]; then
        echo -e "${RED}Error: Build command not found at $COMMANDS_DIR/build.md${NC}"
        exit 1
    fi

    if [[ "$RUN_MERGE" == true && ! -f "$COMMANDS_DIR/merge.md" ]]; then
        echo -e "${RED}Error: Merge command not found at $COMMANDS_DIR/merge.md${NC}"
        exit 1
    fi

    # Check for gh CLI
    if ! command -v gh &> /dev/null; then
        echo -e "${YELLOW}Warning: GitHub CLI (gh) not found - some operations may fail${NC}"
    fi

    echo -e "${GREEN}✓ Prerequisites OK${NC}"
    echo ""
}

# Signal handler for graceful shutdown
cleanup() {
    echo ""
    echo -e "${YELLOW}Received interrupt signal, shutting down gracefully...${NC}"

    if [[ -n "$CURRENT_PID" ]] && kill -0 "$CURRENT_PID" 2>/dev/null; then
        echo -e "${CYAN}Waiting for current command to finish...${NC}"
        wait "$CURRENT_PID" 2>/dev/null || true
    fi

    echo -e "${GREEN}Dev loop stopped.${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if there are open issues
check_open_issues() {
    local issue_count
    issue_count=$(gh issue list --state open --limit 1 --json number 2>/dev/null | grep -c "number" || echo "0")

    if [[ "$issue_count" -eq 0 ]]; then
        return 1  # No open issues
    fi
    return 0  # Has open issues
}

# Write session log to JSON file
write_session_log() {
    local session_id="$1"
    local phase_name="$2"
    local start_time="$3"
    local end_time="$4"
    local exit_code="$5"
    local output_file="$6"
    local log_file="$LOGS_DIR/${session_id}.json"

    local duration=$((end_time - start_time))
    local start_iso
    start_iso=$(date -r "$start_time" '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || date -d "@$start_time" '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || echo "$start_time")
    local end_iso
    end_iso=$(date -r "$end_time" '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || date -d "@$end_time" '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || echo "$end_time")

    # Process stream-json output file to extract structured data
    # The output file contains JSON lines (one JSON object per line)
    if [[ -f "$output_file" ]]; then
        python3 - "$output_file" "$log_file" "$session_id" "$phase_name" "$start_iso" "$end_iso" "$duration" "$exit_code" << 'PYTHON_SCRIPT'
import sys
import json

output_file = sys.argv[1]
log_file = sys.argv[2]
session_id = sys.argv[3]
phase_name = sys.argv[4]
start_iso = sys.argv[5]
end_iso = sys.argv[6]
duration = int(sys.argv[7])
exit_code = int(sys.argv[8])

# Parse stream-json lines
events = []
messages = []
final_result = None
claude_session_id = None

with open(output_file, 'r') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            event = json.loads(line)
            events.append(event)

            event_type = event.get('type', '')

            # Capture session ID from init or result
            if event_type == 'system' and 'session_id' in event:
                claude_session_id = event.get('session_id')
            elif event_type == 'result':
                final_result = event
                if 'session_id' in event:
                    claude_session_id = event.get('session_id')
            elif event_type == 'assistant':
                messages.append(event.get('message', {}))

        except json.JSONDecodeError:
            # Skip non-JSON lines
            pass

# Build final log structure
log_data = {
    "sessionId": session_id,
    "claudeSessionId": claude_session_id,
    "phase": phase_name,
    "startTime": start_iso,
    "endTime": end_iso,
    "durationSeconds": duration,
    "exitCode": exit_code,
    "status": "success" if exit_code == 0 else "failed",
    "result": final_result,
    "messages": messages,
    "streamEvents": events
}

with open(log_file, 'w') as f:
    json.dump(log_data, f, indent=2, ensure_ascii=False)

PYTHON_SCRIPT
    else
        # Fallback if output file doesn't exist
        cat > "$log_file" << EOF
{
  "sessionId": "$session_id",
  "claudeSessionId": null,
  "phase": "$phase_name",
  "startTime": "$start_iso",
  "endTime": "$end_iso",
  "durationSeconds": $duration,
  "exitCode": $exit_code,
  "status": "$([ $exit_code -eq 0 ] && echo "success" || echo "failed")",
  "result": null,
  "messages": [],
  "streamEvents": []
}
EOF
    fi

    echo "$log_file"
}

# Run a Claude command with streaming output
run_claude_command() {
    local phase_name="$1"
    local prompt_file="$2"

    # Generate session ID for this run
    local phase_slug
    phase_slug=$(echo "$phase_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr -cd '[:alnum:]_')
    CURRENT_SESSION_ID=$(generate_session_id "$phase_slug")

    # Ensure logs directory exists
    ensure_logs_dir

    # Create temporary file for capturing output
    local temp_output_file
    temp_output_file=$(mktemp)

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}${BOLD}  Phase: $phase_name${NC}"
    echo -e "${BLUE}${BOLD}  Session ID: ${CYAN}$CURRENT_SESSION_ID${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    local prompt
    prompt=$(cat "$prompt_file")

    local start_time
    start_time=$(date +%s)

    # Create stream parser script
    local parser_script
    parser_script=$(mktemp)
    cat > "$parser_script" << 'STREAM_PARSER'
import sys
import json

# ANSI colors
CYAN = '\033[0;36m'
NC = '\033[0m'

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        event = json.loads(line)
        event_type = event.get('type', '')

        if event_type == 'assistant':
            # Extract and print assistant text content
            msg = event.get('message', {})
            for block in msg.get('content', []):
                if block.get('type') == 'text':
                    text = block.get('text', '')
                    if text:
                        print(text, flush=True)

        elif event_type == 'content_block_delta':
            # Print streaming text deltas (partial messages)
            delta = event.get('delta', {})
            if delta.get('type') == 'text_delta':
                text = delta.get('text', '')
                if text:
                    print(text, end='', flush=True)

        elif event_type == 'result':
            # Final result
            print(f"\n{CYAN}[Session complete]{NC}", flush=True)

        elif event_type == 'system':
            # System messages (init, session info)
            session_id = event.get('session_id', '')
            if session_id:
                print(f"{CYAN}[Claude Session: {session_id}]{NC}", flush=True)

    except json.JSONDecodeError:
        # Print non-JSON lines as-is (stderr, etc.)
        print(line, flush=True)
STREAM_PARSER

    # Run Claude with streaming JSON output for full capture
    # --output-format stream-json: outputs streaming JSON events
    # --include-partial-messages: includes partial streaming events
    # --verbose: required when using stream-json with -p
    # Output goes to both terminal (processed) and temp file (raw JSON)
    # Using --dangerously-skip-permissions for fully automated operation
    claude -p "$prompt" \
        --output-format stream-json \
        --include-partial-messages \
        --verbose \
        --dangerously-skip-permissions \
        --allowedTools "*" \
        2>&1 | tee "$temp_output_file" | python3 -u "$parser_script" &

    CURRENT_PID=$!

    # Wait for completion and capture exit code
    local exit_code=0
    wait "$CURRENT_PID" || exit_code=$?
    CURRENT_PID=""

    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Write session log to JSON file
    local log_file
    log_file=$(write_session_log "$CURRENT_SESSION_ID" "$phase_name" "$start_time" "$end_time" "$exit_code" "$temp_output_file")

    # Clean up temp files
    rm -f "$temp_output_file" "$parser_script"

    echo ""
    if [[ $exit_code -eq 0 ]]; then
        echo -e "${GREEN}✓ $phase_name completed successfully (${duration}s)${NC}"
    else
        echo -e "${RED}✗ $phase_name failed with exit code $exit_code (${duration}s)${NC}"
    fi
    echo -e "${CYAN}  Log saved: $log_file${NC}"
    echo ""

    CURRENT_SESSION_ID=""
    return $exit_code
}

# Run one development cycle
# Returns 0 on success, 1 on failure
run_cycle() {
    local cycle_num="$1"
    local cycle_failed=false

    echo ""
    echo -e "${MAGENTA}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}${BOLD}                     CYCLE $cycle_num                           ${NC}"
    echo -e "${MAGENTA}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}Started at: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""

    # Run build phase
    if [[ "$RUN_BUILD" == true ]]; then
        if ! run_claude_command "BUILD (Issue Implementation)" "$COMMANDS_DIR/build.md"; then
            echo -e "${YELLOW}Build phase encountered issues, continuing to merge...${NC}"
            cycle_failed=true
        fi
    fi

    # Run merge phase
    if [[ "$RUN_MERGE" == true ]]; then
        if ! run_claude_command "MERGE (PR Review & Merge)" "$COMMANDS_DIR/merge.md"; then
            echo -e "${YELLOW}Merge phase encountered issues${NC}"
            cycle_failed=true
        fi
    fi

    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
    if [[ "$cycle_failed" == true ]]; then
        echo -e "${YELLOW}Cycle $cycle_num completed with some issues${NC}"
        echo -e "${CYAN}Finished at: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        return 1
    else
        echo -e "${GREEN}${BOLD}Cycle $cycle_num completed successfully!${NC}"
        echo -e "${CYAN}Finished at: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        return 0
    fi
}

# Main loop
main() {
    parse_args "$@"

    print_banner

    # Show configuration
    echo -e "${CYAN}Configuration:${NC}"
    echo -e "  Build phase:   $([ "$RUN_BUILD" == true ] && echo -e "${GREEN}enabled${NC}" || echo -e "${YELLOW}disabled${NC}")"
    echo -e "  Merge phase:   $([ "$RUN_MERGE" == true ] && echo -e "${GREEN}enabled${NC}" || echo -e "${YELLOW}disabled${NC}")"
    echo -e "  Mode:          $([ "$SINGLE_CYCLE" == true ] && echo "single cycle" || echo "continuous loop")"
    echo -e "  Delay:         ${DELAY_SECONDS}s between cycles"
    echo -e "  Max failures:  ${MAX_CONSECUTIVE_FAILURES} consecutive before exit"
    echo -e "  Logs dir:      ${LOGS_DIR}"
    echo ""

    check_prerequisites

    # Change to project root
    cd "$PROJECT_ROOT"
    echo -e "${CYAN}Working directory: $PROJECT_ROOT${NC}"
    echo ""

    local cycle_count=0
    local consecutive_failures=0

    if [[ "$SINGLE_CYCLE" == true ]]; then
        # Single cycle mode
        cycle_count=1
        run_cycle $cycle_count
        local exit_code=$?
        echo ""
        if [[ $exit_code -eq 0 ]]; then
            echo -e "${GREEN}${BOLD}Single cycle complete. Exiting.${NC}"
        else
            echo -e "${YELLOW}${BOLD}Single cycle complete with errors. Exiting.${NC}"
            exit 1
        fi
    else
        # Continuous loop mode
        echo -e "${YELLOW}Starting continuous loop. Press Ctrl+C to stop.${NC}"
        echo -e "${CYAN}Will exit after ${MAX_CONSECUTIVE_FAILURES} consecutive failures.${NC}"
        echo ""

        while true; do
            # Check for open issues before starting a new cycle
            if ! check_open_issues; then
                echo ""
                echo -e "${GREEN}${BOLD}No open issues found. Exiting loop.${NC}"
                break
            fi

            ((cycle_count++))
            if run_cycle $cycle_count; then
                # Success - reset failure counter
                consecutive_failures=0
            else
                # Failure - increment counter
                ((consecutive_failures++))
                echo -e "${YELLOW}Consecutive failures: ${consecutive_failures}/${MAX_CONSECUTIVE_FAILURES}${NC}"

                if [[ $consecutive_failures -ge $MAX_CONSECUTIVE_FAILURES ]]; then
                    echo ""
                    echo -e "${RED}${BOLD}Reached ${MAX_CONSECUTIVE_FAILURES} consecutive failures. Exiting loop to prevent infinite loop.${NC}"
                    echo -e "${RED}Please check the logs and fix any issues before restarting.${NC}"
                    exit 1
                fi
            fi

            echo ""
            echo -e "${CYAN}Waiting ${DELAY_SECONDS} seconds before next cycle...${NC}"
            echo -e "${CYAN}Press Ctrl+C to stop.${NC}"
            sleep "$DELAY_SECONDS"
        done
    fi
}

# Run main with all arguments
main "$@"
