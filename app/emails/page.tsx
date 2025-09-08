"use client"

import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, MoreHorizontal, Plus, Search, Copy, Eye, Upload, Sparkles, FileText, Loader2, CheckCircle2, XCircle, Reply } from "lucide-react"
import type { RootState, AppDispatch } from "@/store/store"
import { handleFetchEmails, handleCreateEmail, handleUpdateEmail, handleDeleteEmail, handleBulkCreateEmails, handleSmartCreateEmails } from "@/store/actions/emailActions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { handleFetchCampaigns } from "@/store/actions/campaignActions"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import dynamic from 'next/dynamic';

// Dynamically import the ContactListManager component with no SSR
const ContactListManager = dynamic(
  () => import('@/components/contact-lists/ContactListManager'),
  { ssr: false }
);

interface EmailForm {
  organization_name: string
  email: string
  context?: string
  first_name?: string
  last_name?: string
  title?: string
  company_name_for_emails?: string
  email_status?: string
  primary_email_source?: string
  email_confidence?: string
  primary_email_catch_all_status?: string
  seniority?: string
  departments?: string
  contact_owner?: string
  work_direct_phone?: string
  home_phone?: string
  mobile_phone?: string
  corporate_phone?: string
  other_phone?: string
  stage?: string
  lists?: string
  account_owner?: string
  num_employees?: number
  industry?: string
  keywords?: string
  person_linkedin_url?: string
  website?: string
  company_linkedin_url?: string
  facebook_url?: string
  twitter_url?: string
  city?: string
  state?: string
  country?: string
  company_address?: string
  company_city?: string
  company_state?: string
  company_country?: string
  company_phone?: string
  technologies?: string
  annual_revenue?: number
  total_funding?: number
  latest_funding?: string
  latest_funding_amount?: number
  subsidiary_of?: string
  email_sent?: boolean
  email_open?: boolean
  email_bounced?: boolean
  replied?: boolean
  demoed?: boolean
  number_of_retail_locations?: number
  apollo_contact_id?: string
  apollo_account_id?: string
  secondary_email?: string
  secondary_email_source?: string
  tertiary_email?: string
  tertiary_email_source?: string
}

export default function EmailsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  // Use separate selectors for better performance and to ensure re-renders
  const emails = useSelector((state: RootState) => state.emails.emails)
  const isLoading = useSelector((state: RootState) => state.emails.isLoading)
  const error = useSelector((state: RootState) => state.emails.error)
  const pagination = useSelector((state: RootState) => state.emails.pagination)
  const { campaigns } = useSelector((state: RootState) => state.campaigns)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [form, setForm] = useState<EmailForm>({ 
    organization_name: "", 
    email: "", 
    context: "",
    first_name: "",
    last_name: "",
    title: "",
    company_name_for_emails: "",
    email_status: "",
    primary_email_source: "",
    email_confidence: "",
    primary_email_catch_all_status: "",
    seniority: "",
    departments: "",
    contact_owner: "",
    work_direct_phone: "",
    home_phone: "",
    mobile_phone: "",
    corporate_phone: "",
    other_phone: "",
    stage: "",
    lists: "",
    account_owner: "",
    num_employees: undefined,
    industry: "",
    keywords: "",
    person_linkedin_url: "",
    website: "",
    company_linkedin_url: "",
    facebook_url: "",
    twitter_url: "",
    city: "",
    state: "",
    country: "",
    company_address: "",
    company_city: "",
    company_state: "",
    company_country: "",
    company_phone: "",
    technologies: "",
    annual_revenue: undefined,
    total_funding: undefined,
    latest_funding: "",
    latest_funding_amount: undefined,
    subsidiary_of: "",
    email_sent: false,
    email_open: false,
    email_bounced: false,
    replied: false,
    demoed: false,
    number_of_retail_locations: undefined,
    apollo_contact_id: "",
    apollo_account_id: "",
    secondary_email: "",
    secondary_email_source: "",
    tertiary_email: "",
    tertiary_email_source: ""
  })
  const [editId, setEditId] = useState<number | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editError, setEditError] = useState("")
  const [filtered, setFiltered] = useState(emails)
  const [createTab, setCreateTab] = useState("manual")
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkError, setBulkError] = useState("")
  const [smartData, setSmartData] = useState({ campaign_type: "", model: "gpt-4" })
  const [smartError, setSmartError] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)
  const [manualLoading, setManualLoading] = useState(false)
  const [manualSuccess, setManualSuccess] = useState(false)
  const [manualError, setManualError] = useState("")
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkSuccess, setBulkSuccess] = useState(false)
  const [smartLoading, setSmartLoading] = useState(false)
  const [smartSuccess, setSmartSuccess] = useState(false)
  const [checkUserDuplicates, setCheckUserDuplicates] = useState(true)

  // Fetch campaigns on component mount if not already loaded
  useEffect(() => {
    if (!campaigns || campaigns.length === 0) {
      dispatch(handleFetchCampaigns());
    }
  }, [dispatch, campaigns]);

  // Fetch emails when component mounts or page changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(handleFetchEmails({ page: currentPage }));
      } catch (error) {
      }
    };
    
    fetchData();
  }, [dispatch, currentPage]);

  // Debounced search function
  useEffect(() => {
    const searchEmails = async () => {
      if (!searchQuery.trim()) {
        // If search is empty, reset to show all emails
        dispatch(handleFetchEmails({ page: 1 }))
        return
      }

      setIsSearching(true)
      try {
        // Use the search parameter in the API call
        await dispatch(handleFetchEmails({ 
          search: searchQuery,
          page: 1 // Reset to first page when searching
        }))
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const timerId = setTimeout(searchEmails, 500) // 500ms debounce
    return () => clearTimeout(timerId)
  }, [searchQuery, dispatch])

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
    if (editId) {
        await dispatch(handleUpdateEmail({ id: editId, emailData: { ...form, campaign: selectedCampaign } }))
    } else {
        const result = await dispatch(handleCreateEmail({ ...form, campaign: selectedCampaign, check_user_duplicates: checkUserDuplicates }) as any)
        if (!result || result.error) {
          setManualError(result?.error || "Failed to create email.")
          setManualLoading(false)
          return
        }
      }
      setManualSuccess(true)
      setTimeout(() => setManualSuccess(false), 2000)
    setShowForm(false)
    setEditId(null)
    setForm({ organization_name: "", email: "", context: "" })
    dispatch(handleFetchEmails())
    } catch (err: any) {
      setManualError(err?.message || "Failed to create email.")
    } finally {
      setManualLoading(false)
    }
  }

  const handleEdit = (email: any) => {
    setEditId(email.id)
    setForm({
      organization_name: email.organization_name || "",
      email: email.email || "",
      context: email.context || "",
      first_name: email.first_name || "",
      last_name: email.last_name || "",
      title: email.title || "",
      company_name_for_emails: email.company_name_for_emails || "",
      email_status: email.email_status || "",
      primary_email_source: email.primary_email_source || "",
      email_confidence: email.email_confidence || "",
      primary_email_catch_all_status: email.primary_email_catch_all_status || "",
      seniority: email.seniority || "",
      departments: email.departments || "",
      contact_owner: email.contact_owner || "",
      work_direct_phone: email.work_direct_phone || "",
      home_phone: email.home_phone || "",
      mobile_phone: email.mobile_phone || "",
      corporate_phone: email.corporate_phone || "",
      other_phone: email.other_phone || "",
      stage: email.stage || "",
      lists: email.lists || "",
      account_owner: email.account_owner || "",
      num_employees: email.num_employees,
      industry: email.industry || "",
      keywords: email.keywords || "",
      person_linkedin_url: email.person_linkedin_url || "",
      website: email.website || "",
      company_linkedin_url: email.company_linkedin_url || "",
      facebook_url: email.facebook_url || "",
      twitter_url: email.twitter_url || "",
      city: email.city || "",
      state: email.state || "",
      country: email.country || "",
      company_address: email.company_address || "",
      company_city: email.company_city || "",
      company_state: email.company_state || "",
      company_country: email.company_country || "",
      company_phone: email.company_phone || "",
      technologies: email.technologies || "",
      annual_revenue: email.annual_revenue,
      total_funding: email.total_funding,
      latest_funding: email.latest_funding || "",
      latest_funding_amount: email.latest_funding_amount,
      subsidiary_of: email.subsidiary_of || "",
      email_sent: email.email_sent || false,
      email_open: email.email_open || false,
      email_bounced: email.email_bounced || false,
      replied: email.replied || false,
      demoed: email.demoed || false,
      number_of_retail_locations: email.number_of_retail_locations,
      apollo_contact_id: email.apollo_contact_id || "",
      apollo_account_id: email.apollo_account_id || "",
      secondary_email: email.secondary_email || "",
      secondary_email_source: email.secondary_email_source || "",
      tertiary_email: email.tertiary_email || "",
      tertiary_email_source: email.tertiary_email_source || ""
    })
    setShowEditDialog(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError("")
    setEditSuccess(false)
    
    if (!editId) {
      setEditError("No email selected for editing")
      setEditLoading(false)
      return
    }

    try {
      const result = await dispatch(handleUpdateEmail({ id: editId, emailData: form }) as any)
      if (result) {
        setEditSuccess(true)
        setTimeout(() => {
          setEditSuccess(false)
          setShowEditDialog(false)
          setEditId(null)
          setForm({ organization_name: "", email: "", context: "" })
          dispatch(handleFetchEmails())
        }, 2000)
      } else {
        setEditError("Failed to update email")
      }
    } catch (err: any) {
      setEditError(err?.message || "Failed to update email")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    await dispatch(handleDeleteEmail(id))
    dispatch(handleFetchEmails())
  }

  const handleView = (emailId: number) => {
    router.push(`/emails/${emailId}`)
  }

  // Pagination state
  const itemsPerPage = 10; // Fixed page size
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.count || 0;
  
  // Use unique emails (by primary email) for display on this page only
  const displayedEmails = useMemo(() => {
    const seen = new Set<string>()
    return (emails || []).filter((e: any) => {
      const key = (e?.email || "").toLowerCase()
      if (!key) return true
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [emails])
  

  useEffect(() => { setCurrentPage(1) }, [filtered])

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
      setShowCreateDialog(false)
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
      setShowCreateDialog(false)
      setSmartData({ campaign_type: "", model: "gpt-4" })
      dispatch(handleFetchEmails())
    }
    setSmartLoading(false)
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground">Manage your campaign emails. Add emails manually, upload in bulk, or use AI to generate a list!</p>
          </div>
          <Button onClick={() => { setShowCreateDialog(true); setEditId(null); setForm({ organization_name: "", email: "", context: "" }) }}>
            <Plus className="mr-2 h-4 w-4" /> New Email(s)
          </Button>
        </div>


        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
                    Add a single email entry manually. Use this for quick, one-off additions.<br/>
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
                    <span className="block mb-2 bg-blue-50 border border-blue-200 rounded p-2 text-blue-900">
                      <b>Tip:</b> You can directly fetch your data from <a href="https://apollo.io/" target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-900">Apollo.io</a> and upload it here!<br/>
                      Export your Apollo contacts as a CSV and use our template for a seamless import.
                    </span>
                    Upload a CSV or JSON file to add many emails at once. Useful for importing lists from spreadsheets or other tools.<br/>
                    <b>Required columns:</b> <code>organization_name</code> and <code>email</code>.<br/>
                    <b>Optional columns:</b> You can include any of the additional fields shown in the downloadable template.<br/>
                    <b>Duplicate check:</b> By default, the system will skip emails that already exist in any of your campaigns. You can disable this below.<br/>
                    You can <Button type="button" variant="link" className="p-0 h-auto align-baseline" onClick={() => {
                      const csv = `First Name,Last Name,Title,organization_name,Company Name for Emails,email,Email Status,Primary Email Source,Email Confidence,Primary Email Catch-all Status,Primary Email Last Verified At,Seniority,Departments,Contact Owner,Work Direct Phone,Home Phone,Mobile Phone,Corporate Phone,Other Phone,Stage,Lists,Last Contacted,Account Owner,# Employees,Industry,Keywords,Person Linkedin Url,Website,Company Linkedin Url,Facebook Url,Twitter Url,City,State,Country,Company Address,Company City,Company State,Company Country,Company Phone,context,Technologies,Annual Revenue,Total Funding,Latest Funding,Latest Funding Amount,Last Raised At,Subsidiary of,Email Sent,Email Open,Email Bounced,Replied,Demoed,Number of Retail Locations,Apollo Contact Id,Apollo Account Id,Secondary Email,Secondary Email Source,Tertiary Email,Tertiary Email Source\n` +
                        `John,Doe,Manager,Acme Corp,Acme Corp,info@acme.com,Active,Import,High,No,2024-01-01,Senior,Sales,Jane Smith,123-456-7890,234-567-8901,345-678-9012,456-789-0123,567-890-1234,Prospect,Newsletter,2024-02-01,Jane Smith,100,Technology,AI,https://linkedin.com/in/johndoe,https://acme.com,https://linkedin.com/company/acme,https://facebook.com/acme,https://twitter.com/acme,New York,NY,USA,123 Acme St,New York,NY,USA,123-456-7890,Cloud,1000000,5000000,Series A,2000000,2023-12-01,Acme Holdings,TRUE,FALSE,FALSE,FALSE,FALSE,10,12345,67890,john.alt@acme.com,Referral,john.third@acme.com,Event\n`;
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'email_upload_template.csv';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}>download a CSV template here</Button>
                    to see all available fields.
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
                  {/* Optionally allow model selection */}
                  {/* <Input name="model" value={smartData.model} onChange={handleSmartChange} /> */}
                  <DialogFooter>
                    <Button type="submit">Generate with AI</Button>
                  </DialogFooter>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Emails</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${isSearching ? 'text-primary' : 'text-muted-foreground'}`} />
              {isSearching && (
                <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Input
                type="search"
                placeholder="Search by name, email, or company..."
                className={`pl-8 pr-8 w-[200px] md:w-[300px] ${isSearching ? 'pr-8' : ''}`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
                    </div>
          <TabsContent value="all" className="space-y-4">
            <div className="flex flex-wrap gap-6 justify-center">
              {displayedEmails.map((email) => (
                <Card key={email.id} className="w-full sm:w-[350px] md:w-[320px] lg:w-[300px] rounded-xl border bg-card shadow-lg hover:shadow-2xl transition-shadow duration-200 relative group">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="truncate max-w-[180px] text-lg font-semibold" title={email.organization_name}>{email.organization_name}</CardTitle>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]" title={email.email}>{email.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center">
                      {email.email_sent && <TooltipProvider><Tooltip><TooltipTrigger><CheckCircle2 className="text-green-600 h-5 w-5" /></TooltipTrigger><TooltipContent>Email Sent</TooltipContent></Tooltip></TooltipProvider>}
                      {email.email_open && <TooltipProvider><Tooltip><TooltipTrigger><Eye className="text-blue-600 h-5 w-5" /></TooltipTrigger><TooltipContent>Email Opened</TooltipContent></Tooltip></TooltipProvider>}
                      {email.email_bounced && <TooltipProvider><Tooltip><TooltipTrigger><XCircle className="text-red-600 h-5 w-5" /></TooltipTrigger><TooltipContent>Bounced</TooltipContent></Tooltip></TooltipProvider>}
                      {email.replied && <TooltipProvider><Tooltip><TooltipTrigger><Reply className="text-purple-600 h-5 w-5" /></TooltipTrigger><TooltipContent>Replied</TooltipContent></Tooltip></TooltipProvider>}
                      {email.demoed && <TooltipProvider><Tooltip><TooltipTrigger><Sparkles className="text-yellow-500 h-5 w-5" /></TooltipTrigger><TooltipContent>Demoed</TooltipContent></Tooltip></TooltipProvider>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 pt-0">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {email.city && <Badge variant="secondary">{email.city}</Badge>}
                      {email.country && <Badge variant="secondary">{email.country}</Badge>}
                      {email.stage && <Badge variant="outline">{email.stage}</Badge>}
                      {email.seniority && <Badge variant="outline">{email.seniority}</Badge>}
                      {email.industry && <Badge variant="outline">{email.industry}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate" title={email.context}>{email.context || "No context"}</div>
                    <div className="flex gap-2 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => handleView(email.id)}><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>View</TooltipContent></Tooltip></TooltipProvider>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => handleEdit(email)}><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip></TooltipProvider>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => handleDelete(email.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip></TooltipProvider>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}><Copy className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Duplicate</TooltipContent></Tooltip></TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              ))}
                      {/* Contact Lists Section */}
        <div className="mt-8">
          <ContactListManager />
        </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedEmails.length} of {pagination?.count || emails.length} emails
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                <span className="text-xs">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Contact</DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">Update contact information and details.</p>
            </DialogHeader>
            
            {editLoading && (
              <Alert variant="info" className="mb-4">
                <Loader2 className="animate-spin mr-2 inline" />
                <AlertTitle>Updating contact...</AlertTitle>
              </Alert>
            )}
            
            {editSuccess && (
              <Alert variant="success" className="mb-4">
                <CheckCircle2 className="text-green-600 mr-2 inline" />
                <AlertTitle>Contact updated successfully!</AlertTitle>
              </Alert>
            )}
            
            {editError && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="text-red-600 mr-2 inline" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-5 mb-6">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="company">Company</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Last Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Job Title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="seniority">Seniority</Label>
                      <Input
                        id="seniority"
                        name="seniority"
                        value={form.seniority}
                        onChange={handleChange}
                        placeholder="Seniority Level"
                      />
                    </div>
                    <div>
                      <Label htmlFor="departments">Departments</Label>
                      <Input
                        id="departments"
                        name="departments"
                        value={form.departments}
                        onChange={handleChange}
                        placeholder="Departments"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stage">Stage</Label>
                      <Input
                        id="stage"
                        name="stage"
                        value={form.stage}
                        onChange={handleChange}
                        placeholder="Stage"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Primary Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Primary Email"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondary_email">Secondary Email</Label>
                      <Input
                        id="secondary_email"
                        name="secondary_email"
                        value={form.secondary_email}
                        onChange={handleChange}
                        placeholder="Secondary Email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tertiary_email">Tertiary Email</Label>
                      <Input
                        id="tertiary_email"
                        name="tertiary_email"
                        value={form.tertiary_email}
                        onChange={handleChange}
                        placeholder="Tertiary Email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="work_direct_phone">Work Phone</Label>
                      <Input
                        id="work_direct_phone"
                        name="work_direct_phone"
                        value={form.work_direct_phone}
                        onChange={handleChange}
                        placeholder="Work Phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile_phone">Mobile Phone</Label>
                      <Input
                        id="mobile_phone"
                        name="mobile_phone"
                        value={form.mobile_phone}
                        onChange={handleChange}
                        placeholder="Mobile Phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="home_phone">Home Phone</Label>
                      <Input
                        id="home_phone"
                        name="home_phone"
                        value={form.home_phone}
                        onChange={handleChange}
                        placeholder="Home Phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="corporate_phone">Corporate Phone</Label>
                      <Input
                        id="corporate_phone"
                        name="corporate_phone"
                        value={form.corporate_phone}
                        onChange={handleChange}
                        placeholder="Corporate Phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="other_phone">Other Phone</Label>
                      <Input
                        id="other_phone"
                        name="other_phone"
                        value={form.other_phone}
                        onChange={handleChange}
                        placeholder="Other Phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="person_linkedin_url">LinkedIn URL</Label>
                      <Input
                        id="person_linkedin_url"
                        name="person_linkedin_url"
                        value={form.person_linkedin_url}
                        onChange={handleChange}
                        placeholder="LinkedIn Profile URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook_url">Facebook URL</Label>
                      <Input
                        id="facebook_url"
                        name="facebook_url"
                        value={form.facebook_url}
                        onChange={handleChange}
                        placeholder="Facebook Profile URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter_url">Twitter URL</Label>
                      <Input
                        id="twitter_url"
                        name="twitter_url"
                        value={form.twitter_url}
                        onChange={handleChange}
                        placeholder="Twitter Profile URL"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="company" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organization_name">Organization Name *</Label>
                      <Input
                        id="organization_name"
                        name="organization_name"
                        value={form.organization_name}
                        onChange={handleChange}
                        placeholder="Organization Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_name_for_emails">Company Name for Emails</Label>
                      <Input
                        id="company_name_for_emails"
                        name="company_name_for_emails"
                        value={form.company_name_for_emails}
                        onChange={handleChange}
                        placeholder="Company Name for Emails"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_address">Company Address</Label>
                      <Input
                        id="company_address"
                        name="company_address"
                        value={form.company_address}
                        onChange={handleChange}
                        placeholder="Company Address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_city">Company City</Label>
                      <Input
                        id="company_city"
                        name="company_city"
                        value={form.company_city}
                        onChange={handleChange}
                        placeholder="Company City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_state">Company State</Label>
                      <Input
                        id="company_state"
                        name="company_state"
                        value={form.company_state}
                        onChange={handleChange}
                        placeholder="Company State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_country">Company Country</Label>
                      <Input
                        id="company_country"
                        name="company_country"
                        value={form.company_country}
                        onChange={handleChange}
                        placeholder="Company Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_phone">Company Phone</Label>
                      <Input
                        id="company_phone"
                        name="company_phone"
                        value={form.company_phone}
                        onChange={handleChange}
                        placeholder="Company Phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="Company Website"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_linkedin_url">Company LinkedIn</Label>
                      <Input
                        id="company_linkedin_url"
                        name="company_linkedin_url"
                        value={form.company_linkedin_url}
                        onChange={handleChange}
                        placeholder="Company LinkedIn URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={form.industry}
                        onChange={handleChange}
                        placeholder="Industry"
                      />
                    </div>
                    <div>
                      <Label htmlFor="num_employees">Number of Employees</Label>
                      <Input
                        id="num_employees"
                        name="num_employees"
                        type="number"
                        value={form.num_employees || ""}
                        onChange={handleChange}
                        placeholder="Number of Employees"
                      />
                    </div>
                    <div>
                      <Label htmlFor="annual_revenue">Annual Revenue</Label>
                      <Input
                        id="annual_revenue"
                        name="annual_revenue"
                        type="number"
                        value={form.annual_revenue || ""}
                        onChange={handleChange}
                        placeholder="Annual Revenue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="total_funding">Total Funding</Label>
                      <Input
                        id="total_funding"
                        name="total_funding"
                        type="number"
                        value={form.total_funding || ""}
                        onChange={handleChange}
                        placeholder="Total Funding"
                      />
                    </div>
                    <div>
                      <Label htmlFor="latest_funding">Latest Funding</Label>
                      <Input
                        id="latest_funding"
                        name="latest_funding"
                        value={form.latest_funding}
                        onChange={handleChange}
                        placeholder="Latest Funding Round"
                      />
                    </div>
                    <div>
                      <Label htmlFor="latest_funding_amount">Latest Funding Amount</Label>
                      <Input
                        id="latest_funding_amount"
                        name="latest_funding_amount"
                        type="number"
                        value={form.latest_funding_amount || ""}
                        onChange={handleChange}
                        placeholder="Latest Funding Amount"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="status" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email_status">Email Status</Label>
                      <Input
                        id="email_status"
                        name="email_status"
                        value={form.email_status}
                        onChange={handleChange}
                        placeholder="Email Status"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primary_email_source">Primary Email Source</Label>
                      <Input
                        id="primary_email_source"
                        name="primary_email_source"
                        value={form.primary_email_source}
                        onChange={handleChange}
                        placeholder="Primary Email Source"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email_confidence">Email Confidence</Label>
                      <Input
                        id="email_confidence"
                        name="email_confidence"
                        value={form.email_confidence}
                        onChange={handleChange}
                        placeholder="Email Confidence"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primary_email_catch_all_status">Catch-all Status</Label>
                      <Input
                        id="primary_email_catch_all_status"
                        name="primary_email_catch_all_status"
                        value={form.primary_email_catch_all_status}
                        onChange={handleChange}
                        placeholder="Catch-all Status"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Status Flags</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email_sent"
                          name="email_sent"
                          checked={form.email_sent}
                          onCheckedChange={(checked) => setForm({ ...form, email_sent: checked as boolean })}
                        />
                        <Label htmlFor="email_sent">Email Sent</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email_open"
                          name="email_open"
                          checked={form.email_open}
                          onCheckedChange={(checked) => setForm({ ...form, email_open: checked as boolean })}
                        />
                        <Label htmlFor="email_open">Email Open</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email_bounced"
                          name="email_bounced"
                          checked={form.email_bounced}
                          onCheckedChange={(checked) => setForm({ ...form, email_bounced: checked as boolean })}
                        />
                        <Label htmlFor="email_bounced">Email Bounced</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="replied"
                          name="replied"
                          checked={form.replied}
                          onCheckedChange={(checked) => setForm({ ...form, replied: checked as boolean })}
                        />
                        <Label htmlFor="replied">Replied</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="demoed"
                          name="demoed"
                          checked={form.demoed}
                          onCheckedChange={(checked) => setForm({ ...form, demoed: checked as boolean })}
                        />
                        <Label htmlFor="demoed">Demoed</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="other" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        placeholder="Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="keywords">Keywords</Label>
                      <Input
                        id="keywords"
                        name="keywords"
                        value={form.keywords}
                        onChange={handleChange}
                        placeholder="Keywords"
                      />
                    </div>
                    <div>
                      <Label htmlFor="technologies">Technologies</Label>
                      <Input
                        id="technologies"
                        name="technologies"
                        value={form.technologies}
                        onChange={handleChange}
                        placeholder="Technologies"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="context">Context</Label>
                      <Textarea
                        id="context"
                        name="context"
                        value={form.context}
                        onChange={handleChange}
                        placeholder="Additional context or notes"
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Contact"
                  )}
                </Button>
              </DialogFooter>
              
            </form>
            
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
