"use client"

import React, { useRef, useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { AppDispatch, RootState } from "@/store/store"
import {
  uploadEmailMinerCSV,
  removeMiningSession,
  clearCompletedSessions,
} from "@/store/actions/emailMinerActions"
import { fetchCampaigns, handleFetchCampaigns } from "@/store/actions/campaignActions"
import { fetchCompanies } from "@/store/actions/companyActions"
import { addProcessingEmailMiner } from "@/store/slices/processingEmailMinersSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  X,
  Search,
  ChevronDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Import animations via CSS
import "@/styles/email-miner.css"

interface EmailMinerUploadProps {
  onComplete?: (results: any) => void
  defaultCampaignId?: number
}

export default function EmailMinerUpload({
  onComplete,
  defaultCampaignId,
}: EmailMinerUploadProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { toast } = useToast()

  // File and form state
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [csvFile, setCSVFile] = useState<File | null>(null)
  const [label, setLabel] = useState("")
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    defaultCampaignId || null
  )

  // Campaign selector modal state
  const [showCampaignSelector, setCampaignSelector] = useState(false)
  const [campaignSearch, setCampaignSearch] = useState("")
  const [campaignPage, setCampaignPage] = useState(1)

  // Redux state
  const miningSession = useSelector((state: RootState) => {
    const sessions = state.emailMiner?.sessions || {}
    return Object.values(sessions)[0] || null
  })
  const isProcessing = useSelector((state: RootState) => state.emailMiner?.isProcessing)
  
  // Campaigns state - correctly access nested structure
  const campaigns = useSelector((state: RootState) => state.campaigns?.campaigns || [])
  const campaignsPagination = useSelector((state: RootState) => state.campaigns?.pagination)
  const campaignsLoading = useSelector((state: RootState) => state.campaigns?.isLoading || false)

  // Error handling
  const [error, setError] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [uploadStarted, setUploadStarted] = useState(false)
  const currentCampaign = campaigns.find((c: any) => c.id === selectedCampaignId)

  // Validation
  const isFormValid = csvFile && label.trim()
  const isSubmitDisabled = !isFormValid || isProcessing || uploadStarted

  // Handle file selection
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      if (!f.name.toLowerCase().endsWith(".csv")) {
        setError("Please select a CSV file")
        e.target.value = ""
        return
      }
      setCSVFile(f)
      setError("")
      setUploadError("")
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!csvFile) {
      setError("Please select a CSV file")
      return
    }

    if (!label.trim()) {
      setError("Label is required")
      return
    }

    setUploadStarted(true)
    setError("")
    setUploadError("")

    try {
      const result = await dispatch(
        uploadEmailMinerCSV({
          file: csvFile,
          campaignId: selectedCampaignId || undefined,
          label: label.trim(),
          checkUserDuplicates: true,
        })
      ).unwrap()

      toast({
        title: "Upload Started",
        description: `Mining started for ${csvFile.name}`,
      })

      // Add to processing miners for float display
      dispatch(addProcessingEmailMiner({
        minerId: Date.now(),
        name: csvFile.name,
        status: "processing",
        startedAt: Date.now(),
        lastPolled: Date.now(),
        retryCount: 0,
        campaignId: selectedCampaignId,
        campaignName: currentCampaign?.name,
      }))

      // Navigate to campaign or companies page
      if (selectedCampaignId) {
        router.push(`/campaigns/${selectedCampaignId}`)
      } else {
        router.push('/companies')
      }

      // Firebase notifications will handle dismissal and refresh when email mining completes

      // Reset form
      setCSVFile(null)
      setLabel("")
      if (fileRef.current) fileRef.current.value = ""
    } catch (err: any) {
      setUploadError(err || "Failed to upload file")
      setUploadStarted(false)
      toast({
        title: "Upload Failed",
        description: err || "Failed to upload CSV file",
        variant: "destructive",
      })
    }
  }

  // Fetch campaigns when selector opens
  useEffect(() => {
    if (showCampaignSelector) {
      dispatch(handleFetchCampaigns({ search: campaignSearch, page: campaignPage }) as any)
    }
  }, [showCampaignSelector, dispatch])

  // Refetch campaigns when search or page changes
  useEffect(() => {
    if (showCampaignSelector && (campaignSearch || campaignPage > 1)) {
      const timer = setTimeout(() => {
        dispatch(handleFetchCampaigns({ search: campaignSearch, page: campaignPage }) as any)
      }, 300) // Debounce search
      return () => clearTimeout(timer)
    }
  }, [campaignSearch, campaignPage, showCampaignSelector, dispatch])

  // Handle mining completion
  useEffect(() => {
    if (miningSession?.status === "completed" && uploadStarted) {
      toast({
        title: "✨ Mining Complete!",
        description: `Successfully extracted ${miningSession.emailsCount} emails from ${miningSession.companiesCount} companies`,
      })

      // Fetch companies with the label filter
      if (miningSession.label) {
        dispatch(
          fetchCompanies({
            label: miningSession.label,
            page: 1,
          }) as any
        )

        // Redirect with label filter
        setTimeout(() => {
          router.push(`/companies?label=${encodeURIComponent(miningSession.label)}`)
        }, 2000)
      }
    }

    if (miningSession?.status === "failed" && uploadStarted) {
      setUploadError(miningSession.error || "Email mining failed")
      setUploadStarted(false)
      toast({
        title: "Mining Failed",
        description: miningSession.error || "Failed to mine emails",
        variant: "destructive",
      })
    }
  }, [miningSession?.status, miningSession?.emailsCount, miningSession?.companiesCount, miningSession?.label, miningSession?.error, uploadStarted, dispatch, router, toast])

  // PROCESSING STATE
  if (isProcessing && miningSession) {
    return (
      <ProcessingBanner
        session={miningSession}
        onCancel={() => {
          dispatch(removeMiningSession(miningSession.token))
          setUploadStarted(false)
        }}
      />
    )
  }

  // SUCCESS STATE
  if (miningSession?.status === "completed" && uploadStarted) {
    return (
      <SuccessBanner
        session={miningSession}
        onViewCompanies={() =>
          router.push(`/companies?label=${encodeURIComponent(miningSession.label)}`)
        }
        onStartAnother={() => {
          dispatch(removeMiningSession(miningSession.token))
          setUploadStarted(false)
          setCSVFile(null)
          setLabel("")
          setSelectedCampaignId(defaultCampaignId || null)
        }}
      />
    )
  }

  // ERROR STATE
  if (miningSession?.status === "failed" && uploadStarted) {
    return (
      <ErrorBanner
        session={miningSession}
        onRetry={() => {
          dispatch(removeMiningSession(miningSession.token))
          setUploadStarted(false)
        }}
      />
    )
  }

  // IDLE STATE
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Card */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 overflow-hidden transition-all">
        <div className="relative p-8">
          {/* Animated background gradient */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 dark:from-blue-500/10 dark:to-indigo-500/10" />
          </div>

          <div className="relative group">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onFileChange}
              disabled={uploadStarted}
            />

            <button
              type="button"
              onClick={() => !uploadStarted && fileRef.current?.click()}
              disabled={uploadStarted}
              className="w-full group"
            >
              <div className="flex flex-col items-center justify-center gap-3 py-8 transition-all duration-300 group-hover:gap-4">
                <div className="relative">
                  <Upload className="h-12 w-12 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
                  <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                </div>

                <div className="text-center">
                  {csvFile ? (
                    <>
                      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        {csvFile.name}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {(csvFile.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 group-hover:text-blue-700 transition-colors">
                        Drag and drop CSV here
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        or click to browse
                      </p>
                    </>
                  )}
                </div>

                <p className="text-xs text-blue-600 dark:text-blue-400 max-w-xs">
                  CSV must include a <strong>Website</strong> column. Other columns are optional.
                </p>
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* Label Input - REQUIRED */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
            1
          </span>
          Label
          <span className="text-red-600">*</span>
        </label>
        <Input
          type="text"
          placeholder="e.g., Q1-Prospects, VIP-Leads, Tech-Companies"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value)
            setError("")
          }}
          disabled={uploadStarted}
          className="text-sm border-2 focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-slate-600 dark:text-slate-400">
          This label will be applied to all extracted companies and emails
        </p>
      </div>

      {/* Campaign Selector - OPTIONAL */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
            2
          </span>
          Associate Campaign
          <span className="text-xs text-slate-500">(Optional)</span>
        </label>

        <button
          type="button"
          onClick={() => setCampaignSelector(true)}
          disabled={uploadStarted}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-colors bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-left text-sm">
            {currentCampaign ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {currentCampaign.name}
                </Badge>
              </div>
            ) : (
              <span className="text-slate-500">Click to select campaign...</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>

        {selectedCampaignId && (
          <button
            type="button"
            onClick={() => setSelectedCampaignId(null)}
            className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 underline"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Campaign Selector Modal */}
      <CampaignSelectorModal
        open={showCampaignSelector}
        onOpenChange={setCampaignSelector}
        selectedId={selectedCampaignId}
        onSelect={setSelectedCampaignId}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        pagination={campaignsPagination}
        searchQuery={campaignSearch}
        onSearchChange={setCampaignSearch}
        page={campaignPage}
        onPageChange={setCampaignPage}
      />

      {/* Error Messages */}
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive" className="animate-in slide-in-from-top">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription className="text-xs">{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadStarted ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Start Mining
            </>
          )}
        </Button>

        {csvFile && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCSVFile(null)
              if (fileRef.current) fileRef.current.value = ""
            }}
            disabled={uploadStarted}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
          ℹ️ How it works:
        </p>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Upload a CSV with company websites</li>
          <li>We extract emails for each company</li>
          <li>All results get your label for easy filtering</li>
          <li>Optionally link to a campaign</li>
        </ul>
      </div>
    </form>
  )
}

// ==================== PROCESSING BANNER ====================
function ProcessingBanner({
  session,
  onCancel,
}: {
  session: any
  onCancel: () => void
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const elapsed = Date.now() - session.startedAt
        return Math.min(85, (elapsed / 300000) * 100) // Max 85% over 5 minutes
      })
    }, 500)
    return () => clearInterval(interval)
  }, [session.startedAt])

  return (
    <div className="fixed top-4 left-4 z-50 w-[420px] max-w-[calc(100vw-2rem)]">
      <Card className="p-4 shadow-lg border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="relative">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                  Mining emails...
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                  {session.filename}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={onCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="h-2 bg-blue-100 dark:bg-blue-900" />
            <p className="text-xs text-muted-foreground">
              Extracting emails from companies... This may take 1-2 minutes
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ==================== SUCCESS BANNER ====================
function SuccessBanner({
  session,
  onViewCompanies,
  onStartAnother,
}: {
  session: any
  onViewCompanies: () => void
  onStartAnother: () => void
}) {
  return (
    <div className="fixed top-4 left-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-left">
      <Card className="p-6 shadow-lg border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1 animate-pop" />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                ✨ Mining Complete!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {session.label}
              </p>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-3 gap-3 py-4 px-3 bg-green-100/50 dark:bg-green-900/30 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {session.companiesCount || 0}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">Companies</p>
            </div>
            <div className="text-center border-l border-r border-green-300 dark:border-green-700">
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {session.emailsCount || 0}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">Emails</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {session.duplicatesSkipped || 0}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">Skipped</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onViewCompanies}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              View Companies
            </Button>
            <Button
              onClick={onStartAnother}
              variant="outline"
              className="flex-1"
            >
              Start Another
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ==================== ERROR BANNER ====================
function ErrorBanner({
  session,
  onRetry,
}: {
  session: any
  onRetry: () => void
}) {
  return (
    <div className="fixed top-4 left-4 z-50 w-[420px] max-w-[calc(100vw-2rem)]">
      <Card className="p-4 shadow-lg border-2 border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/40 dark:to-pink-950/40">
        <div className="flex items-start gap-3">
          <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                Mining Failed
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                {session.error || "Unknown error occurred"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onRetry}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ==================== CAMPAIGN SELECTOR MODAL ====================
function CampaignSelectorModal({
  open,
  onOpenChange,
  selectedId,
  onSelect,
  campaigns,
  campaignsLoading,
  pagination,
  searchQuery,
  onSearchChange,
  page,
  onPageChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedId: number | null
  onSelect: (id: number | null) => void
  campaigns: any[]
  campaignsLoading?: boolean
  pagination?: any
  searchQuery: string
  onSearchChange: (query: string) => void
  page: number
  onPageChange: (page: number) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Campaign (Optional)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Campaigns List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {campaignsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : campaigns.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">
                No campaigns found
              </p>
            ) : (
              campaigns.map((campaign: any) => (
                <button
                  key={campaign.id}
                  onClick={() => {
                    onSelect(campaign.id)
                    onOpenChange(false)
                  }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedId === campaign.id
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500"
                  }`}
                >
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                    {campaign.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {campaign.recipient_count || 0} recipients
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination?.next && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          )}

          {/* No Selection Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onSelect(null)
              onOpenChange(false)
            }}
          >
            No Campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
