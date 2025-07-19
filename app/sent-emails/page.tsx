"use client"
import React from "react";
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { handleFetchSentEmails } from "@/store/actions/sentEmailActions"
import type { RootState, AppDispatch } from "@/store/store"
import MainLayout from "@/components/layout/main-layout"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import EmailDetailModal from "./EmailDetailModal";

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

export default function SentEmailsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const sentEmails = useSelector((state: RootState) => state.sentEmail.list.items) || [];
  const isLoading = useSelector((state: RootState) => state.sentEmail.list.isLoading)

  const [selectedEmailId, setSelectedEmailId] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  useEffect(() => {
    dispatch(handleFetchSentEmails())
  }, [dispatch])

  const handleEmailClick = (id: number) => {
    setSelectedEmailId(id);
    setModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-10 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Sent Emails</h1>
          <Input className="w-full sm:w-80" placeholder="Search by subject or recipient..." />
        </div>
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
          {/* Pagination controls (mock) */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
            <span className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : sentEmails.length > 0 ? `Showing 1–${sentEmails.length} of ${sentEmails.length}` : ""}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled>Previous</Button>
              <Button size="sm" variant="outline" disabled>Next</Button>
            </div>
          </div>
        </div>
      </div>
      <EmailDetailModal open={modalOpen} onOpenChange={setModalOpen} emailId={selectedEmailId} />
    </MainLayout>
  )
} 