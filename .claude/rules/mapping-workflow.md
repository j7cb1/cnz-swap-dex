# Mapping Workflow Rules

## When to Update Maps

After ANY of these actions, update the relevant maps:

| Action | Maps to Update |
|--------|----------------|
| New file created | `architecture.md`, relevant `modules/*.md`, `SESSION_CONTEXT.md` |
| File deleted | `architecture.md`, relevant `modules/*.md`, `relationships.md`, `SESSION_CONTEXT.md` |
| Function/class added | Relevant `modules/*.md`, `SESSION_CONTEXT.md` |
| Dependencies changed | `relationships.md`, `SESSION_CONTEXT.md` |
| New pattern introduced | `patterns.md`, `SESSION_CONTEXT.md` |
| Major refactor | All affected maps + `SESSION_CONTEXT.md` |

## Map Update Process

1. **Identify scope**: Determine which maps are affected by the change
2. **Update specific maps**: Edit the detailed maps first (modules/, relationships.md, etc.)
3. **Regenerate summary**: Always regenerate SESSION_CONTEXT.md last to reflect all changes

## SESSION_CONTEXT.md Format

This is the "quick-load" document. Keep it between 1000-2000 lines. Structure:

```markdown
# Session Context
> Last updated: [timestamp]
> Changes since last update: [brief summary]

## Quick Orientation
[2-3 sentences: what this project does, primary tech stack]

## Directory Structure
[Tree view with 1-line descriptions per major directory]

## Core Modules (Deep Knowledge)
[For each core module: purpose, key files, main exports, critical functions with file:line refs]

## Module Relationships
[Dependency graph in text/mermaid, data flow summary]

## Entry Points
[Main entry files, CLI commands, API endpoints]

## Active Patterns
[Key patterns used, where they're implemented]

## Recent Changes
[Last 5-10 significant changes with context]

## Quick Reference
[Common commands, test patterns, build steps]
```

## Module Deep Dive Format (.claude/context/modules/*.md)

```markdown
# [Module Name]
> Last updated: [timestamp]
> Path: [relative path]

## Purpose
[What this module does and why it exists]

## Key Files
| File | Purpose | Key Exports |
|------|---------|-------------|
| file.ts | ... | ... |

## Public API
[Main functions/classes with signatures and brief descriptions]

## Internal Architecture
[How it's structured internally, key private functions]

## Dependencies
- **Imports from**: [list modules this depends on]
- **Imported by**: [list modules that depend on this]

## Patterns Used
[Specific patterns implemented here]

## Edge Cases / Gotchas
[Things to watch out for]
```

## architecture.md Format

```markdown
# Architecture Overview
> Last updated: [timestamp]

## System Purpose
[High-level description]

## Tech Stack
[Languages, frameworks, key libraries]

## Directory Structure
[Full tree with descriptions]

## Layer Diagram
[Text or mermaid diagram showing architectural layers]

## Build & Deploy
[How it's built, deployed, run]
```

## relationships.md Format

```markdown
# Component Relationships
> Last updated: [timestamp]

## Dependency Graph
[Mermaid or text diagram]

## Data Flow
[How data moves through the system]

## Shared State
[Global state, caches, singletons]

## External Integrations
[APIs, databases, services]
```

## patterns.md Format

```markdown
# Codebase Patterns
> Last updated: [timestamp]

## [Pattern Name]
- **Purpose**: Why this pattern is used
- **Implementation**: Where it's implemented (file:line refs)
- **Usage**: How to use it correctly
- **Example**: Brief code example if helpful
```

## Quality Checklist

Before considering a map update complete:

- [ ] Timestamps updated
- [ ] File:line references are accurate
- [ ] No stale references to deleted code
- [ ] SESSION_CONTEXT.md reflects changes
- [ ] Cross-references between maps are consistent
