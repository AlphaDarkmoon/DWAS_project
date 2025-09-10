import { useState, useCallback } from "react"
import { Upload, File, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type UploadState = "idle" | "uploading" | "success" | "error"

interface UploadZoneProps {
  onUpload?: (file: File) => void
  className?: string
}

export function UploadZone({ onUpload, className }: UploadZoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback((files: FileList) => {
    const file = files[0]
    if (file && file.name.endsWith('.zip')) {
      setFileName(file.name)
      setUploadState("uploading")
      setProgress(0)
      
      // Call the upload callback immediately
      onUpload?.(file)
      
      // Simulate upload progress for UI feedback
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setUploadState("success")
            return 100
          }
          return prev + 10
        })
      }, 200)
    } else {
      setUploadState("error")
    }
  }, [onUpload])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          dragActive && "border-primary bg-primary/5",
          uploadState === "idle" && "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
          uploadState === "success" && "border-success bg-success/5",
          uploadState === "error" && "border-critical bg-critical/5"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploadState === "idle" && (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Django Project</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your Django project ZIP file here, or click to browse
            </p>
            <Button variant="outline">
              Choose File
            </Button>
          </>
        )}

        {uploadState === "uploading" && (
          <>
            <File className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Uploading {fileName}</h3>
            <Progress value={progress} className="w-full max-w-sm mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {progress}% complete
            </p>
          </>
        )}

        {uploadState === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-success mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Successful</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {fileName} has been uploaded and security scan has started
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadState("idle")
                setProgress(0)
                setFileName("")
              }}
            >
              Upload Another
            </Button>
          </>
        )}

        {uploadState === "error" && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-critical mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Failed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please upload a valid ZIP file containing a Django project
            </p>
            <Button 
              variant="outline" 
              onClick={() => setUploadState("idle")}
            >
              Try Again
            </Button>
          </>
        )}

        <input
          type="file"
          accept=".zip"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadState === "uploading"}
        />
      </div>
    </div>
  )
}