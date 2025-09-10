import { useState } from "react"
import { Bug, X, Wifi, Download, FileText, ExternalLink, TestTube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/services/api"
import { logger } from "@/utils/logger"

export function DebugPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleTestConnection = async () => {
    try {
      const health = await apiService.healthCheck()
      toast({
        title: "Connection Test",
        description: `Backend is reachable: ${health.message}`,
      })
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: `Cannot reach backend: ${error}`,
        variant: "destructive",
      })
    }
  }

  const handleDebugAPI = () => {
    console.log('=== API Service Debug Info ===')
    console.log('apiService:', apiService)
    console.log('apiService.getBaseUrl exists:', typeof apiService.getBaseUrl)
    try {
      const baseUrl = apiService.getBaseUrl ? apiService.getBaseUrl() : 'http://localhost:8000'
      console.log('apiService.getBaseUrl():', baseUrl)
      toast({
        title: "Debug Info",
        description: `Check console for API service debug info. Base URL: ${baseUrl}`,
      })
    } catch (error) {
      console.log('apiService.getBaseUrl() failed:', error)
      toast({
        title: "Debug Info",
        description: `getBaseUrl method failed. Check console for details.`,
      })
    }
    console.log('typeof apiService.baseUrl:', typeof (apiService as any).baseUrl)
    console.log('apiService.baseUrl value:', (apiService as any).baseUrl)
  }

  const handleDownloadFrontendLogs = () => {
    logger.downloadLogs()
    toast({
      title: "Logs Downloaded",
      description: "Frontend logs have been downloaded to your device",
    })
  }

  const handleDownloadBackendLogs = async () => {
    try {
      const backendLogs = await apiService.getBackendLogs()
      const blob = new Blob([JSON.stringify(backendLogs, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dwas-backend-logs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Backend Logs Downloaded",
        description: `Downloaded ${backendLogs.total_logs} backend log entries`,
      })
    } catch (error) {
      toast({
        title: "Failed to Download Backend Logs",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    }
  }

  const handleOpenAPIDocs = () => {
    window.open('http://localhost:8000/docs', '_blank')
  }

  const handleTestJobsAPI = async () => {
    try {
      const response = await fetch('http://localhost:8000/jobs')
      const data = await response.json()
      console.log('Manual jobs fetch result:', data)
      toast({
        title: "Manual Test",
        description: `Fetched ${data.length} jobs manually`,
      })
    } catch (error) {
      toast({
        title: "Manual Test Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    }
  }

  const getBaseUrl = () => {
    try {
      return apiService.getBaseUrl ? apiService.getBaseUrl() : 'http://localhost:8000'
    } catch (error) {
      console.warn('getBaseUrl failed:', error)
      return 'http://localhost:8000'
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
            aria-label="Debug Menu"
          >
            <Bug className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4 mr-4 mb-4" 
          side="top" 
          align="end"
          sideOffset={12}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Debug Tools
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-3">
                <strong>API Base URL:</strong> {getBaseUrl()}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  className="flex items-center gap-2"
                >
                  <Wifi className="h-4 w-4" />
                  Test Connection
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDebugAPI}
                  className="flex items-center gap-2"
                >
                  <Bug className="h-4 w-4" />
                  Debug API
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadFrontendLogs}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Frontend Logs
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadBackendLogs}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Backend Logs
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAPIDocs}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  API Docs
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestJobsAPI}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Test Jobs API
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
