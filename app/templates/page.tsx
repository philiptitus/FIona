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
import CKEditorWrapper from "@/components/CKEditorWrapper"
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
  const [aiDesignContext, setAIDesignContext] = useState("")

  useEffect(() => {
    dispatch({ type: "campaigns/fetchCampaignsStart" })
    dispatch(handleFetchTemplates())
  }, [dispatch])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        dispatch(handleFetchTemplates({ search: searchQuery }))
      } else {
        dispatch(handleFetchTemplates())
      }
    }, 500) // 500ms debounce
    
    return () => clearTimeout(timer)
  }, [searchQuery, dispatch])

  // Update filtered templates when templates change
  useEffect(() => {
    setFiltered(templates)
  }, [templates])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

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

  const handleEdit = (e: React.MouseEvent, tpl: any) => {
    e.stopPropagation(); // Prevent event from bubbling up to the card
    setEditId(tpl.id);
    setForm({ name: tpl.name, html_content: tpl.html_content });
    setShowForm(true);
    setShowAIForm(false);
    setSelectedCampaign(tpl.campaign || null);
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

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
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <TabsContent value="all" className="space-y-4">
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>{editId ? "Edit Template" : "Create Template"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col md:flex-row gap-8 py-2">
                  {/* Edit Form */}
                  <form onSubmit={handleSubmit} className="flex-1 min-w-0">
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Subject</label>
                      <Input
                        name="name"
                        placeholder="Subject"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="mb-1 block font-medium">Email Content</label>
                      <CKEditorWrapper
                        data={form.html_content}
                        onChange={val => setForm(f => ({ ...f, html_content: val }))}
                        placeholder="Write your email content here..."
                      />
                    </div>
                    <div className="mb-4">
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
                    <div className="flex gap-2 mt-4">
                      <Button type="submit">{editId ? "Update" : "Create"}</Button>
                      <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); setForm({ name: "", html_content: "" }); setSelectedCampaign(null) }}>Cancel</Button>
                    </div>
                  </form>
                  {/* Live Email Preview */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 font-semibold text-lg">Live Email Preview</div>
                    <div className="rounded-lg border bg-gray-50 dark:bg-zinc-800 p-6 shadow-inner max-h-[60vh] overflow-auto">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full bg-blue-200 dark:bg-blue-900 w-10 h-10 flex items-center justify-center font-bold text-lg text-blue-900 dark:text-blue-100">
                          {form.name?.[0] || "E"}
                        </div>
                        <div>
                          <div className="font-semibold text-base text-gray-900 dark:text-gray-100">From: <span className="text-gray-700 dark:text-gray-300">Your Campaign</span></div>
                          <div className="text-xs text-gray-500">To: [Recipient]</div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="block text-lg font-bold text-gray-900 dark:text-gray-100">{form.name || "(No Subject)"}</span>
                      </div>
                      <HtmlPreview html={form.html_content || ""} />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                    <Button type="button" variant="outline" onClick={() => { setShowAIForm(false); setAIError(""); setAIRequirements(""); }} disabled={aiLoading}>Cancel</Button>
                  </form>
                  {templateLoading && <div className="text-blue-500 mt-2">Generating template...</div>}
                  {templateError && <div className="text-red-500 mt-2">{templateError}</div>}
                </CardContent>
              </Card>
            )}
            <Dialog open={aiDialogOpen} onOpenChange={setAIDialogOpen}>
              <DialogTrigger asChild>
              
              </DialogTrigger>
              <DialogContent className="max-w-3xl w-full">
                <DialogHeader>
                  <DialogTitle>Edit Template Design with AI</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* AI Prompt Form */}
                  <form className="flex-1 min-w-0" onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editId) return;
                    setAILoading(true);
                    setAIError("");
                    try {
                      const result = await dispatch(handleGenerateTemplate({
                        id: editId,
                        ui_change_context: aiDesignContext,
                        isDesignEdit: true,
                      }));
                      if (result && result.payload && result.meta && result.meta.requestStatus === "fulfilled" && result.payload.id) {
                        toast({ variant: "success", title: "Template design updated!", description: "Your template design was updated successfully." });
                        setAIDesignContext("");
                        dispatch(handleFetchTemplates());
                      } else {
                        setAIError(result.payload?.error || "AI could not update the template design.");
                      }
                    } catch (err) {
                      setAIError(err?.message || "An error occurred while updating the template design.");
                    } finally {
                      setAILoading(false);
                    }
                  }}>
                    <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-blue-900 text-sm">
                      <b>Note:</b> This prompt is for <b>design changes only</b> (e.g., layout, colors, fonts). <br />
                      <span className="text-blue-700">It will not change the content or words of your template.</span>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Design Context / Prompt</label>
                      <textarea
                        name="ui_change_context"
                        placeholder="Describe the design changes you want (e.g., colors, layout, fonts, etc.)"
                        className="border rounded p-2 min-h-[80px] w-full"
                        value={aiDesignContext}
                        onChange={e => setAIDesignContext(e.target.value)}
                        required
                        disabled={aiLoading}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button type="submit" disabled={aiLoading}>{aiLoading ? "Updating..." : "Update Design with AI"}</Button>
                      <Button type="button" variant="outline" onClick={() => { setAIDialogOpen(false); setAIError(""); setAIDesignContext("") }} disabled={aiLoading}>Cancel</Button>
                    </div>
                    {aiError && <div className="text-red-500 text-sm mt-2">{aiError}</div>}
                  </form>
                  {/* Live Email Preview */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 font-semibold text-lg">Live Email Preview</div>
                    <div className="rounded-lg border bg-gray-50 dark:bg-zinc-800 p-6 shadow-inner">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full bg-blue-200 dark:bg-blue-900 w-10 h-10 flex items-center justify-center font-bold text-lg text-blue-900 dark:text-blue-100">
                          {form.name?.[0] || "E"}
                        </div>
                        <div>
                          <div className="font-semibold text-base text-gray-900 dark:text-gray-100">From: <span className="text-gray-700 dark:text-gray-300">Your Campaign</span></div>
                          <div className="text-xs text-gray-500">To: [Recipient]</div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="block text-lg font-bold text-gray-900 dark:text-gray-100">{form.name || "(No Subject)"}</span>
                      </div>
                      <HtmlPreview html={templates.find(t => t.id === editId)?.html_content || form.html_content || ""} />
                    </div>
                  </div>
                </div>
                {templateLoading && <div className="text-blue-500 mt-2">Updating template design...</div>}
                {templateError && <div className="text-red-500 mt-2">{templateError}</div>}
              </DialogContent>
            </Dialog>
            <div className="divide-y">
              {paginatedTemplates.map((tpl) => (
                <Card 
                  key={tpl.id} 
                  className="rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleView(tpl.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="hover:text-primary transition-colors">{tpl.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(tpl.id)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleEdit(e, tpl)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(tpl.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); setAIDialogOpen(true); setEditId(tpl.id); setForm({ name: tpl.name, html_content: tpl.html_content }); setSelectedCampaign(tpl.campaign || null); }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit with AI
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { }}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  {/* Removed HTML content from list view */}
                </Card>
              ))}
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedTemplates.length} of {filtered.length} templates
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="text-xs">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}