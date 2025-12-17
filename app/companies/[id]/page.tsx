"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Building2, CheckCircle2, AlertCircle, Loader2, XCircle, Sparkles } from "lucide-react"
import type { RootState, AppDispatch } from "@/store/store"
import { handleFetchCompanyById, handleUpdateCompany, handleDeleteCompany } from "@/store/actions/companyActions"
import { handleStartResearch } from "@/store/actions/researchActions"
import { addProcessingResearch } from "@/store/slices/processingResearchesSlice"
import { useToast } from "@/components/ui/use-toast"
import ResearchConfirmationModal from "@/components/research/ResearchConfirmationModal"

export default function CompanyDetailPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const companyId = Number(params.id)

  const currentCompany = useSelector((state: RootState) => state.companies.currentCompany)
  const isLoading = useSelector((state: RootState) => state.companies.isLoading)
  const error = useSelector((state: RootState) => state.companies.error)

  const [isEditing, setIsEditing] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showResearchModal, setShowResearchModal] = useState(false)
  const [researchLoading, setResearchLoading] = useState(false)

  const [form, setForm] = useState<any>({
    company_name: "",
    company_name_for_emails: "",
    company_email: "",
    company_phone: "",
    company_street: "",
    company_city: "",
    company_state: "",
    company_country: "",
    company_postal_code: "",
    company_address: "",
    account_stage: "",
    industry: "",
    keywords: "",
    short_description: "",
    website: "",
    number_of_employees: undefined,
    annual_revenue: "",
    number_of_retail_locations: undefined,
    total_funding: "",
    latest_funding: "",
    latest_funding_amount: "",
    last_raised_at: "",
    founded_year: undefined,
    technologies: "",
    sic_codes: "",
    naics_codes: "",
    company_linkedin_url: "",
    facebook_url: "",
    twitter_url: "",
    logo_url: "",
    subsidiary_of: null,
    account_owner: "",
    apollo_account_id: "",
    email_sent: false,
    replied: false,
  })

  useEffect(() => {
    if (companyId) {
      dispatch(handleFetchCompanyById(companyId))
    }
  }, [dispatch, companyId])

  useEffect(() => {
    if (currentCompany) {
      setForm({
        company_name: currentCompany.company_name || "",
        company_name_for_emails: currentCompany.company_name_for_emails || "",
        company_email: currentCompany.company_email || "",
        company_phone: currentCompany.company_phone || "",
        company_street: currentCompany.company_street || "",
        company_city: currentCompany.company_city || "",
        company_state: currentCompany.company_state || "",
        company_country: currentCompany.company_country || "",
        company_postal_code: currentCompany.company_postal_code || "",
        company_address: currentCompany.company_address || "",
        account_stage: currentCompany.account_stage || "",
        industry: currentCompany.industry || "",
        keywords: currentCompany.keywords || "",
        short_description: currentCompany.short_description || "",
        website: currentCompany.website || "",
        number_of_employees: currentCompany.number_of_employees,
        annual_revenue: currentCompany.annual_revenue || "",
        number_of_retail_locations: currentCompany.number_of_retail_locations,
        total_funding: currentCompany.total_funding || "",
        latest_funding: currentCompany.latest_funding || "",
        latest_funding_amount: currentCompany.latest_funding_amount || "",
        last_raised_at: currentCompany.last_raised_at || "",
        founded_year: currentCompany.founded_year,
        technologies: currentCompany.technologies || "",
        sic_codes: currentCompany.sic_codes || "",
        naics_codes: currentCompany.naics_codes || "",
        company_linkedin_url: currentCompany.company_linkedin_url || "",
        facebook_url: currentCompany.facebook_url || "",
        twitter_url: currentCompany.twitter_url || "",
        logo_url: currentCompany.logo_url || "",
        subsidiary_of: currentCompany.subsidiary_of || null,
        account_owner: currentCompany.account_owner || "",
        apollo_account_id: currentCompany.apollo_account_id || "",
        email_sent: currentCompany.email_sent || false,
        replied: currentCompany.replied || false,
      })
    }
  }, [currentCompany])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm({ ...form, [name]: checked })
    } else if (type === 'number') {
      setForm({ ...form, [name]: value ? Number(value) : undefined })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateLoading(true)
    setUpdateError("")
    setUpdateSuccess(false)

    try {
      const result = await dispatch(handleUpdateCompany({ id: companyId, data: form }) as any)
      if (result) {
        setUpdateSuccess(true)
        setIsEditing(false)
        setTimeout(() => setUpdateSuccess(false), 2000)
        dispatch(handleFetchCompanyById(companyId))
      } else {
        setUpdateError("Failed to update company")
      }
    } catch (err: any) {
      setUpdateError(err?.message || "Failed to update company")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      setDeleteLoading(true)
      try {
        await dispatch(handleDeleteCompany(companyId))
        router.push("/companies")
      } catch (err: any) {
        alert("Failed to delete company: " + (err?.message || "Unknown error"))
      } finally {
        setDeleteLoading(false)
      }
    }
  }

  if (isLoading && !currentCompany) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    )
  }

  if (error && !currentCompany) {
    return (
      <MainLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </MainLayout>
    )
  }

  if (!currentCompany) {
    return (
      <MainLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Company not found</AlertTitle>
          <AlertDescription>The company you're looking for doesn't exist.</AlertDescription>
        </Alert>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/companies")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">{currentCompany.company_name}</h1>
              </div>
              <p className="text-muted-foreground">{currentCompany.company_email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setShowResearchModal(true)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Research & Email
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Use AI to research this company and generate a personalized email
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteLoading}>
                  {deleteLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {updateSuccess && (
          <Alert variant="success">
            <CheckCircle2 className="text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Company updated successfully!</AlertDescription>
          </Alert>
        )}

        {updateError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{updateError}</AlertDescription>
          </Alert>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {currentCompany.email_sent && <Badge className="bg-green-100 text-green-800">📧 Email Sent</Badge>}
          {currentCompany.replied && <Badge className="bg-purple-100 text-purple-800">💬 Replied</Badge>}
          {currentCompany.account_stage && <Badge variant="outline">{currentCompany.account_stage}</Badge>}
          {currentCompany.industry && <Badge variant="secondary">{currentCompany.industry}</Badge>}
          {currentCompany.campaign && (
            <Link href={`/campaigns/${currentCompany.campaign}`}>
              <Badge variant="default" className="cursor-pointer hover:opacity-80 transition-opacity">📋 Campaign {currentCompany.campaign}</Badge>
            </Link>
          )}
        </div>

        {/* Main Content */}
        {isEditing ? (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_name_for_emails">Company Name for Emails *</Label>
                    <Input
                      id="company_name_for_emails"
                      name="company_name_for_emails"
                      value={form.company_name_for_emails}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_email">Company Email *</Label>
                    <Input
                      id="company_email"
                      name="company_email"
                      type="email"
                      value={form.company_email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_phone">Company Phone</Label>
                    <Input
                      id="company_phone"
                      name="company_phone"
                      value={form.company_phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_owner">Account Owner</Label>
                    <Input
                      id="account_owner"
                      name="account_owner"
                      value={form.account_owner}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="short_description">Description</Label>
                  <Textarea
                    id="short_description"
                    name="short_description"
                    value={form.short_description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="company_address">Full Address</Label>
                    <Input
                      id="company_address"
                      name="company_address"
                      value={form.company_address}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_street">Street</Label>
                    <Input
                      id="company_street"
                      name="company_street"
                      value={form.company_street}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_city">City</Label>
                    <Input
                      id="company_city"
                      name="company_city"
                      value={form.company_city}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_state">State</Label>
                    <Input
                      id="company_state"
                      name="company_state"
                      value={form.company_state}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_country">Country</Label>
                    <Input
                      id="company_country"
                      name="company_country"
                      value={form.company_country}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_postal_code">Postal Code</Label>
                    <Input
                      id="company_postal_code"
                      name="company_postal_code"
                      value={form.company_postal_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="business" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_stage">Account Stage</Label>
                    <Input
                      id="account_stage"
                      name="account_stage"
                      value={form.account_stage}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="number_of_employees">Number of Employees</Label>
                    <Input
                      id="number_of_employees"
                      name="number_of_employees"
                      type="number"
                      value={form.number_of_employees || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annual_revenue">Annual Revenue</Label>
                    <Input
                      id="annual_revenue"
                      name="annual_revenue"
                      value={form.annual_revenue}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_funding">Total Funding</Label>
                    <Input
                      id="total_funding"
                      name="total_funding"
                      value={form.total_funding}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="latest_funding">Latest Funding Round</Label>
                    <Input
                      id="latest_funding"
                      name="latest_funding"
                      value={form.latest_funding}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="founded_year">Founded Year</Label>
                    <Input
                      id="founded_year"
                      name="founded_year"
                      type="number"
                      value={form.founded_year || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="technologies">Technologies</Label>
                    <Input
                      id="technologies"
                      name="technologies"
                      value={form.technologies}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      name="keywords"
                      value={form.keywords}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Status Flags</h4>
                  <div className="grid grid-cols-2 gap-4">
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
                        id="replied"
                        name="replied"
                        checked={form.replied}
                        onCheckedChange={(checked) => setForm({ ...form, replied: checked as boolean })}
                      />
                      <Label htmlFor="replied">Replied</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button type="submit" disabled={updateLoading}>
                {updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          // View Mode
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-mono">{currentCompany.company_email}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Phone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentCompany.company_phone || "N/A"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Industry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentCompany.industry || "N/A"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Account Stage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentCompany.account_stage || "N/A"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Website</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentCompany.website ? (
                      <a href={currentCompany.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {currentCompany.website}
                      </a>
                    ) : (
                      <p className="text-sm">N/A</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentCompany.number_of_employees ? currentCompany.number_of_employees.toLocaleString() : "N/A"}</p>
                  </CardContent>
                </Card>
              </div>

              {currentCompany.short_description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentCompany.short_description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCompany.company_address && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{currentCompany.company_address}</p>
                    </CardContent>
                  </Card>
                )}

                {currentCompany.company_city && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">City/State</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{currentCompany.company_city}, {currentCompany.company_state}</p>
                    </CardContent>
                  </Card>
                )}

                {currentCompany.company_country && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Country</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{currentCompany.company_country}</p>
                    </CardContent>
                  </Card>
                )}

                {currentCompany.annual_revenue && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Annual Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{currentCompany.annual_revenue}</p>
                    </CardContent>
                  </Card>
                )}

                {currentCompany.total_funding && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Total Funding</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{currentCompany.total_funding}</p>
                    </CardContent>
                  </Card>
                )}

                {currentCompany.latest_funding && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Latest Funding</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{currentCompany.latest_funding}</p>
                    </CardContent>
                  </Card>
                )}

                {currentCompany.technologies && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Technologies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{currentCompany.technologies}</p>
                    </CardContent>
                  </Card>
                )}

                {currentCompany.founded_year && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Founded</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{currentCompany.founded_year}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCompany.company_linkedin_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">LinkedIn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href={currentCompany.company_linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
                        View Profile
                      </a>
                    </CardContent>
                  </Card>
                )}

                {currentCompany.facebook_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Facebook</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href={currentCompany.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
                        View Page
                      </a>
                    </CardContent>
                  </Card>
                )}

                {currentCompany.twitter_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Twitter</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href={currentCompany.twitter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
                        View Account
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <ResearchConfirmationModal
          open={showResearchModal}
          onOpenChange={setShowResearchModal}
          contactName={currentCompany.company_name}
          contactType="company"
          isLoading={researchLoading}
          onConfirm={async (createCampaign) => {
            setResearchLoading(true)
            try {
              const result = await dispatch(
                handleStartResearch({
                  contact_id: companyId,
                  contact_type: "company",
                  create_campaign: createCampaign,
                })
              )
              
              // Check if this is an async response (202 Accepted)
              if (result?.payload?.status === "processing" && result?.payload?.token && result?.payload?.research_id) {
                const researchId = result.payload.research_id
                const token = result.payload.token
                
                // Add to processing researches tracker
                dispatch(addProcessingResearch({
                  researchId,
                  contactId: companyId,
                  contactType: "company",
                  contactName: currentCompany.company_name,
                  token,
                  status: "processing",
                  startedAt: Date.now(),
                  lastPolled: Date.now(),
                  retryCount: 0,
                }))
                
                setShowResearchModal(false)
                toast({
                  title: "✨ Research Started!",
                  description: `AI is researching ${currentCompany.company_name}. You'll be notified when ready.`,
                })
                router.push("/dashboard")
              } else if (result.success) {
                // Synchronous response (legacy)
                setShowResearchModal(false)
                toast({
                  title: "✨ Research Complete!",
                  description: `AI research generated for ${currentCompany.company_name}.`,
                })
                router.push("/research")
              } else {
                toast({
                  title: "Error",
                  description: result.error || "Failed to start research",
                  variant: "destructive",
                })
              }
            } catch (error: any) {
              toast({
                title: "Error",
                description: error.message || "Failed to start research",
                variant: "destructive",
              })
            } finally {
              setResearchLoading(false)
            }
          }}
        />
      </div>
    </MainLayout>
  )
}

