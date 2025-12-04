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
import { Loader2, CheckCircle2, XCircle, Upload, Download, Edit } from "lucide-react"
import { handleCreateCompany } from "@/store/actions/companyActions"
import { handleBulkCreateCompaniesCsv } from "@/store/actions/companyActions"
import type { AppDispatch } from "@/store/store"

interface Company {
  id: number
  company_email: string
  company_name: string
  industry?: string
  company_city?: string
  company_country?: string
  campaign: number
}

interface Campaign {
  id: number
  name: string
}

interface AddCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCampaignId?: number | null
  campaign?: Campaign | null
  companies?: Company[]
  isLoadingCompanies?: boolean
  onSuccess?: () => void
}


export default function AddCompanyDialog({
  open,
  onOpenChange,
  initialCampaignId,
  campaign,
  companies = [],
  isLoadingCompanies = false,
  onSuccess,
}: AddCompanyDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [industry, setIndustry] = useState("")
  const [website, setWebsite] = useState("")
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [checkDuplicates, setCheckDuplicates] = useState(true)
  
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkError, setBulkError] = useState("")
  const [bulkSuccess, setBulkSuccess] = useState(false)
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  
  const campaignId = initialCampaignId || campaign?.id

  const csvTemplate = `Company Name,Company Email,Company Phone,Company City,Company Country,Industry,Website
TechCorp Inc,contact@techcorp.com,+1-555-0100,San Francisco,USA,Technology,https://techcorp.com
StartupAI Ltd,hello@startupaai.com,+1-555-0200,Boston,USA,AI,https://startupaai.com`

  // Mapping of CSV field names (with spaces) to backend field names (underscores)
  const csvToModelField: Record<string, string> = {
    "Company Name": "company_name",
    "Company Name for Emails": "company_name_for_emails",
    "Company Email": "company_email",
    "company_email": "company_email",
    "Company Phone": "company_phone",
    "Company Street": "company_street",
    "Company City": "company_city",
    "Company State": "company_state",
    "Company Country": "company_country",
    "Company Postal Code": "company_postal_code",
    "Company Address": "company_address",
    "Account Stage": "account_stage",
    "Industry": "industry",
    "Keywords": "keywords",
    "Short Description": "short_description",
    "Website": "website",
    "# Employees": "number_of_employees",
    "Annual Revenue": "annual_revenue",
    "Number of Retail Locations": "number_of_retail_locations",
    "Total Funding": "total_funding",
    "Latest Funding": "latest_funding",
    "Latest Funding Amount": "latest_funding_amount",
    "Last Raised At": "last_raised_at",
    "Founded Year": "founded_year",
    "Technologies": "technologies",
    "SIC Codes": "sic_codes",
    "NAICS Codes": "naics_codes",
    "Company Linkedin Url": "company_linkedin_url",
    "Facebook Url": "facebook_url",
    "Twitter Url": "twitter_url",
    "Logo Url": "logo_url",
    "Subsidiary of": "subsidiary_of",
    "Account Owner": "account_owner",
    "Apollo Account Id": "apollo_account_id",
    "Email Sent": "email_sent",
    "Replied": "replied",
  }

  // Manual add single company
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!campaignId) {
      setError("Campaign ID is required")
      return
    }

    if (!companyEmail || !companyName) {
      setError("Company email and name are required")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await dispatch(handleCreateCompany({
        campaign: campaignId,
        company_email: companyEmail,
        company_name: companyName,
        company_phone: companyPhone || undefined,
        industry: industry || undefined,
        website: website || undefined,
        check_user_duplicates: checkDuplicates,
      }) as any)

      if (result?.error) {
        setError(result.error)
        setSuccess(false)
        return
      }

      if (result) {
        setSuccess(true)
        setError("")
        setCompanyEmail("")
        setCompanyName("")
        setCompanyPhone("")
        setIndustry("")
        setWebsite("")
        
        if (onSuccess) {
          onSuccess()
        }
        
        setTimeout(() => {
          onOpenChange(false)
          setSuccess(false)
        }, 2000)
      } else {
        setError("Failed to add company")
        setSuccess(false)
      }
    } catch (err: any) {
      setError(err?.message || "Failed to add company")
    } finally {
      setIsLoading(false)
    }
  }

  // CSV bulk upload
  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        const validation = await validateCSVColumns(file)
        if (!validation.valid) {
          setBulkError(validation.error || "Invalid CSV file")
          e.target.value = ''
          return
        }
      }
      
      setBulkFile(file)
      setBulkError("")
    }
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
          
          const headers = lines[0].split(',').map(h => h.trim())
          
          // Check for required columns - can be in either format (with spaces or underscores)
          const requiredFields = ["Company Name", "Company Email"]
          const hasRequiredFields = requiredFields.every(field => 
            headers.includes(field) || headers.includes(csvToModelField[field] || field)
          )
          
          if (!hasRequiredFields) {
            resolve({ 
              valid: false, 
              error: `Missing required columns: Company Name, Company Email` 
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

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bulkFile) {
      setBulkError("Please select a CSV file to upload")
      return
    }

    if (!campaignId) {
      setBulkError("Campaign ID is required")
      return
    }

    setIsBulkLoading(true)
    setBulkError("")
    setBulkSuccess(false)

    try {
      const formData = new FormData()
      formData.append("csv_file", bulkFile)
      formData.append("campaign_id", String(campaignId))
      formData.append("check_user_duplicates", String(checkDuplicates))

      const result = await dispatch(handleBulkCreateCompaniesCsv(formData) as any)

      if (result?.error) {
        setBulkError(result.error)
        setBulkSuccess(false)
        return
      }

      setBulkSuccess(true)
      setBulkError("")
      setBulkFile(null)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      if (onSuccess) {
        onSuccess()
      }

      // Close dialog after 2 seconds on success
      setTimeout(() => {
        onOpenChange(false)
        setBulkSuccess(false)
      }, 2000)

    } catch (err: any) {
      setBulkError(err?.message || "Failed to upload companies")
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    const element = document.createElement("a")
    const file = new Blob([csvTemplate], { type: "text/csv" })
    element.href = URL.createObjectURL(file)
    element.download = "companies_template.csv"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleReset = () => {
    setCompanyEmail("")
    setCompanyName("")
    setCompanyPhone("")
    setIndustry("")
    setWebsite("")
    setError("")
    setSuccess(false)
    setBulkFile(null)
    setBulkError("")
    setBulkSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (open) {
      handleReset()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Companies</DialogTitle>
          <p className="text-sm text-muted-foreground">Choose how you want to add companies to your campaign</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <Tabs defaultValue="manual" className="w-full flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="manual"><Edit className="w-4 h-4 mr-1" /> Manual</TabsTrigger>
              <TabsTrigger value="bulk"><Upload className="w-4 h-4 mr-1" /> Bulk Upload</TabsTrigger>
            </TabsList>

            {/* Manual Tab */}
            <TabsContent value="manual">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900">Success</AlertTitle>
                    <AlertDescription className="text-green-800 text-xs">Company added successfully!</AlertDescription>
                  </Alert>
                )}

                <p className="text-sm text-muted-foreground mb-1">
                  Add a single company entry manually. Use this for quick, one-off additions.
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Email *</label>
                  <Input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="contact@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Inc."
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Phone</label>
                  <Input
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="+1-555-0000"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Technology, Finance, etc."
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://company.com"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="check-duplicates-manual"
                    checked={checkDuplicates}
                    onChange={(e) => setCheckDuplicates(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                  <label htmlFor="check-duplicates-manual" className="text-sm font-medium">
                    Check for duplicates
                  </label>
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      handleReset()
                      onOpenChange(false)
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !companyEmail || !companyName}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Company
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
                    <AlertDescription className="text-xs">{bulkError}</AlertDescription>
                  </Alert>
                )}

                {bulkSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900">Success</AlertTitle>
                    <AlertDescription className="text-green-800 text-xs">Companies uploaded successfully!</AlertDescription>
                  </Alert>
                )}

                <p className="text-sm text-muted-foreground mb-1">
                  Upload a CSV file to add multiple companies at once.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-sm text-blue-900">CSV Format</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTemplate}
                      className="text-xs h-8"
                      type="button"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Template
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">Required columns: Company Name, Company Email</p>
                  <p className="text-xs text-blue-700">Optional columns: Company Phone, Company City, Company Country, Industry, Website, and more...</p>
                  <p className="text-xs text-blue-600 mt-2 italic">Note: Field names with spaces (e.g., "Company Name") are automatically converted to underscores</p>
                </div>

                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleBulkFileChange}
                    className="hidden"
                    disabled={isBulkLoading}
                  />
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-12"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    disabled={isBulkLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {bulkFile ? bulkFile.name : "Click to upload CSV file..."}
                  </Button>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="check-duplicates-bulk"
                    checked={checkDuplicates}
                    onChange={(e) => setCheckDuplicates(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={isBulkLoading}
                  />
                  <label htmlFor="check-duplicates-bulk" className="text-sm font-medium">
                    Check for duplicates
                  </label>
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      handleReset()
                      onOpenChange(false)
                    }}
                    disabled={isBulkLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isBulkLoading || !bulkFile}>
                    {isBulkLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Upload Companies
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
