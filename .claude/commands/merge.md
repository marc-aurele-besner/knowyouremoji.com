# Merge - Pull Request Review and Merge

Review and merge a pull request with comprehensive validation, ensuring code quality and proper cleanup.

⏱️ **Estimated time**: 5-15 minutes depending on PR complexity and conflicts

## Prerequisites

Before running this command, ensure:

- **GitHub CLI** (`gh`) is installed and authenticated: `gh auth status`
- **Repository access**: You have write/merge access to the repository
- **Pull request exists**: A PR is open and ready for review

## Configuration

Default configuration (automatically detected or uses these defaults):

- **Repository**: Detected from `git remote get-url origin` or defaults to `marc-aurele-besner/knowyouremoji.com`
- **Main branch**: `main`
- **Delete branch after merge**: `true` (configurable)

## Usage

```bash
# Merge current branch's PR
@merge

# Merge specific PR number
@merge --pr <pr-number>

# Review only (no merge)
@merge --review-only

# Merge without deleting branch
@merge --keep-branch
```

## Steps

### Phase 1: Identification and Validation

1. **Identify the pull request**
   - Detect repository: `git remote get-url origin | sed 's/.*[:/]//;s/.git$//'`
   - If no `--pr` parameter provided:
     - Get current branch: `git branch --show-current`
     - Find PR for current branch: `gh pr list --repo <repo> --head <branch-name> --json number,url,title`
     - If multiple PRs exist, select the most recent one
   - If `--pr` parameter provided, use that PR number
   - Verify PR exists and is open

2. **Get PR details and status**
   - Fetch PR information: `gh pr view <pr-number> --repo <repo> --json number,title,body,author,reviews,state,mergeable,statusCheckRollup,headRefName,baseRefName`
   - Display PR summary:
     - Title and number
     - Author
     - Base and head branches
     - Review status
     - CI status
     - Mergeable status
   - Check if PR is linked to an issue (from "Resolves #" or "Closes #" in description)

### Phase 2: Pre-Merge Validation

3. **Check CI/CD status**
   - Review status checks: `gh pr checks <pr-number> --repo <repo>`
   - Ensure all required checks have passed:
     - Tests
     - Lint
     - Type checking
     - Build
     - Any custom CI workflows
   - If any checks are failing:
     - Display which checks failed
     - Ask if you want to continue despite failures (not recommended)
     - Default: wait for checks to pass

4. **Review code changes**
   - Fetch PR diff: `gh pr diff <pr-number> --repo <repo>`
   - Analyze changes for:
     - Code quality and style
     - Test coverage (must maintain 100%)
     - Breaking changes
     - Security concerns
     - Performance implications
     - Documentation updates
   - If `--review-only` flag is set, stop here and provide review feedback

5. **Check for merge conflicts**
   - Check mergeable status from PR data
   - If conflicts exist:
     - Display conflicting files
     - Provide instructions to resolve:
       ```bash
       git checkout <head-branch>
       git pull origin <head-branch>
       git merge origin/<base-branch>
       # Resolve conflicts
       git add .
       git commit -m "fix: resolve merge conflicts"
       git push origin <head-branch>
       ```
     - Wait for conflicts to be resolved before proceeding

6. **Verify review approvals**
   - Check review status
   - Ensure required approvals are met (if configured in repo settings)
   - Display list of reviewers and their approval status
   - If reviews are required but missing, notify and wait

### Phase 3: Final Validation

7. **Local validation (optional but recommended)**
   - Checkout the PR branch locally: `gh pr checkout <pr-number>`
   - Pull latest changes: `git pull origin <head-branch>`
   - Run full validation suite:
     - `bun install` (ensure dependencies are up to date)
     - `bun run typecheck`
     - `bun run lint`
     - `bun test` (verify 100% coverage)
     - `bun run build`
   - If any validation fails:
     - Report failures
     - Do not proceed with merge
     - Notify PR author of issues

8. **Sync with base branch**
   - Ensure head branch is up to date with base branch
   - Check if base branch has new commits: `git rev-list --count <head-branch>..origin/<base-branch>`
   - If base has new commits:
     - Option 1 (recommended): Update PR branch
       ```bash
       git checkout <head-branch>
       git pull origin <base-branch>
       git push origin <head-branch>
       ```
     - Wait for CI to pass again
     - Option 2: Proceed if no conflicts (less safe)

### Phase 4: Merge

9. **Perform the merge**
   - Choose merge strategy:
     - **Merge commit** (default, preserves commit history)
     - **Squash and merge** (combines all commits into one)
     - **Rebase and merge** (linear history)
   - Execute merge: `gh pr merge <pr-number> --repo <repo> --merge --delete-branch`
   - Confirm merge was successful

10. **Verify merge**
    - Check PR status: `gh pr view <pr-number> --repo <repo> --json state,mergedAt,mergedBy,mergeCommit,number,title`
    - Verify PR is closed and merged (check that `mergedAt` is not null and `state` is MERGED)
    - Verify commit appears on base branch: `git log origin/<base-branch> --oneline -5`

### Phase 5: Cleanup and Notifications

11. **Close linked issue**
    - If PR was linked to an issue (detected in step 2)
    - Check if issue is still open: `gh issue view <issue-number> --repo <repo> --json state`
    - If issue is still open:
      - GitHub usually auto-closes issues when PR with "Closes #N" is merged
      - If not auto-closed, manually close: `gh issue close <issue-number> --repo <repo> --comment "✅ Resolved by PR #<pr-number>"`

12. **Clean up local branches**
    - Switch to main branch: `git checkout <base-branch>`
    - Update local main: `git pull origin <base-branch>`
    - If `--keep-branch` flag is NOT set:
      - Delete local branch: `git branch -d <head-branch>`
      - Verify remote branch was deleted (should be auto-deleted by GitHub)
    - Prune remote tracking branches: `git remote prune origin`

13. **Post-merge summary**
    - Display summary:
      - PR number and title
      - Merged commit SHA
      - Linked issue (if any) and its status
      - Branches deleted
      - Next steps or recommendations
    - Notify team if configured (optional)

## Troubleshooting

### Common Issues and Solutions

**GitHub CLI not authenticated**

- Run `gh auth login` and follow the prompts
- Verify with `gh auth status`

**Permission denied - cannot merge**

- Ensure you have write/merge permissions to the repository
- Check repository settings for branch protection rules
- You may need to be an admin or have specific merge permissions

**CI checks are failing**

- Review which checks failed: `gh pr checks <pr-number> --repo <repo>`
- Do NOT merge with failing checks (violates quality standards)
- Fix issues on the PR branch and push changes
- Wait for CI to pass before attempting merge again

**Merge conflicts detected**

- Conflicts must be resolved before merging
- Checkout the PR branch: `gh pr checkout <pr-number>`
- Merge base branch: `git merge origin/<base-branch>`
- Resolve conflicts manually in affected files
- Commit resolution: `git add . && git commit -m "fix: resolve merge conflicts"`
- Push: `git push origin <head-branch>`
- Wait for CI to pass, then retry merge

**Required reviews are missing**

- Some repositories require approval reviews before merge
- Check PR reviews: `gh pr view <pr-number> --repo <repo> --json reviews`
- Request reviews: `gh pr review <pr-number> --repo <repo> --request-reviewer <username>`
- Wait for approvals before proceeding

**Issue not auto-closing after merge**

- Ensure PR description contains "Closes #<issue-number>" or "Resolves #<issue-number>"
- If missing, manually close: `gh issue close <issue-number> --repo <repo>`
- Add comment explaining resolution

**Branch not deleted after merge**

- Remote branch: `gh api repos/<repo>/git/refs/heads/<branch-name> -X DELETE`
- Local branch: `git branch -D <branch-name>` (force delete if needed)

**Accidental merge - need to revert**

- Find merge commit: `git log --oneline -5`
- Create revert PR:
  ```bash
  git checkout <base-branch>
  git pull origin <base-branch>
  git revert -m 1 <merge-commit-sha>
  git push origin <base-branch>
  ```
- Or create a new branch and PR with the revert

## Notes

- **100% test coverage**: Never merge if test coverage drops below 100%. This is a hard requirement.
- **CI must pass**: All status checks must pass before merging. No exceptions unless explicitly approved by maintainer.
- **Review requirements**: Follow repository's review policy. Some repos require 1-2 approvals before merge.
- **Merge commit default**: Regular merge commits preserve the full commit history for traceability. Use squash merge when you want to combine multiple commits into one.
- **Delete branches**: Always delete feature branches after merge to keep repository clean. Use `--keep-branch` only for special cases (release branches, long-lived feature branches).
- **Issue linking**: Always link PRs to issues using "Closes #N" or "Resolves #N" in PR description for automatic closure.
- **Branch protection**: Respect branch protection rules. If you can't merge, it's likely due to protection rules (required reviews, status checks, etc.).
- **Merge timing**: Coordinate merges for large features or breaking changes. Don't merge late on Friday or before holidays without monitoring capability.

## Example Workflow

```bash
# Review and merge current branch's PR
@merge

# Review specific PR before merge
@merge --pr 42 --review-only

# After review, merge the PR
@merge --pr 42

# Merge and keep the branch (for release branches)
@merge --pr 42 --keep-branch

# The merge process will:
# 1. Validate PR status and checks
# 2. Review code changes
# 3. Check for conflicts
# 4. Run local validation (optional)
# 5. Merge with merge commit
# 6. Close linked issue
# 7. Clean up branches
# 8. Provide summary
```

## Integration with Build Command

This command complements the `@build` command:

- **@build**: Creates feature branch, implements changes, creates PR
- **@merge**: Reviews PR, validates changes, merges to main, closes issue

Together they form a complete development workflow from issue to production.
