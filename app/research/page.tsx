"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import type { AppDispatch, RootState } from "@/store/store"
import { handleFetchResearchList } from "@/store/actions/researchActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import MailLoader from "@/components/MailLoader"
import { Search, CheckCircle2, Clock, AlertCircle, Eye, ExternalLink } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PAGE_SIZE = 10

export default function ResearchPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { researchResults, isLoading, pagination } = useSelector(
    (state: RootState) => state.research
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<"all" | "processing" | "completed" | "failed">("all")
  const [contactTypeFilter, setContactTypeFilter] = useState<"all" | "emaillist" | "company">("all")

  const fetchResearch = useCallback(async () => {
    const params = {
      page: currentPage,
      page_size: PAGE_SIZE,
      ...(searchQuery && { search: searchQuery }),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(contactTypeFilter !== "all" && { contact_type: contactTypeFilter }),
      ordering: "-created_at",
    }
    await dispatch(handleFetchResearchList(params) as any)
  }, [dispatch, currentPage, searchQuery, statusFilter, contactTypeFilter])

  useEffect(() => {
    fetchResearch()
  }, [fetchResearch])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "processing":
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDetailPageUrl = (contactType: string, contactId: number) => {
    if (contactType === "emaillist") {
      return `/emails/${contactId}`
    } else if (contactType === "company") {
      return `/companies/${contactId}`
    }
    return "#"
  }

  const handleContactNameClick = (contactType: string, contactId: number) => {
    const url = getDetailPageUrl(contactType, contactId)
    router.push(url)
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Research Results</h1>
          <p className="text-muted-foreground">
            View personalized research and generated emails for contacts and companies
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by contact name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={statusFilter}
              onValueChange={(value: any) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={contactTypeFilter}
              onValueChange={(value: any) => {
                setContactTypeFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="emaillist">Email List</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results List */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <MailLoader />
          </div>
        ) : researchResults.length > 0 ? (
          <>
            <div className="space-y-4">
              {researchResults.map((research) => (
                <Card key={research.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(research.status)}
                            <h3
                              className="text-lg font-semibold cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                              onClick={() =>
                                handleContactNameClick(research.contact_type, research.contact_id)
                              }
                            >
                              {research.contact_name}
                            </h3>
                            {getStatusBadge(research.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{research.contact_email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2">
                            {research.contact_type === "emaillist" ? "Contact" : "Company"}
                          </Badge>
                        </div>
                      </div>

                      {/* Career Field */}
                      {research.career_field && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Field:</strong> {research.career_field}
                        </div>
                      )}

                      {/* Error Message */}
                      {research.error_message && (
                        <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Error:</strong> {research.error_message}
                          </p>
                        </div>
                      )}

                      {/* Research Summary - if completed */}
                      {research.status === "completed" && research.research_summary && (
                        <Tabs defaultValue="summary" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="email">Generated Email</TabsTrigger>
                          </TabsList>

                          <TabsContent value="summary" className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">BACKGROUND</p>
                              <ul className="text-sm space-y-1 mt-1">
                                {research.research_summary.professional_background?.map(
                                  (item, idx) => (
                                    <li key={idx} className="text-muted-foreground">
                                      • {item}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>

                            {research.research_summary.recent_achievements && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground">ACHIEVEMENTS</p>
                                <ul className="text-sm space-y-1 mt-1">
                                  {research.research_summary.recent_achievements.map(
                                    (item, idx) => (
                                      <li key={idx} className="text-muted-foreground">
                                        • {item}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {research.research_summary.industry_focus && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground">FOCUS</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {research.research_summary.industry_focus}
                                </p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="email" className="space-y-3">
                            {research.generated_email && (
                              <>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground">SUBJECT</p>
                                  <p className="text-sm mt-1">{research.generated_email.subject}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground">BODY</p>
                                  <p className="text-sm mt-1 whitespace-pre-wrap">
                                    {research.generated_email.body}
                                  </p>
                                </div>
                              </>
                            )}
                          </TabsContent>
                        </Tabs>
                      )}

                      {/* Footer - Timestamps */}
                      <div className="flex flex-col sm:flex-row gap-4 text-xs text-muted-foreground border-t pt-4">
                        <div>
                          <span className="font-semibold">Created:</span> {formatDate(research.created_at)}
                        </div>
                        {research.completed_at && (
                          <div>
                            <span className="font-semibold">Completed:</span>{" "}
                            {formatDate(research.completed_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, pagination.count)} of {pagination.count}{" "}
                  research results
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={
                          currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                      const isNearCurrent = Math.abs(page - currentPage) <= 1
                      const isFirstOrLast = page === 1 || page === pagination.totalPages

                      if (!isNearCurrent && !isFirstOrLast) {
                        if (page === 2 && currentPage > 3) return <PaginationEllipsis key={page} />
                        if (page === pagination.totalPages - 1 && currentPage < pagination.totalPages - 2)
                          return <PaginationEllipsis key={page} />
                        return null
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, pagination.totalPages)
                          )
                        }
                        className={
                          currentPage >= pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-dashed gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg">No research yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start researching contacts or companies to generate personalized emails.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
