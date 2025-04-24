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
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<DispatchForm>({ campaign: null })
  const [filtered, setFiltered] = useState(dispatches)

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

  const handleSend = async (id: number) => {
    await dispatch(handleSendDispatch(id))
    dispatch(handleFetchDispatches())
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
                const campaign = campaigns.find((c: any) => c.id === item.campaign)
                const template = templates.find((t: any) => t.id === item.template)
                const content = contents.find((c: any) => c.id === item.content)
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
                          <DropdownMenuItem onClick={() => handleSend(item.id)}>
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
                            <Link href={`/templates/${safeValue(template.id)}`} className="text-primary underline hover:text-primary/80">
                              {safeValue(template, `Template #${safeValue(item.template)}`)}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Content:</span>{' '}
                          {content ? (
                            <Link href={`/content/${safeValue(content.id)}`} className="text-primary underline hover:text-primary/80">
                              {safeValue(content, `Content #${safeValue(item.content)}`)}
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
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
