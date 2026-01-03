# Project Instructions

## About This Template

This is a **Next.js Base Template** with authentication, clean architecture patterns, and AI-friendly documentation. Use this as a starting point for new projects.

## Context Loading

On session start, load the codebase context for quick orientation:

@context/SESSION_CONTEXT.md

## Pattern Documentation

See `docs/project-pattern/` for detailed pattern guides:
- `use-cases.md` - Use case pattern with examples
- `repositories.md` - Repository pattern
- `front-end.md` - Frontend architecture
- `front-end-forms.md` - Form patterns

See `docs/TEMPLATE_USAGE.md` for a guide on adding new domains.

## Codebase Mapping System

This project uses a structured mapping system to maintain persistent knowledge across sessions.

### Map Structure

```
.claude/context/
├── SESSION_CONTEXT.md      # Quick-load working summary
├── architecture.md         # High-level system structure
├── modules/                # Deep dives on core modules
│   └── [module-name].md
├── relationships.md        # Component dependencies and data flow
└── patterns.md             # Common patterns and conventions
```

### Workflow

1. **After Changes**: Update affected maps when making significant changes
2. **Session Start**: SESSION_CONTEXT.md is auto-loaded via this file

### Map Document Standards

When generating or updating maps, follow these guidelines:

- **Be concise but complete**: Focus on "what" and "why", not "how" (code speaks for itself)
- **Use relative paths**: Always reference files relative to project root
- **Include line references**: For key functions/classes, include `file:line` references
- **Maintain relationships**: Document how components interact, not just what they do
- **Update timestamps**: Each map should have a "Last updated" header

## Rules

See detailed workflow rules:
@rules/mapping-workflow.md

## Skills

This template includes skills to help generate code following the patterns:

- `create-use-case.md` - Generate a new use case
- `create-repository.md` - Generate a new repository
- `create-form.md` - Generate a form component
- `create-db-table.md` - Generate a database table
- `create-frontend-component.md` - Generate a frontend component
- `auth-patterns.md` - Authentication patterns
