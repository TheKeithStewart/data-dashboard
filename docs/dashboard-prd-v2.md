# Dashboard Builder v2 - Product Requirements Document

## 1. Executive Summary

Dashboard Builder is a web application that enables developers, DevOps engineers, and open-source maintainers to create customized data visualization dashboards using public API data from GitHub and npm. Users can build multiple dashboards through a dedicated management interface, each containing a flexible arrangement of pre-built widgets selected from a persistent left-side panel. Board-level filters in the same panel allow users to apply data constraints across all widgets simultaneously. The product eliminates the need for custom coding to monitor repository health, package performance, and development activity. By providing a drag-and-drop interface with resizable widgets, persistent configurations, and unified filtering capabilities, Dashboard Builder delivers instant visibility into open-source project metrics that matter most to each user's workflow.

**Target Users**: Open-source maintainers, development team leads, DevOps engineers, package authors, community managers

**Key Value**: Unified visibility into GitHub and npm metrics with centralized dashboard management, intuitive widget browsing, and powerful board-level filtering without writing code or managing multiple tools.

## 2. User Stories

### US-01: Dashboard Collection Management
**As a** repository maintainer, **I want** to access a dedicated page that displays all my dashboards with metadata **so that** I can view, organize, and manage my entire dashboard collection from a single location.

**Acceptance Criteria**: Given I access the dashboard management page, When the page loads, Then I see a list or grid of all my dashboards with names, creation dates, and widget counts, And I can create, rename, duplicate, or delete dashboards from this page.

### US-02: Dashboard Creation and Navigation
**As a** user, **I want** to create a new dashboard from the management page and immediately navigate to it **so that** I can start building visualizations for a new project or use case.

**Acceptance Criteria**: Given I am on the dashboard management page, When I click create dashboard and provide a name, Then a new empty dashboard is created, And I am navigated to the dashboard view with the widget catalog panel visible.

### US-03: Widget Catalog Panel Access
**As a** user, **I want** to browse available widgets in a persistent left-side panel while viewing my dashboard **so that** I can easily add widgets without losing sight of my dashboard layout.

**Acceptance Criteria**: Given I am viewing a dashboard, When the page loads, Then a left-side panel displays the widget catalog organized by category, And the panel remains accessible while I interact with dashboard widgets, And I can collapse or expand the panel to maximize workspace.

### US-04: Widget Catalog Browsing and Search
**As a** user, **I want** to explore widgets in the catalog by category and search by name or metric **so that** I can quickly find the visualization that meets my monitoring needs.

**Acceptance Criteria**: Given the widget catalog panel is open, When I browse or search, Then I see widgets grouped by GitHub, npm, and combined categories, And each widget shows an icon, name, description, and data source indicator, And search filters results in real-time.

### US-05: Widget Addition from Panel
**As a** user, **I want** to add a widget from the left panel to my dashboard with minimal interaction **so that** I can rapidly build my dashboard layout.

**Acceptance Criteria**: Given I select a widget from the catalog panel, When I click add or drag the widget to the dashboard, Then the widget appears on the dashboard with default positioning and sizing, And a configuration dialog opens if required parameters are needed, And the widget immediately fetches and displays data once configured.

### US-06: Board-Level Filter Panel
**As a** DevOps engineer, **I want** to access board-level filters in the left-side panel **so that** I can apply data constraints across all widgets on the dashboard simultaneously.

**Acceptance Criteria**: Given I am viewing a dashboard, When I open the filters section in the left panel, Then I see available filter options including date ranges, repository selectors, package selectors, and status filters, And applying a filter updates all compatible widgets on the dashboard, And filter state persists with the dashboard configuration.

### US-07: Filter Application and Widget Updates
**As a** user, **I want** to apply a date range filter and see all time-based widgets update automatically **so that** I can analyze metrics across a consistent time period without configuring each widget individually.

**Acceptance Criteria**: Given I have multiple time-based widgets on my dashboard, When I select a date range in the board-level filter panel, Then all widgets that support time filtering update to display data for the selected period, And widgets indicate they are filtered, And I can clear filters to return to default views.

### US-08: Widget Positioning and Resizing
**As a** user, **I want** to drag widgets to different positions and resize them **so that** I can organize my dashboard layout according to my preferred workflow and emphasis.

**Acceptance Criteria**: Given a dashboard with widgets, When I drag a widget to a new position, Then the widget moves smoothly and other widgets adjust to accommodate the change, And when I drag resize handles, the widget dimensions change while maintaining data visualization integrity, And all layout changes persist across sessions.

### US-09: Widget Configuration and Removal
**As a** package author, **I want** to configure widget-specific parameters and remove widgets I no longer need **so that** I can maintain relevant and accurate monitoring dashboards.

**Acceptance Criteria**: Given a widget on my dashboard, When I open widget settings and modify parameters like repository name or package name, Then the widget updates to display data for the new configuration, And when I remove a widget, it is deleted from the dashboard and the layout adjusts automatically.

### US-10: Multi-Dashboard Workflow
**As a** user, **I want** to switch between dashboards from the management page or dashboard navigation **so that** I can monitor different projects or teams without rebuilding layouts.

**Acceptance Criteria**: Given I have multiple dashboards, When I navigate between dashboards, Then each dashboard loads its independent widget configuration, layout, and filter state, And I can quickly return to the dashboard management page to select a different dashboard.

### US-11: Dashboard Duplication
**As a** user, **I want** to duplicate an existing dashboard from the management page **so that** I can create similar monitoring setups for related projects without manual reconfiguration.

**Acceptance Criteria**: Given I am on the dashboard management page, When I select duplicate on a dashboard, Then a new dashboard is created with all widgets, configurations, filters, and layout copied, And I can rename the duplicated dashboard, And both dashboards operate independently.

### US-12: Data Refresh Control
**As a** user, **I want** to manually refresh widget data or configure automatic refresh intervals **so that** I can balance data freshness with API rate limits.

**Acceptance Criteria**: Given widgets are displaying data, When I trigger a manual refresh, Then all widgets update their data respecting API rate limits, And when I configure auto-refresh intervals, the system updates data automatically at specified times, And refresh status is displayed to the user.

## 3. Functional Requirements

### Dashboard Management Page
- Dedicated page route for managing all dashboards in the system
- Display dashboards as list or grid with metadata (name, date created, last modified, widget count)
- Create new dashboard with name input from management page
- Rename dashboards inline or via edit dialog
- Duplicate dashboards with all configurations, widgets, layouts, and filters
- Delete dashboards with confirmation dialog
- Navigate from management page to specific dashboard view
- Search or filter dashboards by name
- Sort dashboards by creation date, modification date, or name
- Display empty state when no dashboards exist with call-to-action to create first dashboard

### Dashboard View Navigation
- Navigate between dashboard management page and individual dashboard views
- Display current dashboard name prominently in header
- Provide breadcrumb or back navigation to return to management page
- Support direct URL routing to specific dashboards
- Handle dashboard not found errors gracefully

### Widget Catalog Panel (Left Side)
- Persistent left-side panel displaying widget catalog when viewing a dashboard
- Panel remains open by default, can be collapsed to maximize dashboard workspace
- Panel width optimized for readability without obscuring dashboard (300-400px)
- Organize widgets by category tabs or sections (GitHub, npm, Combined)
- Display widget cards with icon, name, brief description, and data source badge
- Search bar at top of panel for filtering widgets by name or metric keywords
- Highlight or badge widgets already present on current dashboard
- Support drag-and-drop from catalog panel to dashboard canvas
- Support click-to-add interaction for users who prefer not to drag
- Panel scrollable when widget list exceeds viewport height
- Responsive behavior: panel converts to modal or bottom sheet on mobile devices

### Board-Level Filter Panel (Left Side)
- Filter section within left-side panel, separate from widget catalog
- Toggle between widget catalog view and filter view, or display both in collapsible sections
- Support multiple filter types affecting all compatible widgets simultaneously
- Date range filter with presets (7d, 30d, 90d, 1yr, custom range)
- Repository filter allowing selection of one or multiple repositories
- Package filter allowing selection of one or multiple npm packages
- Status filters (active/archived, public/private, specific issue states)
- Apply filters button to trigger widget updates, or real-time application on change
- Clear all filters action to reset dashboard to default state
- Visual indicator on dashboard when filters are active
- Filter state persists with dashboard configuration
- Incompatible widgets display message when filters cannot be applied

### Widget Lifecycle Management
- Add widgets from catalog panel to dashboard via drag-and-drop or click
- Configure widget parameters via dialog before or after addition
- Position widgets via drag-and-drop interaction with snap-to-grid
- Resize widgets using corner or edge handles with minimum/maximum size constraints
- Remove widgets with delete button or context menu action
- Support undo for accidental widget removal
- Allow same widget type multiple times with different configurations
- Display loading states during initial widget data fetch
- Show error states when widget data unavailable or API fails
- Refresh individual widget data manually via widget controls

### Layout System
- Grid-based layout with collision detection and auto-adjustment
- Responsive breakpoints for desktop, laptop, and tablet screen sizes
- Maintain relative widget positioning when resizing viewport
- Snap-to-grid behavior for precise alignment
- Layout persistence tied to specific dashboard
- Support compact layout mode to minimize gaps between widgets
- Provide layout reset option to restore default widget positions
- Prevent widgets from overlapping during drag operations

### Data Integration
- Fetch data from GitHub public API for repository metrics
- Fetch data from npm public API for package statistics
- Proxy API requests through backend routes for rate limit management
- Implement caching strategy to minimize redundant API calls
- Handle API rate limiting gracefully with user-friendly notifications
- Support manual refresh for all widgets or individual widgets
- Configure automatic refresh intervals per dashboard (off, 1min, 5min, 15min, 30min, 1hr)
- Display last refresh timestamp on widgets
- Queue API requests to avoid overwhelming rate limits
- Retry failed requests with exponential backoff

### User Interface
- Use Salt Design System exclusively for all components and patterns
- Responsive design supporting desktop, laptop, and tablet viewports
- Consistent color palette, typography, and spacing from Salt DS tokens
- Accessible keyboard navigation for all interactions (WCAG 2.1 AA)
- Screen reader support for data visualizations with ARIA labels
- Toast notifications for user actions, errors, and confirmations
- Loading skeletons matching widget dimensions during data fetch
- Dark mode support if provided by Salt DS
- Focus management for modals, dialogs, and panel interactions

### Data Persistence
- Save dashboard metadata (name, creation date, modification date)
- Save widget configurations per dashboard (type, parameters, position, size)
- Save board-level filter state per dashboard
- Save layout positions and dimensions for all widgets
- Persist user preferences (panel collapsed state, refresh intervals, theme)
- Support export of dashboard configuration as JSON file
- Support import of dashboard configuration from JSON file
- Use browser local storage for client-side persistence
- Handle storage quota limits with user warnings

## 4. Widget Catalog Specifications

### GitHub Widgets

**GH-01: Repository Stars Trend**
- Visualization: Line chart
- Data Source: GitHub API - repository stargazers
- Metrics: Star count over time with growth rate indicator
- Configuration: Repository owner/name, time period
- Board Filters: Date range, repository selector
- Purpose: Track repository popularity growth and identify viral moments

**GH-02: Issue Health Dashboard**
- Visualization: Multi-metric card with gauges and trend indicators
- Data Source: GitHub API - issues endpoint
- Metrics: Open vs closed issues ratio, average time to close, issue velocity, stale issue count
- Configuration: Repository owner/name, issue state filters
- Board Filters: Date range, repository selector, status filters
- Purpose: Monitor issue management effectiveness and identify bottlenecks

**GH-03: Pull Request Activity**
- Visualization: Stacked bar chart
- Data Source: GitHub API - pull requests endpoint
- Metrics: PRs opened, merged, closed, and pending by time period
- Configuration: Repository owner/name, time granularity (daily, weekly, monthly)
- Board Filters: Date range, repository selector
- Purpose: Visualize contribution and code review activity patterns

**GH-04: Top Contributors**
- Visualization: Ranked table with avatars and badges
- Data Source: GitHub API - contributors endpoint
- Metrics: Contributor name, commit count, lines added/deleted, PR count
- Configuration: Repository owner/name, time period, top N contributors (5, 10, 25)
- Board Filters: Date range, repository selector
- Purpose: Recognize and track most active contributors

**GH-05: Release Timeline**
- Visualization: Vertical timeline with version markers
- Data Source: GitHub API - releases endpoint
- Metrics: Release version tag, publication date, download counts, release notes preview
- Configuration: Repository owner/name, number of releases to display
- Board Filters: Date range, repository selector
- Purpose: Track release cadence, version adoption, and changelog visibility

**GH-06: Repository Health Score**
- Visualization: Large metric card with composite score and breakdown
- Data Source: GitHub API - multiple endpoints aggregated
- Metrics: Composite score calculated from documentation coverage, test presence, recent activity, issue response time, community engagement
- Configuration: Repository owner/name
- Board Filters: Repository selector
- Purpose: At-a-glance repository quality and maintenance assessment

### npm Widgets

**NPM-01: Package Downloads Trend**
- Visualization: Area chart with gradient fill
- Data Source: npm API - download counts endpoint
- Metrics: Daily, weekly, or monthly download counts over selected time period
- Configuration: Package name, time period, granularity
- Board Filters: Date range, package selector
- Purpose: Track package adoption, usage trends, and growth patterns

**NPM-02: Version Distribution**
- Visualization: Donut chart with legend
- Data Source: npm API - package download statistics by version
- Metrics: Percentage of downloads per major version, version adoption rate
- Configuration: Package name, version grouping (major, minor, exact)
- Board Filters: Date range, package selector
- Purpose: Understand version migration patterns across user base

**NPM-03: Package Health Score**
- Visualization: Metric card with score breakdown and badges
- Data Source: npms.io API
- Metrics: Overall health score, quality score, popularity score, maintenance score
- Configuration: Package name
- Board Filters: Package selector
- Purpose: Assess overall package health, quality, and reliability signals

**NPM-04: Dependency Risk Analysis**
- Visualization: Table or matrix with severity indicators
- Data Source: npm API - dependencies endpoint with metadata
- Metrics: Outdated dependency count, security vulnerability flags, unmaintained packages, update recommendations
- Configuration: Package name, risk threshold
- Board Filters: Package selector
- Purpose: Identify dependency maintenance needs and security risks

### Combined Widgets

**COMBO-01: Project Overview Dashboard**
- Visualization: Multi-section summary card combining GitHub and npm metrics
- Data Source: GitHub API + npm API
- Metrics: Repository stars, npm downloads, open issues, latest release version, latest package version, last commit date
- Configuration: Repository owner/name, package name
- Board Filters: Date range, repository selector, package selector
- Purpose: Comprehensive single-pane project health and activity status

**COMBO-02: Growth Correlation Chart**
- Visualization: Dual-axis line chart with two Y-axes
- Data Source: GitHub API + npm API
- Metrics: GitHub stars on left axis, npm downloads on right axis, both plotted over same time period
- Configuration: Repository owner/name, package name, time period
- Board Filters: Date range, repository selector, package selector
- Purpose: Correlate repository popularity with package adoption and identify causation patterns

## 5. Technical Approach

The application will be built using **Next.js 15** with **React 19** and **TypeScript 5**, leveraging the **App Router** architecture for modern routing and data fetching. The **Salt Design System** serves as the mandatory UI framework, ensuring consistent and accessible components. Data visualizations will utilize **Recharts 3** for chart rendering. The widget layout system will employ **react-grid-layout** for drag-and-drop repositioning and resizing capabilities. A dedicated dashboard management page will provide centralized CRUD operations. The left-side panel architecture will house both widget catalog and board-level filters with collapsible sections. Dashboard configurations, widget settings, layout state, and filter preferences will persist using browser local storage. API integrations with GitHub and npm will be proxied through Next.js API routes to manage rate limiting, implement caching strategies, and protect against quota exhaustion. The architecture follows a widget registry pattern where each widget type defines its own data fetching logic, configuration schema, rendering component, and filter compatibility matrix.

## 6. Success Metrics

### User Engagement
- Users create average of 3+ dashboards within first week
- 80% of users utilize dashboard management page to organize dashboards
- Users add 6+ widgets per dashboard on average
- Users apply board-level filters in 60% of dashboard sessions
- Users return to application at least 3 times per week

### Widget and Filter Utilization
- Each widget type is used by at least 20% of active users
- Date range filter is most used board-level filter (used in 70% of sessions)
- Repository and package filters used in 50% of sessions with applicable widgets
- Average of 2.5 active filters per filtered dashboard session

### Dashboard Management
- Dashboard duplication feature used by 40% of users to create similar setups
- Average time to create and configure first dashboard under 5 minutes
- Dashboard deletion rate remains below 15% of created dashboards
- Users successfully navigate between management page and dashboards without errors

### Performance
- Dashboard management page loads all dashboard metadata within 1.5 seconds
- Individual dashboard view loads within 2 seconds including left panel
- Widget data refresh completes within 3 seconds for 90% of requests
- Layout interactions (drag, resize) respond within 100ms
- Board-level filter application updates all widgets within 2 seconds

### User Satisfaction
- Users successfully complete dashboard creation from management page (95% success rate)
- Users successfully add widget from left panel (90% success rate)
- Users successfully apply board-level filter (85% success rate)
- Dashboard configurations persist correctly across browser sessions (99% reliability)

## 7. Risks & Assumptions

### Risks
- **API Rate Limiting**: GitHub and npm APIs impose rate limits that could impact high-frequency refresh scenarios, especially with board-level filters triggering multiple widget updates simultaneously
- **Left Panel Real Estate**: Widget catalog and filter panel compete for limited left-side space, requiring careful UX design to avoid overwhelming users
- **Filter Complexity**: Board-level filters applying to all widgets may create confusing states when widgets have incompatible filter requirements
- **Browser Storage Limits**: Multiple dashboards with complex configurations and filter states may approach browser storage quotas faster than single-dashboard approach
- **Mobile Experience**: Left-side panel architecture designed for desktop may require significant rework for mobile viewports

### Assumptions
- Users have modern browsers supporting ES2022, CSS Grid, and flexbox
- Target repositories and packages are publicly accessible (no private access in v1)
- Users accept eventual consistency in data updates (not real-time streaming)
- Users do not require authentication for basic GitHub/npm data access initially
- Dashboard configurations including filter state remain under 5MB total per user
- Majority of users monitor fewer than 10 repositories/packages simultaneously
- Users primarily access application from desktop or laptop devices
- Users understand that board-level filters apply to all widgets uniformly

### Dependencies
- GitHub REST API v3 or GraphQL API v4 remains publicly accessible
- npm Registry API continues to provide download statistics publicly
- npms.io API remains available for package quality metrics
- Salt Design System component library is stable, maintained, and supports panel layouts
- react-grid-layout library supports React 19 and maintains compatibility

## 8. Out of Scope for v1

### User Features Not Included
- **Custom Widget Creation**: Users cannot build their own widget types with custom data sources or visualizations
- **Widget Marketplace**: No sharing, exporting, or importing of widgets between users
- **User Authentication**: No user accounts, login, profile management, or cloud storage
- **Multi-User Collaboration**: No dashboard sharing, real-time collaboration, or commenting
- **Advanced Export**: No PDF, PNG, or image export of dashboard views (JSON config export only)
- **Alerting System**: No threshold-based alerts, notifications, or email reports when metrics exceed limits
- **Historical Data Storage**: No server-side database storing historical trends beyond API provider retention

### Data Source Extensions
- **Additional APIs**: No GitLab, Bitbucket, PyPI, RubyGems, or other package registry integrations
- **Custom API Endpoints**: Users cannot add arbitrary REST or GraphQL API connections
- **Database Integrations**: No connections to SQL, NoSQL, or time-series databases
- **Webhook Support**: No incoming webhooks for real-time data push from external systems

### Advanced Features
- **Widget Interactions**: Widgets cannot cross-filter or interact with each other beyond board-level filters
- **Drill-Down Navigation**: No detailed modal views or secondary pages for deeper data exploration
- **Dashboard Comparison**: No side-by-side comparison of multiple dashboards simultaneously
- **Version Control**: No dashboard configuration version history, rollback, or change tracking
- **Scheduled Reports**: No automated email reports or scheduled dashboard snapshots
- **Mobile Native Apps**: Responsive web only, no native iOS or Android applications
- **Offline Mode**: No progressive web app capabilities or offline data caching

### Enterprise Features
- **Team Management**: No organization accounts, team dashboards, or permission structures
- **SSO Integration**: No single sign-on, SAML, or enterprise authentication providers
- **Audit Logging**: No tracking of user actions for compliance or security monitoring
- **Custom Branding**: No white-labeling, custom themes, or branding beyond Salt DS defaults
- **SLA Guarantees**: Best-effort availability only, no uptime commitments or support SLAs

### Technical Capabilities
- **Backend Database**: All persistence is client-side browser storage, no server-side user data storage
- **Server-Side Rendering**: Widget data fetching occurs client-side only, not during SSR
- **Real-Time Updates**: No WebSocket or Server-Sent Events for live streaming data
- **Advanced Caching**: Basic browser caching and backend proxy caching only, no CDN or Redis
- **Rate Limit Pooling**: Each browser session subject to individual API rate limits, no shared quota management across users

---

**Document Version**: 2.0
**Last Updated**: 2025-11-02
**PRD Author**: prd-writer agent
**Total Lines**: 400
