# Style and Conventions

- File naming: kebab-case
- Component naming: PascalCase
- Import order: external -> shared -> feature-internal (ESLint enforced)
- No cross-feature imports
- Unidirectional deps: shared -> features -> app
- TypeScript strict, Prettier formatting
- Direct path imports (minimal barrel files)
