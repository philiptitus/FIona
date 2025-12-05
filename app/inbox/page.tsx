"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import MainLayout from "@/components/layout/main-layout"
import MailboxSelector from "./components/MailboxSelector"
import LabelsSidebar from "./components/LabelsSidebar"
import InboxMessageList from "./components/InboxMessageList"
import MessageDetails from "./components/MessageDetails"
import ThreadView from "./components/ThreadView"
import MailboxStats from "./components/MailboxStats"
import { fetchMailboxes } from "@/store/actions/mailboxActions"
import { Button } from "@/components/ui/button"
import { Mail, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function InboxPage() {
  const dispatch = useAppDispatch()
  const { mailboxes, isLoading } = useAppSelector((state) => state.mailbox)
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | null>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"inbox" | "message" | "thread">("inbox")
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    dispatch(fetchMailboxes())
  }, [dispatch])

  useEffect(() => {
    if (mailboxes.length > 0 && !selectedMailboxId) {
      setSelectedMailboxId(mailboxes[0].id)
    }
  }, [mailboxes, selectedMailboxId])

  const handleMailboxChange = (mailboxId: number) => {
    setSelectedMailboxId(mailboxId)
    setSelectedMessageId(null)
    setSelectedThreadId(null)
    setViewMode("inbox")
  }

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessageId(messageId)
    setViewMode("message")
  }

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId)
    setViewMode("thread")
  }

  const handleBackToInbox = () => {
    setSelectedMessageId(null)
    setSelectedThreadId(null)
    setViewMode("inbox")
  }

  if (isLoading && mailboxes.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Skeleton className="h-96 lg:col-span-1" />
            <Skeleton className="h-96 lg:col-span-3" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (mailboxes.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Mail className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">No Mailboxes Connected</h2>
            <p className="text-muted-foreground">
              Please connect a Gmail account to view your inbox.
            </p>
            <Button onClick={() => window.location.href = "/settings"}>
              Connect Mailbox
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-2 md:p-4 space-y-4">
        {/* Top Bar - Mailbox Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card rounded-lg p-4 border">
          <MailboxSelector
            mailboxes={mailboxes}
            selectedMailboxId={selectedMailboxId}
            onMailboxChange={handleMailboxChange}
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="flex-1 sm:flex-none"
            >
              {showStats ? "Hide Stats" : "Show Stats"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchMailboxes())}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        {showStats && selectedMailboxId && (
          <MailboxStats mailboxId={selectedMailboxId} />
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Labels Sidebar - Hidden on mobile in message/thread view */}
          <div className={`${viewMode !== "inbox" ? "hidden lg:block" : ""} lg:col-span-1`}>
            {selectedMailboxId && (
              <LabelsSidebar mailboxId={selectedMailboxId} />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {viewMode === "inbox" && selectedMailboxId && (
              <InboxMessageList
                mailboxId={selectedMailboxId}
                onMessageSelect={handleMessageSelect}
                onThreadSelect={handleThreadSelect}
              />
            )}

            {viewMode === "message" && selectedMailboxId && selectedMessageId && (
              <MessageDetails
                mailboxId={selectedMailboxId}
                messageId={selectedMessageId}
                onBack={handleBackToInbox}
                onThreadSelect={handleThreadSelect}
              />
            )}

            {viewMode === "thread" && selectedMailboxId && selectedThreadId && (
              <ThreadView
                mailboxId={selectedMailboxId}
                threadId={selectedThreadId}
                onBack={handleBackToInbox}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
