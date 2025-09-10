import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Download, FileText, AlertTriangle, Package, Code, BarChart3, ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { StatusBadge } from "@/components/ui/status-badge"
import { useJob } from "@/hooks/useJobs"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/services/api"

export default function ScanDetails() {
  const { jobId } = useParams()
  const [expandedVulns, setExpandedVulns] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  
  const { 
    job, 
    isLoading, 
    deleteJob, 
    isDeleting,
    deleteError 
  } = useJob(jobId || "")
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            <p className="text-muted-foreground mb-4">Loading scan details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Scan Not Found</h1>
            <p className="text-muted-foreground mb-4">The requested scan could not be found.</p>
            <Button asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const toggleVulnExpansion = (id: string) => {
    const newExpanded = new Set(expandedVulns)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedVulns(newExpanded)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-critical border-critical'
      case 'high': return 'text-destructive border-destructive'
      case 'medium': return 'text-warning border-warning'
      case 'low': return 'text-muted-foreground border-muted'
      default: return 'text-muted-foreground border-muted'
    }
  }

  const calculateDuration = (createdAt: string, completedAt?: string) => {
    if (!completedAt) return "-"
    const start = new Date(createdAt)
    const end = new Date(completedAt)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    return `${diffMins}m ${diffSecs}s`
  }

  const calculateScore = (result: any) => {
    if (!result || !result.static_code_analysis) return null
    
    const issues = result.static_code_analysis.bandit?.results || []
    const totalIssues = issues.length
    if (totalIssues === 0) return 10
    
    const criticalIssues = issues.filter((i: any) => i.issue_severity === 'HIGH').length
    const highIssues = issues.filter((i: any) => i.issue_severity === 'MEDIUM').length
    
    // Simple scoring: start with 10, deduct points for issues
    let score = 10
    score -= criticalIssues * 3
    score -= highIssues * 1
    score -= (totalIssues - criticalIssues - highIssues) * 0.5
    
    return Math.max(0, Math.min(10, score))
  }

  const getVulnerabilityCount = (result: any) => {
    if (!result || !result.static_code_analysis) return null
    
    const issues = result.static_code_analysis.bandit?.results || []
    const count = {
      critical: issues.filter((i: any) => i.issue_severity === 'HIGH').length,
      high: issues.filter((i: any) => i.issue_severity === 'MEDIUM').length,
      medium: issues.filter((i: any) => i.issue_severity === 'LOW').length,
      low: 0
    }
    
    return count
  }

  const getVulnerabilities = (result: any) => {
    if (!result || !result.static_code_analysis) return []
    
    const issues = result.static_code_analysis.bandit?.results || []
    return issues.map((issue: any, index: number) => ({
      id: `vuln-${index}`,
      name: issue.test_name || 'Security Issue',
      file: issue.filename || 'Unknown file',
      severity: issue.issue_severity === 'HIGH' ? 'critical' : 
                issue.issue_severity === 'MEDIUM' ? 'high' : 'medium',
      lineNo: issue.line_number || 0,
      description: issue.issue_text || 'No description available',
      fix: 'Please review the code and implement proper security measures.',
      category: issue.test_id || 'Security'
    }))
  }

  const getDependencies = (result: any) => {
    if (!result || !result.dependency_scan) return []
    
    const deps = result.dependency_scan.dependencies || []
    return deps.map((dep: any, index: number) => ({
      id: `dep-${index}`,
      package: dep.package || 'Unknown',
      version: dep.version || 'Unknown',
      cveId: dep.vulnerabilities?.[0]?.id || undefined,
      severity: dep.vulnerabilities?.[0]?.severity || 'low',
      description: dep.vulnerabilities?.[0]?.description || 'No description available'
    }))
  }

  const getLintingResult = (result: any) => {
    if (!result || !result.coding_standards) {
      return {
        score: 0,
        warnings: 0,
        errors: 0,
        issues: []
      }
    }
    
    const issues = result.coding_standards.flatMap((file: any) => 
      (file.messages || []).map((msg: any) => ({
        file: file.path || 'Unknown file',
        line: msg.line || 0,
        type: msg.type || 'warning',
        message: msg.message || 'No message'
      }))
    )
    
    const warnings = issues.filter((i: any) => i.type === 'warning').length
    const errors = issues.filter((i: any) => i.type === 'error').length
    const score = Math.max(0, 10 - (errors * 2) - (warnings * 0.5))
    
    return {
      score: Math.round(score * 10) / 10,
      warnings,
      errors,
      issues: issues.slice(0, 10) // Show only first 10 issues
    }
  }

  const handleDelete = () => {
    deleteJob(job.job_id, {
      onSuccess: () => {
        toast({
          title: "Job Deleted",
          description: "Scan job deleted successfully.",
        })
        // Navigate back to dashboard
        window.location.href = '/dashboard'
      },
      onError: (error) => {
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete job",
          variant: "destructive",
        })
      }
    })
  }

  const handleDownloadJsonReport = async () => {
    if (!jobId) return
    
    try {
      const blob = await apiService.downloadJsonReport(jobId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${job.filename}_security_report.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Download Started",
        description: "JSON report download has started.",
      })
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download JSON report",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPdfReport = async () => {
    if (!jobId) return
    
    try {
      const blob = await apiService.downloadPdfReport(jobId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${job.filename}_security_report.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Download Started",
        description: "PDF report download has started. You can print this HTML file as PDF.",
      })
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download PDF report",
        variant: "destructive",
      })
    }
  }

  const score = calculateScore(job.result)
  const vulnerabilityCount = getVulnerabilityCount(job.result)
  const vulnerabilities = getVulnerabilities(job.result)
  const dependencies = getDependencies(job.result)
  const lintingResult = getLintingResult(job.result)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{job.filename}</h1>
              <p className="text-muted-foreground">Scan ID: {job.job_id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadJsonReport}>
              <Download className="h-4 w-4 mr-2" />
              JSON Report
            </Button>
            <Button variant="outline" onClick={handleDownloadPdfReport}>
              <FileText className="h-4 w-4 mr-2" />
              PDF Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={job.status} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateDuration(job.created_at, job.completed_at)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score ? `${score.toFixed(1)}/10` : "-"}</div>
              {score && (
                <Progress value={score * 10} className="mt-2" />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vulnerabilityCount 
                  ? Object.values(vulnerabilityCount).reduce((a, b) => a + b, 0)
                  : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Code Vulnerabilities</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="linting">Code Quality</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan Summary</CardTitle>
                <CardDescription>
                  Overview of security scan results for {job.filename}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vulnerabilityCount && Object.entries(vulnerabilityCount).map(([severity, count]) => (
                    <div key={severity} className="text-center">
                      <div className={`text-2xl font-bold ${getSeverityColor(severity).split(' ')[0]}`}>
                        {count}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">{severity}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Code Vulnerabilities
                </CardTitle>
                <CardDescription>
                  Security vulnerabilities detected in your Django application code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vulnerabilities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No vulnerabilities found
                    </div>
                  ) : vulnerabilities.map((vuln) => (
                    <Collapsible key={vuln.id}>
                      <CollapsibleTrigger 
                        className="flex items-center justify-between w-full p-4 text-left border rounded-lg hover:bg-muted/50"
                        onClick={() => toggleVulnExpansion(vuln.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={getSeverityColor(vuln.severity)}>
                            {vuln.severity.toUpperCase()}
                          </Badge>
                          <div>
                            <div className="font-medium">{vuln.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vuln.file}:{vuln.lineNo}
                            </div>
                          </div>
                        </div>
                        {expandedVulns.has(vuln.id) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="bg-muted/30 rounded-lg p-4 mt-2 space-y-3">
                          <div>
                            <h4 className="font-medium mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">{vuln.description}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Recommended Fix</h4>
                            <p className="text-sm text-muted-foreground">{vuln.fix}</p>
                          </div>
                          <div>
                            <Badge variant="secondary">{vuln.category}</Badge>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dependencies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Dependency Vulnerabilities
                </CardTitle>
                <CardDescription>
                  Security issues found in project dependencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>CVE ID</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dependencies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No dependency vulnerabilities found
                        </TableCell>
                      </TableRow>
                    ) : dependencies.map((dep) => (
                      <TableRow key={dep.id}>
                        <TableCell className="font-medium">{dep.package}</TableCell>
                        <TableCell className="font-mono text-sm">{dep.version}</TableCell>
                        <TableCell className="font-mono text-sm">{dep.cveId || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(dep.severity)}>
                            {dep.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{dep.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="linting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Code Quality & Standards
                </CardTitle>
                <CardDescription>
                  Code quality analysis and linting results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">{lintingResult.score}</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning">{lintingResult.warnings}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive">{lintingResult.errors}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recent Issues</h4>
                  <div className="space-y-2">
                    {lintingResult.issues.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No linting issues found
                      </div>
                    ) : lintingResult.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <Badge 
                          variant="outline" 
                          className={issue.type === 'error' ? 'text-destructive border-destructive' : 'text-warning border-warning'}
                        >
                          {issue.type.toUpperCase()}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{issue.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {issue.file}:{issue.line}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Vulnerability Distribution
                </CardTitle>
                <CardDescription>
                  Visual representation of security scan results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Severity Breakdown</h4>
                    {vulnerabilityCount && Object.entries(vulnerabilityCount).map(([severity, count]) => (
                      <div key={severity} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{severity}</span>
                          <span>{count}</span>
                        </div>
                        <Progress 
                          value={(count / Object.values(vulnerabilityCount).reduce((a, b) => a + b, 0)) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Risk Assessment</h4>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {score ? (
                          <span className={
                            score >= 8 ? 'text-success' :
                            score >= 6 ? 'text-warning' :
                            'text-critical'
                          }>
                            {score.toFixed(1)}
                          </span>
                        ) : '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">Security Score</div>
                      {score && (
                        <Progress value={score * 10} className="mt-4" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}