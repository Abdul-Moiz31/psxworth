# Contributing to PSXworth

Thanks for your interest in contributing! This guide will get you started.

## Before You Start

**Always get assigned to an issue before writing any code.**
Comment on the issue you want to work on and wait for a maintainer to assign it to you.
This avoids multiple people working on the same thing.

## Workflow

1. **Find an issue** — look for open issues, pick one that's unassigned
2. **Comment on it** — say you'd like to work on it and wait to be assigned
3. **Fork the repo** and clone your fork locally
4. **Set up upstream** (one-time step after cloning)
   ```bash
   git remote add upstream https://github.com/Wajahat43/psxworth.git
   git fetch upstream
   ```
5. **Create a branch** from `develop` (not `main`)
   ```bash
   git checkout -b fix/your-branch-name upstream/develop
   ```
6. **Make your changes** and commit with a clear message
7. **Push to your fork** and open a PR targeting the `develop` branch
8. **Link the issue** in your PR description using `Closes #<issue-number>`

## Branch Naming

| Type | Example |
|------|---------|
| Bug fix | `fix/drawer-height-ios` |
| Feature | `feat/auto-fill-shares` |
| Refactor | `refactor/unified-button` |

## PR Guidelines

- Keep PR focused on 1 issue
- Don't refactor unrelated code in the same PR
- For UI changes, include a screenshot or screen recording in the PR description
- Run these before opening a PR:
  ```bash
  pnpm lint
  pnpm build
  ```
- Don't open a PR without being assigned to the issue first

## Questions?

Open a discussion or comment on the relevant issue — no question is too small.
