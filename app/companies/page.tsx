"use client"

import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, Plus, Search, Eye, Loader2, CheckCircle2, XCircle, Building2, Sparkles } from "lucide-react"
import type { RootState, AppDispatch } from "@/store/store"
import { handleFetchCompanies, handleCreateCompany, handleUpdateCompany, handleDeleteCompany } from "@/store/actions/companyActions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { handleFetchCampaigns } from "@/store/actions/campaignActions"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useBulkResearch } from "@/components/research/useBulkResearch"
import { BulkResearchFloatingBar } from "@/components/research/BulkResearchFloatingBar"
import { BulkResearchConfirmationModal } from "@/components/research/BulkResearchConfirmationModal"

interface CompanyForm {
  campaign: number
  company_name: string
  company_name_for_emails: string
  company_email: string
  company_phone?: string
  company_street?: string
  company_city?: string
  company_state?: string
  company_country?: string
  company_postal_code?: string
  company_address?: string
  account_stage?: string
  industry?: string
  keywords?: string
  short_description?: string
  website?: string
  number_of_employees?: number
  annual_revenue?: string
  number_of_retail_locations?: number
  total_funding?: string
  latest_funding?: string
  latest_funding_amount?: string
  last_raised_at?: string
  founded_year?: number
  technologies?: string
  sic_codes?: string
  naics_codes?: string
  company_linkedin_url?: string
  facebook_url?: string
  twitter_url?: string
  logo_url?: string
  subsidiary_of?: string | null
  account_owner?: string
  apollo_account_id?: string
  email_sent: boolean
  replied: boolean
}

export default function CompaniesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  
  // Bulk research hook
  const bulkResearch = useBulkResearch("company")
  
  const companies = useSelector((state: RootState) => state.companies.companies)
  const isLoading = useSelector((state: RootState) => state.companies.isLoading)
  const error = useSelector((state: RootState) => state.companies.error)
  const pagination = useSelector((state: RootState) => state.companies.pagination)
  const { campaigns } = useSelector((state: RootState) => state.campaigns)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [countries, setCountries] = useState<string[]>([])
  const [countriesLoading, setCountriesLoading] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [form, setForm] = useState<CompanyForm>({
    campaign: 0,
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

  const [createLoading, setCreateLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createError, setCreateError] = useState("")
  
  const [editLoading, setEditLoading] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editError, setEditError] = useState("")

  // Fetch campaigns on component mount
  useEffect(() => {
    if (!campaigns || campaigns.length === 0) {
      dispatch(handleFetchCampaigns())
    }
  }, [dispatch, campaigns])

  // Fetch countries from REST Countries API
  useEffect(() => {
    const fetchCountries = async () => {
      setCountriesLoading(true)
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name')
        const data = await response.json()
        const countryNames = data.map((country: any) => country.name.common).sort()
        setCountries(countryNames)
      } catch (error) {
        console.error('Failed to fetch countries:', error)
      } finally {
        setCountriesLoading(false)
      }
    }
    fetchCountries()
  }, [])

  // Fetch companies when component mounts or page/filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const campaignId = selectedCampaignId || undefined
        const country = selectedCountry || undefined
        await dispatch(handleFetchCompanies({ campaignId, country, page: currentPage }))
      } catch (error) {
        console.error('Failed to fetch companies:', error)
      }
    }
    
    fetchData()
  }, [dispatch, currentPage, selectedCampaignId, selectedCountry])

  // Debounced search function
  useEffect(() => {
    const searchCompanies = async () => {
      if (!searchQuery.trim()) {
        await dispatch(handleFetchCompanies({ 
          campaignId: selectedCampaignId || undefined,
          country: selectedCountry || undefined,
          page: 1 
        }))
        return
      }

      setIsSearching(true)
      try {
        await dispatch(handleFetchCompanies({
          search: searchQuery,
          campaignId: selectedCampaignId || undefined,
          country: selectedCountry || undefined,
          page: 1,
        }))
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const timerId = setTimeout(searchCompanies, 500)
    return () => clearTimeout(timerId)
  }, [searchQuery, dispatch, selectedCampaignId, selectedCountry])

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

  const resetForm = () => {
    setForm({
      campaign: selectedCampaignId || 0,
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
    setEditId(null)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError("")
    setCreateSuccess(false)

    if (!selectedCampaignId) {
      setCreateError("Please select a campaign")
      setCreateLoading(false)
      return
    }

    try {
      const result = await dispatch(handleCreateCompany({ ...form, campaign: selectedCampaignId }) as any)
      if (result) {
        setCreateSuccess(true)
        setTimeout(() => {
          setCreateSuccess(false)
          setShowCreateDialog(false)
          resetForm()
          dispatch(handleFetchCompanies({ campaignId: selectedCampaignId, page: 1 }))
        }, 2000)
      } else {
        setCreateError("Failed to create company")
      }
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create company")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEdit = (company: any) => {
    setEditId(company.id)
    setForm({
      campaign: company.campaign,
      company_name: company.company_name || "",
      company_name_for_emails: company.company_name_for_emails || "",
      company_email: company.company_email || "",
      company_phone: company.company_phone || "",
      company_street: company.company_street || "",
      company_city: company.company_city || "",
      company_state: company.company_state || "",
      company_country: company.company_country || "",
      company_postal_code: company.company_postal_code || "",
      company_address: company.company_address || "",
      account_stage: company.account_stage || "",
      industry: company.industry || "",
      keywords: company.keywords || "",
      short_description: company.short_description || "",
      website: company.website || "",
      number_of_employees: company.number_of_employees,
      annual_revenue: company.annual_revenue || "",
      number_of_retail_locations: company.number_of_retail_locations,
      total_funding: company.total_funding || "",
      latest_funding: company.latest_funding || "",
      latest_funding_amount: company.latest_funding_amount || "",
      last_raised_at: company.last_raised_at || "",
      founded_year: company.founded_year,
      technologies: company.technologies || "",
      sic_codes: company.sic_codes || "",
      naics_codes: company.naics_codes || "",
      company_linkedin_url: company.company_linkedin_url || "",
      facebook_url: company.facebook_url || "",
      twitter_url: company.twitter_url || "",
      logo_url: company.logo_url || "",
      subsidiary_of: company.subsidiary_of || null,
      account_owner: company.account_owner || "",
      apollo_account_id: company.apollo_account_id || "",
      email_sent: company.email_sent || false,
      replied: company.replied || false,
    })
    setShowEditDialog(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError("")
    setEditSuccess(false)

    if (!editId) {
      setEditError("No company selected for editing")
      setEditLoading(false)
      return
    }

    try {
      const result = await dispatch(handleUpdateCompany({ id: editId, data: form }) as any)
      if (result) {
        setEditSuccess(true)
        setTimeout(() => {
          setEditSuccess(false)
          setShowEditDialog(false)
          resetForm()
          dispatch(handleFetchCompanies({ campaignId: selectedCampaignId || undefined, page: 1 }))
        }, 2000)
      } else {
        setEditError("Failed to update company")
      }
    } catch (err: any) {
      setEditError(err?.message || "Failed to update company")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        await dispatch(handleDeleteCompany(id))
        dispatch(handleFetchCompanies({ campaignId: selectedCampaignId || undefined, page: 1 }))
      } catch (error) {
        console.error("Failed to delete company:", error)
      }
    }
  }

  const handleView = (companyId: number) => {
    router.push(`/companies/${companyId}`)
  }

  const itemsPerPage = 10
  const totalPages = pagination?.totalPages || 1
  const totalItems = pagination?.count || 0

  const displayedCompanies = useMemo(() => {
    const seen = new Set<string>()
    return (companies || []).filter((c: any) => {
      const key = (c?.company_email || "").toLowerCase()
      if (!key) return true
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [companies])

  // Get contact names for selected companies
  const selectedContactNames = useMemo(() => {
    return bulkResearch.selectedIds.map(id => {
      const company = displayedCompanies.find((c: any) => c.id === id)
      return {
        id,
        name: company?.company_name || "Unknown"
      }
    })
  }, [bulkResearch.selectedIds, displayedCompanies])

  // Handle select all on current page
  const handleSelectAllOnPage = (checked: boolean) => {
    const pageIds = displayedCompanies.map((c: any) => c.id)
    if (checked) {
      bulkResearch.handleSelectAll(pageIds)
    } else {
      bulkResearch.handleDeselectAll(pageIds)
    }
  }

  // Check if all on page are selected
  const allOnPageSelected = useMemo(() => {
    if (displayedCompanies.length === 0) return false
    return displayedCompanies.every((c: any) => bulkResearch.isSelected(c.id))
  }, [displayedCompanies, bulkResearch.selectedIds])

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Bulk Research Floating Bar */}
        <BulkResearchFloatingBar
          selectedCount={bulkResearch.selectedCount}
          maxCount={bulkResearch.maxCount}
          onResearchClick={bulkResearch.handleResearchClick}
          onClearClick={bulkResearch.handleClearSelection}
        />

        {/* Bulk Research Confirmation Modal */}
        <BulkResearchConfirmationModal
          open={bulkResearch.showConfirmModal}
          onOpenChange={bulkResearch.setShowConfirmModal}
          contactCount={bulkResearch.selectedCount}
          contactNames={selectedContactNames.map(c => c.name)}
          onConfirm={(createCampaign) => bulkResearch.handleConfirmResearch(createCampaign, selectedContactNames)}
          isLoading={bulkResearch.isSubmitting}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-muted-foreground">Manage companies in your campaigns. Add, edit, and organize company information.</p>
          </div>
          <Button onClick={() => { setShowCreateDialog(true); resetForm() }}>
            <Plus className="mr-2 h-4 w-4" /> New Company
          </Button>
        </div>

        {/* Campaign and Country Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="campaign-filter">Filter by Campaign</Label>
                <select
                  id="campaign-filter"
                  className="w-full border rounded px-3 py-2 mt-2"
                  value={selectedCampaignId || ""}
                  onChange={e => {
                    setSelectedCampaignId(e.target.value ? Number(e.target.value) : null)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">All Campaigns</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="country-filter">Filter by Country</Label>
                <select
                  id="country-filter"
                  className="w-full border rounded px-3 py-2 mt-2"
                  value={selectedCountry}
                  onChange={e => {
                    setSelectedCountry(e.target.value)
                    setCurrentPage(1)
                  }}
                  disabled={countriesLoading}
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {countriesLoading && <p className="text-xs text-muted-foreground mt-1">Loading countries...</p>}
              </div>
              <div className="relative">
                <Search className={`absolute left-2.5 top-9 h-4 w-4 ${isSearching ? 'text-primary' : 'text-muted-foreground'}`} />
                {isSearching && (
                  <Loader2 className="absolute right-2.5 top-9 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  type="search"
                  placeholder="Search by name, email, or industry..."
                  className={`pl-8 pr-8 mt-2 w-full ${isSearching ? 'pr-8' : ''}`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">Fill in the company details below.</p>
            </DialogHeader>

            {createLoading && (
              <Alert variant="info">
                <Loader2 className="animate-spin mr-2 inline" />
                <AlertTitle>Creating company...</AlertTitle>
              </Alert>
            )}

            {createSuccess && (
              <Alert variant="success">
                <CheckCircle2 className="text-green-600 mr-2 inline" />
                <AlertTitle>Company created successfully!</AlertTitle>
              </Alert>
            )}

            {createError && (
              <Alert variant="destructive">
                <XCircle className="text-red-600 mr-2 inline" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign">Campaign *</Label>
                  <select
                    id="campaign"
                    className="w-full border rounded px-3 py-2 mt-2"
                    value={selectedCampaignId || ""}
                    onChange={e => setSelectedCampaignId(Number(e.target.value))}
                    required
                  >
                    <option value="">Choose a campaign...</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    placeholder="Company Name"
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
                    placeholder="Company Name for Emails"
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
                    placeholder="company@email.com"
                    required
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
                  <Label htmlFor="account_stage">Account Stage</Label>
                  <Input
                    id="account_stage"
                    name="account_stage"
                    value={form.account_stage}
                    onChange={handleChange}
                    placeholder="e.g., Lead, Prospect, Customer"
                  />
                </div>

                <div>
                  <Label htmlFor="company_city">City</Label>
                  <Input
                    id="company_city"
                    name="company_city"
                    value={form.company_city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="company_state">State</Label>
                  <Input
                    id="company_state"
                    name="company_state"
                    value={form.company_state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>

                <div>
                  <Label htmlFor="company_country">Country</Label>
                  <Input
                    id="company_country"
                    name="company_country"
                    value={form.company_country}
                    onChange={handleChange}
                    placeholder="Country"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
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
                    placeholder="500"
                  />
                </div>

                <div>
                  <Label htmlFor="annual_revenue">Annual Revenue</Label>
                  <Input
                    id="annual_revenue"
                    name="annual_revenue"
                    value={form.annual_revenue}
                    onChange={handleChange}
                    placeholder="e.g., $50M - $100M"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={form.short_description}
                  onChange={handleChange}
                  placeholder="Brief description of the company"
                  rows={3}
                />
              </div>

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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Company"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">Update company information below.</p>
            </DialogHeader>

            {editLoading && (
              <Alert variant="info">
                <Loader2 className="animate-spin mr-2 inline" />
                <AlertTitle>Updating company...</AlertTitle>
              </Alert>
            )}

            {editSuccess && (
              <Alert variant="success">
                <CheckCircle2 className="text-green-600 mr-2 inline" />
                <AlertTitle>Company updated successfully!</AlertTitle>
              </Alert>
            )}

            {editError && (
              <Alert variant="destructive">
                <XCircle className="text-red-600 mr-2 inline" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_company_name">Company Name *</Label>
                  <Input
                    id="edit_company_name"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    placeholder="Company Name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit_company_name_for_emails">Company Name for Emails *</Label>
                  <Input
                    id="edit_company_name_for_emails"
                    name="company_name_for_emails"
                    value={form.company_name_for_emails}
                    onChange={handleChange}
                    placeholder="Company Name for Emails"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit_company_email">Company Email *</Label>
                  <Input
                    id="edit_company_email"
                    name="company_email"
                    type="email"
                    value={form.company_email}
                    onChange={handleChange}
                    placeholder="company@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit_industry">Industry</Label>
                  <Input
                    id="edit_industry"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    placeholder="Industry"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_account_stage">Account Stage</Label>
                  <Input
                    id="edit_account_stage"
                    name="account_stage"
                    value={form.account_stage}
                    onChange={handleChange}
                    placeholder="e.g., Lead, Prospect, Customer"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_company_city">City</Label>
                  <Input
                    id="edit_company_city"
                    name="company_city"
                    value={form.company_city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_company_state">State</Label>
                  <Input
                    id="edit_company_state"
                    name="company_state"
                    value={form.company_state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_company_country">Country</Label>
                  <Input
                    id="edit_company_country"
                    name="company_country"
                    value={form.company_country}
                    onChange={handleChange}
                    placeholder="Country"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_website">Website</Label>
                  <Input
                    id="edit_website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_number_of_employees">Number of Employees</Label>
                  <Input
                    id="edit_number_of_employees"
                    name="number_of_employees"
                    type="number"
                    value={form.number_of_employees || ""}
                    onChange={handleChange}
                    placeholder="500"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_annual_revenue">Annual Revenue</Label>
                  <Input
                    id="edit_annual_revenue"
                    name="annual_revenue"
                    value={form.annual_revenue}
                    onChange={handleChange}
                    placeholder="e.g., $50M - $100M"
                  />
                </div>

                <div>
                  <Label htmlFor="edit_total_funding">Total Funding</Label>
                  <Input
                    id="edit_total_funding"
                    name="total_funding"
                    value={form.total_funding}
                    onChange={handleChange}
                    placeholder="e.g., $25M"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_short_description">Short Description</Label>
                <Textarea
                  id="edit_short_description"
                  name="short_description"
                  value={form.short_description}
                  onChange={handleChange}
                  placeholder="Brief description of the company"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Status Flags</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_email_sent"
                      name="email_sent"
                      checked={form.email_sent}
                      onCheckedChange={(checked) => setForm({ ...form, email_sent: checked as boolean })}
                    />
                    <Label htmlFor="edit_email_sent">Email Sent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_replied"
                      name="replied"
                      checked={form.replied}
                      onCheckedChange={(checked) => setForm({ ...form, replied: checked as boolean })}
                    />
                    <Label htmlFor="edit_replied">Replied</Label>
                  </div>
                </div>
              </div>

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
                    "Update Company"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Companies Listing */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading && !displayedCompanies.length ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : displayedCompanies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No companies found. Create one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Select All Checkbox */}
                {displayedCompanies.length > 0 && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                    <Checkbox
                      checked={allOnPageSelected}
                      onCheckedChange={handleSelectAllOnPage}
                      id="select-all"
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Select all on this page ({displayedCompanies.length})
                    </Label>
                    {bulkResearch.selectedCount > 0 && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {bulkResearch.selectedCount} selected
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-6 justify-center">
                  {displayedCompanies.map((company) => (
                    <Card key={company.id} className="w-full sm:w-[350px] md:w-[320px] lg:w-[300px] rounded-xl border bg-card shadow-lg hover:shadow-2xl transition-shadow duration-200 relative group">
                      {/* Selection Checkbox */}
                      <div className="absolute top-3 left-3 z-10">
                        <Checkbox
                          checked={bulkResearch.isSelected(company.id)}
                          onCheckedChange={() => bulkResearch.handleToggle(company.id)}
                          className="bg-background border-2"
                        />
                      </div>

                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="truncate max-w-[180px] text-lg font-semibold" title={company.company_name}>{company.company_name}</CardTitle>
                          <div className="text-xs text-muted-foreground truncate max-w-[180px]" title={company.company_email}>{company.company_email}</div>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                        {company.email_sent && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <CheckCircle2 className="text-green-600 h-5 w-5" />
                              </TooltipTrigger>
                              <TooltipContent>Email Sent</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {company.replied && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <CheckCircle2 className="text-purple-600 h-5 w-5" />
                              </TooltipTrigger>
                              <TooltipContent>Replied</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 pt-0">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {company.industry && <Badge variant="secondary">{company.industry}</Badge>}
                        {company.account_stage && <Badge variant="outline">{company.account_stage}</Badge>}
                        {company.company_city && <Badge variant="secondary">{company.company_city}</Badge>}
                        {company.company_country && <Badge variant="secondary">{company.company_country}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate" title={company.short_description}>{company.short_description || "No description"}</div>
                      <div className="flex gap-2 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => handleView(company.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(company)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(company.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedCompanies.length} of {pagination?.count || companies.length} companies
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                <span className="text-xs">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
