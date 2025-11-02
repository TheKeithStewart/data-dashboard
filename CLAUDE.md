# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository is a **dashboard builder project template** with a sophisticated agent-based workflow system for designing and implementing data visualization dashboards. The project uses:

- **Salt Design System** for UI components
- **GitHub Public API** for repository metrics
- **npm Public API** for package statistics
- **Next.js 15** with React 19 and TypeScript
- **Recharts** for data visualizations

## Core Architecture: Agent-Based Workflow System

This repository follows a **multi-agent design-to-implementation workflow** where specialized AI agents handle different aspects of product development. The architecture separates planning/research agents from implementation agents.

### Agent Categories

**Research/Planning Agents** (`.claude/agents/research-planning/`):
- `prd-writer` - Creates focused PRDs under 400 lines
- `system-architect` - System design and architecture planning
- `ui-designer` - UI/UX specifications (research-only, no implementation)
- `salt-ds-expert` - Salt Design System component selection
- `github-api-expert` - GitHub API integration strategies
- `npm-api-expert` - npm Registry API integration strategies
- `recharts-expert` - Data visualization chart selection
- `dashboard-layout-expert` - Grid layout system design (react-grid-layout)
- `widget-architecture-expert` - Modular widget system architecture
- `nextjs-expert` - Next.js App Router patterns
- `playwright-expert` - E2E testing strategies

**Implementation Agents** (`.claude/agents/implementation/`):
- `react-typescript-specialist` - React components with strict TypeScript
- `playwright-expert` - Executable Playwright E2E tests

**Coordination Agents** (`.claude/agents/coordination/`):
- `orchestrator` - Coordinates multiple specialists (NOT a meta-coordinator)

### Critical Agent Execution Pattern

**IMPORTANT**: Claude Code coordinates agents, NOT the orchestrator agent. The orchestrator is just another specialist that:
- Sets up project structure (Phase 1)
- Synthesizes outputs (final phase)
- Does NOT spawn or coordinate other agents

When executing workflows:
- Each agent invoked with separate `Task` tool call
- Use multiple Task calls in single message for parallel execution
- Never delegate coordination to orchestrator agent

## Project Workflow Commands

### Generate PRD

```bash
/design:generate-dashboard-prd docs/dashboard-prd.md
```

Invokes the `prd-writer` agent to create a comprehensive Product Requirements Document for the dashboard builder.

### Design Application from PRD

```bash
/dev:design-app docs/dashboard-prd.md
```

Multi-phase design workflow that coordinates specialized agents:

**Phase 1**: Orchestrator initialization (project setup only)
**Phase 2**: UI Designer creates wireframes (sequential - foundation required)
**Phase 3**: Parallel agent execution in SINGLE message with multiple Task calls:
  - `shadcn-expert` (or `salt-ds-expert`) - Component selection
  - `playwright-expert` - Test specifications
  - `system-architect` - Integration architecture
  - `reddit-api-expert` (or `github-api-expert`/`npm-api-expert`) - API integration
  - `chatgpt-expert` (if needed) - AI integration

**Phase 4**: Orchestrator synthesis (combines all outputs)

**Output Location**: `.claude/outputs/design/projects/[project-name]/[timestamp]/`

### Implement Application from Design

```bash
/dev:implement-app .claude/outputs/design/projects/[project-name]/[timestamp]/ ./app
```

Builds production-ready application from design specifications with practical implementation approach focused on rapid delivery.

### Setup Design Folders

```bash
/design:setup-folders docs/PRD.md
```

Initializes standardized folder structure for design workflow with MANIFEST.md.

## Skills System

**Skills** are project-specific guides located in `.claude/skills/` that provide implementation patterns:

- `frontend-components/SKILL.md` - React 19 + Next.js 15 component patterns (currently configured for ClaudeCode Sentiment Monitor with shadcn/ui, needs adaptation for Salt DS)
- `backend-api/SKILL.md` - Next.js API routes, service layer patterns (currently Reddit + OpenAI, needs adaptation for GitHub + npm)
- `database-schema/SKILL.md` - Prisma schema and migrations (needs adaptation for dashboard/widget models)
- `skill-creator/SKILL.md` - Guide for creating new skills

**Note**: Current skills are from a previous project (ClaudeCode Sentiment Monitor). For the dashboard builder project, these need to be adapted to use:
- Salt DS instead of shadcn/ui
- GitHub/npm APIs instead of Reddit/OpenAI
- Dashboard/widget data models

## Directory Structure

```
.claude/
├── agents/                    # Specialized AI agents
│   ├── coordination/          # Orchestrator agent
│   ├── implementation/        # Code-writing agents
│   └── research-planning/     # Design & architecture agents
├── commands/                  # Slash commands
│   ├── design/               # Design workflow commands
│   ├── dev/                  # Development workflow commands
│   └── agent_prompts/        # Agent prompt templates
├── skills/                   # Project-specific implementation guides
│   ├── frontend-components/
│   ├── backend-api/
│   └── database-schema/
└── outputs/                  # Generated design outputs
    └── design/
        ├── projects/         # Project-level outputs (MANIFEST.md)
        └── agents/           # Agent-specific outputs

docs/                         # Documentation and PRDs
templates/                    # Project templates
```

## Design Output Structure

When `/dev:design-app` runs, it creates:

```
.claude/outputs/design/projects/[project-name]/[timestamp]/
└── MANIFEST.md              # Registry linking all agent outputs

.claude/outputs/design/agents/
├── ui-designer/[project-name]-[timestamp]/
│   └── design-specification.md
├── salt-ds-expert/[project-name]-[timestamp]/
│   └── component-implementation.md
├── playwright-expert/[project-name]-[timestamp]/
│   └── test-specifications.md
├── system-architect/[project-name]-[timestamp]/
│   └── integration-architecture.md
├── github-api-expert/[project-name]-[timestamp]/
│   └── github-integration.md
└── npm-api-expert/[project-name]-[timestamp]/
    └── npm-integration.md
```

## Agent Output Standards

Each research/planning agent produces **ONE comprehensive markdown file** combining planning and specifications:

- No code implementation (research-only)
- Detailed specifications for implementation agents
- Type-safe TypeScript interface definitions
- Exact values (colors, tokens, endpoints) for THIS specific app
- WCAG accessibility validation where applicable

## Implementation Approach

The repository follows a **design-first, implementation-second** philosophy:

1. **PRD Generation**: Define product requirements
2. **Design Phase**: Multiple specialized agents create comprehensive specifications
3. **Implementation Phase**: Build from specifications with practical, rapid delivery
4. **Progressive Quality**: Start with core functionality, enhance with testing

## Key Technologies for Dashboard Builder

- **Framework**: Next.js 15 App Router, React 19, TypeScript 5
- **Design System**: Salt Design System (mandatory)
- **Data Visualization**: Recharts 3
- **Layout**: react-grid-layout (for drag-and-drop widget positioning)
- **Data Sources**: GitHub REST/GraphQL API, npm Registry API
- **Styling**: Tailwind CSS with Salt DS tokens

## Agent Naming Conventions

- Project names: `lowercase-kebab-case` (e.g., "dashboard-builder")
- Timestamps: `YYYYMMDD-HHMMSS` format (e.g., "20250818-140710")
- Output paths: `.claude/outputs/design/agents/[agent-name]/[project-name]-[timestamp]/`

## Critical Constraints

### For Design Agents

- **Stay under 400 lines** for PRDs
- **Focus on WHAT and WHY**, not HOW
- **No code examples** in research/planning agent outputs
- **Exact values required**: Colors (hex), tokens, API endpoints
- **Avoid AI design clichés**: No purple-blue gradients, generic violet schemes

### For Implementation

- Follow design specifications exactly
- Use Salt DS components (not shadcn/ui for this project)
- Implement widget architecture with TypeScript generics
- Use react-grid-layout for dashboard grid system
- Cache API responses appropriately (GitHub: 1hr, npm: 24hr for static data)

## Dashboard Builder Specific Architecture

### Widget System

The core architecture revolves around a **modular widget system**:

- **Widget Registry Pattern**: Central registry with factory functions
- **Type-Safe Configuration**: Zod schemas for validation
- **Widget Lifecycle**: Initialization → Mounting → Active → Update → Unmounting
- **Data Fetching**: Separate data fetcher per widget type with caching
- **State Isolation**: Each widget manages its own state

### Grid Layout

- **Library**: react-grid-layout
- **Columns**: 12 (desktop), 8 (tablet), 4 (mobile)
- **Row Height**: 80-100px per row unit
- **Features**: Drag-and-drop, resize, collision detection, layout persistence

### API Integration

- **GitHub API**: REST v3 or GraphQL v4 (5000 req/hour authenticated)
- **npm API**: Registry API (no auth), Download Counts API, npms.io (quality scores)
- **Rate Limiting**: Implement client-side throttling and aggressive caching
- **Authentication**: Backend proxy for token management (never expose in client)

## Required Documentation Reference

When working on this project, agents should consult:

- **Salt Design System**: https://www.figma.com/design/tZUqsVcqY5REGzbWagkl5Q/Salt-DS-Components-and-Patterns--Community---Copy-
- **Salt DS Storybook**: https://saltdesignsystem-storybook.pages.dev/
- **GitHub API**: https://docs.github.com/en/rest
- **npm Registry API**: https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md
- **Recharts**: https://recharts.org/
- **react-grid-layout**: https://github.com/react-grid-layout/react-grid-layout

## Status Line

The repository includes a custom status line (`.claude/statusline.sh`) configured in `.claude/settings.json` for displaying project status in Claude Code.

## Current Project State

This repository is a **template/starter** for building dashboard applications. As of now:

- ✅ All 6 required agents created for dashboard builder
- ✅ PRD generation command ready
- ✅ Design workflow command ready
- ✅ Implementation workflow command ready
- ⏳ Skills need adaptation (currently from ClaudeCode Sentiment Monitor project)
- ⏳ No actual dashboard application implemented yet

To start building, run: `/design:generate-dashboard-prd docs/dashboard-prd.md`
