"use client"

import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { handleUpdateEmail } from "@/store/actions/emailActions"
import type { AppDispatch } from "@/store/store"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  email?: any | null
  onSuccess?: () => void
}

export default function EditEmailDialog({ open, onOpenChange, email, onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>()

  const [form, setForm] = useState<any>({
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

  const [editLoading, setEditLoading] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editError, setEditError] = useState("")

  useEffect(() => {
    if (email) {
      setForm({ ...form, ...email })
      setEditError("")
      setEditSuccess(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((f: any) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setEditLoading(true)
    setEditError("")
    try {
      // handleUpdateEmail expects an object: { id, emailData }
      // Exclude many-to-many fields (like contact_lists) and any array values from the plain update payload
      const emailData = { ...form } as any

      // Remove known many-to-many fields if present
      if (emailData.contact_lists !== undefined) delete emailData.contact_lists
      if (emailData.lists !== undefined) delete emailData.lists

      // Remove any other array-type fields to avoid accidental M2M assignments
      Object.keys(emailData).forEach((key) => {
        if (Array.isArray(emailData[key])) {
          delete emailData[key]
        }
      })

      await dispatch(handleUpdateEmail({ id: email.id, emailData }) as any)
      setEditSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setEditError(err?.message || "Update failed")
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Input id="first_name" name="first_name" value={form.first_name || ""} onChange={handleChange} placeholder="First Name" />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" value={form.last_name || ""} onChange={handleChange} placeholder="Last Name" />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={form.title || ""} onChange={handleChange} placeholder="Job Title" />
                </div>
                <div>
                  <Label htmlFor="seniority">Seniority</Label>
                  <Input id="seniority" name="seniority" value={form.seniority || ""} onChange={handleChange} placeholder="Seniority Level" />
                </div>
                <div>
                  <Label htmlFor="departments">Departments</Label>
                  <Input id="departments" name="departments" value={form.departments || ""} onChange={handleChange} placeholder="Departments" />
                </div>
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Input id="stage" name="stage" value={form.stage || ""} onChange={handleChange} placeholder="Stage" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Primary Email *</Label>
                  <Input id="email" name="email" value={form.email || ""} onChange={handleChange} placeholder="Primary Email" required />
                </div>
                <div>
                  <Label htmlFor="secondary_email">Secondary Email</Label>
                  <Input id="secondary_email" name="secondary_email" value={form.secondary_email || ""} onChange={handleChange} placeholder="Secondary Email" />
                </div>
                <div>
                  <Label htmlFor="tertiary_email">Tertiary Email</Label>
                  <Input id="tertiary_email" name="tertiary_email" value={form.tertiary_email || ""} onChange={handleChange} placeholder="Tertiary Email" />
                </div>
                <div>
                  <Label htmlFor="work_direct_phone">Work Phone</Label>
                  <Input id="work_direct_phone" name="work_direct_phone" value={form.work_direct_phone || ""} onChange={handleChange} placeholder="Work Phone" />
                </div>
                <div>
                  <Label htmlFor="mobile_phone">Mobile Phone</Label>
                  <Input id="mobile_phone" name="mobile_phone" value={form.mobile_phone || ""} onChange={handleChange} placeholder="Mobile Phone" />
                </div>
                <div>
                  <Label htmlFor="home_phone">Home Phone</Label>
                  <Input id="home_phone" name="home_phone" value={form.home_phone || ""} onChange={handleChange} placeholder="Home Phone" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization_name">Organization Name *</Label>
                  <Input id="organization_name" name="organization_name" value={form.organization_name || ""} onChange={handleChange} placeholder="Organization Name" required />
                </div>
                <div>
                  <Label htmlFor="company_name_for_emails">Company Name for Emails</Label>
                  <Input id="company_name_for_emails" name="company_name_for_emails" value={form.company_name_for_emails || ""} onChange={handleChange} placeholder="Company Name for Emails" />
                </div>
                <div>
                  <Label htmlFor="company_address">Company Address</Label>
                  <Input id="company_address" name="company_address" value={form.company_address || ""} onChange={handleChange} placeholder="Company Address" />
                </div>
                <div>
                  <Label htmlFor="company_city">Company City</Label>
                  <Input id="company_city" name="company_city" value={form.company_city || ""} onChange={handleChange} placeholder="Company City" />
                </div>
                <div>
                  <Label htmlFor="company_state">Company State</Label>
                  <Input id="company_state" name="company_state" value={form.company_state || ""} onChange={handleChange} placeholder="Company State" />
                </div>
                <div>
                  <Label htmlFor="company_country">Company Country</Label>
                  <Input id="company_country" name="company_country" value={form.company_country || ""} onChange={handleChange} placeholder="Company Country" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email_status">Email Status</Label>
                  <Input id="email_status" name="email_status" value={form.email_status || ""} onChange={handleChange} placeholder="Email Status" />
                </div>
                <div>
                  <Label htmlFor="primary_email_source">Primary Email Source</Label>
                  <Input id="primary_email_source" name="primary_email_source" value={form.primary_email_source || ""} onChange={handleChange} placeholder="Primary Email Source" />
                </div>
                <div>
                  <Label htmlFor="email_confidence">Email Confidence</Label>
                  <Input id="email_confidence" name="email_confidence" value={form.email_confidence || ""} onChange={handleChange} placeholder="Email Confidence" />
                </div>
                <div>
                  <Label htmlFor="primary_email_catch_all_status">Catch-all Status</Label>
                  <Input id="primary_email_catch_all_status" name="primary_email_catch_all_status" value={form.primary_email_catch_all_status || ""} onChange={handleChange} placeholder="Catch-all Status" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Email Status Flags</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email_sent" name="email_sent" checked={!!form.email_sent} onCheckedChange={(checked) => setForm({ ...form, email_sent: checked as boolean })} />
                    <Label htmlFor="email_sent">Email Sent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email_open" name="email_open" checked={!!form.email_open} onCheckedChange={(checked) => setForm({ ...form, email_open: checked as boolean })} />
                    <Label htmlFor="email_open">Email Open</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email_bounced" name="email_bounced" checked={!!form.email_bounced} onCheckedChange={(checked) => setForm({ ...form, email_bounced: checked as boolean })} />
                    <Label htmlFor="email_bounced">Email Bounced</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="replied" name="replied" checked={!!form.replied} onCheckedChange={(checked) => setForm({ ...form, replied: checked as boolean })} />
                    <Label htmlFor="replied">Replied</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="demoed" name="demoed" checked={!!form.demoed} onCheckedChange={(checked) => setForm({ ...form, demoed: checked as boolean })} />
                    <Label htmlFor="demoed">Demoed</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={form.city || ""} onChange={handleChange} placeholder="City" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={form.state || ""} onChange={handleChange} placeholder="State" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" value={form.country || ""} onChange={handleChange} placeholder="Country" />
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input id="keywords" name="keywords" value={form.keywords || ""} onChange={handleChange} placeholder="Keywords" />
                </div>
                <div>
                  <Label htmlFor="technologies">Technologies</Label>
                  <Input id="technologies" name="technologies" value={form.technologies || ""} onChange={handleChange} placeholder="Technologies" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="context">Context</Label>
                  <Textarea id="context" name="context" value={form.context || ""} onChange={handleChange} placeholder="Additional context or notes" rows={3} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
  )
}
