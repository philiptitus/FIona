"use client"
import React, { useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Upload, Download } from "lucide-react"
import MailLoader from "@/components/MailLoader"
import { handleBulkCreateCompaniesCsv } from "@/store/actions/companyActions"
import { handleBulkCreateEmails } from "@/store/actions/emailActions"
import MainLayout from "@/components/layout/main-layout"
import type { AppDispatch } from "@/store/store"

export default function BulkUploadPage() {
  const dispatch = useDispatch<AppDispatch>()

  // Companies state
  const fileRefCompanies = useRef<HTMLInputElement | null>(null)
  const [companyFile, setCompanyFile] = useState<File | null>(null)
  const [companyError, setCompanyError] = useState("")
  const [companySuccess, setCompanySuccess] = useState(false)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [checkCompanyDuplicates, setCheckCompanyDuplicates] = useState(true)

  // Emails state
  const fileRefEmails = useRef<HTMLInputElement | null>(null)
  const [emailFile, setEmailFile] = useState<File | null>(null)
  const [emailError, setEmailError] = useState("")
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [checkEmailDuplicates, setCheckEmailDuplicates] = useState(true)

  const csvToModelField: Record<string, string> = {
    "Company Name": "company_name",
    "Company Email": "company_email",
    "company_email": "company_email",
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
          const required = ["Company Name", "Company Email"]
          const has = required.every(field => headers.includes(field) || headers.includes(csvToModelField[field] || field))
          if (!has) {
            resolve({ valid: false, error: "Missing required columns: Company Name, Company Email" })
            return
          }
          resolve({ valid: true })
        } catch (err) {
          resolve({ valid: false, error: "Error reading CSV file" })
        }
      }
      reader.readAsText(file)
    })
  }

  // Companies handlers
  const onCompanyFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      if (!f.name.toLowerCase().endsWith('.csv')) {
        setCompanyError('Please select a CSV file for companies')
        e.target.value = ''
        return
      }
      const validation = await validateCSVColumns(f)
      if (!validation.valid) {
        setCompanyError(validation.error || 'Invalid CSV')
        e.target.value = ''
        return
      }
      setCompanyFile(f)
      setCompanyError("")
    }
  }

  const submitCompanies = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyFile) { setCompanyError('Please select a CSV file'); return }
    setCompanyLoading(true)
    setCompanyError("")
    setCompanySuccess(false)
    try {
      const formData = new FormData()
      formData.append('csv_file', companyFile)
      formData.append('check_user_duplicates', String(checkCompanyDuplicates))

      const result = await dispatch(handleBulkCreateCompaniesCsv(formData) as any)

      if (!result || result === false || result?.error) {
        setCompanyError(result?.error || 'Upload failed')
        return
      }

      setCompanySuccess(true)
      setCompanyFile(null)
      if (fileRefCompanies.current) fileRefCompanies.current.value = ''
      setTimeout(() => setCompanySuccess(false), 2500)
    } catch (err: any) {
      setCompanyError(err?.message || 'Upload failed')
    } finally {
      setCompanyLoading(false)
    }
  }

  // Emails handlers
  const onEmailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      const ok = f.name.toLowerCase().endsWith('.csv') || f.name.toLowerCase().endsWith('.json')
      if (!ok) { setEmailError('Please select a CSV or JSON file for emails'); e.target.value = ''; return }
      setEmailFile(f)
      setEmailError("")
    }
  }

  const submitEmails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailFile) { setEmailError('Please select a file'); return }
    setEmailLoading(true)
    setEmailError("")
    setEmailSuccess(false)
    try {
      const formData = new FormData()
      formData.append('csv_file', emailFile)
      formData.append('check_user_duplicates', String(checkEmailDuplicates))

      const result = await dispatch(handleBulkCreateEmails(formData) as any)

      if (!result || result === false || result?.error) {
        setEmailError(result?.error || 'Upload failed')
        return
      }

      setEmailSuccess(true)
      setEmailFile(null)
      if (fileRefEmails.current) fileRefEmails.current.value = ''
      setTimeout(() => setEmailSuccess(false), 2500)
    } catch (err: any) {
      setEmailError(err?.message || 'Upload failed')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="p-6">
        {(companyLoading || emailLoading) && <MailLoader />}

        <h1 className="text-2xl font-semibold mb-4">Bulk Uploads</h1>

        <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="companies"><Upload className="inline mr-1" /> Companies</TabsTrigger>
          <TabsTrigger value="emails"><Upload className="inline mr-1" /> Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <form onSubmit={submitCompanies} className="space-y-4">
            {companyError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-xs">{companyError}</AlertDescription>
              </Alert>
            )}

            {companySuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Success</AlertTitle>
                <AlertDescription className="text-green-800 text-xs">Companies uploaded successfully</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm text-blue-900">CSV Format</h3>
                <Button variant="outline" size="sm" onClick={() => {
                  const template = `Company Name,Company Email,Company Phone,Company City,Company Country,Industry,Website\nTechCorp Inc,contact@techcorp.com,+1-555-0100,San Francisco,USA,Technology,https://techcorp.com`
                  const b = new Blob([template], { type: 'text/csv' })
                  const url = URL.createObjectURL(b)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'companies_template.csv'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}>
                  <Download className="w-3 h-3 mr-1" /> Template
                </Button>
              </div>
              <p className="text-xs text-blue-700 mb-1">Required columns: Company Name, Company Email</p>
              <p className="text-xs text-blue-700">Optional: Company Phone, Company City, Company Country, Industry, Website</p>
            </div>

            <input ref={fileRefCompanies} type="file" accept=".csv" className="hidden" onChange={onCompanyFileChange} />
            <Button variant="outline" onClick={() => fileRefCompanies.current?.click()} type="button" className="w-full text-left">
              <Upload className="h-4 w-4 mr-2" /> {companyFile ? companyFile.name : 'Click to upload CSV file...'}
            </Button>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={checkCompanyDuplicates} onChange={(e) => setCheckCompanyDuplicates(e.target.checked)} />
                <span className="text-sm">Check for duplicates</span>
              </label>
              <Button type="submit" disabled={!companyFile || companyLoading}>{companyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload Companies'}</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="emails">
          <form onSubmit={submitEmails} className="space-y-4">
            {emailError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-xs">{emailError}</AlertDescription>
              </Alert>
            )}

            {emailSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Success</AlertTitle>
                <AlertDescription className="text-green-800 text-xs">Emails uploaded successfully</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm text-blue-900">Import Format</h3>
                <Button variant="outline" size="sm" onClick={() => {
                  const csv = 'organization_name,email\nAcme,hello@acme.com'
                  const b = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(b)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'emails_template.csv'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}>
                  <Download className="w-3 h-3 mr-1" /> Template
                </Button>
              </div>
              <p className="text-xs text-blue-700 mb-1">Required: organization_name and email (for CSV)</p>
              <p className="text-xs text-blue-700">JSON imports are also accepted.</p>
            </div>

            <input ref={fileRefEmails} type="file" accept=".csv,.json" className="hidden" onChange={onEmailFileChange} />
            <Button variant="outline" onClick={() => fileRefEmails.current?.click()} type="button" className="w-full text-left">
              <Upload className="h-4 w-4 mr-2" /> {emailFile ? emailFile.name : 'Click to upload CSV or JSON file...'}
            </Button>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={checkEmailDuplicates} onChange={(e) => setCheckEmailDuplicates(e.target.checked)} />
                <span className="text-sm">Check for duplicates</span>
              </label>
              <Button type="submit" disabled={!emailFile || emailLoading}>{emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload Emails'}</Button>
            </div>
          </form>
        </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
