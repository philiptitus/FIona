"use client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Edit, Upload, Sparkles } from "lucide-react"
import { handleFetchEmails, handleCreateEmail, handleBulkCreateEmails, handleSmartCreateEmails } from "@/store/actions/emailActions"
import { handleFetchCampaigns } from "@/store/actions/campaignActions"
import type { RootState, AppDispatch } from "@/store/store"

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
  const [smartData, setSmartData] = useState({ campaign_type: "", model: "gpt-4" })
  const [smartError, setSmartError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(initialCampaignId || null)
  const [manualLoading, setManualLoading] = useState(false)
  const [manualSuccess, setManualSuccess] = useState(false)
  const [manualError, setManualError] = useState("")
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkSuccess, setBulkSuccess] = useState(false)
  const [smartLoading, setSmartLoading] = useState(false)
  const [smartSuccess, setSmartSuccess] = useState(false)
  const [checkUserDuplicates, setCheckUserDuplicates] = useState(true)

  useEffect(() => {
    if (open) {
      dispatch(handleFetchCampaigns())
      if (initialCampaignId) setSelectedCampaign(initialCampaignId)
    }
  }, [open, initialCampaignId, dispatch])

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

  const handleSmartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSmartData({ ...smartData, [e.target.name]: e.target.value })
  }

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSmartLoading(true)
    setSmartSuccess(false)
    setSmartError("")
    if (!smartData.campaign_type) {
      setSmartError("Please describe your campaign type.")
      setSmartLoading(false)
      return
    }
    if (!selectedCampaign) {
      setSmartError("Please select a campaign.")
      setSmartLoading(false)
      return
    }
    const result = await dispatch(handleSmartCreateEmails({ ...smartData, campaign_id: selectedCampaign }) as any)
    if (!result || result.error) {
      setSmartError(result?.error || "Failed to generate emails.")
      setSmartLoading(false)
    } else {
      setSmartSuccess(true)
      setTimeout(() => setSmartSuccess(false), 2000)
      onOpenChange(false)
      setSmartData({ campaign_type: "", model: "gpt-4" })
      dispatch(handleFetchEmails())
    }
    setSmartLoading(false)
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
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="manual"><Edit className="inline mr-1" /> Manual</TabsTrigger>
            <TabsTrigger value="bulk"><Upload className="inline mr-1" /> Bulk Upload</TabsTrigger>
            <TabsTrigger value="smart"><Sparkles className="inline mr-1" /> AI Smart</TabsTrigger>
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
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={checkUserDuplicates} onChange={e => setCheckUserDuplicates(e.target.checked)} />
                Check for duplicates across all my campaigns
              </label>
              <Input type="file" accept=".csv,.json" onChange={handleBulkFileChange} />
              <DialogFooter>
                <Button type="submit">Upload</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="smart">
            <form onSubmit={handleSmartSubmit} className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground mb-1">Let AI generate a targeted email list for your campaign. Describe your campaign and get a ready-to-use list!</p>
              {smartLoading && <Alert variant="info"><Loader2 className="animate-spin mr-2 inline" /> <AlertTitle>Generating with AI...</AlertTitle></Alert>}
              {smartSuccess && <Alert variant="success"><CheckCircle2 className="text-green-600 mr-2 inline" /> <AlertTitle>AI-generated emails added!</AlertTitle></Alert>}
              {smartError && <Alert variant="destructive"><XCircle className="text-red-600 mr-2 inline" /> <AlertTitle>Error</AlertTitle><AlertDescription>{smartError}</AlertDescription></Alert>}
              <Input
                name="campaign_type"
                placeholder="Describe your campaign (e.g. Outreach to tech startups in Kenya)"
                value={smartData.campaign_type}
                onChange={handleSmartChange}
                required
              />
              <DialogFooter>
                <Button type="submit">Generate with AI</Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 