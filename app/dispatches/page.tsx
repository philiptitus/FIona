"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, MoreHorizontal, Plus, Search, Send } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import type { RootState, AppDispatch } from "@/store/store"
import { handleFetchDispatches, handleCreateDispatch, handleSendDispatch, handleVerifyDispatch } from "@/store/actions/dispatchActions"
import { safeValue } from "./safeValue"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { handleFetchMailboxes } from "@/store/actions/mailboxActions"

interface DispatchForm {
  campaign: number | null
}

interface Campaign {
  id: number
  name: string
}

interface Template {
  id: number
  name: string
}

interface Content {
  id: number
  name: string
}

export default function DispatchesPage() {
  const dispatch = useDispatch<AppDispatch>()
  // NOTE: The correct key is 'dispatch' not 'dispatches' in the Redux store
  const { dispatches, isLoading, error } = useSelector((state: RootState) => state.dispatch)
  const { campaigns } = useSelector((state: RootState) => state.campaigns)
  const { templates } = useSelector((state: RootState) => state.template)
  const { contents } = useSelector((state: RootState) => state.content)
  const { mailboxes, isLoading: isMailboxesLoading } = useSelector((state: RootState) => state.mailbox)
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<DispatchForm>({ campaign: null })
  const [filtered, setFiltered] = useState(dispatches)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [sendDispatchId, setSendDispatchId] = useState<number | null>(null)
  const [selectedMailbox, setSelectedMailbox] = useState<number | null>(null)
  const [selectedType, setSelectedType] = useState<"content" | "template" | "">("")
  const [sendError, setSendError] = useState("")

  useEffect(() => {
    dispatch(handleFetchDispatches())
  }, [dispatch])

  useEffect(() => {
    setFiltered(
      dispatches.filter(item =>
        String(item.campaign).includes(searchQuery)
      )
    )
  }, [dispatches, searchQuery])

  useEffect(() => {
    if (sendModalOpen) {
      dispatch(handleFetchMailboxes())
    }
  }, [sendModalOpen, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.campaign) {
      await dispatch(handleCreateDispatch(Number(form.campaign)))
      setShowForm(false)
      setForm({ campaign: null })
      dispatch(handleFetchDispatches())
    }
  }

  const openSendModal = (id: number) => {
    setSendDispatchId(id)
    setSendModalOpen(true)
    setSelectedMailbox(null)
    setSelectedType("")
    setSendError("")
  }

  const closeSendModal = () => {
    setSendModalOpen(false)
    setSendDispatchId(null)
    setSelectedMailbox(null)
    setSelectedType("")
    setSendError("")
  }

  const handleSendModal = async () => {
    if (!sendDispatchId || !selectedMailbox || !selectedType) {
      setSendError("Please select a mailbox and type.")
      return
    }
    setSendError("")
    const result = await dispatch(handleSendDispatch(sendDispatchId, selectedMailbox, selectedType) as any)
    if (result && result.success >= 0) {
      closeSendModal()
      dispatch(handleFetchDispatches())
    } else {
      setSendError(result?.error || "Failed to send dispatch.")
    }
  }

  const handleVerify = async (id: number) => {
    await dispatch(handleVerifyDispatch(id))
    dispatch(handleFetchDispatches())
  }

  // Pagination and sorting logic
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const sortedDispatches = [...filtered].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
  const totalPages = Math.ceil(sortedDispatches.length / itemsPerPage)
  const paginatedDispatches = sortedDispatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => { setCurrentPage(1) }, [filtered])

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatches</h1>
            <p className="text-muted-foreground">Manage and send your campaign dispatches</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Dispatch
          </Button>
        </div>
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Dispatches</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by campaign..."
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
                  <CardTitle>Create Dispatch</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                      name="campaign"
                      placeholder="Campaign"
                      value={form.campaign || ""}
                      onChange={handleChange}
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Create</Button>
                      <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm({ campaign: null }) }}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            <div className="divide-y">
              {paginatedDispatches.map((item: any) => {
                // Support both object and ID for campaign, template, content
                const campaignObj = item.campaign && typeof item.campaign === "object" ? item.campaign : null;
                const templateObj = item.template && typeof item.template === "object" ? item.template : null;
                const contentObj = item.content && typeof item.content === "object" ? item.content : null;
                const campaignId = campaignObj ? campaignObj.id : item.campaign;
                const templateId = templateObj ? templateObj.id : item.template;
                const contentId = contentObj ? contentObj.id : item.content;
                const campaign = campaignObj || campaigns.find((c: any) => c.id === campaignId);
                const template = templateObj || templates.find((t: any) => t.id === templateId);
                const content = contentObj || contents.find((c: any) => c.id === contentId);
                return (
                  <Card key={item.id} className="rounded-lg border bg-card shadow-sm hover:scale-102 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>
                        {campaign ? (
                          <Link href={`/campaigns/${safeValue(campaign.id)}`} className="text-primary underline hover:text-primary/80">
                            {safeValue(campaign, `Campaign #${safeValue(item.campaign)}`)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Campaign {safeValue(item.campaign)}</span>
                        )}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openSendModal(item.id)}>
                            <Send className="mr-2 h-4 w-4" /> Send
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerify(item.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Verify
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none space-y-2">
                        <div>
                          <span className="font-medium">Template:</span>{' '}
                          {template ? (
                            <Link href={`/templates/${template.id}`} className="text-primary underline hover:text-primary/80">
                              {template.name || `Template #${template.id}`}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Content:</span>{' '}
                          {content ? (
                            <Link href={`/content/${content.id}`} className="text-primary underline hover:text-primary/80">
                              {content.name || `Content #${content.id}`}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {item.is_verified ? <span className="text-green-600">Verified</span> : <span className="text-yellow-600">Pending</span>}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {format(new Date(item.created_at), "PPpp")}
                        </div>
                        <div>
                          <span className="font-medium">Last Updated:</span> {format(new Date(item.updated_at), "PPpp")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedDispatches.length} of {filtered.length} filtered dispatches (Total: {dispatches.length})
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                <span className="text-xs">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next</Button>
              </div>
            </div>
            {/* Modal for sending dispatch */}
            <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Dispatch</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Select Mailbox</label>
                    {isMailboxesLoading ? (
                      <div>Loading mailboxes...</div>
                    ) : (
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={selectedMailbox || ""}
                        onChange={e => setSelectedMailbox(Number(e.target.value))}
                      >
                        <option value="">Select mailbox...</option>
                        {mailboxes.map((mb: any) => (
                          <option key={mb.id} value={mb.id}>{mb.email} ({mb.provider})</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Type</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={selectedType}
                      onChange={e => setSelectedType(e.target.value as "content" | "template")}
                    >
                      <option value="">Select type...</option>
                      <option value="content">Content (plain text)</option>
                      <option value="template">Template (HTML)</option>
                    </select>
                  </div>
                  {sendError && <div className="text-red-600 text-sm">{sendError}</div>}
                </div>
                <DialogFooter>
                  <Button onClick={handleSendModal}>Send</Button>
                  <Button variant="outline" onClick={closeSendModal}>Cancel</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
