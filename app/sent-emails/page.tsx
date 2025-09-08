"use client"
import React from "react";
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { handleFetchSentEmails } from "@/store/actions/sentEmailActions"
import type { RootState, AppDispatch } from "@/store/store"
import { useDebounce } from "@/hooks/use-debounce"
import MainLayout from "@/components/layout/main-layout"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, XCircle, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import EmailDetailModal from "./EmailDetailModal";
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

export default function SentEmailsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const sentEmails = useSelector((state: RootState) => state.sentEmail.list.items) || [];
  const isLoading = useSelector((state: RootState) => state.sentEmail.list.isLoading)
  const pagination = useSelector((state: RootState) => state.sentEmail.list.pagination)
  const filters = useSelector((state: RootState) => state.sentEmail.list.filters)

  const [selectedEmailId, setSelectedEmailId] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Handle initial load, search, and pagination
  useEffect(() => {
    const currentFilters: Record<string, any> = { ...filters };
    if (debouncedSearchQuery) {
      currentFilters.search = debouncedSearchQuery;
    }
    dispatch(handleFetchSentEmails(currentFilters));
  }, [dispatch, debouncedSearchQuery, filters.page, filters.page_size])

  const handleEmailClick = (id: number) => {
    setSelectedEmailId(id);
    setModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-10 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Sent Emails</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input 
              className="w-full sm:w-80" 
              placeholder="Search by subject or recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={filters.status || null}
                  onValueChange={(value) => dispatch({ 
                    type: 'sentEmail/setSentEmailFilters', 
                    payload: { ...filters, status: value } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_html">Email Type</Label>
                <Select 
                  value={filters.is_html === undefined ? null : (filters.is_html ? "html" : "plain")}
                  onValueChange={(value) => dispatch({ 
                    type: 'sentEmail/setSentEmailFilters', 
                    payload: { 
                      ...filters, 
                      is_html: value === null ? undefined : (value === "html")
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Types</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="plain">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="from-date" className="text-xs">From</Label>
                    <input
                      id="from-date"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={filters.sent_at_after || ""}
                      onChange={(e) => dispatch({ 
                        type: 'sentEmail/setSentEmailFilters', 
                        payload: { 
                          ...filters, 
                          sent_at_after: e.target.value 
                        } 
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="to-date" className="text-xs">To</Label>
                    <input
                      id="to-date"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={filters.sent_at_before || ""}
                      onChange={(e) => dispatch({ 
                        type: 'sentEmail/setSentEmailFilters', 
                        payload: { 
                          ...filters, 
                          sent_at_before: e.target.value 
                        } 
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <input
                  id="recipient"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Filter by recipient"
                  value={filters.recipient || ""}
                  onChange={(e) => dispatch({ 
                    type: 'sentEmail/setSentEmailFilters', 
                    payload: { ...filters, recipient: e.target.value } 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <input
                  id="subject"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Filter by subject"
                  value={filters.subject || ""}
                  onChange={(e) => dispatch({ 
                    type: 'sentEmail/setSentEmailFilters', 
                    payload: { ...filters, subject: e.target.value } 
                  })}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  dispatch({ type: 'sentEmail/resetFilters' });
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    dispatch(handleFetchSentEmails(filters));
                    setShowFilters(false);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden border">
          <div className="divide-y divide-muted-foreground/10">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="rounded-full w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))
            ) : sentEmails && sentEmails.length > 0 ? (
              sentEmails.map((email: any) => (
                <button
                  key={email.id}
                  onClick={() => handleEmailClick(email.id)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/60 transition group w-full text-left focus:outline-none"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex-shrink-0">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900 w-10 h-10 flex items-center justify-center font-bold text-lg text-blue-900 dark:text-blue-100">
                      {email.recipient[0]?.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base truncate text-gray-900 dark:text-gray-100 group-hover:text-primary">
                        {email.subject}
                      </span>
                      {email.is_html && <Badge variant="outline" className="ml-2">HTML</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      To: {email.recipient}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                    <span className="text-xs text-muted-foreground">{formatDate(email.sent_at)}</span>
                    {email.status === "sent" ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1" variant="outline">
                        <CheckCircle className="w-4 h-4" /> Sent
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1" variant="outline">
                        <XCircle className="w-4 h-4" /> Failed
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
                <Mail className="w-12 h-12 text-muted-foreground mb-2" />
                <h2 className="text-xl font-semibold text-muted-foreground">No sent emails yet</h2>
                <p className="text-muted-foreground">You haven&apos;t sent any emails. Once you do, they will appear here.</p>
                <Button asChild variant="default" className="mt-2">
                  <Link href="/campaigns/new">Send Your First Campaign</Link>
                </Button>
                {/* Debug: show raw data if present but not rendering */}
                {sentEmails && Array.isArray(sentEmails) && sentEmails.length === 0 ? (
                  <pre className="text-xs text-left mt-4 bg-zinc-100 dark:bg-zinc-800 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(sentEmails, null, 2)}</pre>
                ) : null}
              </div>
            )}
          </div>
          {/* Pagination controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
            <span className="text-xs text-muted-foreground">
              {isLoading 
                ? "Loading..." 
                : sentEmails.length > 0 
                  ? `Showing ${((pagination.currentPage - 1) * pagination.pageSize) + 1}–${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of ${pagination.totalItems}` 
                  : "No results"}
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => dispatch(handleFetchSentEmails({ ...filters, page: pagination.currentPage - 1 }))}
                disabled={pagination.currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = Math.max(1, Math.min(
                    pagination.currentPage - 2 + i,
                    Math.max(1, pagination.totalPages - 4)
                  ));
                  
                  if (i === 0 && pageNum > 1) {
                    return (
                      <React.Fragment key="ellipsis-start">
                        <Button 
                          size="sm" 
                          variant={pagination.currentPage === 1 ? "default" : "ghost"}
                          onClick={() => dispatch(handleFetchSentEmails({ ...filters, page: 1 }))}
                          disabled={isLoading}
                        >
                          1
                        </Button>
                        <span className="px-1">...</span>
                      </React.Fragment>
                    );
                  }
                  
                  if (i === 4 && pageNum < pagination.totalPages - 1) {
                    return (
                      <React.Fragment key="ellipsis-end">
                        <span className="px-1">...</span>
                        <Button 
                          size="sm" 
                          variant={pagination.currentPage === pagination.totalPages ? "default" : "ghost"}
                          onClick={() => dispatch(handleFetchSentEmails({ ...filters, page: pagination.totalPages }))}
                          disabled={isLoading}
                        >
                          {pagination.totalPages}
                        </Button>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <Button 
                      key={pageNum}
                      size="sm" 
                      variant={pagination.currentPage === pageNum ? "default" : "ghost"}
                      onClick={() => dispatch(handleFetchSentEmails({ ...filters, page: pageNum }))}
                      disabled={isLoading || pagination.currentPage === pageNum}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => dispatch(handleFetchSentEmails({ ...filters, page: pagination.currentPage + 1 }))}
                disabled={pagination.currentPage >= pagination.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      <EmailDetailModal open={modalOpen} onOpenChange={setModalOpen} emailId={selectedEmailId} />
    </MainLayout>
  )
} 