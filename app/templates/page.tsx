"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Link from "next/link"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, MoreHorizontal, Plus, Search, Copy, Eye } from "lucide-react"
import { HtmlPreview } from "@/components/ui/html-preview"
import { MiniHtmlEditor } from "@/components/ui/mini-html-editor"
import type { RootState, AppDispatch } from "@/store/store"
import { handleFetchTemplates, handleCreateTemplate, handleUpdateTemplate, handleDeleteTemplate, handleGenerateTemplate } from "@/store/actions/templateActions"
import { useRouter } from "next/navigation"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface TemplateForm {
  name: string
  html_content: string
}

export default function TemplatesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { templates, isLoading: templateLoading, error: templateError } = useSelector((state: RootState) => state.template)
  const { campaigns } = useSelector((state: RootState) => state.campaigns)
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<TemplateForm>({ name: "", html_content: "" })
  const [editId, setEditId] = useState<number | null>(null)
  const [filtered, setFiltered] = useState(templates)
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)
  const [showAIForm, setShowAIForm] = useState(false)
  const [aiRequirements, setAIRequirements] = useState("")
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState("")
  const [aiDialogOpen, setAIDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    dispatch({ type: "campaigns/fetchCampaignsStart" })
    dispatch(handleFetchTemplates())
  }, [dispatch])

  useEffect(() => {
    setFiltered(
      templates.filter(tpl => tpl.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [templates, searchQuery])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaign) {
      alert("Please select a campaign.")
      return
    }
    if (editId) {
      await dispatch(handleUpdateTemplate({ id: editId, templateData: { ...form, campaign: selectedCampaign } }))
    } else {
      await dispatch(handleCreateTemplate({ ...form, campaign: selectedCampaign }))
    }
    setShowForm(false)
    setEditId(null)
    setForm({ name: "", html_content: "" })
    setSelectedCampaign(null)
    dispatch(handleFetchTemplates())
  }

  const handleEdit = (tpl: any) => {
    setEditId(tpl.id)
    setForm({ name: tpl.name, html_content: tpl.html_content })
    setShowForm(true)
    setSelectedCampaign(tpl.campaign || null)
  }

  const handleDelete = async (id: number) => {
    await dispatch(handleDeleteTemplate(id))
    dispatch(handleFetchTemplates())
  }

  const handleView = (tplId: number) => {
    router.push(`/templates/${tplId}`)
  }

  const handleAICreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaign) {
      toast({ variant: "destructive", title: "Missing campaign", description: "Please select a campaign." })
      return
    }
    setAILoading(true)
    setAIError("")
    try {
      const result = await dispatch(handleGenerateTemplate({
        campaignId: selectedCampaign,
        templateName: form.name,
        requirements: aiRequirements,
      }))
      if (result === true) {
        toast({ variant: "success", title: "Template generated!", description: "Your template was created successfully." })
        setShowAIForm(false)
        setShowForm(false)
        setEditId(null)
        setForm({ name: "", html_content: "" })
        setSelectedCampaign(null)
        setAIRequirements("")
        setTimeout(() => {
          dispatch(handleFetchTemplates()).then((res: any) => {
            const state = store.getState()
            const latest = state.template.templates[0]
            if (latest && latest.id) {
              router.push(`/templates/${latest.id}`)
            }
          })
        }, 1000)
      } else {
        toast({ variant: "destructive", title: "Generation failed", description: "AI could not generate the template." })
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Generation error", description: err?.message || "An error occurred while generating the template." })
    } finally {
      setAILoading(false)
    }
  }

  const handleAIEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaign) {
      toast({ variant: "destructive", title: "Missing campaign", description: "Please select a campaign." })
      return
    }
    setAILoading(true)
    setAIError("")
    try {
      const result = await dispatch(handleGenerateTemplate({
        campaignId: selectedCampaign,
        templateName: form.name,
        requirements: aiRequirements,
      }))
      if (result && result.payload && result.meta && result.meta.requestStatus === "fulfilled" && result.payload.id) {
        toast({ variant: "success", title: "Template updated!", description: "Your template was updated successfully." })
        setAIDialogOpen(false)
        setAIError("")
        setAIRequirements("")
        setForm({ name: result.payload.name || "", html_content: result.payload.html_content || "" })
        setSelectedCampaign(null)
        dispatch(handleFetchTemplates())
      } else {
        toast({ variant: "destructive", title: "Generation failed", description: result.payload?.error || "AI could not update the template." })
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Generation error", description: err?.message || "An error occurred while updating the template." })
    } finally {
      setAILoading(false)
    }
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const sortedTemplates = [...filtered].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
  const totalPages = Math.ceil(sortedTemplates.length / itemsPerPage)
  const paginatedTemplates = sortedTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => { setCurrentPage(1) }, [filtered])

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground">Create and manage your email templates</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", html_content: "" }); setSelectedCampaign(null) }}>
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
          <Button variant="secondary" onClick={() => { setShowAIForm(true); setShowForm(false); setEditId(null); setForm({ name: "", html_content: "" }); setSelectedCampaign(null) }}>
            🤖 Create with AI
          </Button>
        </div>
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              {/* Add more tabs for filtering if needed */}
            </TabsList>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <TabsContent value="all" className="space-y-4">
            {showForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{editId ? "Edit Template" : "Create Template"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                      name="name"
                      placeholder="Template Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <div>
                      <label className="mb-1 block font-medium">HTML Content</label>
                      <MiniHtmlEditor
                        value={form.html_content}
                        onChange={val => setForm(f => ({ ...f, html_content: val }))}
                        height={180}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Campaign</label>
                      <Select value={selectedCampaign ? String(selectedCampaign) : undefined} onValueChange={val => setSelectedCampaign(Number(val))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns.map((c: any) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium">Preview</label>
                      <HtmlPreview html={form.html_content} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">{editId ? "Update" : "Create"}</Button>
                      <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); setForm({ name: "", html_content: "" }); setSelectedCampaign(null) }}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            {showAIForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Generate Template with AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAICreate} className="flex flex-col gap-4">
                    <Input
                      name="name"
                      placeholder="Template Name (optional)"
                      value={form.name}
                      onChange={handleChange}
                      disabled={aiLoading}
                    />
                    <div>
                      <label className="block mb-1 font-medium">Requirements / Prompt</label>
                      <textarea
                        name="requirements"
                        placeholder="Describe what you want the template to contain..."
                        className="border rounded p-2 min-h-[80px] w-full"
                        value={aiRequirements}
                        onChange={e => setAIRequirements(e.target.value)}
                        required
                        disabled={aiLoading}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Campaign</label>
                      <Select value={selectedCampaign ? String(selectedCampaign) : undefined} onValueChange={val => setSelectedCampaign(Number(val))} disabled={aiLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns.map((c: any) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {aiError && <div className="text-red-500 text-sm">{aiError}</div>}
                    <Button type="submit" disabled={aiLoading}>{aiLoading ? "Generating..." : "Generate with AI"}</Button>
                    <Button type="button" variant="outline" onClick={() => { setShowAIForm(false); setAIError(""); setAIRequirements("") }} disabled={aiLoading}>Cancel</Button>
                  </form>
                  {templateLoading && <div className="text-blue-500 mt-2">Generating template...</div>}
                  {templateError && <div className="text-red-500 mt-2">{templateError}</div>}
                </CardContent>
              </Card>
            )}
            <Dialog open={aiDialogOpen} onOpenChange={setAIDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" data-tour="create-template-btn" onClick={() => { setShowAIForm(false); setShowForm(false); setEditId(null); setForm({ name: "", html_content: "" }); setSelectedCampaign(null); setAIDialogOpen(true) }}>
                  🤖 Edit with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                  <DialogTitle>Edit Template with AI</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAIEdit} className="flex flex-col gap-4">
                  <Input
                    name="name"
                    placeholder="Template Name (optional)"
                    value={form.name}
                    onChange={handleChange}
                    disabled={aiLoading}
                  />
                  <div>
                    <label className="block mb-1 font-medium">Requirements / Prompt</label>
                    <textarea
                      name="requirements"
                      placeholder="Describe how you want to update this template..."
                      className="border rounded p-2 min-h-[80px] w-full"
                      value={aiRequirements}
                      onChange={e => setAIRequirements(e.target.value)}
                      required
                      disabled={aiLoading}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Campaign</label>
                    <Select value={selectedCampaign ? String(selectedCampaign) : undefined} onValueChange={val => setSelectedCampaign(Number(val))} disabled={aiLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {aiError && <div className="text-red-500 text-sm">{aiError}</div>}
                  <DialogFooter>
                    <Button type="submit" disabled={aiLoading} className="w-full">{aiLoading ? "Generating..." : "Update with AI"}</Button>
                    <Button type="button" variant="outline" onClick={() => { setAIDialogOpen(false); setAIError(""); setAIRequirements("") }} disabled={aiLoading}>Cancel</Button>
                  </DialogFooter>
                </form>
                {templateLoading && <div className="text-blue-500 mt-2">Generating template...</div>}
                {templateError && <div className="text-red-500 mt-2">{templateError}</div>}
              </DialogContent>
            </Dialog>
            <div className="divide-y">
              {paginatedTemplates.map((tpl) => (
                <Card key={tpl.id} className="rounded-lg border bg-card shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{tpl.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(tpl.id)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(tpl)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(tpl.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); setAIDialogOpen(true); setEditId(tpl.id); setForm({ name: tpl.name, html_content: tpl.html_content }); setSelectedCampaign(tpl.campaign || null); }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit with AI
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { }}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground text-xs truncate max-w-full" title={tpl.html_content}>{tpl.html_content?.slice(0, 80) || "No content"}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedTemplates.length} of {filtered.length} filtered templates (Total: {templates.length})
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
