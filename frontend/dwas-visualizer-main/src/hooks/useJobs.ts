import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService, simpleApiService, type Job } from '@/services/api'

export function useJobs() {
  const queryClient = useQueryClient()

  const {
    data: jobs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const result = await apiService.getAllJobs()
        console.log('Fetched jobs:', result)
        return result
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
        throw error
      }
    },
    refetchInterval: 3000, // Refetch every 3 seconds to get real-time updates
    retry: 3,
    retryDelay: 1000,
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        return await apiService.uploadProject(file)
      } catch (error) {
        console.warn('Main API service failed, trying simple API service:', error)
        return await simpleApiService.uploadProject(file)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => apiService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  const deleteAllMutation = useMutation({
    mutationFn: () => apiService.deleteAllJobs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    jobs,
    isLoading,
    error,
    refetch,
    uploadJob: uploadMutation.mutate,
    deleteJob: deleteMutation.mutate,
    deleteAllJobs: deleteAllMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingAll: deleteAllMutation.isPending,
    uploadError: uploadMutation.error,
    deleteError: deleteMutation.error,
    deleteAllError: deleteAllMutation.error,
  }
}

export function useJob(jobId: string) {
  const queryClient = useQueryClient()

  const {
    data: job,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => apiService.getJob(jobId),
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Only refetch if job is not completed or failed
      return data?.status === 'pending' || data?.status === 'ongoing' ? 3000 : false
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => apiService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    job,
    isLoading,
    error,
    refetch,
    deleteJob: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  }
}
