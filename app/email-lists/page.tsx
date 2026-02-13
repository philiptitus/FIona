"use client"

import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Eye, Loader2, Mail, User } from "lucide-react"
import type { RootState, AppDispatch } from "@/store/store"
import { fetchContactLists, fetchContactListDetails } from "@/store/actions/contactListActions"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useBulkResearch } from "@/components/research/useBulkResearch"
import { BulkResearchFloatingBar } from "@/components/research/BulkResearchFloatingBar"
import { BulkResearchConfirmationModal } from "@/components/research/BulkResearchConfirmationModal"
import type { Email } from "@/store/slices/contactListSlice"

export default function EmailListsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  
  // Bulk research hook
  const bulkResearch = useBulkResearch("emaillist")
  
  const { lists, currentList, isLoading } = useSelector((state: RootState) => state.contactList)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Fetch contact lists on mount
  useEffect(() => {
    dispatch(fetchContactLists())
  }, [dispatch])

  // Fetch list details when a list is selected
  useEffect(() => {
    if (selectedListId) {
      dispatch(fetchContactListDetails(selectedListId))
    }
  }, [dispatch, selectedListId])

  // Get emails from current list
  const emails = currentList?.emails || []

  // Filter emails based on search
  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) return emails
    const query = searchQuery.toLowerCase()
    return emails.filter((email: Email) => 
      email.email.toLowerCase().includes(query) ||
      email.first_name?.toLowerCase().includes(query) ||
      email.last_name?.toLowerCase().includes(query) ||
      email.organization_name?.toLowerCase().includes(query)
    )
  }, [emails, searchQuery])

  // Paginate emails
  const paginatedEmails = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredEmails.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredEmails, currentPage])

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage)

  // Get contact names for selected emails
  const selectedContactNames = useMemo(() => {
    return bulkResearch.selectedIds.map(id => {
      const email = emails.find((e: Email) => e.id === id)
      const name = email?.first_name && email?.last_name 
        ? `${email.first_name} ${email.last_name}`
        : email?.email || "Unknown"
      return { id, name }
    })
  }, [bulkResearch.selectedIds, emails])

  // Handle select all on current page
  const handleSelectAllOnPage = (checked: boolean) => {
    const pageIds = paginatedEmails.map((e: Email) => e.id)
    if (checked) {
      bulkResearch.handleSelectAll(pageIds)
    } else {
      bulkResearch.handleDeselectAll(pageIds)
    }
  }

  // Check if all on page are selected
  const allOnPageSelected = useMemo(() => {
    if (paginatedEmails.length === 0) return false
    return paginatedEmails.every((e: Email) => bulkResearch.isSelected(e.id))
  }, [paginatedEmails, bulkResearch.selectedIds])

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
            <h1 className="text-3xl font-bold tracking-tight">Email Lists</h1>
            <p className="text-muted-foreground">Select contacts to generate personalized research</p>
          </div>
        </div>

        {/* List Selector and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="list-filter">Select Contact List</Label>
                <select
                  id="list-filter"
                  className="w-full border rounded px-3 py-2 mt-2"
                  value={selectedListId || ""}
                  onChange={e => {
                    setSelectedListId(e.target.value ? Number(e.target.value) : null)
                    setCurrentPage(1)
                    bulkResearch.handleClearSelection()
                  }}
                >
                  <option value="">Choose a list...</option>
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({list.email_count} contacts)
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-9 h-4 w-4 text-muted-foreground" />
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  type="search"
                  placeholder="Search by name or email..."
                  className="pl-8 mt-2 w-full"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  disabled={!selectedListId}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email List */}
        {!selectedListId ? (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Select a contact list to view and research contacts</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : paginatedEmails.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No contacts match your search" : "No contacts in this list"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Checkbox
                checked={allOnPageSelected}
                onCheckedChange={handleSelectAllOnPage}
                id="select-all"
              />
              <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select all on this page ({paginatedEmails.length})
              </Label>
              {bulkResearch.selectedCount > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {bulkResearch.selectedCount} selected
                </span>
              )}
            </div>

            {/* Email Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedEmails.map((email: Email) => (
                <Card key={email.id} className="relative hover:shadow-lg transition-shadow">
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={bulkResearch.isSelected(email.id)}
                      onCheckedChange={() => bulkResearch.handleToggle(email.id)}
                      className="bg-background border-2"
                    />
                  </div>

                  <CardHeader className="pb-3 pl-12">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {email.first_name && email.last_name
                        ? `${email.first_name} ${email.last_name}`
                        : "No Name"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{email.email}</span>
                    </div>
                    {email.organization_name && (
                      <Badge variant="secondary" className="text-xs">
                        {email.organization_name}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedEmails.length} of {filteredEmails.length} contacts
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-xs">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}
