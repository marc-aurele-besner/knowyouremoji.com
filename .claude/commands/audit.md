# Audit and Update Dependencies

Audit dependencies for security vulnerabilities and outdated packages, then update them safely.

## Steps

1. **Check current dependency status**
   - Read `package.json` to understand current dependencies
   - Check if `bun.lockb` exists and is up to date
   - Identify the package manager being used (Bun)

2. **Security audit**
   - Run `bun audit` to check for known security vulnerabilities
   - If vulnerabilities are found, prioritize critical and high severity issues
   - Document any vulnerabilities that cannot be automatically fixed

3. **Check for outdated packages**
   - Run `bun outdated` to see which packages have newer versions available
   - Categorize updates by semver level (patch, minor, major)
   - Review changelogs for major version updates to identify breaking changes

4. **Update dependencies**
   - **Patch updates**: Apply automatically (low risk)
   - **Minor updates**: Review and apply (medium risk, usually safe)
   - **Major updates**: Review changelogs and breaking changes before applying
   - Use `bun update` for specific packages or `bun update --latest` for all packages
   - Update `package.json` and regenerate `bun.lockb`

5. **Verify updates**
   - Run `bun install` to ensure lockfile is in sync
   - Run `bun run typecheck` to catch TypeScript errors
   - Run `bun run lint` to check for linting issues
   - Run `bun test` to ensure all tests pass (100% coverage requirement)
   - Run `bun run build` to verify the build succeeds (build runs tests first per CLAUDE.md)
   - **CRITICAL**: Both build and test must pass before proceeding. If either fails:
     - Investigate the failure
     - Fix issues or revert problematic updates (see rollback strategy below)
     - Do not commit changes until build and test pass

6. **Document changes**
   - Create a summary of:
     - Security vulnerabilities fixed
     - Packages updated (with version changes)
     - Any breaking changes or migration notes
     - Packages that were not updated and why
   - Save this summary for the commit message

7. **Commit changes**
   - Review the dependency changes: `git diff package.json`
   - Review lockfile changes: `git diff bun.lockb`
   - Stage changes: `git add package.json bun.lockb`
   - Commit with descriptive message following the summary from step 6:
     ```bash
     git commit -m "chore: update dependencies
     
     - Fixed N security vulnerabilities (severity levels)
     - Updated X packages (patch/minor/major)
     - Breaking changes: [list if any]
     - Did not update: [packages] (reason)
     "
     ```
   - Consider creating a PR if changes are significant or include major version updates

## Notes

- **Testing requirement**: This project requires 100% test coverage. All updates must pass both `bun test` and `bun run build` before committing.
- **Bun-specific**: Use Bun commands (`bun install`, `bun update`, `bun audit`) rather than npm/yarn equivalents.
- **Conservative approach**: When in doubt, prefer patch/minor updates over major version bumps unless explicitly needed.
- **Breaking changes**: For major version updates, check migration guides and update code accordingly.
- **Lockfile**: Always commit `bun.lockb` after updates to ensure reproducible builds.
- **Branch strategy**: Consider creating a branch for dependency updates if changes are significant (major version updates, many packages, or breaking changes). For minor/patch updates, updating directly on a feature branch or main may be acceptable.
- **Rollback strategy**: If updates break things badly and fixes aren't immediately clear:
  - Revert package files: `git checkout HEAD -- package.json bun.lockb`
  - Reinstall previous versions: `bun install`
  - Verify rollback: `bun test && bun run build`
  - For partial rollback, update specific packages back to previous versions: `bun add <package>@<previous-version>`
- **Testing major updates in isolation**: For major version updates, consider updating one package at a time, testing between each update to identify which update causes issues if tests fail.

## Example Commands

```bash
# Security audit
bun audit

# Check outdated packages
bun outdated

# Update all dependencies to latest (within semver ranges)
bun update

# Update specific package
bun update <package-name>

# Update to latest versions (may include major updates)
bun update --latest

# After updates, verify everything works
bun install
bun run typecheck
bun run lint
bun test
bun run build  # Build runs tests first, but explicit verification ensures both pass
```
