"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMessageDetails } from "@/store/actions/mailboxActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Calendar,
  Mail,
  User,
  Tag,
  MessagesSquare,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface MessageDetailsProps {
  mailboxId: number
  messageId: string
  onBack: () => void
  onThreadSelect: (threadId: string) => void
}

export default function MessageDetails({
  mailboxId,
  messageId,
  onBack,
  onThreadSelect,
}: MessageDetailsProps) {
  const dispatch = useAppDispatch()
  const { currentMessage, isLoading, error } = useAppSelector((state) => state.mailbox)
  const [decodedBody, setDecodedBody] = useState<string>("")
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    if (mailboxId && messageId) {
      setLoadingProgress(0)
      dispatch(fetchMessageDetails({ mailboxId, messageId }))
    }
  }, [dispatch, mailboxId, messageId])

  // Progress simulation for loading
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0)
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 15
        })
      }, 200)
      return () => clearInterval(interval)
    } else {
      setLoadingProgress(100)
      const timeout = setTimeout(() => setLoadingProgress(0), 500)
      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  useEffect(() => {
    if (currentMessage?.message?.payload) {
      try {
        const body = currentMessage.message.payload.body?.data || 
                     currentMessage.message.payload.parts?.[0]?.body?.data
        if (body) {
          // Decode base64 with URL-safe characters
          const decoded = atob(body.replace(/-/g, '+').replace(/_/g, '/'))
          setDecodedBody(decoded)
        }
      } catch (err) {
        console.error("Error decoding message body:", err)
        setDecodedBody("Unable to decode message body")
      }
    }
  }, [currentMessage])

  const getHeader = (name: string) => {
    return currentMessage?.message?.payload?.headers?.find(
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

  if (isLoading || !currentMessage) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
        <Card>
          <CardHeader className="space-y-4">
            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="animate-pulse">Loading message from Gmail API...</span>
                </div>
                <Progress value={loadingProgress} className="h-1" />
              </div>
            )}
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
            <Skeleton className="h-64 w-full mt-6" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const message = currentMessage.message

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Inbox</span>
        </Button>
        {message.threadId !== message.id && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onThreadSelect(message.threadId)}
          >
            <MessagesSquare className="h-4 w-4 mr-2" />
            View Thread
          </Button>
        )}
      </div>

      {/* Message Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl md:text-2xl line-clamp-2">
              {getHeader("Subject")}
            </CardTitle>
          </div>

          {/* Message Meta Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">From</p>
                <p className="text-sm text-muted-foreground truncate">
                  {getHeader("From")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">To</p>
                <p className="text-sm text-muted-foreground truncate">
                  {getHeader("To")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(getHeader("Date"))}
                </p>
              </div>
            </div>

            {/* Labels */}
            {message.labelIds && message.labelIds.length > 0 && (
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Labels</p>
                  <div className="flex flex-wrap gap-2">
                    {message.labelIds.map((label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {/* Message Body with Better Height */}
          <div className="mb-6">
            <ScrollArea className="h-[60vh] md:h-[calc(100vh-420px)] min-h-[400px] rounded-md border bg-muted/30 p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
                  {decodedBody || message.snippet || "No content available"}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Technical Details Accordion */}
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm">
                Technical Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Message ID:</span>
                    <span className="text-muted-foreground break-all">{message.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Thread ID:</span>
                    <span className="text-muted-foreground break-all">{message.threadId}</span>
                  </div>
                  {message.sizeEstimate && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Size:</span>
                      <span className="text-muted-foreground">
                        {(message.sizeEstimate / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  )}
                  {message.internalDate && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Internal Date:</span>
                      <span className="text-muted-foreground">
                        {new Date(parseInt(message.internalDate)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="headers">
              <AccordionTrigger className="text-sm">
                All Headers
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2 text-xs font-mono">
                    {message.payload?.headers?.map((header: any, index: number) => (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        <span className="font-semibold truncate">{header.name}:</span>
                        <span className="col-span-2 text-muted-foreground break-all">
                          {header.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
