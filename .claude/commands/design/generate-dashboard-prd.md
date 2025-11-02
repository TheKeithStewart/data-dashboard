---
allowed-tools: Task
description: Generate comprehensive PRD for dashboard builder web application
argument-hint: [output-path]
---

# Generate Dashboard Builder PRD

Generate a comprehensive Product Requirements Document (PRD) for a dashboard builder web application using the prd-writer agent.

## Usage

```bash
/design:generate-dashboard-prd docs/dashboard-prd.md
```

## What This Does

Uses the prd-writer agent to create a focused PRD (under 400 lines) that defines:
- Product vision and user needs
- Core functionality requirements
- User stories and acceptance criteria
- Success metrics
- Technical approach (high-level only)

## Task for PRD Writer Agent

Generate a comprehensive Product Requirements Document (PRD) for a dashboard builder web application with the following specifications:

## Product Overview
Create a PRD for a web application that enables users to build and customize data visualization dashboards using public API data sources.

## Core Functionality Requirements

### Dashboard Management
- Users can create multiple independent dashboards
- Each dashboard serves as a canvas for organizing widgets
- Users can switch between different dashboards
- Dashboard naming, editing, and deletion capabilities
- Save/persist dashboard configurations

### Widget System
- **Widget Catalog**: A browsable collection of pre-built data visualization widgets
- **Widget Addition**: Users can select and add widgets from the catalog to any dashboard
- **Widget Resizing**: Each widget on a dashboard can be dynamically resized by the user
- **Widget Positioning**: Widgets can be dragged and repositioned on the dashboard
- **Widget Configuration**: Different widgets can have different configurations on different dashboards
- **Widget Removal**: Users can remove widgets from dashboards
- **Flexible Layouts**: Support for grid-based or free-form widget arrangements

### Data Sources
- **GitHub Public API**: Integration for retrieving GitHub-related metrics including:
  - Repository statistics (stars, forks, issues, PRs)
  - Contributor activity
  - Commit history and trends
  - Release information
  - Repository health metrics
- **npm Public API**: Integration for retrieving npm package statistics including:
  - Download counts and trends
  - Package popularity metrics
  - Version information
  - Dependency analysis
  - Package health scores

### Design System
- **Mandatory**: Use the Salt Design System for all UI components
- **Design Reference**: https://www.figma.com/design/tZUqsVcqY5REGzbWagkl5Q/Salt-DS-Components-and-Patterns--Community---Copy-?m=auto&t=ETaENrfc5i2JDOSY-6
- Ensure all UI components, patterns, and interactions align with Salt DS principles
- Maintain consistency with Salt DS color palette, typography, and spacing

## PRD Structure Requirements

Structure the PRD with these sections:

1. **Executive Summary** (100-150 words)
   - Product vision and goals
   - Target users (developers, DevOps engineers, open-source maintainers)
   - Key value propositions

2. **User Stories** (8-10 stories)
   - Dashboard creation and management
   - Widget catalog browsing and selection
   - Widget addition and configuration workflow
   - Widget resizing and positioning
   - Data source connection (GitHub/npm)
   - Dashboard viewing and monitoring
   - Multi-dashboard workflows

3. **Functional Requirements** (Bullet points, no implementation details)
   - Dashboard CRUD operations
   - Widget catalog system
   - Widget lifecycle (add, configure, resize, move, remove)
   - Data fetching requirements
   - Real-time or scheduled data refresh
   - Responsive design requirements

4. **Widget Catalog Specifications**
   - List 10-12 specific widget types with:
     - Widget name and purpose
     - Data visualization type (line chart, bar chart, metric card, gauge, table, etc.)
     - Which API(s) it uses (GitHub/npm/both)
     - What specific metrics it displays
     - Key configuration options (without implementation details)
   - Examples:
     - "GitHub Stars Trend" - Line chart showing star growth over time
     - "npm Downloads" - Bar chart showing weekly/monthly download counts
     - "Repository Health" - Metric card with health score and indicators
     - "Top Contributors" - Table/list of most active contributors

5. **Technical Approach** (50-100 words, high-level only)
   - Technology stack (Next.js, React, TypeScript)
   - Architecture pattern (self-hosted, API-driven)
   - Salt Design System as UI framework
   - Data persistence approach (without specifics)
   - NO implementation details, code, or API endpoints

6. **Success Metrics** (5-8 metrics)
   - User engagement (dashboards created, widgets added)
   - User satisfaction indicators
   - Performance targets (page load, data refresh times)
   - Dashboard usability metrics

7. **Risks & Assumptions** (Brief list)
   - API rate limiting considerations
   - Browser compatibility requirements
   - Data refresh frequency limitations
   - User authentication assumptions

8. **Out of Scope for v1**
   - Features explicitly not included in initial release
   - Custom widget creation by users
   - Data source extensibility beyond GitHub/npm
   - Collaboration features
   - Widget sharing between users

## Output Requirements
- Write PRD to: `$ARGUMENTS` (or default to `docs/dashboard-builder-prd.md`)
- Stay under 400 lines
- Focus on WHAT and WHY, not HOW
- No code examples, API URLs, or technical implementation details
- Clear, concise user stories with acceptance criteria
- Measurable success metrics

## Execution Steps

1. Use the Task tool to invoke the prd-writer agent
2. Pass this entire prompt to the agent
3. Agent writes PRD to specified output path
4. Display summary of created PRD with file path

The PRD will serve as the foundation for subsequent design and implementation phases using specialized agents.
