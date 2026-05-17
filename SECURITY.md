# Security Policy

## Reporting a vulnerability

If you discover a security issue in psxworth, **please do not open a public GitHub issue**.

Instead, email **support@psxworth.com** (primary) or **wajahat@psxworth.com** (backup) with:

- A description of the issue
- Steps to reproduce
- Potential impact (what an attacker could do)
- Any suggested fix, if you have one

You'll get a response within a few days. Once the issue is patched, you'll be credited in the release notes if you'd like.

## Scope

The following are in scope:

- The psxworth web app and its server actions
- Authentication and session handling (Clerk integration)
- Database access patterns
- Anything involving user portfolio/transaction data

The following are out of scope:

- Third-party services we depend on (Clerk, PostHog, Cloudflare, Coolify, etc.) — report those directly to their vendors
- Issues that require physical access to a user's device
- Brute-force or denial-of-service attacks against publicly rate-limited endpoints

Thanks for helping keep psxworth and its users safe.
