# Ralph Loop - Junior Dev Workflow

Implement a full junior developer workflow following the Ralph loop style. This command automates the complete issue-to-PR workflow with test-first development, frequent commits, and thorough validation.

⏱️ **Estimated time**: 20-40 minutes depending on issue complexity and validation cycles

## Prerequisites

Before running this command, ensure:
- **GitHub CLI** (`gh`) is installed and authenticated: `gh auth status`
- **Git** is configured with user name and email: `git config user.name` and `git config user.email`
- **Bun** is installed: `bun --version`
- **Repository access**: You have write access to the repository
- **Clean state**: Current working directory is clean or changes are stashed/committed

## Configuration

Default configuration (automatically detected or uses these defaults):
- **Repository**: Detected from `git remote get-url origin` or defaults to `marc-aurele-besner/knowyouremoji.com`
- **Main branch**: `main`
- **Max validation attempts**: 5

## Usage

```bash
# Full workflow - pick next available issue
@build

# Work on specific issue (skip milestone/issue selection)
@build --issue <issue-number>

# Or run phases individually for more control:
@build --select-issue    # Phase 1: Issue selection only
@build --setup           # Phase 2: Issue setup (assign + branch)
@build --develop         # Phase 3: Development work
@build --validate        # Phase 4: Run validation and fixes
@build --pr              # Phase 5: Create pull request
```

## Steps

### Phase 0: Initial Setup (Always run first)

1. **Detect repository configuration**
   - Get repository from git remote: `git remote get-url origin | sed 's/.*[:/]//;s/.git$//'`
   - Expected format: `owner/repo` (e.g., `marc-aurele-besner/knowyouremoji.com`)
   - If detection fails, use default: `marc-aurele-besner/knowyouremoji.com`
   - Store repository variable for use in all subsequent `gh` commands
   - Verify authentication: `gh auth status`

### Phase 1: Issue Selection (Skip if `--issue` parameter provided)

2. **Query and select milestone**
   - Use `gh api repos/<repo>/milestones?state=open&sort=title&direction=asc` to fetch open milestones
   - Display milestones with their open/closed issue counts
   - Select the first milestone with open issues (sorted by title)
   - If no milestones exist, proceed with all open issues

3. **Query open issues from selected milestone**
   - Use `gh issue list --repo <repo> --state open --assignee "" --milestone "<milestone>" --json number,title,labels,milestone` to get unassigned issues
   - Sort issues by:
     1. Category order (SETUP → TYPE → DATA → PAGE → COMBO → INTERPRETER → RATE → SEO → DEPLOY → TEST → AUTH → SUB → HISTORY → SHARE)
     2. Category number (001 before 002)
     3. Priority (P0 > P1 > P2)
     4. Issue number (as tiebreaker)
   - Select the first issue from the sorted list

4. **Query full issue details**
   - Use `gh issue view <issue-number> --repo <repo> --json body,title,labels,assignees,milestone` to get complete issue information
   - Store issue number, title, body, labels, and milestone for later use

### Phase 2: Issue Setup

5. **Assign yourself to the issue**
   - Use `gh issue edit <issue-number> --repo <repo> --add-assignee "@me"` to assign the issue
   - Verify assignment was successful

6. **Create branch for the issue**
   - Ensure main branch is up to date first: `git checkout main && git pull origin main`
   - Generate branch name: `issue-<issue-number>-<sanitized-title>`
     - Sanitize title: lowercase, replace non-alphanumeric with hyphens, limit to 50 chars
     - Example: "SETUP-001: Initialize Next.js" → `issue-123-setup-001-initialize-nextjs`
   - Check if branch exists locally or remotely
   - If exists locally: `git checkout <branch-name>`
   - If exists remotely: `git checkout -b <branch-name> origin/<branch-name>`
   - If new: `git checkout -b <branch-name>` from main branch

7. **Push branch and link to issue**
   - Push branch: `git push -u origin <branch-name>`
   - Add comment to issue: `gh issue comment <issue-number> --repo <repo> --body "🔗 Branch created: \`<branch-name>\`\n\nWorking on this issue."`
   - Link branch via GitHub development field (if supported)

### Phase 3: Development (Test-First Approach)

8. **Work on the issue with test-first mentality**
   - Read issue details carefully to understand requirements
   - **For applicable issues:**
     - Write tests first (before implementation)
     - Ensure tests cover all requirements from the issue
     - Run tests to confirm they fail (red phase)
   - **Implementation approach:**
     - Implement code to make tests pass (green phase)
     - Refactor while keeping tests green
     - Maintain 100% test coverage requirement
   - **Commit frequently:**
     - Commit after each logical unit of work
     - Use descriptive commit messages: `feat: <description>`, `fix: <description>`, `test: <description>`
     - Examples:
       - `test: add tests for emoji data loader`
       - `feat: implement emoji data loader`
       - `fix: handle edge case in emoji slug generation`
   - **Push semi-frequently:**
     - Push every 3-5 commits or after completing a significant feature
     - Use `git push origin <branch-name>`
   - Follow project conventions from `CLAUDE.md` and `AGENT.md`
   - Reference the issue in commit messages when relevant: `Resolves #<issue-number>`

### Phase 4: Validation and Fixes

9. **Run validation scripts**
   - Check `package.json` for available scripts
   - Run in order:
     1. **Build**: `bun run build` (runs tests first per CLAUDE.md)
     2. **Tests**: `bun test` (verify 100% coverage)
     3. **Lint**: `bun run lint`
     4. **Type-check**: `bun run typecheck`
   - Capture all error output for fixing

10. **Fix validation errors (mandatory)**
    - **CRITICAL RULES:**
      - Do NOT skip, comment out, or remove tests
      - Do NOT ignore errors or warnings
      - Fix ALL errors before proceeding
      - Maintain 100% test coverage
    - Analyze error messages carefully
    - Fix issues systematically:
      - Fix linting errors (formatting, unused imports, etc.)
      - Fix type errors (add proper types, fix type mismatches)
      - Fix test failures (update implementation or tests as needed)
      - Ensure build succeeds
    - After fixes, commit with message: `fix: resolve lint/typecheck/test errors`
    - Re-run validation scripts to confirm fixes
    - Repeat until all validations pass (max 5 attempts, then report manual intervention needed)

11. **Final push**
    - Stage any remaining changes: `git add -A`
    - Commit final changes if needed: `git commit -m "Complete work on issue #<issue-number>"`
    - Push all commits: `git push origin <branch-name>`

### Phase 5: Pull Request

12. **Create pull request**
    - Check if PR already exists: `gh pr list --repo <repo> --head <branch-name> --json number`
    - If exists, use existing PR
    - If not, create PR:
      - Title: Use issue title
      - Body template:
        ```markdown
        ## Summary
        Resolves #<issue-number>
        
        ## Changes
        This PR implements the requirements from issue #<issue-number>.
        
        ## Test Plan
        - [x] All tests pass (`bun test`)
        - [x] 100% code coverage maintained
        - [x] Linting passes (`bun run lint`)
        - [x] Type checking passes (`bun run typecheck`)
        - [x] Build succeeds (`bun run build`)
        
        ---
        🤖 Generated with automated AI assistance
        ```
      - Base: `main`
      - Head: `<branch-name>`
    - Link PR to issue: `gh issue comment <issue-number> --repo <repo> --body "🚀 Pull request created: <pr-url>"`

## Troubleshooting

### Common Issues and Solutions

**GitHub CLI not authenticated**
- Run `gh auth login` and follow the prompts
- Verify with `gh auth status`

**Permission denied on repository**
- Ensure you have write access to the repository
- Check with repository owner if you need to be added as collaborator

**Validation fails repeatedly (5+ attempts)**
- The command will stop and report the issue
- Review errors manually: `bun run lint`, `bun test`, `bun run typecheck`
- Fix issues locally and commit
- Resume with `@build --validate` to re-run validation only

**Resume interrupted workflow**
- If on an issue branch (`issue-<N>-*`), the command automatically detects it
- Check current branch: `git branch --show-current`
- The command will resume from the appropriate phase based on:
  - Uncommitted changes → Resume at Phase 4 (Validation)
  - Commits ahead of main → Resume at Phase 4 (Validation)
  - PR already exists → Resume at Phase 5 (PR already created)
  - No work detected → Resume at Phase 3 (Development)

**Repository detection fails**
- Manually set repository: Use the full `owner/repo` format in all `gh` commands
- Example: `gh issue list --repo marc-aurele-besner/knowyouremoji.com`

**Git conflicts or dirty working directory**
- Stash changes: `git stash`
- Or commit current work: `git add -A && git commit -m "WIP: <description>"`
- Then re-run the command

**For continuous automation (multiple issues)**
- Use `scripts/ralph-loop.sh` instead of this command
- The bash script handles looping, PR monitoring, and automatic resume

**Python not available (for issue sorting)**
- Issue sorting logic requires Python 3
- Install Python: `brew install python3` (macOS) or use system package manager
- Alternative: Manually pick issue and use `@build --issue <number>`

## Notes

- **Test-first development**: Write tests before implementation when applicable. Not all issues require tests (e.g., documentation-only), but code changes should have tests.
- **Frequent commits**: Commit after each logical unit of work. This creates a clear history and allows for easier rollback if needed.
- **Semi-frequent pushes**: Push every 3-5 commits to backup work and make progress visible.
- **100% coverage requirement**: Maintain test coverage at 100%. CI blocks merges if coverage drops.
- **Never skip tests**: Do not comment out, remove, or skip tests to make validation pass. Fix the underlying issues instead.
- **Error handling**: If validation fails after 5 attempts, report the issue and ask for manual intervention rather than proceeding with errors.
- **Branch naming**: Follow pattern `issue-<number>-<sanitized-title>` for consistency.
- **Commit messages**: Use conventional commits format (`feat:`, `fix:`, `test:`, `chore:`, etc.).

## Example Workflow

```bash
# Full workflow - pick next issue
@build

# Work on specific issue
@build --issue 42

# During development, commits might look like:
# git commit -m "test: add tests for emoji detail page route"
# git commit -m "feat: implement emoji detail page route"
# git commit -m "fix: handle missing emoji gracefully"
# git push origin issue-42-emoji-detail-page-route

# After validation passes:
# git commit -m "fix: resolve lint errors"
# git push origin issue-42-emoji-detail-page-route
# gh pr create --title "..." --body "..." --base main --head issue-42-emoji-detail-page-route
```

## Integration with Ralph Loop Script

This command complements the `scripts/ralph-loop.sh` script by providing a Claude Code-native way to execute the same workflow. The script handles continuous looping and PR status polling, while this command focuses on the single-issue workflow execution.
