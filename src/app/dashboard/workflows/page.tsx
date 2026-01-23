'use client'

import { useEffect, useState } from 'react'
import { workflowsAPI } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { RefreshCw, PlayCircle, PauseCircle, RotateCcw, Activity, AlertTriangle, Loader2 } from 'lucide-react'

type WorkflowRunStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

interface WorkflowRunSummary {
  id: string
  status: WorkflowRunStatus
  progress: number
  startedAt: string | null
  completedAt: string | null
  pausedAt: string | null
  campaign?: {
    id: string
    name: string
  } | null
  templateId?: string | null
  totalJobs: number
  failedJobs: number
  queuedJobs: number
  createdAt: string
  metadata?: Record<string, unknown>
}

interface WorkflowJob {
  id: string
  status: string
  jobName: string
  queueName: string
  createdAt: string
  updatedAt: string
  scheduledFor?: string | null
  errorMessage?: string | null
  result?: Record<string, unknown> | null
}

interface WorkflowRunDetail extends WorkflowRunSummary {
  jobs: WorkflowJob[]
  user?: {
    id: string
    email: string | null
  }
}

const statusStyles: Record<WorkflowRunStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
  ACTIVE: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  PAUSED: 'bg-slate-100 text-slate-700 border border-slate-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  FAILED: 'bg-rose-100 text-rose-800 border border-rose-200',
  CANCELLED: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
}

const jobStatusStyles: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700 border border-slate-200',
  QUEUED: 'bg-sky-100 text-sky-800 border border-sky-200',
  RUNNING: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  FAILED: 'bg-rose-100 text-rose-800 border border-rose-200',
  CANCELLED: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  SKIPPED: 'bg-amber-100 text-amber-800 border border-amber-200',
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

export default function WorkflowDashboardPage() {
  const [runs, setRuns] = useState<WorkflowRunSummary[]>([])
  const [selectedRun, setSelectedRun] = useState<WorkflowRunDetail | null>(null)
  const [statusFilter, setStatusFilter] = useState<WorkflowRunStatus | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshingRun, setIsRefreshingRun] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRuns = async (status?: WorkflowRunStatus) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await workflowsAPI.listRuns(status ? { status } : undefined)
      setRuns(response.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load workflow runs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadRunDetail = async (runId: string) => {
    try {
      setIsRefreshingRun(true)
      const response = await workflowsAPI.getRun(runId)
      setSelectedRun(response.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load workflow details.')
    } finally {
      setIsRefreshingRun(false)
    }
  }

  useEffect(() => {
    loadRuns(statusFilter)
  }, [statusFilter])

  const handlePause = async (runId: string) => {
    await workflowsAPI.pauseRun(runId)
    await loadRuns(statusFilter)
    if (selectedRun?.id === runId) {
      await loadRunDetail(runId)
    }
  }

  const handleResume = async (runId: string) => {
    await workflowsAPI.resumeRun(runId)
    await loadRuns(statusFilter)
    if (selectedRun?.id === runId) {
      await loadRunDetail(runId)
    }
  }

  const handleRetryJob = async (jobId: string, runId: string) => {
    await workflowsAPI.retryJob(jobId)
    await loadRuns(statusFilter)
    await loadRunDetail(runId)
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
                <Activity className="h-7 w-7 text-primary-light-purple drop-shadow-md" />
                Automation Workflows
              </h1>
              <p className="text-white/90 mt-2 text-base drop-shadow-md">
                Monitor and control end-to-end campaign automation pipelines.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative z-50">
                <select
                  value={statusFilter ?? ''}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value ? (event.target.value as WorkflowRunStatus) : undefined,
                    )
                  }
                  className="appearance-none rounded-lg border-2 border-white/60 bg-white/95 backdrop-blur-md text-gray-900 px-4 py-2.5 pr-10 text-sm font-semibold shadow-2xl transition-all duration-200 hover:bg-white hover:border-primary-light-purple focus:border-primary-light-purple focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer z-50 min-w-[160px]"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    zIndex: 9999
                  }}
                >
                  <option value="" style={{ backgroundColor: '#ffffff', color: '#111827' }}>All statuses</option>
                  <option value="PENDING" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Pending</option>
                  <option value="ACTIVE" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Active</option>
                  <option value="PAUSED" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Paused</option>
                  <option value="COMPLETED" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Completed</option>
                  <option value="FAILED" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Failed</option>
                  <option value="CANCELLED" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Cancelled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                  <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => loadRuns(statusFilter)}
                size="sm"
                className="flex items-center gap-2 text-white border-white/50 bg-white/20 backdrop-blur-md hover:bg-white/30 hover:border-white/70 transition-all duration-200 shadow-lg font-semibold px-4 py-2.5"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/20 backdrop-blur-sm px-4 py-3 text-sm text-red-200">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Panel - Workflow Runs List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="card flex items-center justify-center py-12 bg-white/10 backdrop-blur-lg border-white/20">
                  <Loader2 className="mr-3 h-6 w-6 animate-spin text-white" />
                  <span className="text-white text-base font-semibold drop-shadow-md">Loading workflow runs...</span>
                </div>
              ) : runs.length === 0 ? (
                <div className="card p-8 text-center bg-white/10 backdrop-blur-lg border-white/20">
                  <Activity className="h-12 w-12 text-white/80 mx-auto mb-4" />
                  <p className="text-white text-lg font-semibold mb-2 drop-shadow-lg">
                    No workflow runs found yet
                  </p>
                  <p className="text-white/80 text-sm drop-shadow-md">
                    Create a campaign to trigger automation.
                  </p>
                </div>
              ) : (
                <>
                  {runs.map((run) => (
                    <div
                      key={run.id}
                      className={`card rounded-xl border-2 transition-all duration-200 hover:border-primary-light-purple/60 hover:shadow-xl cursor-pointer bg-white/10 backdrop-blur-lg ${
                        selectedRun?.id === run.id ? 'ring-2 ring-primary-light-purple border-primary-light-purple shadow-2xl bg-white/15' : 'border-white/30'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (selectedRun?.id === run.id) {
                          setSelectedRun(null)
                        } else {
                          loadRunDetail(run.id)
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-white/70 mb-1 drop-shadow-sm">
                            Campaign
                          </p>
                          <p className="text-lg font-bold text-white mb-2 drop-shadow-md">
                            {run.campaign?.name ?? 'Unassigned'}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase shadow-md backdrop-blur-sm ${statusStyles[run.status]}`}
                            >
                              {run.status}
                            </span>
                            <span className="text-xs text-white/90 font-medium drop-shadow-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                              {Math.round((run.progress ?? 0) * 100)}% complete
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {run.status === 'ACTIVE' || run.status === 'PENDING' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePause(run.id)
                              }}
                              className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-white border border-white/50 shadow-lg font-semibold"
                            >
                              <PauseCircle className="h-4 w-4" />
                              Pause
                            </Button>
                          ) : run.status === 'PAUSED' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResume(run.id)
                              }}
                              className="flex items-center gap-1 bg-primary-light-purple hover:bg-primary-light-purple/90 text-white shadow-lg font-semibold"
                            >
                              <PlayCircle className="h-4 w-4" />
                              Resume
                            </Button>
                          ) : null}
                          <Button
                            variant={selectedRun?.id === run.id ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (selectedRun?.id === run.id) {
                                setSelectedRun(null)
                              } else {
                                loadRunDetail(run.id)
                              }
                            }}
                            className={
                              selectedRun?.id === run.id
                                ? 'bg-primary-light-purple hover:bg-primary-light-purple/90 text-white shadow-lg font-semibold'
                                : 'bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-white border border-white/50 shadow-lg font-semibold'
                            }
                          >
                            {selectedRun?.id === run.id ? 'Hide details' : 'View details'}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-light-purple to-primary-pink transition-all shadow-md"
                            style={{ width: `${Math.round((run.progress ?? 0) * 100)}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-4 text-white/90 drop-shadow-sm">
                          <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Created: {formatDate(run.createdAt)}</span>
                          <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Started: {formatDate(run.startedAt)}</span>
                          <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Completed: {formatDate(run.completedAt)}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-white/90 drop-shadow-sm">
                          <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Total jobs: {run.totalJobs}</span>
                          <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Queued: {run.queuedJobs}</span>
                          <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Failed: {run.failedJobs}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Right Panel - Workflow Run Details */}
            <div className="hidden lg:block">
              {selectedRun ? (
                <div className="sticky top-6 space-y-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-lg p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1 drop-shadow-md">Workflow run details</h2>
                      <p className="text-sm text-white/80 drop-shadow-sm">
                        Run ID: <span className="font-mono text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">{selectedRun.id}</span>
                      </p>
                    </div>
                    {isRefreshingRun ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-white border border-white/50 shadow-lg"
                        onClick={() => loadRunDetail(selectedRun.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm p-4 text-sm text-white/90 space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase shadow-md backdrop-blur-sm ${statusStyles[selectedRun.status]}`}>
                        {selectedRun.status}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Progress:</span>
                      <span className="text-white">{Math.round((selectedRun.progress ?? 0) * 100)}%</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Campaign:</span>
                      <span className="text-white">{selectedRun.campaign?.name ?? 'Unassigned'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">User:</span>
                      <span className="text-white">{selectedRun.user?.email ?? '—'}</span>
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-white drop-shadow-md">Jobs</h3>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedRun.jobs.map((job) => (
                        <div
                          key={job.id}
                          className="rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm p-4 text-xs shadow-lg hover:bg-white/15 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-semibold text-white mb-1 drop-shadow-sm">{job.jobName}</p>
                              <p className="text-[11px] uppercase tracking-wide text-white/70">
                                Queue: {job.queueName}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase shadow-md backdrop-blur-sm ${
                                jobStatusStyles[job.status] ?? 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {job.status}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/80">
                            <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Created: {formatDate(job.createdAt)}</span>
                            <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Updated: {formatDate(job.updatedAt)}</span>
                            <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm col-span-2">Scheduled: {formatDate(job.scheduledFor)}</span>
                          </div>
                          {job.errorMessage && (
                            <div className="mt-3 rounded-lg border border-red-300/50 bg-red-500/20 backdrop-blur-sm p-3 text-[11px] text-red-100 shadow-md">
                              <span className="font-semibold">Error:</span> {job.errorMessage}
                            </div>
                          )}
                          {job.status === 'FAILED' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRetryJob(job.id, selectedRun.id)}
                              className="mt-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-white border border-white/50 shadow-lg h-auto px-3 py-1.5 text-xs font-semibold"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Retry job
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sticky top-6 rounded-xl border-2 border-dashed border-white/30 bg-white/10 backdrop-blur-lg p-8 text-center shadow-xl">
                  <Activity className="h-12 w-12 text-white/60 mx-auto mb-4" />
                  <p className="text-white text-base font-medium drop-shadow-md mb-2">
                    Select a workflow run
                  </p>
                  <p className="text-white/80 text-sm drop-shadow-sm">
                    View detailed job progress and logs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

