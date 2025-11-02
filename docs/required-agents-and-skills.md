# Required Agents and Skills for Dashboard Builder Project

## Executive Summary

This document outlines the agents and skills needed to build the dashboard builder application. Some agents already exist and can be reused, while others need to be created specifically for this project.

---

## ✅ Existing Agents (Ready to Use)

These agents are already available and suitable for the dashboard builder project:

### 1. **prd-writer** (Research/Planning)
- **Location**: `.claude/agents/research-planning/prd-writer.md`
- **Purpose**: Creates focused PRDs under 400 lines
- **Usage**: Generate initial PRD using `/design:generate-dashboard-prd`
- **Status**: ✅ Ready

### 2. **system-architect** (Research/Planning)
- **Location**: `.claude/agents/research-planning/system-architect.md`
- **Purpose**: Comprehensive system design and architecture planning
- **Usage**: Design overall application architecture, tech stack decisions, data flow
- **Status**: ✅ Ready

### 3. **ui-designer** (Research/Planning)
- **Location**: `.claude/agents/research-planning/ui-designer.md`
- **Purpose**: Research-only UI/UX designer for specifications
- **Usage**: Create visual specifications aligned with Salt Design System
- **Status**: ✅ Ready

### 4. **nextjs-expert** (Research/Planning)
- **Location**: `.claude/agents/research-planning/nextjs-expert.md`
- **Purpose**: Next.js 13-15+ App Router, server/client components
- **Usage**: Framework-specific patterns and optimization
- **Status**: ✅ Ready

### 5. **react-typescript-specialist** (Implementation)
- **Location**: `.claude/agents/implementation/react-typescript-specialist.md`
- **Purpose**: React components with strict TypeScript typing
- **Usage**: Build dashboard components and widget system
- **Status**: ✅ Ready

### 6. **playwright-expert** (Implementation)
- **Location**: `.claude/agents/research-planning/playwright-expert.md`
- **Purpose**: E2E testing strategies and test specifications
- **Usage**: Create comprehensive tests for TDD workflow
- **Status**: ✅ Ready

### 7. **playwright-expert** (Implementation)
- **Location**: `.claude/agents/implementation/playwright-expert.md`
- **Purpose**: Executable Playwright test files for TDD
- **Usage**: E2E testing implementation
- **Status**: ✅ Ready

### 8. **orchestrator** (Coordination)
- **Location**: `.claude/agents/coordination/orchestrator.md`
- **Purpose**: Coordinates multiple specialist agents working simultaneously
- **Usage**: Manage complex multi-faceted goals
- **Status**: ✅ Ready

---

## 🆕 Agents to Create

These agents need to be created specifically for the dashboard builder project:

### 1. **salt-ds-expert** (Research/Planning) - HIGH PRIORITY
**Purpose**: Salt Design System component selection and integration
**Similar to**: `shadcn-expert.md`
**Responsibilities**:
- Research Salt DS components from Figma reference
- Component selection for dashboard layouts, widget containers, controls
- Accessibility patterns specific to Salt DS
- Theme customization and styling guidelines
- Integration patterns with React/Next.js

**Why needed**: The project mandates Salt Design System usage. Similar to how shadcn-expert helps with shadcn/ui, this agent ensures proper Salt DS component usage.

**Tools**: Read, Write, WebSearch, WebFetch

**Example usage**:
```
"Help me select the right Salt DS components for the dashboard grid layout and widget containers"
```

---

### 2. **github-api-expert** (Research/Planning) - HIGH PRIORITY
**Purpose**: GitHub REST/GraphQL API integration strategy
**Similar to**: `reddit-api-expert.md`, `youtube-api-expert.md`
**Responsibilities**:
- GitHub API authentication (personal access tokens, OAuth apps)
- Rate limiting strategies (5000 req/hour for authenticated)
- GraphQL vs REST API decision matrix
- Repository metrics endpoints
- Contributor data fetching
- Commit history and trends
- Caching strategies for different endpoints
- TypeScript types for GitHub API responses

**Why needed**: Core data source for the dashboard. Needs expertise in GitHub API quotas, caching, and efficient data fetching.

**Tools**: Read, Write, WebFetch, WebSearch

**Example queries**:
```
"Design a GitHub API integration that fetches repository stars, forks, and contributor activity with quota optimization"
```

---

### 3. **npm-api-expert** (Research/Planning) - HIGH PRIORITY
**Purpose**: npm Registry API integration strategy
**Similar to**: `reddit-api-expert.md`, `youtube-api-expert.md`
**Responsibilities**:
- npm Registry API endpoints (https://registry.npmjs.org)
- Download statistics API (npm-stat, download-counts)
- Package metadata fetching
- Rate limiting and caching
- TypeScript types for npm API responses
- Historical data retrieval strategies
- Package health metrics integration

**Why needed**: Second core data source. npm API has different patterns than GitHub (public registry vs authenticated API).

**Tools**: Read, Write, WebFetch, WebSearch

**Example queries**:
```
"Create an npm API integration for fetching package download trends and version history"
```

---

### 4. **recharts-expert** (Research/Planning) - MEDIUM PRIORITY
**Purpose**: Data visualization with Recharts library
**Responsibilities**:
- Chart type selection (line, bar, pie, area, scatter, radar)
- Recharts component patterns for React
- Responsive chart design
- Custom tooltip and legend design
- Animation and interaction patterns
- Performance optimization for large datasets
- TypeScript typing for chart data
- Accessibility considerations for charts

**Why needed**: Dashboard builder requires sophisticated data visualizations. While frontend-components skill covers some Recharts basics, a dedicated expert ensures optimal chart implementations.

**Tools**: Read, Write, WebSearch, WebFetch

**Example usage**:
```
"Design a line chart widget that shows GitHub star growth over time with drill-down capability"
```

---

### 5. **dashboard-layout-expert** (Research/Planning) - MEDIUM PRIORITY
**Purpose**: Dashboard grid layout system and widget positioning
**Responsibilities**:
- Grid layout library selection (react-grid-layout, react-gridstack)
- Responsive grid patterns
- Widget resizing and drag-drop implementation
- Layout persistence strategies
- Collision detection and grid constraints
- Mobile-responsive dashboard design
- Performance optimization for many widgets

**Why needed**: Core requirement is resizable, repositionable widgets. This requires specialized knowledge of dashboard layout libraries and patterns.

**Tools**: Read, Write, WebSearch, WebFetch

**Example usage**:
```
"Design a grid layout system that allows users to resize and reposition widgets with touch support"
```

---

### 6. **widget-architecture-expert** (Research/Planning) - MEDIUM PRIORITY
**Purpose**: Modular widget system architecture
**Responsibilities**:
- Widget plugin architecture design
- Widget lifecycle management
- Widget configuration schema design
- Widget state management patterns
- Widget registry/catalog implementation
- Dynamic widget loading strategies
- Widget type system with TypeScript
- Widget props and configuration patterns

**Why needed**: The dashboard builder revolves around a widget system. Proper architecture ensures extensibility and maintainability.

**Tools**: Read, Write, WebSearch

**Example usage**:
```
"Design a widget architecture that allows easy addition of new widget types with type-safe configuration"
```

---

## 🔄 Skills to Adapt/Create

The existing skills are project-specific (ClaudeCode Sentiment Monitor). New versions are needed:

### 1. **frontend-components** (Project Skill) - HIGH PRIORITY
**Current**: Specific to ClaudeCode Sentiment Monitor with shadcn/ui + Recharts
**Needed**: Dashboard builder version with Salt DS + Recharts
**Changes**:
- Replace shadcn/ui references with Salt DS components
- Update component templates for widget system
- Add dashboard layout patterns
- Widget-specific component patterns
- Salt DS styling with Tailwind CSS

**Status**: 🔄 Needs adaptation

---

### 2. **backend-api** (Project Skill) - HIGH PRIORITY
**Current**: Reddit + OpenAI API integration patterns
**Needed**: GitHub + npm API integration patterns
**Changes**:
- Service layer for GitHubService and NpmService
- API routes for dashboard data endpoints
- Widget data endpoints
- Rate limiting specific to GitHub/npm
- Caching strategies for metrics data

**Status**: 🔄 Needs new version

---

### 3. **database-schema** (Project Skill) - MEDIUM PRIORITY
**Current**: Prisma schema for Reddit posts and sentiment
**Needed**: Schema for dashboards, widgets, and cached API data
**Changes**:
- Dashboard and widget models
- User preferences and layouts
- Cached GitHub/npm data
- Widget configurations
- Time-series data optimization

**Status**: 🔄 Needs new version

---

## 📋 Agent Creation Priority

### Phase 1: Planning & Design (Week 1)
1. ✅ Use existing **prd-writer** to create PRD
2. 🆕 Create **salt-ds-expert** agent
3. 🆕 Create **github-api-expert** agent
4. 🆕 Create **npm-api-expert** agent
5. ✅ Use existing **system-architect** for overall design

### Phase 2: Architecture & Specifications (Week 2)
6. 🆕 Create **widget-architecture-expert** agent
7. 🆕 Create **dashboard-layout-expert** agent
8. 🆕 Create **recharts-expert** agent
9. ✅ Use existing **ui-designer** for Salt DS specifications

### Phase 3: Implementation (Week 3-4)
10. 🔄 Create **frontend-components** skill (adapted)
11. 🔄 Create **backend-api** skill (adapted)
12. 🔄 Create **database-schema** skill (adapted)
13. ✅ Use existing **react-typescript-specialist** for implementation
14. ✅ Use existing **nextjs-expert** for Next.js patterns

### Phase 4: Testing (Week 5)
15. ✅ Use existing **playwright-expert** for E2E tests

---

## 🎯 Quick Start Workflow

### Step 1: Generate PRD
```bash
/design:generate-dashboard-prd docs/dashboard-prd.md
```

### Step 2: Create Missing Agents (Priority Order)
```bash
# Create these agents in .claude/agents/research-planning/
1. salt-ds-expert.md
2. github-api-expert.md
3. npm-api-expert.md
4. recharts-expert.md
5. dashboard-layout-expert.md
6. widget-architecture-expert.md
```

### Step 3: System Architecture Design
```bash
# Use existing system-architect agent
"Design the complete system architecture for the dashboard builder based on the PRD"
```

### Step 4: Create Project Skills
```bash
# Create in .claude/skills/
- frontend-components/SKILL.md (adapted for Salt DS)
- backend-api/SKILL.md (adapted for GitHub/npm APIs)
- database-schema/SKILL.md (adapted for dashboard data models)
```

### Step 5: Implementation
```bash
# Use orchestrator to coordinate multiple agents
# Or use sequential workflow with specialized agents
```

---

## 📚 Agent Template References

When creating new agents, follow patterns from existing agents:

- **API Experts**: See `reddit-api-expert.md`, `youtube-api-expert.md`, `chatgpt-expert.md`
- **UI/Component Experts**: See `shadcn-expert.md`, `ui-designer.md`
- **Architecture Experts**: See `system-architect.md`
- **Framework Experts**: See `nextjs-expert.md`

---

## 🔗 Dependencies Between Agents

```
prd-writer
    ↓
system-architect ← salt-ds-expert, github-api-expert, npm-api-expert
    ↓
widget-architecture-expert, dashboard-layout-expert, recharts-expert
    ↓
ui-designer (with Salt DS context)
    ↓
frontend-components (skill), backend-api (skill), database-schema (skill)
    ↓
react-typescript-specialist, nextjs-expert
    ↓
playwright-expert
```

---

## ✅ Summary

### Ready to Use (8 agents)
- prd-writer
- system-architect
- ui-designer
- nextjs-expert
- react-typescript-specialist
- playwright-expert
- orchestrator

### Need to Create (6 agents)
1. **salt-ds-expert** - HIGH PRIORITY
2. **github-api-expert** - HIGH PRIORITY
3. **npm-api-expert** - HIGH PRIORITY
4. **recharts-expert** - MEDIUM PRIORITY
5. **dashboard-layout-expert** - MEDIUM PRIORITY
6. **widget-architecture-expert** - MEDIUM PRIORITY

### Need to Adapt (3 skills)
1. **frontend-components** - HIGH PRIORITY
2. **backend-api** - HIGH PRIORITY
3. **database-schema** - MEDIUM PRIORITY

---

## Next Steps

1. Run `/design:generate-dashboard-prd docs/dashboard-prd.md` to create the PRD
2. Create the 3 high-priority agents (salt-ds-expert, github-api-expert, npm-api-expert)
3. Use system-architect to design the overall architecture
4. Create the 3 medium-priority agents as needed during design phase
5. Adapt the 3 skills for the dashboard builder project
6. Begin implementation using existing implementation agents

This approach ensures you have all the specialized knowledge needed while leveraging existing agents where possible.
