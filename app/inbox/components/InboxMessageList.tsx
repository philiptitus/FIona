"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMailboxInbox } from "@/store/actions/mailboxActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Mail,
  MailOpen,
  Search,
  Star,
  Loader2,
} from "lucide-react"
import { GmailMessage } from "@/store/slices/mailboxSlice"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InboxMessageListProps {
  mailboxId: number
  onMessageSelect: (messageId: string) => void
  onThreadSelect: (threadId: string) => void
}

export default function InboxMessageList({
  mailboxId,
  onMessageSelect,
  onThreadSelect,
}: InboxMessageListProps) {
  const dispatch = useAppDispatch()
  const { inbox, isLoading, error } = useAppSelector((state) => state.mailbox)
  const [limit, setLimit] = useState(25)
  const [currentPageToken, setCurrentPageToken] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    if (mailboxId) {
      setLoadingProgress(0)
      dispatch(fetchMailboxInbox({ mailboxId, limit, pageToken: currentPageToken }))
    }
  }, [dispatch, mailboxId, limit, currentPageToken])

  // Simulate progress for better UX during Gmail API calls
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0)
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 300)
      return () => clearInterval(interval)
    } else {
      setLoadingProgress(100)
      const timeout = setTimeout(() => setLoadingProgress(0), 500)
      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  const handleNextPage = () => {
    if (inbox?.nextPageToken) {
      setCurrentPageToken(inbox.nextPageToken)
    }
  }

  const handlePreviousPage = () => {
    setCurrentPageToken(undefined)
  }

  const filteredMessages = inbox?.messages?.filter((msg) =>
    msg.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getMessagePreview = (message: GmailMessage) => {
    return message.snippet || "No preview available"
  }

  const getSubject = (message: GmailMessage) => {
    // Check if subject is directly available (from API response)
    if (message.subject) {
      return message.subject
    }
    // Fall back to checking headers
    const subjectHeader = message.payload?.headers?.find(
      (h: any) => h.name.toLowerCase() === 'subject'
    )
    return subjectHeader?.value || "(No Subject)"
  }

  const hasImportantLabel = (message: GmailMessage) => {
    return message.labelIds?.includes("IMPORTANT") || false
  }

  const isUnread = (message: GmailMessage) => {
    return message.labelIds?.includes("UNREAD") || false
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="h-[calc(100vh-280px)] md:h-[calc(100vh-250px)]">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Inbox className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">Inbox</span>
            {inbox?.total !== undefined && (
              <Badge variant="secondary" className="ml-2">
                {inbox.total}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!currentPageToken || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!inbox?.nextPageToken || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Loading Progress Bar */}
        {isLoading && (
          <div className="space-y-2">
            <Progress value={loadingProgress} className="h-1" />
            <p className="text-xs text-muted-foreground text-center animate-pulse">
              Fetching messages from Gmail API...
            </p>
          </div>
        )}
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Loading messages...</p>
                  <p className="text-xs text-muted-foreground">
                    This may take a few moments as we fetch data from Gmail
                  </p>
                </div>
              </div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
                <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-460px)] md:h-[calc(100vh-430px)]">
            {filteredMessages && filteredMessages.length > 0 ? (
              <div className="divide-y">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                      isUnread(message) ? "bg-accent/50" : ""
                    }`}
                    onClick={() => onMessageSelect(message.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isUnread(message) ? (
                          <Mail className="h-5 w-5 text-primary" />
                        ) : (
                          <MailOpen className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className={`text-sm truncate ${
                                isUnread(message) ? "font-semibold" : "font-normal"
                              }`}
                            >
                              {getSubject(message)}
                            </span>
                            {hasImportantLabel(message) && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs hidden sm:inline-flex flex-shrink-0"
                          >
                            {message.labelIds?.length || 0} labels
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {getMessagePreview(message)}
                        </p>
                        {message.threadId !== message.id && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              onThreadSelect(message.threadId)
                            }}
                          >
                            View conversation thread
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No messages found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Your inbox is empty"}
                </p>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
