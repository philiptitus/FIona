"use client"
import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Edit, Upload, Copy, Download } from "lucide-react"
import { handleFetchEmails, handleCreateEmail, handleBulkCreateEmails, handleAddExistingEmails } from "@/store/actions/emailActions"
import { handleFetchCampaigns } from "@/store/actions/campaignActions"
import type { RootState, AppDispatch } from "@/store/store"

interface Email {
  id: number;
  email: string;
  organization_name?: string;
  first_name?: string;
  last_name?: string;
  campaign?: number;
  [key: string]: any;
}

interface AddEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCampaignId?: number | null
}

interface EmailForm {
  organization_name: string
  email: string
  context?: string
  [key: string]: any
}

export default function AddEmailDialog({ open, onOpenChange, initialCampaignId }: AddEmailDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { campaigns } = useSelector((state: RootState) => state.campaigns)
  const [form, setForm] = useState<EmailForm>({ organization_name: "", email: "", context: "" })
  const [createTab, setCreateTab] = useState("manual")
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkError, setBulkError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(initialCampaignId || null)
  const [manualLoading, setManualLoading] = useState(false)
  const [manualSuccess, setManualSuccess] = useState(false)
  const [manualError, setManualError] = useState("")
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkSuccess, setBulkSuccess] = useState(false)
  const [checkUserDuplicates, setCheckUserDuplicates] = useState(true)
  const [existingEmails, setExistingEmails] = useState<Email[]>([])
  const [selectedEmailIds, setSelectedEmailIds] = useState<number[]>([])
  const [existingLoading, setExistingLoading] = useState(false)
  const [existingSuccess, setExistingSuccess] = useState(false)
  const [existingError, setExistingError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const loadExistingEmails = useCallback(async () => {
    try {
      console.log('Starting to load existing emails...');
      setExistingLoading(true);
      setExistingError("");
      
      console.log('Dispatching handleFetchEmails...');
      const result = await dispatch(handleFetchEmails() as any);
      console.log('handleFetchEmails result:', result);
      
      if (!result) {
        console.error('No result returned from handleFetchEmails');
        setExistingError("No response from server. Please try again.");
        return;
      }
      
      // The response is already the array of emails
      const emails = Array.isArray(result) ? result : [];
      console.log('Parsed emails:', emails);
      
      // Filter out emails that already belong to the current campaign
      const filteredEmails = selectedCampaign 
        ? emails.filter((email: Email) => {
            console.log('Checking email:', email.id, 'campaign:', email.campaign, 'selectedCampaign:', selectedCampaign);
            return !email.campaign || email.campaign !== selectedCampaign;
          })
        : emails;
        
      console.log('Filtered emails:', filteredEmails);
      setExistingEmails(filteredEmails);
      
      if (filteredEmails.length === 0) {
        console.log('No emails found after filtering');
        setExistingError(emails.length > 0 
          ? "All emails are already in the selected campaign." 
          : "No existing emails found to add. Please add new emails first.");
      } else {
        console.log('Successfully loaded', filteredEmails.length, 'emails');
      }
    } catch (error) {
      console.error("Failed to load existing emails:", error)
      setExistingError("An error occurred while loading emails.")
    } finally {
      setExistingLoading(false)
    }
  }, [dispatch, selectedCampaign])

  useEffect(() => {
    if (open) {
      dispatch(handleFetchCampaigns())
      if (initialCampaignId) setSelectedCampaign(initialCampaignId)
      loadExistingEmails()
    }
  }, [open, initialCampaignId, dispatch, loadExistingEmails])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm({ ...form, [name]: checked })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setManualLoading(true)
    setManualError("")
    setManualSuccess(false)
    if (!selectedCampaign) { setManualLoading(false); return }
    try {
      const result = await dispatch(handleCreateEmail({ ...form, campaign: selectedCampaign, check_user_duplicates: checkUserDuplicates }) as any)
      if (!result || result.error) {
        setManualError(result?.error || "Failed to create email.")
        setManualLoading(false)
        return
      }
      setManualSuccess(true)
      setTimeout(() => setManualSuccess(false), 2000)
      onOpenChange(false)
      setForm({ organization_name: "", email: "", context: "" })
      dispatch(handleFetchEmails())
    } catch (err: any) {
      setManualError(err?.message || "Failed to create email.")
    } finally {
      setManualLoading(false)
    }
  }

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBulkFile(e.target.files[0])
    }
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBulkLoading(true)
    setBulkSuccess(false)
    setBulkError("")
    if (!bulkFile) {
      setBulkError("Please select a CSV or JSON file.")
      setBulkLoading(false)
      return
    }
    if (!selectedCampaign) {
      setBulkError("Please select a campaign.")
      setBulkLoading(false)
      return
    }
    const formData = new FormData()
    formData.append("csv_file", bulkFile)
    formData.append("campaign_id", String(selectedCampaign))
    formData.append("check_user_duplicates", String(checkUserDuplicates))
    const result = await dispatch(handleBulkCreateEmails(formData) as any)
    const backendError = result?.response?.error || result?.error
    if (!result || backendError) {
      setBulkError(backendError || "Failed to upload emails.")
      setBulkLoading(false)
    } else {
      setBulkSuccess(true)
      setTimeout(() => setBulkSuccess(false), 2000)
      onOpenChange(false)
      setBulkFile(null)
      dispatch(handleFetchEmails())
    }
    setBulkLoading(false)
  }

  const handleAddExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaign || selectedEmailIds.length === 0) {
      setExistingError("Please select a campaign and at least one email")
      return
    }

    setExistingLoading(true)
    setExistingError("")
    setExistingSuccess(false)

    try {
      const result = await dispatch(
        handleAddExistingEmails({
          campaignId: selectedCampaign,
          emailListIds: selectedEmailIds,
          skipDuplicates: checkUserDuplicates
        }) as any
      )

      if (result?.success) {
        setExistingSuccess(true)
        setSelectedEmailIds([])
        setTimeout(() => setExistingSuccess(false), 2000)
        onOpenChange(false)
        dispatch(handleFetchEmails())
      } else {
        setExistingError(result?.error || "Failed to add existing emails")
      }
    } catch (err: any) {
      setExistingError(err?.message || "Failed to add existing emails")
    } finally {
      setExistingLoading(false)
    }
  }

  const toggleEmailSelection = (emailId: number) => {
    setSelectedEmailIds(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Emails</DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">Choose how you want to add emails to your campaign. Each method is explained below.</p>
        </DialogHeader>
        <div className="mb-4">
          <label className="block font-medium mb-1">Select Campaign</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedCampaign || ""}
            onChange={e => setSelectedCampaign(Number(e.target.value))}
            disabled={!!initialCampaignId}
          >
            <option value="">Choose a campaign...</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">All emails you add will be attached to this campaign.</p>
        </div>
        <Tabs value={createTab} onValueChange={setCreateTab} className="w-full mt-2">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="existing"><Copy className="inline mr-1" /> Add Existing</TabsTrigger>
            <TabsTrigger value="manual"><Edit className="inline mr-1" /> Manual</TabsTrigger>
            <TabsTrigger value="bulk"><Upload className="inline mr-1" /> Bulk Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground mb-1">
                Add a single email entry manually. Use this for quick, one-off additions.<br />
                <b>Duplicate check:</b> By default, the system will prevent adding an email that already exists in any of your campaigns. You can disable this below.
              </p>
              {manualLoading && <Alert variant="info"><Loader2 className="animate-spin mr-2 inline" /> <AlertTitle>Adding email...</AlertTitle></Alert>}
              {manualSuccess && <Alert variant="success"><CheckCircle2 className="text-green-600 mr-2 inline" /> <AlertTitle>Email added!</AlertTitle></Alert>}
              {manualError && <Alert variant="destructive"><XCircle className="text-red-600 mr-2 inline" /> <AlertTitle>Error</AlertTitle><AlertDescription>{manualError}</AlertDescription></Alert>}
              <Input
                name="organization_name"
                placeholder="Organization Name"
                value={form.organization_name}
                onChange={handleChange}
                required
              />
              <Input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Input
                name="context"
                placeholder="Context (optional)"
                value={form.context}
                onChange={handleChange}
              />
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={checkUserDuplicates} onChange={e => setCheckUserDuplicates(e.target.checked)} />
                Check for duplicates across all my campaigns
              </label>
              <DialogFooter>
                <Button type="submit">Add Email</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="bulk">
            <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground mb-1">
                Upload a CSV or JSON file to add many emails at once. Useful for importing lists from spreadsheets or other tools.<br />
                <b>Required columns:</b> <code>organization_name</code> and <code>email</code>.<br />
                <b>Optional columns:</b> You can include any of the additional fields shown in the downloadable template.<br />
                <b>Duplicate check:</b> By default, the system will skip emails that already exist in any of your campaigns. You can disable this below.
              </p>
              {bulkLoading && <Alert variant="info"><Loader2 className="animate-spin mr-2 inline" /> <AlertTitle>Uploading...</AlertTitle></Alert>}
              {bulkSuccess && <Alert variant="success"><CheckCircle2 className="text-green-600 mr-2 inline" /> <AlertTitle>Bulk upload successful!</AlertTitle></Alert>}
              {bulkError && <Alert variant="destructive"><XCircle className="text-red-600 mr-2 inline" /> <AlertTitle>Error</AlertTitle><AlertDescription>{bulkError}</AlertDescription></Alert>}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={checkUserDuplicates} onChange={e => setCheckUserDuplicates(e.target.checked)} />
                  Check for duplicates across all my campaigns
                </label>
                <div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs mb-2"
                    onClick={() => {
                      // Create a sample CSV content with all fields from EmailList model
                      const csvContent = 'organization_name,email,first_name,last_name,title,company_name_for_emails,email_status,primary_email_source,email_confidence,primary_email_catch_all_status,primary_email_last_verified_at,seniority,departments,contact_owner,work_direct_phone,home_phone,mobile_phone,corporate_phone,other_phone,stage,lists,last_contacted,account_owner,num_employees,industry,keywords,person_linkedin_url,website,company_linkedin_url,facebook_url,twitter_url,city,state,country,company_address,company_city,company_state,company_country,company_phone,technologies,annual_revenue,total_funding,latest_funding,latest_funding_amount,last_raised_at,subsidiary_of,email_sent,email_open,email_bounced,replied,demoed,number_of_retail_locations,apollo_contact_id,apollo_account_id,secondary_email,secondary_email_source,tertiary_email,tertiary_email_source,context\n' +
                        'TechCorp,john.doe@techcorp.com,John,Doe,CTO,Tech Corporation,Verified,Clearbit,High,Valid,2025-01-15,Executive,Engineering,John Smith,+12025550123,,+12025550124,,,Prospect,Enterprise,2025-07-15,John Smith,500,Technology,AI,linkedin.com/in/johndoe,techcorp.com,linkedin.com/company/techcorp,facebook.com/techcorp,@techcorp,San Francisco,California,USA,123 Tech St,San Francisco,California,USA,+12025550000,AI,50000000,100000000,Series B,50000000,2024-06-01,,true,true,false,true,false,0,12345,54321,john@personal.com,Personal,john@old-email.com,Old Email,Marketing contact\n' +
                        'Acme Inc,sarah.williams@acme.com,Sarah,Williams,Marketing Director,Acme Inc,Unverified,Manual,Medium,Unknown,,Director,Marketing,John Smith,,+12025550125,+12025550126,,,,Lead,Marketing,2025-07-10,John Smith,200,Retail,Retail,linkedin.com/in/sarahwilliams,acme.com,linkedin.com/company/acme,facebook.com/acme,@acme,New York,New York,USA,456 Business Ave,New York,New York,USA,+12025550001,Retail,20000000,50000000,Series A,20000000,2024-03-15,,false,false,false,false,false,0,67890,09876,sarah@personal.com,Personal,,,Sales inquiry';
                      
                      // Create a Blob with the CSV content
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      
                      // Create a temporary anchor element and trigger download
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'email_import_template.csv';
                      document.body.appendChild(a);
                      a.click();
                      
                      // Clean up
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" /> Download CSV Template
                  </Button>
                  <Input type="file" accept=".csv,.json" onChange={handleBulkFileChange} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Upload</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="existing">
            <form onSubmit={handleAddExistingSubmit} className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground mb-1">
                Select existing emails to add to this campaign. Only emails you own will be shown.<br />
                <b>Duplicate check:</b> By default, the system will skip emails that already exist in the target campaign.
              </p>
              {existingLoading && !existingSuccess && (
                <Alert variant="info">
                  <Loader2 className="animate-spin mr-2 inline" />
                  <AlertTitle>Loading emails...</AlertTitle>
                </Alert>
              )}
              {existingSuccess && (
                <Alert variant="success">
                  <CheckCircle2 className="text-green-600 mr-2 inline" />
                  <AlertTitle>Emails added successfully!</AlertTitle>
                </Alert>
              )}
              {existingError && (
                <Alert variant="destructive">
                  <XCircle className="text-red-600 mr-2 inline" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{existingError}</AlertDescription>
                </Alert>
              )}
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              <div className="border rounded-md h-64 overflow-y-auto p-2 space-y-2">
                {existingEmails
                  .filter((email) => {
                    if (!email) return false;
                    const query = searchQuery.toLowerCase();
                    return (
                      (email.email?.toLowerCase() || '').includes(query) ||
                      (email.organization_name?.toLowerCase() || '').includes(query) ||
                      (email.first_name?.toLowerCase() || '').includes(query) ||
                      (email.last_name?.toLowerCase() || '').includes(query)
                    );
                  })
                  .map((email) => (
                    <div key={email.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={`email-${email.id}`}
                        checked={selectedEmailIds.includes(email.id)}
                        onChange={() => toggleEmailSelection(email.id)}
                        className="mr-2 h-4 w-4"
                      />
                      <label htmlFor={`email-${email.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{email.email}</div>
                        <div className="text-xs text-gray-500">
                          {[email.first_name, email.last_name].filter(Boolean).join(' ') || 'No name'}
                          {email.organization_name ? ` • ${email.organization_name}` : ''}
                        </div>
                      </label>
                    </div>
                  ))}
                {existingEmails.length === 0 && !existingLoading && (
                  <div className="text-center text-gray-500 py-8">
                    No emails found. Add some emails first.
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{selectedEmailIds.length} selected</span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checkUserDuplicates}
                    onChange={e => setCheckUserDuplicates(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Skip duplicates
                </label>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={selectedEmailIds.length === 0 || existingLoading}
                >
                  {existingLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    `Add ${selectedEmailIds.length} email${selectedEmailIds.length !== 1 ? 's' : ''}`
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}