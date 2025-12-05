"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchThreadDetails } from "@/store/actions/mailboxActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Calendar,
  Mail,
  User,
  MessagesSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { GmailMessage } from "@/store/slices/mailboxSlice"

interface ThreadViewProps {
  mailboxId: number
  threadId: string
  onBack: () => void
}

export default function ThreadView({
  mailboxId,
  threadId,
  onBack,
}: ThreadViewProps) {
  const dispatch = useAppDispatch()
  const { currentThread, isLoading, error } = useAppSelector((state) => state.mailbox)
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (mailboxId && threadId) {
      dispatch(fetchThreadDetails({ mailboxId, threadId }))
    }
  }, [dispatch, mailboxId, threadId])

  useEffect(() => {
    // Auto-expand the last message in the thread
    if (currentThread?.thread?.messages && currentThread.thread.messages.length > 0) {
      const lastMessageId = currentThread.thread.messages[currentThread.thread.messages.length - 1].id
      setExpandedMessages(new Set([lastMessageId]))
    }
  }, [currentThread])

  const toggleMessage = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const getHeader = (message: GmailMessage, name: string) => {
    return message.payload?.headers?.find(
      (h: any) => h.name.toLowerCase() === name.toLowerCase()
    )?.value || "N/A"
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const decodeMessageBody = (message: GmailMessage) => {
    try {
      const body = message.payload?.body?.data || 
                   message.payload?.parts?.[0]?.body?.data
      if (body) {
        const decoded = atob(body.replace(/-/g, '+').replace(/_/g, '/'))
        return decoded
      }
      return message.snippet || "No content available"
    } catch (err) {
      return message.snippet || "Unable to decode message"
    }
  }

  const getInitials = (email: string) => {
    const match = email.match(/^([^@]+)/)
    if (match) {
      const name = match[1]
      return name.substring(0, 2).toUpperCase()
    }
    return "??"
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading || !currentThread) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const thread = currentThread.thread
  const firstMessage = thread.messages[0]
  const subject = getHeader(firstMessage, "Subject")

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Inbox</span>
        </Button>
        <Badge variant="secondary" className="flex items-center gap-1">
          <MessagesSquare className="h-3 w-3" />
          {currentThread.message_count} {currentThread.message_count === 1 ? "message" : "messages"}
        </Badge>
      </div>

      {/* Thread Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl line-clamp-2">
            {subject}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Thread ID: {thread.id}
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-340px)] md:h-[calc(100vh-300px)]">
            <div className="p-4 space-y-4">
              {thread.messages.map((message, index) => {
                const isExpanded = expandedMessages.has(message.id)
                const from = getHeader(message, "From")
                const date = getHeader(message, "Date")
                const to = getHeader(message, "To")

                return (
                  <Card key={message.id} className={index === thread.messages.length - 1 ? "border-primary" : ""}>
                    <CardHeader
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => toggleMessage(message.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-xs">
                            {getInitials(from)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm truncate">{from}</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <p className="text-xs text-muted-foreground hidden sm:block">
                                {formatDate(date)}
                              </p>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                          
                          {!isExpanded && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {message.snippet}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <>
                        <Separator />
                        <CardContent className="pt-4 space-y-4">
                          {/* Message Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium">From: </span>
                                <span className="text-muted-foreground break-all">{from}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium">To: </span>
                                <span className="text-muted-foreground break-all">{to}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="font-medium">Date: </span>
                                <span className="text-muted-foreground">{formatDate(date)}</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Message Body */}
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <pre className="whitespace-pre-wrap break-words font-sans text-sm">
                              {decodeMessageBody(message)}
                            </pre>
                          </div>

                          {/* Message Meta */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Badge variant="outline" className="text-xs">
                              {message.labelIds?.length || 0} labels
                            </Badge>
                            {message.sizeEstimate && (
                              <Badge variant="outline" className="text-xs">
                                {(message.sizeEstimate / 1024).toFixed(2)} KB
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </>
                    )}
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
