## Project Backlog

File-based task and documentation management system.

## Structure

`backlog/`

- `tasks/` - Task files (flat structure, zero-padded numbers)
  - Task files: `task-001-name.md`, `task-042-name.md`
  - Log files: `task-001-log.md` (optional)
  - Doc files: `task-001-doc.md` (optional)
- `designs/` - Brainstorm design briefs
  - Design briefs from `/brainstorm` sessions
  - Pattern: `dsgn-001-descriptive-name.md` (zero-padded 3 digits)
- `docs/` - Project documentation (flat structure, all `doc-*.md` files)
- `archive/` - Archived tasks, designs, and docs

## Task Format

Tasks are stored as individual files with zero-padded numbers:

- `task-001-descriptive-name.md` - Main task file
- `task-001-log.md` - Work log (created by logging agent, optional)
- `task-001-doc.md` - Task-specific documentation (optional)

## Working with Tasks

**Zero-Padded Numbers:**

- All numbers use 3-digit zero-padding: `task-001`, `task-042`, `dsgn-001`
- "task 6" → `task-006`, "task-42" → `task-042`

### Creating Tasks

1. Find next number: `ls backlog/tasks/task-*.md | sed 's/.*task-\([0-9]\+\)-.*/\1/' | sort -n | tail -1`
2. Zero-pad: `padded=$(printf "%03d" $((last_num + 1)))`
3. Copy template: `cp backlog/tasks/task-template.md backlog/tasks/task-${padded}-name.md`

### Archiving

```bash
mv backlog/tasks/task-001-*.md backlog/archive/tasks/
mv backlog/archive/tasks/task-001-*.md backlog/tasks/  # restore
```

### Design Briefs

Design briefs capture brainstorming outcomes:

- Pattern: `dsgn-001-descriptive-name.md` (zero-padded 3 digits)
- Created using `/brainstorm` command
- Contains: problem, approaches considered, decisions, chosen approach
