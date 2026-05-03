# Contributing to VoteReady

We welcome contributions to VoteReady! Please ensure that your code adheres to our rigorous quality standards before submitting a Pull Request.

## Workflow

1. Fork the repository and create your feature branch.
2. Ensure you have Node.js 20+ installed.
3. Run `npm install` to install dependencies.
4. Make your changes, ensuring you write relevant tests.
5. Run the full static analysis gauntlet locally before committing:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm test -- --coverage`
   - `npm run build`
6. Submit a Pull Request.

## Code Quality Standards

- **Complexity**: Keep functions small and cyclomatic complexity under 5.
- **Error Handling**: Use the `Result<T>` pattern for predictable and typed error returns instead of throwing exceptions or returning null.
- **Immutability**: Use `readonly` for interfaces and `Readonly<Record<...>>` for lookups.
- **Comments**: Write "Why" comments, not "What" comments. Document intent.

Thank you for helping us keep VoteReady robust and accessible to all!
