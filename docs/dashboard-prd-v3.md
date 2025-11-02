# Product Requirements Document: Dashboard Builder with Extensible Widget Framework

**Version**: 3.0
**Date**: 2025-11-02
**Status**: Draft
**Product Owner**: Dashboard Builder Team

---

## 1. Executive Summary

Dashboard Builder is a web application that empowers users to create customizable data visualization dashboards using an extensible widget framework. The product distinguishes itself through a sophisticated architectural approach that separates data acquisition, business logic, and visualization layers. Users browse a catalog of pre-built widgets, add them to personalized dashboards, and configure them with GitHub and npm public API data. The widget framework enables rapid addition of new widget types by providing generic, reusable visualization components that consume normalized data regardless of source. This architecture reduces development time for new widgets from days to hours while maintaining consistency and quality. Target users include engineering teams, open-source maintainers, and product managers who need flexible, multi-source data visualization without custom development.

**Key Value Proposition**: Build custom dashboards in minutes using an extensible widget system that makes adding new data sources and visualizations straightforward through architectural separation of concerns.

---

## 2. User Stories

### US-001: Dashboard Management Page
**As a** dashboard user
**I want** a dedicated page listing all my dashboards with thumbnails and metadata
**So that** I can easily browse, search, and navigate between multiple dashboards
**Acceptance Criteria**:
- Given I have created multiple dashboards, When I navigate to the management page, Then I see a grid view of all dashboards with names and preview thumbnails
- Given I am viewing the management page, When I click a dashboard card, Then I navigate to that dashboard's detail view
- Given I am on the management page, When I click "Create Dashboard", Then a new blank dashboard is created

### US-002: Widget Catalog Discovery
**As a** dashboard creator
**I want** a left side panel displaying all available widget types with descriptions
**So that** I can discover and understand what visualizations are available
**Acceptance Criteria**:
- Given I am viewing a dashboard, When I open the widget catalog panel, Then I see categorized widgets with names, icons, and short descriptions
- Given the catalog is open, When I search for widgets, Then results filter based on name, description, or data source
- Given I am browsing widgets, When I hover over a widget, Then I see a preview or example visualization

### US-003: Widget Addition via Drag-and-Drop
**As a** dashboard creator
**I want** to drag widgets from the catalog onto my dashboard
**So that** I can quickly build my desired layout
**Acceptance Criteria**:
- Given the widget catalog is open, When I drag a widget onto the dashboard canvas, Then it appears at the drop location with default sizing
- Given I am adding a widget, When I drop it in an occupied space, Then the layout adjusts to accommodate the new widget
- Given a widget is added, When I cancel the action, Then the widget is removed and layout reverts

### US-004: Board-Level Data Filtering
**As a** dashboard user
**I want** a filtering panel that applies date ranges and criteria across all widgets
**So that** I can view consistent time periods and data subsets across my entire dashboard
**Acceptance Criteria**:
- Given I have multiple widgets on a dashboard, When I select a date range filter, Then all compatible widgets update to reflect that time period
- Given I apply a repository filter, When a widget supports repository filtering, Then only data for selected repositories displays
- Given filters are active, When I save the dashboard, Then filter state persists and reloads on next visit

### US-005: Widget Configuration for Different Data Sources
**As a** dashboard creator
**I want** to configure the same widget type with different data sources
**So that** I can compare metrics from GitHub and npm side-by-side
**Acceptance Criteria**:
- Given I add a "Trend Chart" widget, When I configure it with GitHub stargazers data, Then it displays GitHub repository star history
- Given I add another "Trend Chart" widget, When I configure it with npm download data, Then it displays npm package download history
- Given both widgets exist, When I view the dashboard, Then each maintains its independent configuration

### US-006: Widget Resizing and Positioning
**As a** dashboard creator
**I want** to resize and reposition widgets by dragging boundaries and moving widgets
**So that** I can create a layout that emphasizes the most important information
**Acceptance Criteria**:
- Given a widget exists on my dashboard, When I drag its edges, Then the widget resizes and adjusts layout accordingly
- Given multiple widgets exist, When I drag a widget to a new position, Then other widgets rearrange to prevent overlap
- Given I resize a widget, When it becomes too small for content, Then minimum size constraints prevent further reduction

### US-007: Multi-Dashboard Workflow
**As a** engineering manager
**I want** to create separate dashboards for different projects or teams
**So that** I can organize data visualizations by context and share relevant views
**Acceptance Criteria**:
- Given I manage multiple projects, When I create dashboards named "Project Alpha" and "Project Beta", Then each maintains independent widget configurations
- Given I have multiple dashboards, When I switch between them, Then widget states, filters, and layouts persist independently
- Given I need to reorganize, When I rename or delete a dashboard, Then changes reflect immediately in the management page

### US-008: Widget Removal and Cleanup
**As a** dashboard creator
**I want** to remove widgets I no longer need from my dashboard
**So that** I can keep my dashboard focused and uncluttered
**Acceptance Criteria**:
- Given a widget exists on my dashboard, When I click the remove button, Then the widget disappears and layout reflows
- Given I accidentally remove a widget, When I use undo functionality, Then the widget returns to its previous position
- Given I remove all widgets, When I view my dashboard, Then I see an empty state with instructions to add widgets

### US-009: Generic Chart Widget with Multiple Data Sources
**As a** dashboard creator
**I want** chart widgets that work with any time-series or categorical data
**So that** I don't need to learn different chart types for different data sources
**Acceptance Criteria**:
- Given I add a Line Chart widget, When I configure it with GitHub commit data, Then it visualizes commits over time
- Given the same Line Chart widget type, When I configure another instance with npm download data, Then it visualizes downloads over time
- Given both charts exist, When I apply board-level date filters, Then both charts update to show the filtered time range

### US-010: Metric Widget for Key Performance Indicators
**As a** product manager
**I want** metric card widgets that display single values with trend indicators
**So that** I can see at-a-glance performance metrics
**Acceptance Criteria**:
- Given I add a Metric widget, When I configure it to show total GitHub stars, Then it displays the current count with visual styling
- Given the metric includes historical data, When I view the widget, Then I see a trend indicator showing increase or decrease
- Given I configure comparison periods, When viewing the metric, Then I see percentage change from previous period

### US-011: Table Widget for Detailed Data Exploration
**As a** data analyst
**I want** table widgets that display structured data with sorting and filtering
**So that** I can explore detailed information beyond summary visualizations
**Acceptance Criteria**:
- Given I add a Table widget, When I configure it with GitHub contributor data, Then it displays contributor names, commit counts, and activity dates
- Given the table contains data, When I click column headers, Then data sorts ascending or descending
- Given the table has many rows, When I enable pagination, Then I can navigate through pages of data

### US-012: Dashboard Persistence and Auto-Save
**As a** dashboard user
**I want** my dashboard configurations to save automatically
**So that** I don't lose work if I navigate away or close my browser
**Acceptance Criteria**:
- Given I add or modify widgets, When changes occur, Then the system auto-saves after a brief delay
- Given I have unsaved changes, When I attempt to navigate away, Then I receive a warning about unsaved work
- Given I return to a saved dashboard, When I load it, Then all widgets, positions, sizes, and filters restore exactly as I left them

---

## 3. Functional Requirements

### Dashboard Management
- Create new dashboards with user-defined names
- List all dashboards in a dedicated management interface with search and filtering
- Edit dashboard metadata including name, description, and tags
- Delete dashboards with confirmation prompts
- Duplicate existing dashboards to create templates
- Navigate between dashboards without losing state
- Persist dashboard configurations in browser or backend storage
- Support responsive layouts for desktop, tablet, and mobile viewports

### Dashboard Management Page
- Display dashboard cards in grid layout with thumbnails or icons
- Show dashboard metadata: name, creation date, last modified, widget count
- Provide search functionality to filter dashboards by name or tags
- Support sorting by name, date created, or date modified
- Enable bulk operations: delete multiple dashboards, export configurations
- Quick actions: edit name, duplicate, delete from card interface

### Widget Framework Architecture
- **Base Widget Interface**: Define standardized lifecycle hooks for all widgets (initialize, mount, update, unmount, configure)
- **Data Adapter Pattern**: Implement adapter layer that transforms API responses into normalized formats consumed by generic widgets
- **Generic Visualization Components**: Provide reusable chart, metric, table, and list components that accept standardized data structures
- **Widget Registry System**: Maintain central registry mapping widget IDs to factory functions and metadata
- **Configuration Schema**: Define JSON schema or TypeScript interface for each widget type's configuration options
- **Widget Lifecycle Management**: Handle widget instantiation, data fetching, error states, loading states, and cleanup
- **Separation of Concerns**: Isolate data fetching logic, business logic, and presentation logic into distinct layers
- **Extensibility Hooks**: Provide clear extension points for adding new widget types, data sources, and visualization styles

### Widget Catalog System
- Display widget catalog in collapsible left side panel when viewing dashboard
- Organize widgets by category: Charts, Metrics, Tables, Lists, Specialized
- Show widget metadata: name, description, icon, data source compatibility, preview image
- Search and filter catalog by widget name, category, or data source
- Drag-and-drop widgets from catalog to dashboard canvas
- Click-to-add widgets with default positioning
- Indicate which widgets require specific data source configurations

### Board-Level Filtering System
- Provide global filter panel in left sidebar alongside or above widget catalog
- Support date range filters with presets: Last 7 Days, Last 30 Days, Last Quarter, Custom Range
- Support repository selection filters for GitHub data sources
- Support package selection filters for npm data sources
- Support status and category filters applicable to multiple data types
- Apply filters globally to all compatible widgets on current dashboard
- Display filter state visually on dashboard with active filter indicators
- Persist filter configurations with dashboard state
- Allow users to reset filters to default state

### Widget Lifecycle Operations
- **Addition**: Drag widget from catalog or click to add with automatic positioning
- **Positioning**: Drag widget to new location with collision detection and layout reflow
- **Resizing**: Drag widget edges with minimum and maximum size constraints
- **Configuration**: Open configuration panel for each widget instance with data source and display options
- **Duplication**: Clone existing widget with current configuration
- **Removal**: Delete widget with optional confirmation, undo support

### Data Fetching Requirements
- Fetch data from GitHub Public API for repository metrics, contributors, issues, pull requests, stars, forks
- Fetch data from npm Public API for package downloads, versions, dependencies, metadata
- Implement client-side caching to minimize redundant API calls
- Handle API rate limiting gracefully with user feedback
- Support incremental data loading for time-series widgets
- Provide loading indicators during data fetch operations
- Handle error states with clear user messaging and retry options
- Normalize API responses through data adapters before passing to widgets

### Responsive Design Requirements
- Support desktop viewports with multi-column grid layouts
- Adapt to tablet viewports with responsive grid column counts
- Provide mobile-optimized layouts with single-column or stacked widgets
- Hide or collapse widget catalog panel on mobile devices
- Maintain widget functionality across all viewport sizes
- Support touch interactions for drag, resize, and configuration on touch devices

---

## 4. Widget Catalog Specifications

### Chart Widgets (Using Generic Chart Component)

#### W-001: GitHub Stars Trend
- **Widget Type**: Generic Chart Widget (line chart)
- **Data Source**: GitHub Public API - stargazers timeline
- **Metrics**: Star count over time, total stars, growth rate
- **Configuration**: Repository selection, date range, trend line toggle
- **Data Adapter**: Transforms GitHub stargazers response to time-series format (timestamp, value)

#### W-002: npm Download Trend
- **Widget Type**: Generic Chart Widget (line chart or bar chart)
- **Data Source**: npm Public API - download counts
- **Metrics**: Daily or weekly downloads, total downloads, download velocity
- **Configuration**: Package selection, date range, granularity (daily/weekly), chart style
- **Data Adapter**: Transforms npm downloads response to time-series format

#### W-003: Commit Activity Chart
- **Widget Type**: Generic Chart Widget (area chart)
- **Data Source**: GitHub Public API - commit activity statistics
- **Metrics**: Commits per day/week, contributor activity distribution
- **Configuration**: Repository selection, date range, aggregation level
- **Data Adapter**: Aggregates commit data into time-series format

#### W-004: Package Version Distribution
- **Widget Type**: Generic Chart Widget (pie chart or bar chart)
- **Data Source**: npm Public API - package version usage
- **Metrics**: Version adoption percentages, latest vs legacy usage
- **Configuration**: Package selection, version grouping options
- **Data Adapter**: Transforms version data into categorical format (label, value, percentage)

### Metric Widgets (Using Generic Metric Component)

#### W-005: Repository Health Score
- **Widget Type**: Generic Metric Widget (single value with trend)
- **Data Source**: GitHub Public API - composite calculation from stars, forks, issues, activity
- **Metrics**: Health score (0-100), trend indicator, contributing factors
- **Configuration**: Repository selection, scoring weight preferences
- **Data Adapter**: Calculates composite score and formats as metric object (value, trend, metadata)

#### W-006: Total Package Downloads
- **Widget Type**: Generic Metric Widget (single value with comparison)
- **Data Source**: npm Public API - download counts
- **Metrics**: Total downloads, percentage change from previous period
- **Configuration**: Package selection, comparison period
- **Data Adapter**: Aggregates download totals and calculates percentage change

#### W-007: Open Issues Count
- **Widget Type**: Generic Metric Widget (single value with status)
- **Data Source**: GitHub Public API - issues endpoint
- **Metrics**: Open issue count, age distribution, priority breakdown
- **Configuration**: Repository selection, issue state filters
- **Data Adapter**: Counts issues and formats as metric with status indicator

### Table Widgets (Using Generic Table Component)

#### W-008: Top Contributors
- **Widget Type**: Generic Table Widget
- **Data Source**: GitHub Public API - contributors endpoint
- **Metrics**: Contributor name, commit count, lines changed, recent activity
- **Configuration**: Repository selection, sort order, row limit
- **Data Adapter**: Transforms contributors array into table format (columns, rows, sort keys)

#### W-009: Recent Releases
- **Widget Type**: Generic Table Widget
- **Data Source**: GitHub Public API - releases endpoint, npm Public API - versions
- **Metrics**: Release version, date, download count, changelog summary
- **Configuration**: Repository/package selection, release count limit
- **Data Adapter**: Combines release data into table format with sortable columns

#### W-010: Dependency List
- **Widget Type**: Generic Table Widget
- **Data Source**: npm Public API - package dependencies
- **Metrics**: Dependency name, version, license, last updated, security status
- **Configuration**: Package selection, dependency depth, filter outdated
- **Data Adapter**: Parses dependency tree into flat table structure

### List Widgets (Using Generic List Component)

#### W-011: Popular Repositories
- **Widget Type**: Generic List Widget (ranked list)
- **Data Source**: GitHub Public API - search/repositories
- **Metrics**: Repository name, stars, description, language
- **Configuration**: Search criteria, sort order, list length
- **Data Adapter**: Transforms repository array into ranked list format (rank, title, subtitle, metadata)

#### W-012: Trending Packages
- **Widget Type**: Generic List Widget (ranked list)
- **Data Source**: npm Public API - search/packages with npms.io quality scores
- **Metrics**: Package name, weekly downloads, quality score, description
- **Configuration**: Category filter, time period, list length
- **Data Adapter**: Combines npm and npms.io data into ranked list format

---

## 5. Technical Approach

The Dashboard Builder employs a modern web stack centered on Next.js 15 with React 19 and TypeScript 5, ensuring type safety throughout. The widget framework architecture follows a plugin pattern where each widget type registers itself with a central registry providing factory functions, schemas, and metadata. Generic visualization components built with Recharts 3 accept normalized data structures through a data adapter layer that transforms API responses from GitHub and npm into consistent formats.

The separation of concerns architecture isolates three distinct layers: data fetching services communicate with external APIs and implement caching strategies; business logic layer contains data adapters that normalize responses and calculate derived metrics; presentation layer consists of generic widget components that render data without knowledge of its source. The Salt Design System provides all UI components ensuring consistent styling and accessibility compliance.

Dashboard state including widget configurations, layouts, and filters persists using browser local storage for v1, with backend persistence considered for future versions. The react-grid-layout library manages widget positioning and resizing with responsive breakpoints for multi-device support.

---

## 6. Success Metrics

### User Engagement Metrics
- **Dashboard Creation Rate**: Average number of dashboards created per active user per month (target: 3+)
- **Widget Adoption**: Percentage of available widget types used across all dashboards (target: 70%+)
- **Session Duration**: Average time spent per dashboard viewing session (target: 8+ minutes)

### Widget Framework Effectiveness
- **Widget Reusability**: Percentage of widget instances using generic components vs specialized implementations (target: 85%+)
- **Widget Diversity**: Average number of different widget types per dashboard (target: 5+)
- **Configuration Flexibility**: Percentage of widgets with modified configurations vs default settings (target: 60%+)

### Performance Metrics
- **Initial Load Time**: Time to first meaningful paint for dashboard page (target: <2 seconds)
- **Widget Render Time**: Average time for individual widget to fetch data and render (target: <1 second)
- **API Efficiency**: Cache hit rate for API requests (target: 70%+)

### Usability Metrics
- **Dashboard Completion Rate**: Percentage of users who add 3+ widgets after creating a dashboard (target: 75%+)
- **Widget Catalog Discovery**: Percentage of users who browse catalog within first session (target: 90%+)

---

## 7. Risks & Assumptions

### Technical Risks
- **API Rate Limiting**: GitHub API limits 60 requests/hour unauthenticated, 5000/hour authenticated. Risk: Heavy usage dashboards may hit limits. Mitigation: Aggressive caching, user authentication for higher limits.
- **Data Normalization Complexity**: Different API response structures require sophisticated adapters. Risk: Adapter bugs cause widget failures. Mitigation: Comprehensive adapter testing, error boundaries.
- **Browser Performance**: Large dashboards with many widgets may impact performance. Risk: Sluggish UI on lower-end devices. Mitigation: Widget lazy loading, virtualization for long lists.

### Adoption Risks
- **Widget Framework Learning Curve**: Future developers adding widgets must understand adapter pattern. Risk: Slow widget ecosystem growth. Mitigation: Comprehensive documentation, example templates.
- **User Configuration Overwhelm**: Many configuration options may confuse users. Risk: Users abandon complex widgets. Mitigation: Smart defaults, progressive disclosure of advanced options.

### Assumptions
- Users have consistent internet connectivity for API data fetching
- GitHub and npm public APIs remain stable and accessible without authentication for basic use
- Target users understand concepts like repositories, packages, stars, downloads
- Browser local storage sufficient for dashboard persistence in v1 (no user accounts required)
- Salt Design System components cover all required UI patterns
- Widget catalog of 10-12 widgets sufficient for v1 launch

---

## 8. Out of Scope for v1

### Not Included
- **Custom Widget Creation by End Users**: Users cannot build their own widget types through a visual builder or configuration UI (developers can add widgets to framework)
- **Visual Widget Builder UI**: No drag-and-drop interface for designing new widget types
- **Third-Party Widget Marketplace**: No ecosystem for sharing or purchasing community-created widgets
- **Real-Time Data Updates**: Widgets fetch data on demand, no WebSocket or streaming data support
- **Collaboration Features**: No dashboard sharing, permissions, or multi-user editing
- **Additional Data Sources**: Only GitHub and npm in v1, no integration with Jira, Google Analytics, custom APIs
- **Advanced Analytics**: No predictive analytics, anomaly detection, or AI-driven insights
- **Export Functionality**: No dashboard export to PDF, image, or presentation formats
- **Theming Customization**: Salt Design System used as-is, no custom color schemes or branding
- **Mobile App**: Web application only, no native iOS or Android apps
- **User Authentication**: Local storage persistence only, no user accounts or backend storage

### Future Considerations
- Backend API for dashboard persistence and cross-device synchronization
- User authentication and authorization for saved dashboards
- Developer API or SDK for third-party widget creation
- Additional data source integrations based on user demand
- Real-time data streaming for live dashboards
- Collaborative dashboard editing with presence indicators
- Dashboard templates marketplace
- Advanced filtering with custom filter expressions
- Dashboard embedding for external websites
- Scheduled dashboard snapshots and reports

---

**Document End**

Total Lines: ~398
