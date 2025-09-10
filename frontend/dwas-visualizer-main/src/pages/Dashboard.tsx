import { useState } from "react"
import { Search, FileText, Trash2, Eye, Filter, RefreshCw, Trash } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UploadZone } from "@/components/ui/upload-zone"
import { StatusBadge } from "@/components/ui/status-badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useJobs } from "@/hooks/useJobs"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/services/api"
import { logger } from "@/utils/logger"
import { useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()
  
  const { 
    jobs, 
    isLoading, 
    error: jobsError,
    refetch,
    uploadJob, 
    deleteJob, 
    deleteAllJobs,
    isUploading, 
    isDeleting,
    isDeletingAll,
    uploadError,
    deleteError,
    deleteAllError
  } = useJobs()

  // Log jobs data for debugging
  useEffect(() => {
    console.log('Dashboard - Jobs data:', jobs)
    console.log('Dashboard - Jobs count:', jobs.length)
    console.log('Dashboard - Is loading:', isLoading)
    console.log('Dashboard - Jobs error:', jobsError)
  }, [jobs, isLoading, jobsError])

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        let baseUrl = 'http://localhost:8000'
        try {
          baseUrl = apiService.getBaseUrl ? apiService.getBaseUrl() : 'http://localhost:8000'
        } catch (error) {
          console.warn('getBaseUrl failed in useEffect:', error)
        }
        console.log('API Service base URL:', baseUrl)
        const health = await apiService.healthCheck()
        console.log('Backend connection successful:', health)
      } catch (error) {
        console.error('Backend connection failed:', error)
        toast({
          title: "Backend Connection Error",
          description: `Cannot connect to the backend server. Please ensure it's running on http://localhost:8000`,
          variant: "destructive",
        })
      }
    }
    
    testConnection()
  }, [toast])

  const filteredScans = jobs.filter(job => {
    const matchesSearch = job.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.job_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpload = (file: File) => {
    logger.info('FRONTEND', 'Dashboard handleUpload called', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })
    
    uploadJob(file, {
      onSuccess: (data) => {
        logger.info('FRONTEND', 'Upload successful in Dashboard', { data })
        toast({
          title: "Upload Successful",
          description: `Project ${file.name} uploaded successfully. Scan started.`,
        })
      },
      onError: (error) => {
        logger.error('FRONTEND', 'Upload failed in Dashboard', { 
          error: error.message,
          fileName: file.name 
        })
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload project",
          variant: "destructive",
        })
      }
    })
  }

  const handleDelete = (jobId: string) => {
    deleteJob(jobId, {
      onSuccess: () => {
        toast({
          title: "Job Deleted",
          description: "Scan job deleted successfully.",
        })
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

  const handleDeleteAll = () => {
    deleteAllJobs(undefined, {
      onSuccess: (data) => {
        toast({
          title: "All Jobs Deleted",
          description: `Successfully deleted ${data.deleted_count} scan jobs.`,
        })
      },
      onError: (error) => {
        toast({
          title: "Delete All Failed",
          description: error.message || "Failed to delete all jobs",
          variant: "destructive",
        })
      }
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8 animate-fade-in">
        {/* Upload Section */}
        <Card className="shadow-security">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Django Project
            </CardTitle>
            <CardDescription>
              Upload your Django project ZIP file to start a comprehensive security scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadZone onUpload={handleUpload} />
            {isUploading && (
              <div className="mt-4 text-sm text-muted-foreground">
                Uploading and starting scan...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scans Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Security Scans</CardTitle>
                <CardDescription>
                  Manage and view all your Django project security scans
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {jobs.length} Total Scans
                </Badge>
                {jobsError && (
                  <Badge variant="destructive" className="text-sm px-2 py-1">
                    Error Loading
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                {jobs.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isDeletingAll}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Security Scans</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete all {jobs.length} security scans? This action cannot be undone.
                          All scan results, uploaded files, and extracted project data will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAll}
                          disabled={isDeletingAll}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeletingAll ? "Deleting..." : "Delete All"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search scans by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="ongoing">Scanning</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading scans...
                      </TableCell>
                    </TableRow>
                  ) : filteredScans.map((job) => {
                    const score = calculateScore(job.result)
                    return (
                      <TableRow key={job.job_id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">{job.job_id}</TableCell>
                        <TableCell className="font-medium">{job.filename}</TableCell>
                        <TableCell>
                          <StatusBadge status={job.status} />
                        </TableCell>
                        <TableCell>{formatDate(job.created_at)}</TableCell>
                        <TableCell>{calculateDuration(job.created_at, job.completed_at)}</TableCell>
                        <TableCell>
                          {score ? (
                            <Badge 
                              variant="outline"
                              className={
                                score >= 8 ? "text-success border-success" :
                                score >= 6 ? "text-warning border-warning" :
                                "text-critical border-critical"
                              }
                            >
                              {score.toFixed(1)}/10
                            </Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(job.status === "completed" || job.status === "ongoing" || job.status === "running") && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link to={`/scans/${job.job_id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details
                                </Link>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(job.job_id)}
                              disabled={isDeleting}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
              {filteredScans.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No scans match your current filters" 
                    : "No security scans yet. Upload a Django project to get started!"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}