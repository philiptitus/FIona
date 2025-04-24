"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, MoreHorizontal, Plus, Search, Copy, Eye } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { RootState, AppDispatch } from "@/store/store"
import { handleFetchContents, handleCreateContent, handleUpdateContent, handleDeleteContent, handleGenerateContent } from "@/store/actions/contentActions"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ContentForm {
  name: string
  content: string
}

export default function ContentPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { contents, isLoading: contentLoading, error: contentError } = useSelector((state: RootState) => state.content)
  const { campaigns } = useSelector((state: RootState) => state.campaigns)
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ContentForm>({ name: "", content: "" })
  const [editId, setEditId] = useState<number | null>(null)
  const [filtered, setFiltered] = useState(contents)
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)
  const [showAIForm, setShowAIForm] = useState(false)
  const [aiContext, setAIContext] = useState("")
  const [aiTone, setAITone] = useState("professional")
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState("")
  const [aiDialogOpen, setAIDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    dispatch({ type: "campaigns/fetchCampaignsStart" })
    dispatch(handleFetchContents())
  }, [dispatch])

  useEffect(() => {
    setFiltered(
      contents.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [contents, searchQuery])

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
      await dispatch(handleUpdateContent({ id: editId, contentData: { ...form, campaign: selectedCampaign } }))
    } else {
      await dispatch(handleCreateContent({ ...form, campaign: selectedCampaign }))
    }
    setShowForm(false)
    setEditId(null)
    setForm({ name: "", content: "" })
    setSelectedCampaign(null)
    dispatch(handleFetchContents())
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({ name: item.name, content: item.content })
    setShowForm(true)
    setSelectedCampaign(item.campaign || null)
  }

  const handleDelete = async (id: number) => {
    await dispatch(handleDeleteContent(id))
    dispatch(handleFetchContents())
  }

  const handleView = (contentId: number) => {
    router.push(`/content/${contentId}`)
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
      const result = await dispatch(handleGenerateContent({
        campaignId: selectedCampaign,
        context: aiContext,
        tone: aiTone,
      }))
      if (result && result.payload && result.meta && result.meta.requestStatus === "fulfilled" && result.payload.id) {
        toast({ variant: "success", title: "Content generated!", description: "Your content was created successfully." })
        setShowAIForm(false)
        setShowForm(false)
        setEditId(null)
        setForm({ name: result.payload.name || "", content: result.payload.content || "" })
        setSelectedCampaign(null)
        setAIContext("")
        setAITone("professional")
        // Open the generated content page
        router.push(`/content/${result.payload.id}`)
      } else {
        toast({ variant: "destructive", title: "Generation failed", description: result.payload?.error || "AI could not generate the content." })
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Generation error", description: err?.message || "An error occurred while generating the content." })
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
      const result = await dispatch(handleGenerateContent({
        campaignId: selectedCampaign,
        context: aiContext,
        tone: aiTone,
      }))
      if (result && result.payload && result.meta && result.meta.requestStatus === "fulfilled" && result.payload.id) {
        toast({ variant: "success", title: "Content updated!", description: "Your content was updated successfully." })
        setAIDialogOpen(false)
        setAIError("")
        setAIContext("")
        setAITone("professional")
        setForm({ name: result.payload.name || "", content: result.payload.content || "" })
        setSelectedCampaign(null)
        dispatch(handleFetchContents())
      } else {
        toast({ variant: "destructive", title: "Generation failed", description: result.payload?.error || "AI could not generate the content." })
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Generation error", description: err?.message || "An error occurred while generating the content." })
    } finally {
      setAILoading(false)
    }
  }

  // Pagination and sorting logic
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const sortedContents = [...filtered].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
  const totalPages = Math.ceil(sortedContents.length / itemsPerPage)
  const paginatedContents = sortedContents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => { setCurrentPage(1) }, [filtered])

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content</h1>
            <p className="text-muted-foreground">Manage your email content blocks</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", content: "" }); setSelectedCampaign(null) }}>
            <Plus className="mr-2 h-4 w-4" /> New Content
          </Button>
          <Button variant="secondary" onClick={() => { setShowAIForm(true); setShowForm(false); setEditId(null); setForm({ name: "", content: "" }); setSelectedCampaign(null) }}>
            🤖 Create with AI
          </Button>
        </div>
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Content</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search content..."
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
                  <CardTitle>{editId ? "Edit Content" : "Create Content"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Content Name</label>
                      <Input name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Content</label>
                      <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        className="border rounded p-2 min-h-[120px]"
                        required
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
                    <div className="flex gap-2">
                      <Button type="submit">{editId ? "Update" : "Create"} Content</Button>
                      <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); setForm({ name: "", content: "" }); setSelectedCampaign(null) }}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            {showAIForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Generate Content with AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAICreate} className="flex flex-col gap-4">
                    <Input
                      name="name"
                      placeholder="Content Name (optional)"
                      value={form.name}
                      onChange={handleChange}
                      disabled={aiLoading}
                    />
                    <div>
                      <label className="block mb-1 font-medium">Context / Prompt</label>
                      <textarea
                        name="context"
                        placeholder="Describe what you want the content to be about..."
                        className="border rounded p-2 min-h-[80px] w-full"
                        value={aiContext}
                        onChange={e => setAIContext(e.target.value)}
                        required
                        disabled={aiLoading}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Tone</label>
                      <select
                        className="border rounded p-2 w-full"
                        value={aiTone}
                        onChange={e => setAITone(e.target.value)}
                        disabled={aiLoading}
                      >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="casual">Casual</option>
                        <option value="urgent">Urgent</option>
                        <option value="informative">Informative</option>
                      </select>
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
                    <Button type="button" variant="outline" onClick={() => { setShowAIForm(false); setAIError(""); setAIContext(""); setAITone("professional") }} disabled={aiLoading}>Cancel</Button>
                  </form>
                  {contentLoading && <div className="text-blue-500 mt-2">Generating content...</div>}
                  {contentError && <div className="text-red-500 mt-2">{contentError}</div>}
                </CardContent>
              </Card>
            )}
            <Dialog open={aiDialogOpen} onOpenChange={setAIDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" onClick={() => { setShowAIForm(false); setShowForm(false); setEditId(null); setForm({ name: "", content: "" }); setSelectedCampaign(null); setAIDialogOpen(true) }}>🤖 Edit with AI</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                  <DialogTitle>Edit Content with AI</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAIEdit} className="flex flex-col gap-4">
                  <Input
                    name="name"
                    placeholder="Content Name (optional)"
                    value={form.name}
                    onChange={handleChange}
                    disabled={aiLoading}
                  />
                  <div>
                    <label className="block mb-1 font-medium">Context / Prompt</label>
                    <textarea
                      name="context"
                      placeholder="Describe how you want to update this content..."
                      className="border rounded p-2 min-h-[80px] w-full"
                      value={aiContext}
                      onChange={e => setAIContext(e.target.value)}
                      required
                      disabled={aiLoading}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Tone</label>
                    <select
                      className="border rounded p-2 w-full"
                      value={aiTone}
                      onChange={e => setAITone(e.target.value)}
                      disabled={aiLoading}
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="urgent">Urgent</option>
                      <option value="informative">Informative</option>
                    </select>
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
                    <Button type="button" variant="outline" onClick={() => { setAIDialogOpen(false); setAIError(""); setAIContext(""); setAITone("professional") }} disabled={aiLoading}>Cancel</Button>
                  </DialogFooter>
                </form>
                {contentLoading && <div className="text-blue-500 mt-2">Generating content...</div>}
                {contentError && <div className="text-red-500 mt-2">{contentError}</div>}
              </DialogContent>
            </Dialog>
            <div className="divide-y">
              {contentLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 animate-pulse">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading content...</p>
                </div>
              ) : contentError ? (
                <div className="col-span-full text-center text-red-500 py-8">Error: {contentError}</div>
              ) : paginatedContents.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground">No content found.</div>
              ) : (
                paginatedContents.map((item) => (
                  <Card
                    key={item.id}
                    className="rounded-lg border bg-card shadow-sm hover:scale-[1.01] transition-all group cursor-pointer"
                    onClick={() => handleView(item.id)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="truncate max-w-[60%]" title={item.name}>{item.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-70 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(item.id)}>
                            <Copy className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleEdit(item); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); setAIDialogOpen(true); setEditId(item.id); setForm({ name: item.name, content: item.content }); setSelectedCampaign(item.campaign || null); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit with AI
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDelete(item.id); }} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className="text-muted-foreground text-xs truncate max-w-full" title={item.content}>
                        {item.content || "No content"}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedContents.length} of {filtered.length} filtered content items (Total: {contents.length})
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
