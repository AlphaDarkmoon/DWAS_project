// API service for connecting to the DWAS Scanner backend
import { logger } from '@/utils/logger'

const API_BASE_URL = 'http://localhost:8000'

console.log('API_BASE_URL constant:', API_BASE_URL)
logger.info('FRONTEND', 'API service module loaded', { API_BASE_URL })

export interface Job {
  job_id: string
  filename: string
  status: 'pending' | 'ongoing' | 'running' | 'completed' | 'failed'
  summary?: string
  result?: any
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface UploadResponse {
  job_id: string
  status: string
}

export interface DeleteResponse {
  message: string
}

class ApiService {
  private baseUrl: string
  private static readonly DEFAULT_BASE_URL = 'http://localhost:8000'

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl || ApiService.DEFAULT_BASE_URL
    console.log('ApiService constructor - baseUrl:', this.baseUrl)
    console.log('ApiService constructor - API_BASE_URL:', API_BASE_URL)
    logger.info('FRONTEND', 'ApiService constructor called', { 
      baseUrl: this.baseUrl, 
      API_BASE_URL,
      DEFAULT_BASE_URL: ApiService.DEFAULT_BASE_URL 
    })
  }

  getBaseUrl = (): string => {
    const url = this.baseUrl || ApiService.DEFAULT_BASE_URL
    console.log('getBaseUrl() returning:', url)
    logger.debug('FRONTEND', 'getBaseUrl() called', { 
      thisBaseUrl: this.baseUrl, 
      returnedUrl: url,
      DEFAULT_BASE_URL: ApiService.DEFAULT_BASE_URL 
    })
    return url
  }

  // Alternative method name in case of issues
  getApiUrl = (): string => {
    return this.getBaseUrl()
  }

  async healthCheck(): Promise<{status: string, message: string}> {
    const url = this.getBaseUrl()
    const healthUrl = `${url}/health`
    console.log('healthCheck - URL:', healthUrl)
    
    const response = await fetch(healthUrl)
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Fallback method that doesn't rely on this context
  getBaseUrlFallback(): string {
    return 'http://localhost:8000'
  }

  async uploadProject(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    // Try multiple ways to get the base URL
    let baseUrl: string
    try {
      baseUrl = this.getBaseUrl()
    } catch (error) {
      console.warn('getBaseUrl() failed, using fallback:', error)
      baseUrl = this.getBaseUrlFallback()
    }
    
    const uploadUrl = `${baseUrl}/upload`
    
    logger.info('FRONTEND', 'Starting file upload', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadUrl,
      baseUrl
    })

    console.log('Uploading file:', file.name, 'to:', uploadUrl)
    console.log('baseUrl:', baseUrl)

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })

    console.log('Upload response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Upload error response:', errorText)
      logger.error('FRONTEND', 'Upload failed', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        uploadUrl
      })
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    logger.info('FRONTEND', 'Upload successful', { result })
    return result
  }

  async getAllJobs(): Promise<Job[]> {
    const baseUrl = this.getBaseUrl()
    const response = await fetch(`${baseUrl}/jobs`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`)
    }

    return response.json()
  }

  async getJob(jobId: string): Promise<Job> {
    const baseUrl = this.getBaseUrl()
    const response = await fetch(`${baseUrl}/jobs/${jobId}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Job not found')
      }
      throw new Error(`Failed to fetch job: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteJob(jobId: string): Promise<DeleteResponse> {
    const baseUrl = this.getBaseUrl()
    const response = await fetch(`${baseUrl}/jobs/${jobId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete job: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteAllJobs(): Promise<{message: string, deleted_count: number}> {
    const baseUrl = this.getBaseUrl()
    const response = await fetch(`${baseUrl}/jobs`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete all jobs: ${response.statusText}`)
    }

    return response.json()
  }

  async getBackendLogs(): Promise<{logs: any[], total_logs: number}> {
    const baseUrl = this.getBaseUrl()
    const response = await fetch(`${baseUrl}/logs`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`)
    }

    return response.json()
  }

  async clearBackendLogs(): Promise<{message: string}> {
    const baseUrl = this.getBaseUrl()
    const response = await fetch(`${baseUrl}/logs`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to clear logs: ${response.statusText}`)
    }

    return response.json()
  }

  async downloadJsonReport(jobId: string): Promise<Blob> {
    const baseUrl = this.getBaseUrl()
    const response = await fetch(`${baseUrl}/jobs/${jobId}/report/json`)
    
    if (!response.ok) {
      throw new Error(`Failed to download JSON report: ${response.statusText}`)
    }

    return response.blob()
  }

  async downloadPdfReport(jobId: string): Promise<Blob> {
    const baseUrl = this.getBaseUrl()
    const response = await fetch(`${baseUrl}/jobs/${jobId}/report/pdf`)
    
    if (!response.ok) {
      throw new Error(`Failed to download PDF report: ${response.statusText}`)
    }

    return response.blob()
  }
}

// Create API service instance with explicit URL
export const apiService = new ApiService('http://localhost:8000')

console.log('apiService created with baseUrl:', apiService.getBaseUrl())

// Export a function to create a new instance if needed
export function createApiService(baseUrl: string = 'http://localhost:8000'): ApiService {
  return new ApiService(baseUrl)
}

// Simple function-based API service as fallback
export const simpleApiService = {
  baseUrl: 'http://localhost:8000',
  
  async uploadProject(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const uploadUrl = `${this.baseUrl}/upload`
    console.log('Simple API service uploading to:', uploadUrl)
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    return response.json()
  },
  
  async healthCheck(): Promise<{status: string, message: string}> {
    const response = await fetch(`${this.baseUrl}/health`)
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`)
    }
    return response.json()
  }
}
