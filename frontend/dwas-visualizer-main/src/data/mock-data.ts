export interface Scan {
  id: string
  projectName: string
  status: "completed" | "ongoing" | "failed" | "pending"
  createdAt: string
  duration?: string
  overallScore?: number
  vulnerabilityCount?: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export interface Vulnerability {
  id: string
  name: string
  file: string
  severity: "critical" | "high" | "medium" | "low"
  lineNo: number
  description: string
  fix: string
  category: string
}

export interface Dependency {
  id: string
  package: string
  version: string
  cveId?: string
  severity: "critical" | "high" | "medium" | "low"
  description: string
}

export interface LintingResult {
  score: number
  warnings: number
  errors: number
  issues: Array<{
    file: string
    line: number
    type: "warning" | "error"
    message: string
  }>
}

export const mockScans: Scan[] = [
  {
    id: "scan-001",
    projectName: "E-commerce Platform",
    status: "completed",
    createdAt: "2024-01-15T10:30:00Z",
    duration: "5m 32s",
    overallScore: 7.2,
    vulnerabilityCount: {
      critical: 2,
      high: 5,
      medium: 8,
      low: 12
    }
  },
  {
    id: "scan-002",
    projectName: "Blog Management System",
    status: "ongoing",
    createdAt: "2024-01-15T11:45:00Z"
  },
  {
    id: "scan-003",
    projectName: "User Authentication Service",
    status: "completed",
    createdAt: "2024-01-14T16:20:00Z",
    duration: "3m 18s",
    overallScore: 8.9,
    vulnerabilityCount: {
      critical: 0,
      high: 1,
      medium: 3,
      low: 7
    }
  },
  {
    id: "scan-004",
    projectName: "API Gateway",
    status: "failed",
    createdAt: "2024-01-14T14:15:00Z"
  },
  {
    id: "scan-005",
    projectName: "Payment Processing Module",
    status: "pending",
    createdAt: "2024-01-15T12:00:00Z"
  }
]

export const mockVulnerabilities: Vulnerability[] = [
  {
    id: "vuln-001",
    name: "SQL Injection",
    file: "views/user.py",
    severity: "critical",
    lineNo: 45,
    description: "Direct SQL query construction without parameterization allows SQL injection attacks.",
    fix: "Use parameterized queries or Django ORM methods instead of raw SQL.",
    category: "Injection"
  },
  {
    id: "vuln-002",
    name: "Cross-Site Scripting (XSS)",
    file: "templates/profile.html",
    severity: "high",
    lineNo: 23,
    description: "User input is rendered without proper escaping, allowing XSS attacks.",
    fix: "Use Django's built-in template escaping or the |escape filter.",
    category: "XSS"
  },
  {
    id: "vuln-003",
    name: "Insecure Direct Object Reference",
    file: "views/document.py",
    severity: "high",
    lineNo: 78,
    description: "Direct access to objects without authorization checks.",
    fix: "Implement proper authorization checks before object access.",
    category: "Access Control"
  },
  {
    id: "vuln-004",
    name: "Hardcoded Secret Key",
    file: "settings.py",
    severity: "critical",
    lineNo: 12,
    description: "Secret key is hardcoded in the settings file.",
    fix: "Move secret key to environment variables or use Django-environ.",
    category: "Configuration"
  }
]

export const mockDependencies: Dependency[] = [
  {
    id: "dep-001",
    package: "django",
    version: "3.1.2",
    cveId: "CVE-2023-31047",
    severity: "high",
    description: "Potential SQL injection in QuerySet.extra()"
  },
  {
    id: "dep-002",
    package: "pillow",
    version: "8.2.0",
    cveId: "CVE-2023-44271",
    severity: "medium",
    description: "Buffer overflow in image processing"
  },
  {
    id: "dep-003",
    package: "requests",
    version: "2.25.1",
    severity: "low",
    description: "Outdated version with potential security improvements"
  }
]

export const mockLintingResult: LintingResult = {
  score: 8.5,
  warnings: 23,
  errors: 4,
  issues: [
    {
      file: "models/user.py",
      line: 34,
      type: "warning",
      message: "Line too long (88/80 characters)"
    },
    {
      file: "views/auth.py",
      line: 67,
      type: "error",
      message: "Undefined variable 'user_id'"
    },
    {
      file: "utils/helpers.py",
      line: 12,
      type: "warning",
      message: "Unused import 'datetime'"
    }
  ]
}