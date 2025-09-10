// Frontend logging utility for debugging API communication
interface LogEntry {
  timestamp: string
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'
  source: 'FRONTEND' | 'API'
  message: string
  data?: any
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  log(level: LogEntry['level'], source: LogEntry['source'], message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data
    }
    
    this.logs.push(entry)
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
    
    // Also log to console
    const consoleMessage = `[${entry.timestamp}] ${entry.level} [${entry.source}] ${entry.message}`
    if (data) {
      console.log(consoleMessage, data)
    } else {
      console.log(consoleMessage)
    }
  }

  info(source: LogEntry['source'], message: string, data?: any) {
    this.log('INFO', source, message, data)
  }

  error(source: LogEntry['source'], message: string, data?: any) {
    this.log('ERROR', source, message, data)
  }

  warn(source: LogEntry['source'], message: string, data?: any) {
    this.log('WARN', source, message, data)
  }

  debug(source: LogEntry['source'], message: string, data?: any) {
    this.log('DEBUG', source, message, data)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  downloadLogs() {
    const logs = this.exportLogs()
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dwas-frontend-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()

// Log all fetch requests
const originalFetch = window.fetch
window.fetch = async (...args) => {
  const url = args[0] as string
  const options = args[1] as RequestInit
  
  logger.info('API', `Making ${options?.method || 'GET'} request to ${url}`, {
    url,
    method: options?.method || 'GET',
    headers: options?.headers,
    body: options?.body
  })
  
  try {
    const response = await originalFetch(...args)
    
    logger.info('API', `Response from ${url}: ${response.status} ${response.statusText}`, {
      url,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    return response
  } catch (error) {
    logger.error('API', `Request failed for ${url}`, {
      url,
      error: error instanceof Error ? error.message : String(error)
    })
    throw error
  }
}
