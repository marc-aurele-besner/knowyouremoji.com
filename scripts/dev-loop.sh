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
DELAY_SECONDS=5
RUN_BUILD=true
RUN_MERGE=true
SINGLE_CYCLE=false

# Track if we're currently running a command (for signal handling)
CURRENT_PID=""

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
    echo "  --build       Run only the build (issue implementation) phase"
    echo "  --merge       Run only the merge (PR review/merge) phase"
    echo "  --once        Run one cycle then exit (no loop)"
    echo "  --delay N     Delay N seconds between cycles (default: 5)"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Full loop: build -> merge -> repeat"
    echo "  $0 --build --once     # Single build cycle"
    echo "  $0 --merge            # Continuous merge loop"
    echo "  $0 --delay 30         # 30 second delay between cycles"
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

# Run a Claude command with streaming output
run_claude_command() {
    local phase_name="$1"
    local prompt_file="$2"

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}${BOLD}  Phase: $phase_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    local prompt
    prompt=$(cat "$prompt_file")

    local start_time
    start_time=$(date +%s)

    # Run Claude with streaming (output goes directly to terminal)
    # Using --dangerously-skip-permissions for fully automated operation
    claude -p "$prompt" \
        --allow-dangerously-skip-permissions \
        --dangerously-skip-permissions \
        --allowedTools "*" \
        &

    CURRENT_PID=$!

    # Wait for completion and capture exit code
    local exit_code=0
    wait "$CURRENT_PID" || exit_code=$?
    CURRENT_PID=""

    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    if [[ $exit_code -eq 0 ]]; then
        echo -e "${GREEN}✓ $phase_name completed successfully (${duration}s)${NC}"
    else
        echo -e "${RED}✗ $phase_name failed with exit code $exit_code (${duration}s)${NC}"
    fi
    echo ""

    return $exit_code
}

# Run one development cycle
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
    else
        echo -e "${GREEN}${BOLD}Cycle $cycle_num completed successfully!${NC}"
    fi
    echo -e "${CYAN}Finished at: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"

    return 0
}

# Main loop
main() {
    parse_args "$@"

    print_banner

    # Show configuration
    echo -e "${CYAN}Configuration:${NC}"
    echo -e "  Build phase:  $([ "$RUN_BUILD" == true ] && echo -e "${GREEN}enabled${NC}" || echo -e "${YELLOW}disabled${NC}")"
    echo -e "  Merge phase:  $([ "$RUN_MERGE" == true ] && echo -e "${GREEN}enabled${NC}" || echo -e "${YELLOW}disabled${NC}")"
    echo -e "  Mode:         $([ "$SINGLE_CYCLE" == true ] && echo "single cycle" || echo "continuous loop")"
    echo -e "  Delay:        ${DELAY_SECONDS}s between cycles"
    echo ""

    check_prerequisites

    # Change to project root
    cd "$PROJECT_ROOT"
    echo -e "${CYAN}Working directory: $PROJECT_ROOT${NC}"
    echo ""

    local cycle_count=0

    if [[ "$SINGLE_CYCLE" == true ]]; then
        # Single cycle mode
        cycle_count=1
        run_cycle $cycle_count
        echo ""
        echo -e "${GREEN}${BOLD}Single cycle complete. Exiting.${NC}"
    else
        # Continuous loop mode
        echo -e "${YELLOW}Starting continuous loop. Press Ctrl+C to stop.${NC}"
        echo ""

        while true; do
            # Check for open issues before starting a new cycle
            if ! check_open_issues; then
                echo ""
                echo -e "${GREEN}${BOLD}No open issues found. Exiting loop.${NC}"
                break
            fi

            ((cycle_count++))
            run_cycle $cycle_count

            echo ""
            echo -e "${CYAN}Waiting ${DELAY_SECONDS} seconds before next cycle...${NC}"
            echo -e "${CYAN}Press Ctrl+C to stop.${NC}"
            sleep "$DELAY_SECONDS"
        done
    fi
}

# Run main with all arguments
main "$@"
