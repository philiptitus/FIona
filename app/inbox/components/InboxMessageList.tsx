"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMailboxInbox, fetchAllMailboxesFromCache } from "@/store/actions/mailboxActions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Inbox,
  Search,
  Star,
  Loader2,
  AlertCircle,
  Filter,
  X,
} from "lucide-react"
import { GmailMessage } from "@/store/slices/mailboxSlice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

interface InboxMessageListProps {
  mailboxId: number | null
  onMessageSelect: (messageId: string) => void
  onThreadSelect: (threadId: string) => void
}

const PAGINATION_OPTIONS = [10, 25, 50, 100]

export default function InboxMessageList({
  mailboxId,
  onMessageSelect,
  onThreadSelect,
}: InboxMessageListProps) {
  const dispatch = useAppDispatch()
  const { inbox, isLoading, error, labels, allMailboxesData, isLoadingAllMailboxes, allMailboxesError } = useAppSelector((state) => state.mailbox)
  const [limit, setLimit] = useState(10)
  const [currentPage, setCurrentPage] = useState(1) // For all-mailboxes pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingLabels, setIsLoadingLabels] = useState(false)
  const [allMessages, setAllMessages] = useState<GmailMessage[]>([])
  const [skeletonCount, setSkeletonCount] = useState(0)

  // Filter and Sort states (for All Mailboxes mode)
  const [sortBy, setSortBy] = useState<"date" | "from" | "subject">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [hasAttachments, setHasAttachments] = useState<boolean | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [senderDomain, setSenderDomain] = useState("")
  const [subjectKeyword, setSubjectKeyword] = useState("")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Detect if we're in all-mailboxes mode
  const isAllMailboxesMode = mailboxId === null

  // Get current data source based on mode
  const currentData = isAllMailboxesMode ? allMailboxesData : inbox
  const currentIsLoading = isAllMailboxesMode ? isLoadingAllMailboxes : isLoading
  const currentError = isAllMailboxesMode ? allMailboxesError : error

  useEffect(() => {
    if (mailboxId !== undefined) {
      setAllMessages([])
      setIsLoadingMessages(true)
      setIsLoadingMore(false)
      setSkeletonCount(0)
      setCurrentPage(1)

      if (isAllMailboxesMode) {
        // Fetch all mailboxes from cache with filters
        dispatch(
          fetchAllMailboxesFromCache({
            page: 1,
            limit,
            sort_by: sortBy,
            sort_order: sortOrder,
            unread_only: unreadOnly || undefined,
            has_attachments: hasAttachments,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            sender_domain: senderDomain || undefined,
            subject: subjectKeyword || undefined,
            search: searchQuery || undefined,
          })
        ).then(() => {
          setIsLoadingMessages(false)
        })
      } else if (mailboxId) {
        // Fetch single mailbox inbox
        dispatch(fetchMailboxInbox({ mailboxId, limit, pageToken: undefined })).then(() => {
          setIsLoadingMessages(false)
        })
      }
    }
  }, [dispatch, mailboxId, limit, isAllMailboxesMode, sortBy, sortOrder, unreadOnly, hasAttachments, dateFrom, dateTo, senderDomain, subjectKeyword, searchQuery])

  useEffect(() => {
    // Don't update messages while loading - keep the list cleared until new data arrives
    if (isLoadingMessages) return

    if (isAllMailboxesMode && allMailboxesData?.messages && !isLoadingMore) {
      // For all-mailboxes, transform the response format to match GmailMessage
      const transformedMessages = allMailboxesData.messages.map(msg => ({
        ...msg,
        // Ensure the format matches GmailMessage interface
        payload: undefined, // All-mailboxes API doesn't provide payload
      })) as GmailMessage[]
      setAllMessages(transformedMessages)
    } else if (!isAllMailboxesMode && inbox?.messages && !isLoadingMore) {
      setAllMessages(inbox.messages)
    }
  }, [inbox?.messages, allMailboxesData?.messages, isLoadingMore, isAllMailboxesMode, isLoadingMessages])

  const handleLimitChange = (newLimit: string) => {
    setLimit(parseInt(newLimit))
    setCurrentPage(1)
    setAllMessages([])
  }

  const resetFilters = () => {
    setSortBy("date")
    setSortOrder("desc")
    setUnreadOnly(false)
    setHasAttachments(undefined)
    setDateFrom("")
    setDateTo("")
    setSenderDomain("")
    setSubjectKeyword("")
  }

  const handleLoadMore = () => {
    if (isAllMailboxesMode) {
      // Page-based pagination for all-mailboxes
      if (allMailboxesData?.has_next) {
        setIsLoadingMore(true)
        setSkeletonCount(2)
        const nextPage = currentPage + 1
        dispatch(
          fetchAllMailboxesFromCache({
            page: nextPage,
            limit,
            sort_by: sortBy,
            sort_order: sortOrder,
            unread_only: unreadOnly || undefined,
            has_attachments: hasAttachments,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            sender_domain: senderDomain || undefined,
            subject: subjectKeyword || undefined,
            search: searchQuery || undefined,
          })
        ).then(() => {
          if (allMailboxesData?.messages) {
            setAllMessages((prev) => [
              ...prev,
              ...allMailboxesData.messages.map(msg => ({
                ...msg,
                payload: undefined,
              })),
            ] as GmailMessage[])
          }
          setCurrentPage(nextPage)
          setIsLoadingMore(false)
          setSkeletonCount(0)
        })
      }
    } else {
      // Token-based pagination for single mailbox
      if (inbox?.nextPageToken) {
        setIsLoadingMore(true)
        setSkeletonCount(2)
        dispatch(
          fetchMailboxInbox({
            mailboxId: mailboxId as number,
            limit,
            pageToken: inbox.nextPageToken,
          })
        ).then(() => {
          if (inbox?.messages) {
            setAllMessages((prev) => [...prev, ...inbox.messages])
          }
          setIsLoadingMore(false)
          setSkeletonCount(0)
        })
      }
    }
  }

  const filteredMessages = allMessages.filter((msg) =>
    msg.snippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.from?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (email: string) => {
    const name = email.split("@")[0]
    return name
      .split(/[._-]/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2)
  }

  const getAvatarColor = (email: string): string => {
    const colors = [
      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
      "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
      "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
      "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
      "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
      "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
      "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    ]
    const hash = email
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getMessagePreview = (message: GmailMessage) => {
    return message.snippet || "No preview available"
  }

  const getSubject = (message: GmailMessage) => {
    if (message.subject) {
      return message.subject
    }
    const subjectHeader = message.payload?.headers?.find(
      (h: any) => h.name.toLowerCase() === "subject"
    )
    return subjectHeader?.value || "(No Subject)"
  }

  const hasImportantLabel = (message: GmailMessage) => {
    return message.labelIds?.includes("IMPORTANT") || false
  }

  const isUnread = (message: GmailMessage) => {
    return message.labelIds?.includes("UNREAD") || false
  }

  // Skeleton Row Component
  const SkeletonRow = () => (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0 dark:bg-slate-700" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40 dark:bg-slate-700" />
        <Skeleton className="h-3 w-64 dark:bg-slate-700" />
        <Skeleton className="h-3 w-48 dark:bg-slate-700" />
      </div>
      <Skeleton className="h-3 w-12 dark:bg-slate-700" />
    </div>
  )

  if (currentError) {
    return (
      <Alert variant="destructive" className="mt-4 dark:border-red-900 dark:bg-red-950/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="dark:text-red-200">{currentError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] md:h-[calc(100vh-250px)] bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* HEADER SECTION */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 dark:from-slate-900 to-white dark:to-slate-800 p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-gray-700 dark:text-slate-300" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isAllMailboxesMode ? "All Messages" : "Inbox"}
              </h2>
              {isAllMailboxesMode ? (
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Unified view from all mailboxes
                </p>
              ) : (
                inbox?.mailbox && (
                  <p className="text-xs text-gray-500 dark:text-slate-400">{inbox.mailbox}</p>
                )
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {currentData?.total !== undefined && (
              <Badge variant="secondary" className="text-sm font-medium">
                {currentData.total} messages
              </Badge>
            )}
            {filteredMessages.length > 0 && (
              <Badge variant="outline" className="text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300">
                Showing {filteredMessages.length}
              </Badge>
            )}
          </div>
        </div>

        {/* PAGINATION CONTROL */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Show:</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20 h-8 text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
              {PAGINATION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()} className="dark:hover:bg-slate-700">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-500 dark:text-slate-400">per page</span>
        </div>

        {/* BOUNCE SUMMARY ALERT - Only for single mailbox */}
        {!isAllMailboxesMode && inbox?.bounceSummary && inbox.bounceSummary.bounceEmailsDetected > 0 && (
          <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 py-3">
            <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold">✓ Bounce Detection:</span>
                <span>
                  {inbox.bounceSummary.bounceEmailsDetected} bounce email(s) found.
                  Cleaned up {inbox.bounceSummary.invalidAddressesDeleted} invalid
                  address(es).
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
          <Input
            placeholder="Search by sender, subject, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 h-9 text-sm dark:text-white dark:placeholder-slate-500"
            disabled={isLoadingMessages || isLoadingMore}
          />
        </div>

        {/* FILTER AND SORT CONTROLS - Only for All Messages mode */}
        {isAllMailboxesMode && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
            {/* Sort Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Sort:</span>
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                <SelectTrigger className="w-32 h-8 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  <SelectItem value="date" className="dark:hover:bg-slate-600">Date</SelectItem>
                  <SelectItem value="from" className="dark:hover:bg-slate-600">Sender</SelectItem>
                  <SelectItem value="subject" className="dark:hover:bg-slate-600">Subject</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as any)}>
                <SelectTrigger className="w-24 h-8 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  <SelectItem value="desc" className="dark:hover:bg-slate-600">Newest</SelectItem>
                  <SelectItem value="asc" className="dark:hover:bg-slate-600">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={unreadOnly}
                  onCheckedChange={(checked) => setUnreadOnly(checked as boolean)}
                  className="dark:border-slate-500"
                />
                <span className="text-xs text-gray-600 dark:text-slate-300">Unread only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={hasAttachments === true}
                  onCheckedChange={(checked) => setHasAttachments(checked ? true : undefined)}
                  className="dark:border-slate-500"
                />
                <span className="text-xs text-gray-600 dark:text-slate-300">With attachments</span>
              </label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-xs h-6 gap-1 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Filter className="h-3 w-3" />
                Advanced
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="pt-3 border-t border-gray-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Subject Keyword */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">Subject</label>
                    <Input
                      placeholder="e.g., urgent"
                      value={subjectKeyword}
                      onChange={(e) => setSubjectKeyword(e.target.value)}
                      className="h-8 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                      disabled={isLoadingMessages}
                    />
                  </div>

                  {/* Sender Domain */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">Sender Domain</label>
                    <Input
                      placeholder="e.g., gmail.com"
                      value={senderDomain}
                      onChange={(e) => setSenderDomain(e.target.value)}
                      className="h-8 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                      disabled={isLoadingMessages}
                    />
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">From Date</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-8 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      disabled={isLoadingMessages}
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">To Date</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-8 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      disabled={isLoadingMessages}
                    />
                  </div>
                </div>

                {/* Reset Filters Button */}
                {(unreadOnly || hasAttachments || dateFrom || dateTo || senderDomain || subjectKeyword) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetFilters}
                    className="text-xs h-7 gap-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    <X className="h-3 w-3" />
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MESSAGES CONTAINER */}
      {isLoadingMessages && allMessages.length === 0 ? (
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {[...Array(8)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </ScrollArea>
      ) : filteredMessages.length > 0 ? (
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => onMessageSelect(message.id)}
                className={`flex items-start gap-4 p-4 border-b border-gray-100 dark:border-slate-700 cursor-pointer transition-all duration-150 group ${
                  isUnread(message)
                    ? "bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
                    : "hover:bg-gray-50/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {/* LEFT: Avatar */}
                <div
                  className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-semibold text-xs ${getAvatarColor(message.from || "")} flex-none dark:opacity-90`}
                >
                  {getInitials(message.from || "User")}
                </div>

                {/* CENTER: Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Sender + Meta Row */}
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <p
                        className={`text-sm truncate ${
                          isUnread(message)
                            ? "font-semibold text-gray-900 dark:text-white"
                            : "font-medium text-gray-800 dark:text-slate-200"
                        }`}
                      >
                        {message.from?.split("@")[0] || "Unknown"}
                      </p>
                      {hasImportantLabel(message) && (
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-slate-500 flex-shrink-0 group-hover:text-gray-700 dark:group-hover:text-slate-400 transition-colors">
                      {formatDate(message.date || "")}
                    </span>
                  </div>

                  {/* Mailbox Email - Only for All Messages mode */}
                  {isAllMailboxesMode && (message as any).mailbox_email && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      to: <span className="font-medium text-gray-600 dark:text-slate-300">{(message as any).mailbox_email}</span>
                    </p>
                  )}

                  {/* Subject */}
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {getSubject(message)}
                  </p>

                  {/* Preview */}
                  <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                    {getMessagePreview(message)}
                  </p>

                  {/* Thread indicator */}
                  {message.threadId !== message.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onThreadSelect(message.threadId)
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-1 transition-colors"
                    >
                      View thread →
                    </button>
                  )}
                </div>

                {/* RIGHT: Labels Count */}
                {message.labelIds && message.labelIds.length > 0 && (
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300">
                      {message.labelIds.length}
                    </Badge>
                  </div>
                )}
              </div>
            ))}

            {/* SKELETON ROWS WHILE LOADING MORE */}
            {isLoadingMore &&
              skeletonCount > 0 &&
              [...Array(skeletonCount)].map((_, i) => (
                <SkeletonRow key={`skeleton-${i}`} />
              ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <Inbox className="h-12 w-12 text-gray-300 dark:text-slate-700 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {searchQuery ? "No messages found" : "You're all caught up"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "No messages in your inbox"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LOAD MORE BUTTON - Bottom Section */}
      {!isLoadingMessages && (
        (isAllMailboxesMode ? allMailboxesData?.has_next : inbox?.nextPageToken) && (
          <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900 flex justify-center">
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              className="gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-colors"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <span>Load More Messages</span>
                </>
              )}
            </Button>
          </div>
        )
      )}
    </div>
  )
}
