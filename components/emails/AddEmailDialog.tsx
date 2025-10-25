"use client"
import { useState, useRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Edit, Upload, Copy, Download } from "lucide-react"
import { handleCreateEmail, handleBulkCreateEmails, handleAddExistingEmails, handleFetchEmails } from "@/store/actions/emailActions"
import type { RootState, AppDispatch } from "@/store/store"

interface Email {
  id: number
  email: string
  first_name?: string | null
  last_name?: string | null
  organization_name?: string | null
  campaigns?: Array<{ id: number }>
}

interface AddEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCampaignId?: number | null
  emails?: Email[]
  onAddExistingEmails?: (emailIds: number[], skipDuplicates: boolean) => Promise<{ success: boolean; error?: string }>
  isLoadingEmails?: boolean
  onSuccess?: () => void
}

export default function AddEmailDialog({
  open,
  onOpenChange,
  initialCampaignId,
  emails = [],
  onAddExistingEmails,
  isLoadingEmails = false,
  onSuccess
}: AddEmailDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const emailsFromStore = useSelector((state: RootState) => state.emails.emails)
  const isEmailsLoading = useSelector((state: RootState) => state.emails.isLoading)
  const pagination = useSelector((state: RootState) => state.emails.pagination)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [organization, setOrganization] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [checkDuplicates, setCheckDuplicates] = useState(true)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkError, setBulkError] = useState("")
  const [bulkSuccess, setBulkSuccess] = useState(false)
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<number[]>([])
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [isAddingExisting, setIsAddingExisting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEmailIds, setSelectedEmailIds] = useState<number[]>([])
  const [existingError, setExistingError] = useState("")
  const [existingSuccess, setExistingSuccess] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch emails when dialog opens, page changes, or search changes
  useEffect(() => {
    if (!open) return

    const doFetch = async () => {
      await dispatch(handleFetchEmails({ page: currentPage, search: searchQuery || undefined }) as any)
    }

    // Debounce search
    const timer = setTimeout(doFetch, 500)
    return () => clearTimeout(timer)
  }, [open, currentPage, searchQuery, dispatch])

  // Reset to first page when opening or when search changes
  useEffect(() => {
    if (!open) return
    setCurrentPage(1)
  }, [open])

  const toggleEmailSelection = (emailId: number) => {
    setSelectedEmailIds(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }


  const handleAddExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!initialCampaignId) {
      setExistingError("No campaign selected")
      return
    }
    
    if (selectedEmailIds.length === 0) {
      setExistingError("Please select at least one email")
      return
    }
    
    setExistingError("")
    setExistingSuccess(false)
    setIsAddingExisting(true)
    
    try {
      const result = await dispatch(handleAddExistingEmails({
        campaignId: initialCampaignId,
        emailListIds: selectedEmailIds,
        skipDuplicates: skipDuplicates
      }))
      
      console.log('API Response:', result)
      
      // Check for success based on the actual API response structure
      if (result?.success && result?.data) {
        setExistingSuccess(true)
        setSelectedEmailIds([])
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }
        setTimeout(() => setExistingSuccess(false), 2000)
        setTimeout(() => onOpenChange(false), 1000)
      } else {
        const errorMessage = result?.data?.message || result?.error || "Failed to add existing emails"
        setExistingError(errorMessage)
      }
    } catch (err: any) {
      setExistingError(err?.message || "Failed to add existing emails")
    } finally {
      setIsAddingExisting(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = 'email,first_name,last_name,organization_name\nexample@example.com,John,Doe,Acme Inc.'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'email_import_template.csv'
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const validateCSVColumns = (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n')
          if (lines.length === 0) {
            resolve({ valid: false, error: "CSV file is empty" })
            return
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          const requiredColumns = ['email', 'organization_name']
          const missingColumns = requiredColumns.filter(col => !headers.includes(col))
          
          if (missingColumns.length > 0) {
            resolve({ 
              valid: false, 
              error: `Missing required columns: ${missingColumns.join(', ')}. Required columns are: ${requiredColumns.join(', ')}` 
            })
            return
          }
          
          resolve({ valid: true })
        } catch (error) {
          resolve({ valid: false, error: "Error reading CSV file" })
        }
      }
      reader.readAsText(file)
    })
  }

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Only validate CSV files
      if (file.name.toLowerCase().endsWith('.csv')) {
        const validation = await validateCSVColumns(file)
        if (!validation.valid) {
          setBulkError(validation.error || "Invalid CSV file")
          e.target.value = '' // Clear the file input
          return
        }
      }
      
      setBulkFile(file)
      setBulkError("")
    }
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bulkFile) {
      setBulkError("Please select a file to upload")
      return
    }

    if (!initialCampaignId) {
      setBulkError("No campaign selected")
      return
    }

    setIsBulkLoading(true)
    setBulkError("")
    setBulkSuccess(false)

    try {
      const formData = new FormData()
      formData.append("csv_file", bulkFile)
      formData.append("campaign_id", String(initialCampaignId))
      formData.append("check_user_duplicates", String(checkDuplicates))

      const result = await dispatch(handleBulkCreateEmails(formData) as any)

      if (result?.error) {
        setBulkError(result.error)
        return
      }

      setBulkSuccess(true)
      setBulkFile(null)

      // Reset file input
      const fileInput = document.getElementById('bulk-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Close dialog after 2 seconds on success
      setTimeout(() => {
        onOpenChange(false)
        setBulkSuccess(false)
      }, 2000)

    } catch (err: any) {
      setBulkError(err?.message || "Failed to upload emails")
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Email is required")
      return
    }

    if (!initialCampaignId) {
      setError("No campaign selected")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await dispatch(handleCreateEmail({
        email,
        organization_name: organization,
        campaign: initialCampaignId as number,
        check_user_duplicates: checkDuplicates
      }) as any)

      if (result?.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setEmail("")
      setOrganization("")

      // Close dialog after 2 seconds on success
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
      }, 2000)

    } catch (err: any) {
      setError(err?.message || "Failed to add email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Emails</DialogTitle>
          <p className="text-sm text-muted-foreground">Choose how you want to add emails to your campaign</p>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="manual"><Edit className="w-4 h-4 mr-1" /> Manual</TabsTrigger>
            <TabsTrigger value="bulk"><Upload className="w-4 h-4 mr-1" /> Bulk Upload</TabsTrigger>
            <TabsTrigger value="existing"><Copy className="w-4 h-4 mr-1" /> Add Existing</TabsTrigger>
          </TabsList>

          {/* Manual Tab */}
          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Email added successfully!</AlertDescription>
                </Alert>
              )}

              <p className="text-sm text-muted-foreground mb-1">
                Add a single email entry manually. Use this for quick, one-off additions.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Organization
                </label>
                <Input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Acme Inc."
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="check-duplicates"
                  checked={checkDuplicates}
                  onChange={(e) => setCheckDuplicates(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <label htmlFor="check-duplicates" className="text-sm text-gray-600">
                  Check for duplicates across all my campaigns
                </label>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Email'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Bulk Upload Tab */}
          <TabsContent value="bulk">
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              {bulkError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{bulkError}</AlertDescription>
                </Alert>
              )}

              {bulkSuccess && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Emails uploaded successfully!</AlertDescription>
                </Alert>
              )}

              <p className="text-sm text-muted-foreground mb-1">
                Upload a CSV or JSON file to add many emails at once.
                <span className="block mt-1">
                  <b>Required columns:</b> <code>email</code>, <code>organization_name</code>
                </span>
              </p>

              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <Input
                    id="bulk-upload"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleBulkFileChange}
                    disabled={isBulkLoading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    or drag and drop
                  </p>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  'CSV or JSON up to 10MB'
                </p>
                {bulkFile && (
                  <p className="mt-2 text-sm text-green-600">
                    {bulkFile.name} ({(bulkFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={downloadTemplate}
                  disabled={isBulkLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="bulk-check-duplicates"
                    checked={checkDuplicates}
                    onChange={(e) => setCheckDuplicates(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={isBulkLoading}
                  />
                  <label htmlFor="bulk-check-duplicates" className="text-gray-600">
                    Skip duplicates
                  </label>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isBulkLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!bulkFile || isBulkLoading}
                >
                  {isBulkLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : 'Upload & Process'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Add Existing Tab */}
          <TabsContent value="existing" className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {existingError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{existingError}</AlertDescription>
                </Alert>
              )}
              {existingSuccess && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Emails added successfully!</AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground mb-1">
                Select existing emails to add to this campaign.
              </p>

              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="mb-2"
              />

              {/* Select All for Current Page */}
              {(emailsFromStore?.length || 0) > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded mb-2">
                  <Checkbox
                    id="select-all-page"
                    checked={emailsFromStore?.length > 0 && emailsFromStore.every(email => selectedEmailIds.includes(email.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // Add all current page emails to selection
                        const currentPageIds = emailsFromStore?.map(email => email.id) || []
                        setSelectedEmailIds(prev => [...new Set([...prev, ...currentPageIds])])
                      } else {
                        // Remove all current page emails from selection
                        const currentPageIds = emailsFromStore?.map(email => email.id) || []
                        setSelectedEmailIds(prev => prev.filter(id => !currentPageIds.includes(id)))
                      }
                    }}
                  />
                  <label htmlFor="select-all-page" className="text-sm font-medium cursor-pointer">
                    Select all on this page ({emailsFromStore?.length || 0})
                  </label>
                </div>
              )}

              <div className="border rounded-md flex-1 min-h-[300px] overflow-y-auto p-2 space-y-2">
                {isEmailsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (emailsFromStore?.length || 0) === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No emails found. Add some emails first.
                  </div>
                ) : (
                  emailsFromStore
                    .map(email => (
                      <div key={email.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={`email-${email.id}`}
                          checked={selectedEmailIds.includes(email.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmailIds([...selectedEmailIds, email.id]);
                            } else {
                              setSelectedEmailIds(selectedEmailIds.filter(id => id !== email.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`email-${email.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{email.email}</span>
                            <span className="text-xs text-gray-500">
                              {[email.first_name, email.last_name].filter(Boolean).join(' ').trim() || 'No name'}
                            </span>
                          </div>
                          {email.organization_name && (
                            <div className="text-xs text-gray-500">{email.organization_name}</div>
                          )}
                        </label>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Pagination and controls - outside scrollable area */}
            <div className="flex-shrink-0 space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  Showing {(emailsFromStore?.length || 0)} of {pagination?.count || 0}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={(pagination?.currentPage || 1) === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-xs">Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min((pagination?.totalPages || 1), p + 1))}
                    disabled={(pagination?.currentPage || 1) >= (pagination?.totalPages || 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{selectedEmailIds.length} selected</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="existing-check-duplicates"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="existing-check-duplicates" className="text-gray-600">
                    Skip duplicates
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isAddingExisting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddExistingSubmit}
                disabled={selectedEmailIds.length === 0 || isAddingExisting}
              >
                {isAddingExisting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : `Add ${selectedEmailIds.length} email${selectedEmailIds.length !== 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
