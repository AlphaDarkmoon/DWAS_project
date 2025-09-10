# DWAS (Django Web App Security Scanner) Dashboard

A modern, multi-page web dashboard for Django security scanning with comprehensive vulnerability reporting, dependency analysis, and code quality assessment.

## 🎯 Project Overview

DWAS Dashboard is a React-based security scanner interface that provides:
- **Multi-page navigation** with React Router
- **Dual theme support** (Light/Dark mode)
- **Security-focused design** with modern UI components
- **Comprehensive vulnerability reporting** with detailed analysis
- **Interactive charts and visualizations** for security metrics
- **Responsive design** for desktop and mobile

---

## 📁 Project Structure & File Responsibilities

### 🔧 Configuration Files

#### `tailwind.config.ts`
- **Purpose**: Tailwind CSS configuration with custom design tokens
- **Key Features**:
  - Custom color palette with HSL values for consistent theming
  - Security-focused color scheme (primary, secondary, accent colors)
  - Dark mode configuration
  - Custom spacing, typography, and animation settings
  - Component-specific styling extensions

#### `vite.config.ts`
- **Purpose**: Vite build tool configuration
- **Features**: Path aliases (@/ for src/), React plugin setup

#### `tsconfig.json` & related
- **Purpose**: TypeScript configuration for type checking and compilation

---

### 🎨 Styling System

#### `src/index.css`
- **Purpose**: Global styles and CSS custom properties (design tokens)
- **Key Sections**:
  - **CSS Variables**: HSL color definitions for light/dark themes
  - **Base Styles**: HTML element defaults, scroll behavior
  - **Utility Classes**: Custom animation classes, gradients
  - **Component Overrides**: Global component styling

**Color Token System**:
```css
:root {
  --primary: 262 83% 58%;        /* Security blue */
  --secondary: 262 90% 95%;      /* Light accent */
  --accent: 142 76% 36%;         /* Success green */
  --destructive: 0 84% 60%;      /* Error red */
  --warning: 38 92% 50%;         /* Warning orange */
}
```

---

### 🏗️ Core Application Files

#### `src/main.tsx`
- **Purpose**: Application entry point
- **Functionality**: Renders the root App component with React 18's createRoot

#### `src/App.tsx`
- **Purpose**: Main application component with routing setup
- **Key Features**:
  - **Router Configuration**: BrowserRouter with route definitions
  - **Provider Setup**: QueryClient, ThemeProvider, TooltipProvider
  - **Toast Systems**: Sonner and Shadcn toasters for notifications
  - **Route Structure**:
    - `/` → Redirects to `/dashboard`
    - `/dashboard` → Main dashboard page
    - `/scans/:jobId` → Individual scan details
    - `/settings` → User settings
    - `/help` → Help documentation
    - `*` → 404 Not Found page

---

### 🎭 Theme System

#### `src/components/theme-provider.tsx`
- **Purpose**: Context-based theme management system
- **Functionality**:
  - **Theme States**: "light", "dark", "system"
  - **Persistence**: localStorage with customizable storage key
  - **System Detection**: Automatically detects user's OS theme preference
  - **DOM Manipulation**: Adds/removes theme classes on document root

#### `src/components/theme-toggle.tsx`
- **Purpose**: UI component for theme switching
- **Features**: Dropdown with sun/moon icons, smooth transitions

---

### 🧱 Layout Components

#### `src/components/layout/header.tsx`
- **Purpose**: Global navigation header
- **Key Features**:
  - **Brand Identity**: DWAS logo with shield icon
  - **Navigation Menu**: Dashboard, Settings, Help links with active states
  - **Theme Toggle**: Integrated dark/light mode switcher
  - **Responsive Design**: Mobile-friendly navigation
  - **Active Route Highlighting**: Visual indication of current page

#### `src/components/layout/footer.tsx`
- **Purpose**: Global footer component
- **Content**: Version information, copyright, minimal branding

---

### 📄 Page Components

#### `src/pages/Dashboard.tsx`
- **Purpose**: Main dashboard interface
- **Key Sections**:

1. **Upload Section**:
   - Drag & drop file upload zone
   - File validation and progress indication
   - Success/error state handling

2. **Recent Scans Table**:
   - Displays all security scans with status
   - **Columns**: Job ID, Project Name, Status, Created At, Actions
   - **Status Badges**: Color-coded status indicators
   - **Action Buttons**: View Details, Delete scan
   - **Interactive Features**: Hover effects, clickable rows

3. **Statistics Cards**:
   - Total scans, completed scans, active scans
   - Visual progress indicators

**Data Flow**:
- Imports mock data from `src/data/mock-data.ts`
- Maps scan data to table rows with status formatting
- Handles navigation to scan details page

#### `src/pages/ScanDetails.tsx`
- **Purpose**: Detailed scan analysis page
- **URL Pattern**: `/scans/:jobId`
- **Key Features**:

1. **Overview Section**:
   - Scan metadata (project name, duration, score)
   - Overall security score with visual progress bar
   - Quick statistics cards

2. **Tabbed Interface**:
   - **Vulnerabilities Tab**: Detailed vulnerability list with severity indicators
   - **Dependencies Tab**: Dependency analysis with CVE information
   - **Code Quality Tab**: Linting results and code standards

3. **Vulnerability Details**:
   - Expandable rows with detailed descriptions
   - Fix recommendations
   - File location and line numbers
   - Severity-based color coding

**Data Management**:
- Uses React Router's `useParams` to get jobId
- Filters mock data based on scan ID
- Handles missing scan gracefully

#### `src/pages/Settings.tsx`
- **Purpose**: User preferences and configuration
- **Sections**:
  - **Profile Settings**: Name, email (form inputs)
  - **Security Settings**: API keys, tokens (secure input fields)
  - **Appearance**: Theme selection with preview
  - **Notifications**: Email/push notification preferences

#### `src/pages/Help.tsx`
- **Purpose**: User documentation and support
- **Content Structure**:
  - **Getting Started**: Step-by-step scan process
  - **FAQ Section**: Collapsible accordion with common questions
  - **Feature Overview**: Dashboard capabilities explanation
  - **Support Links**: Contact information and resources

#### `src/pages/NotFound.tsx`
- **Purpose**: 404 error page for invalid routes
- **Features**: Friendly error message with navigation back to dashboard

---

### 🧩 UI Components

#### Status & Indicators

##### `src/components/ui/status-badge.tsx`
- **Purpose**: Reusable status indicator component
- **Props**: `status` (pending|ongoing|completed|failed), `children`
- **Styling**: Dynamic background colors based on status type
- **Usage**: Scan status, vulnerability severity levels

##### `src/components/ui/upload-zone.tsx`
- **Purpose**: Drag & drop file upload interface
- **Features**:
  - **Drag States**: Visual feedback for drag over/leave
  - **File Validation**: Type and size checking
  - **Progress Indication**: Upload progress bar
  - **Error Handling**: Invalid file type messaging
  - **Accessibility**: Keyboard navigation support

#### Shadcn/ui Components
Located in `src/components/ui/`, these are customized versions of Shadcn components:

- **`button.tsx`**: Primary UI button with variants (default, destructive, outline, secondary, ghost, link)
- **`card.tsx`**: Container component for content sections
- **`table.tsx`**: Data table components with responsive design
- **`tabs.tsx`**: Tabbed interface for scan details
- **`badge.tsx`**: Small status indicators and labels
- **`progress.tsx`**: Progress bars for scores and loading states
- **`accordion.tsx`**: Collapsible content for FAQ section
- **`dialog.tsx`**: Modal dialogs for detailed views
- **`tooltip.tsx`**: Hover information tooltips
- **`toast.tsx` & `toaster.tsx`**: Notification system
- **`form.tsx`**: Form components with validation
- **And many more...**

---

### 📊 Data Management

#### `src/data/mock-data.ts`
- **Purpose**: Mock data definitions and sample data
- **Key Interfaces**:

```typescript
interface Scan {
  id: string;
  projectName: string;
  status: "completed" | "ongoing" | "failed" | "pending";
  createdAt: string;
  duration?: string;
  overallScore?: number;
  vulnerabilityCount?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface Vulnerability {
  id: string;
  name: string;
  file: string;
  severity: "critical" | "high" | "medium" | "low";
  lineNo: number;
  description: string;
  fix: string;
  category: string;
}

interface Dependency {
  id: string;
  package: string;
  version: string;
  cveId?: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}
```

**Sample Data Sets**:
- `mockScans`: 5 sample security scans with various statuses
- `mockVulnerabilities`: Security vulnerabilities with detailed information
- `mockDependencies`: Package dependencies with CVE data
- `mockLintingResult`: Code quality metrics and issues

---

### 🛠️ Utility Functions

#### `src/lib/utils.ts`
- **Purpose**: Common utility functions
- **Key Functions**:
  - `cn()`: Tailwind class name merging with clsx
  - **Usage**: Conditional styling, component variants

#### `src/hooks/use-mobile.tsx`
- **Purpose**: Responsive design hook
- **Functionality**: Detects mobile screen sizes for responsive components

#### `src/hooks/use-toast.ts`
- **Purpose**: Toast notification management
- **Features**: Success/error/warning message handling

---

## 🔄 Data Flow & State Management

### Component Hierarchy
```
App (Router + Providers)
├── ThemeProvider (Theme state)
├── QueryClientProvider (API state - future)
├── TooltipProvider (UI state)
└── Routes
    ├── Dashboard (Scan list management)
    ├── ScanDetails (Individual scan data)
    ├── Settings (User preferences)
    ├── Help (Static content)
    └── NotFound (Error handling)
```

### State Management Strategy
- **Theme State**: Context API with localStorage persistence
- **Router State**: React Router for navigation and URL parameters
- **Component State**: Local useState for UI interactions
- **Future API State**: TanStack Query setup for server state

---

## 🎨 Design System

### Color Architecture
- **Primary**: Security-focused blue (#6366f1) for main actions
- **Secondary**: Light variants for backgrounds and subtle elements
- **Accent**: Green (#059669) for success states and positive indicators
- **Destructive**: Red (#dc2626) for errors and critical vulnerabilities
- **Warning**: Orange (#ea580c) for medium-severity issues

### Typography Scale
- **Headings**: Font weight 600-700, size scale from text-sm to text-4xl
- **Body Text**: Font weight 400-500, primary foreground color
- **Muted Text**: Reduced opacity for secondary information

### Spacing & Layout
- **Container Max Width**: 7xl (80rem) for main content areas
- **Grid System**: CSS Grid and Flexbox for responsive layouts
- **Padding Scale**: Consistent spacing using Tailwind's spacing scale

---

## 🚀 Key Functionalities

### 1. File Upload System
**Location**: `src/components/ui/upload-zone.tsx`, `src/pages/Dashboard.tsx`

**Process Flow**:
1. User drags file over upload zone
2. Visual feedback shows drop zone is active
3. File validation checks type and size
4. Progress bar shows upload simulation
5. Success/error state displayed to user

### 2. Scan Management
**Location**: `src/pages/Dashboard.tsx`

**Features**:
- Display all scans in a sortable table
- Status-based filtering and color coding
- Navigate to detailed scan results
- Delete scan functionality (with confirmation)

### 3. Vulnerability Analysis
**Location**: `src/pages/ScanDetails.tsx`

**Analysis Types**:
- **Code Vulnerabilities**: SQL injection, XSS, access control issues
- **Dependency Vulnerabilities**: CVE tracking, version analysis
- **Code Quality**: Linting results, style guide compliance

**Presentation**:
- Tabbed interface for different analysis types
- Expandable rows for detailed information
- Severity-based visual indicators
- Fix recommendations and remediation steps

### 4. Theme Management
**Location**: `src/components/theme-provider.tsx`

**Capabilities**:
- Automatic system theme detection
- Manual theme override
- Persistent user preferences
- Smooth transitions between themes

---

## 🔧 Development Guidelines

### Adding New Pages
1. Create component in `src/pages/`
2. Add route to `src/App.tsx`
3. Update navigation in `src/components/layout/header.tsx`
4. Add any required mock data to `src/data/mock-data.ts`

### Creating New Components
1. Use TypeScript interfaces for props
2. Implement proper accessibility attributes
3. Follow the design system color tokens
4. Add responsive design considerations
5. Include hover and focus states

### Styling Best Practices
- Use semantic color tokens from `index.css`
- Avoid hardcoded colors in components
- Utilize Tailwind's responsive prefixes
- Maintain consistent spacing patterns
- Test in both light and dark themes

### Data Integration
- Current: Mock data from `src/data/mock-data.ts`
- Future: Replace with API calls using TanStack Query
- Maintain interface compatibility for smooth transition

---

## 🚦 Future Enhancements

### Planned Features
- **Real API Integration**: Replace mock data with backend APIs
- **Real-time Updates**: WebSocket integration for live scan progress
- **Advanced Filtering**: Multi-criteria search and filtering
- **Export Functionality**: PDF/JSON report generation
- **User Authentication**: Login/logout with role-based access
- **Dashboard Analytics**: Charts and metrics visualization

### Technical Improvements
- **Performance**: Implement virtual scrolling for large data sets
- **Testing**: Add unit and integration tests
- **Accessibility**: Enhanced screen reader support
- **PWA**: Progressive Web App capabilities
- **Internationalization**: Multi-language support

---

## 📝 Notes for Future Development

### Code Patterns
- All components use TypeScript for type safety
- Consistent error handling with try/catch blocks
- Accessibility-first approach with proper ARIA labels
- Mobile-first responsive design methodology

### File Naming Conventions
- **Pages**: PascalCase (Dashboard.tsx, ScanDetails.tsx)
- **Components**: PascalCase with descriptive names
- **Utilities**: kebab-case for files, camelCase for functions
- **Types**: Interfaces in PascalCase, exported from relevant files

### State Management Philosophy
- Keep state as close to where it's used as possible
- Use Context for truly global state (theme, auth)
- Prefer composition over complex prop drilling
- Plan for server state with TanStack Query

This documentation should serve as a comprehensive reference for understanding and extending the DWAS Dashboard codebase.