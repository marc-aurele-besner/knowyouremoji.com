#!/bin/bash

# Ralph Loop - Automated Issue Worker for AI Coding Assistants
# Supports both Claude Code (claude CLI) and Codex CLI
#
# Usage:
#   ./scripts/ralph-loop.sh claude    # Use Claude Code
#   ./scripts/ralph-loop.sh codex     # Use Codex
#   ./scripts/ralph-loop.sh           # Auto-detect available CLI
#
# Options:
#   --loop                            # Continuous mode: auto-start next issue after PR merge
#   --poll-interval <seconds>         # How often to check PR status (default: 60)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO="marc-aurele-besner/knowyouremoji.com"
MAIN_BRANCH="main"
POLL_INTERVAL=60  # seconds between PR status checks
CONTINUOUS_MODE=false

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --loop)
                CONTINUOUS_MODE=true
                shift
                ;;
            --poll-interval)
                POLL_INTERVAL="$2"
                shift 2
                ;;
            claude|codex)
                AI_CLI_ARG="$1"
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
}

# Detect or use specified AI CLI
detect_ai_cli() {
    local specified="$1"

    if [[ -n "$specified" ]]; then
        case "$specified" in
            claude)
                if command -v claude &> /dev/null; then
                    echo "claude"
                    return 0
                else
                    echo -e "${RED}Error: Claude CLI not found${NC}" >&2
                    exit 1
                fi
                ;;
            codex)
                if command -v codex &> /dev/null; then
                    echo "codex"
                    return 0
                else
                    echo -e "${RED}Error: Codex CLI not found${NC}" >&2
                    exit 1
                fi
                ;;
            *)
                echo -e "${RED}Error: Unknown CLI '$specified'. Use 'claude' or 'codex'${NC}" >&2
                exit 1
                ;;
        esac
    fi

    # Auto-detect
    if command -v claude &> /dev/null; then
        echo "claude"
    elif command -v codex &> /dev/null; then
        echo "codex"
    else
        echo -e "${RED}Error: Neither Claude CLI nor Codex CLI found${NC}" >&2
        exit 1
    fi
}

# Step 1: Sync with main
sync_with_main() {
    echo -e "${BLUE}[1/9] Syncing with main branch...${NC}"
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH"
    echo -e "${GREEN}✓ Synced with main${NC}"
}

# Step 2: Pick the next issue to work on (by priority P0 > P1 > P2, then by issue number)
pick_next_issue() {
    echo -e "${BLUE}[2/9] Finding next unassigned issue...${NC}"

    # Get open issues without assignees, sorted by priority labels and number
    # Priority order: P0 first, then P1, then P2
    local issue_json
    issue_json=$(gh issue list --repo "$REPO" --state open --assignee "" --limit 100 --json number,title,labels)

    # Parse and sort issues by priority
    local next_issue
    next_issue=$(echo "$issue_json" | python3 -c "
import json
import sys

data = json.load(sys.stdin)

def get_priority(issue):
    labels = [l['name'] for l in issue.get('labels', [])]
    if 'priority: P0' in labels:
        return (0, issue['number'])
    elif 'priority: P1' in labels:
        return (1, issue['number'])
    elif 'priority: P2' in labels:
        return (2, issue['number'])
    else:
        return (3, issue['number'])

if not data:
    print('')
    sys.exit(0)

sorted_issues = sorted(data, key=get_priority)
if sorted_issues:
    issue = sorted_issues[0]
    print(f\"{issue['number']}|{issue['title']}\")
else:
    print('')
")

    if [[ -z "$next_issue" ]]; then
        echo -e "${YELLOW}No unassigned issues found. All done!${NC}"
        return 1
    fi

    ISSUE_NUMBER=$(echo "$next_issue" | cut -d'|' -f1)
    ISSUE_TITLE=$(echo "$next_issue" | cut -d'|' -f2-)

    echo -e "${GREEN}✓ Selected issue #$ISSUE_NUMBER: $ISSUE_TITLE${NC}"
    return 0
}

# Step 3: Assign yourself to the issue
assign_issue() {
    echo -e "${BLUE}[3/9] Assigning issue #$ISSUE_NUMBER to you...${NC}"
    gh issue edit "$ISSUE_NUMBER" --repo "$REPO" --add-assignee "@me"
    echo -e "${GREEN}✓ Assigned issue #$ISSUE_NUMBER${NC}"
}

# Step 4: Create a branch for the issue
create_branch() {
    echo -e "${BLUE}[4/9] Creating branch for issue #$ISSUE_NUMBER...${NC}"

    # Create branch name from issue number and title
    # e.g., "123-setup-001-initialize-nextjs"
    local sanitized_title
    sanitized_title=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-50)
    BRANCH_NAME="issue-${ISSUE_NUMBER}-${sanitized_title}"

    git checkout -b "$BRANCH_NAME"
    echo -e "${GREEN}✓ Created and checked out branch: $BRANCH_NAME${NC}"
}

# Step 5: Attach the branch to the issue (link via development)
attach_branch_to_issue() {
    echo -e "${BLUE}[5/9] Linking branch to issue #$ISSUE_NUMBER...${NC}"

    # Push the branch first so it exists on remote
    git push -u origin "$BRANCH_NAME"

    # Add a comment to the issue linking the branch
    gh issue comment "$ISSUE_NUMBER" --repo "$REPO" --body "🔗 Branch created: \`$BRANCH_NAME\`

Working on this issue with automated AI assistance."

    echo -e "${GREEN}✓ Branch linked to issue #$ISSUE_NUMBER${NC}"
}

# Step 6: Work on the issue using AI CLI
work_on_issue() {
    echo -e "${BLUE}[6/9] Working on issue #$ISSUE_NUMBER with $AI_CLI...${NC}"

    # Get full issue details
    local issue_body
    issue_body=$(gh issue view "$ISSUE_NUMBER" --repo "$REPO" --json body,title,labels -q '.title + "\n\n" + .body')

    # Build the prompt for the AI
    local prompt="You are working on GitHub issue #$ISSUE_NUMBER for the KnowYourEmoji.com project.

ISSUE TITLE: $ISSUE_TITLE

ISSUE DETAILS:
$issue_body

INSTRUCTIONS:
1. Read and understand the issue requirements
2. Implement the solution following the project's conventions (see CLAUDE.md/AGENT.md)
3. Write tests to maintain 100% coverage (mandatory)
4. Commit your changes regularly with descriptive messages
5. When complete, summarize what was done

Work autonomously until the issue is fully resolved. Approve any permission requests automatically."

    # Run the AI CLI with the prompt
    case "$AI_CLI" in
        claude)
            # Claude Code CLI with auto-accept for permissions
            echo "$prompt" | claude --dangerously-skip-permissions
            ;;
        codex)
            # Codex CLI with auto-approve
            codex --approval-mode full-auto "$prompt"
            ;;
    esac

    echo -e "${GREEN}✓ AI work completed${NC}"
}

# Step 7: Push to branch
push_branch() {
    echo -e "${BLUE}[7/9] Pushing changes to branch...${NC}"

    # Check if there are any changes to push
    if git diff --quiet && git diff --staged --quiet; then
        echo -e "${YELLOW}No changes to push${NC}"
    else
        # Stage any remaining changes
        git add -A
        git commit -m "Complete work on issue #$ISSUE_NUMBER" --allow-empty || true
    fi

    git push origin "$BRANCH_NAME"
    echo -e "${GREEN}✓ Pushed to $BRANCH_NAME${NC}"
}

# Step 8: Create a PR
create_pr() {
    echo -e "${BLUE}[8/9] Creating pull request...${NC}"

    # Get issue labels for PR
    local labels
    labels=$(gh issue view "$ISSUE_NUMBER" --repo "$REPO" --json labels -q '[.labels[].name] | join(",")')

    # Create PR
    PR_URL=$(gh pr create \
        --repo "$REPO" \
        --title "$ISSUE_TITLE" \
        --body "$(cat <<EOF
## Summary
Resolves #$ISSUE_NUMBER

## Changes
This PR implements the requirements from issue #$ISSUE_NUMBER.

## Test Plan
- [ ] All tests pass (\`bun test\`)
- [ ] 100% code coverage maintained
- [ ] Linting passes (\`bun run lint\`)

---
🤖 Generated with automated AI assistance
EOF
)" \
        --base "$MAIN_BRANCH" \
        --head "$BRANCH_NAME")

    echo -e "${GREEN}✓ Pull request created: $PR_URL${NC}"

    # Link PR to issue
    gh issue comment "$ISSUE_NUMBER" --repo "$REPO" --body "🚀 Pull request created: $PR_URL"
}

# Step 9: Wait for PR to be merged and issue to be closed
wait_for_merge_and_close() {
    echo -e "${BLUE}[9/9] Waiting for PR to be merged and issue #$ISSUE_NUMBER to be closed...${NC}"
    echo -e "${CYAN}    Polling every ${POLL_INTERVAL}s. Press Ctrl+C to stop waiting.${NC}"

    local pr_number
    pr_number=$(echo "$PR_URL" | grep -oE '[0-9]+$')

    while true; do
        # Check PR status
        local pr_state
        pr_state=$(gh pr view "$pr_number" --repo "$REPO" --json state -q '.state')

        # Check issue status
        local issue_state
        issue_state=$(gh issue view "$ISSUE_NUMBER" --repo "$REPO" --json state -q '.state')

        echo -e "${CYAN}    [$(date '+%H:%M:%S')] PR #$pr_number: $pr_state | Issue #$ISSUE_NUMBER: $issue_state${NC}"

        if [[ "$pr_state" == "MERGED" ]] && [[ "$issue_state" == "CLOSED" ]]; then
            echo -e "${GREEN}✓ PR merged and issue closed!${NC}"
            return 0
        elif [[ "$pr_state" == "CLOSED" ]] && [[ "$pr_state" != "MERGED" ]]; then
            echo -e "${RED}✗ PR was closed without merging${NC}"
            return 1
        fi

        sleep "$POLL_INTERVAL"
    done
}

# Run one complete cycle
run_cycle() {
    echo ""
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}  Ralph Loop - AI Issue Worker${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""

    # Detect AI CLI
    AI_CLI=$(detect_ai_cli "$AI_CLI_ARG")
    echo -e "${GREEN}Using AI CLI: $AI_CLI${NC}"
    if [[ "$CONTINUOUS_MODE" == true ]]; then
        echo -e "${GREEN}Continuous mode: ON${NC}"
    fi
    echo ""

    # Run the workflow
    sync_with_main

    if ! pick_next_issue; then
        return 1  # No more issues
    fi

    assign_issue
    create_branch
    attach_branch_to_issue
    work_on_issue
    push_branch
    create_pr
    wait_for_merge_and_close

    echo ""
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}  Issue #$ISSUE_NUMBER completed!${NC}"
    echo -e "${GREEN}======================================${NC}"

    return 0
}

# Main entry point
main() {
    parse_args "$@"

    if [[ "$CONTINUOUS_MODE" == true ]]; then
        echo -e "${GREEN}Starting Ralph Loop in continuous mode...${NC}"
        echo -e "${YELLOW}Will automatically start next issue after each PR is merged.${NC}"
        echo ""

        local cycle_count=0
        while true; do
            ((cycle_count++))
            echo -e "${CYAN}========== CYCLE $cycle_count ==========${NC}"

            if ! run_cycle; then
                echo -e "${GREEN}No more issues to work on. Exiting continuous mode.${NC}"
                break
            fi

            echo ""
            echo -e "${YELLOW}Moving to next issue in 5 seconds...${NC}"
            sleep 5
        done

        echo ""
        echo -e "${GREEN}======================================${NC}"
        echo -e "${GREEN}  Ralph Loop completed $cycle_count cycles${NC}"
        echo -e "${GREEN}======================================${NC}"
    else
        run_cycle

        echo ""
        echo -e "${YELLOW}Run again to work on the next issue:${NC}"
        echo -e "  ./scripts/ralph-loop.sh $AI_CLI"
        echo ""
        echo -e "${YELLOW}Or run in continuous mode:${NC}"
        echo -e "  ./scripts/ralph-loop.sh $AI_CLI --loop"
    fi
}

# Run main with all arguments
main "$@"
