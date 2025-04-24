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
import type { RootState, AppDispatch } from "@/store/store"
import { handleFetchEmails, handleCreateEmail, handleUpdateEmail, handleDeleteEmail } from "@/store/actions/emailActions"

interface EmailForm {
  organization_name: string
  email: string
  context?: string
}

export default function EmailsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { emails, isLoading, error } = useSelector((state: RootState) => state.emails)
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<EmailForm>({ organization_name: "", email: "", context: "" })
  const [editId, setEditId] = useState<number | null>(null)
  const [filtered, setFiltered] = useState(emails)

  useEffect(() => {
    dispatch(handleFetchEmails())
  }, [dispatch])

  useEffect(() => {
    setFiltered(
      emails.filter(email =>
        email.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }, [emails, searchQuery])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) {
      await dispatch(handleUpdateEmail({ id: editId, emailData: form }))
    } else {
      await dispatch(handleCreateEmail({ ...form, campaign: 1 })) // TODO: Use real campaign
    }
    setShowForm(false)
    setEditId(null)
    setForm({ organization_name: "", email: "", context: "" })
    dispatch(handleFetchEmails())
  }

  const handleEdit = (email: any) => {
    setEditId(email.id)
    setForm({ organization_name: email.organization_name, email: email.email, context: email.context || "" })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    await dispatch(handleDeleteEmail(id))
    dispatch(handleFetchEmails())
  }

  const handleView = (emailId: number) => {
    router.push(`/emails/${emailId}`)
  }

  // Pagination and sorting logic
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const sortedEmails = [...filtered].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
  const totalPages = Math.ceil(sortedEmails.length / itemsPerPage)
  const paginatedEmails = sortedEmails.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => { setCurrentPage(1) }, [filtered])

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
            <p className="text-muted-foreground">Manage your emails and view metrics</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ organization_name: "", email: "", context: "" }) }}>
            <Plus className="mr-2 h-4 w-4" /> New Email
          </Button>
        </div>
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Emails</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search emails..."
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
                  <CardTitle>{editId ? "Edit Email" : "Create Email"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                      name="organization_name"
                      placeholder="Organization Name"
                      value={form.organization_name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      name="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      name="context"
                      placeholder="Context (optional)"
                      value={form.context}
                      onChange={handleChange}
                    />
                    <div className="flex gap-2">
                      <Button type="submit">{editId ? "Update" : "Create"}</Button>
                      <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); setForm({ organization_name: "", email: "", context: "" }) }}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            <div className="divide-y">
              {paginatedEmails.map((email) => (
                <Card key={email.id} className="rounded-lg border bg-card shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="truncate max-w-[60%]" title={email.organization_name}>{email.organization_name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(email.id)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(email)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(email.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground text-xs truncate max-w-full" title={email.email}>{email.email}</div>
                    <div className="text-muted-foreground text-xs truncate max-w-full" title={email.context}>{email.context || "No context"}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedEmails.length} of {filtered.length} filtered emails (Total: {emails.length})
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
