import MainLayout from "@/components/layout/main-layout"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, XCircle } from "lucide-react"

// Mock data for now
const sentEmails = [
  {
    id: 1,
    recipient: "alice@example.com",
    subject: "Welcome to Fiona!",
    status: "sent",
    sent_at: "2024-06-01T10:30:00Z",
    is_html: true,
  },
  {
    id: 2,
    recipient: "bob@example.com",
    subject: "Your Invoice is Ready",
    status: "failed",
    sent_at: "2024-06-01T09:15:00Z",
    is_html: false,
  },
  {
    id: 3,
    recipient: "carol@example.com",
    subject: "Weekly Update",
    status: "sent",
    sent_at: "2024-05-31T17:45:00Z",
    is_html: true,
  },
]

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

export default function SentEmailsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-10 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Sent Emails</h1>
          <Input className="w-full sm:w-80" placeholder="Search by subject or recipient..." />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden border">
          <div className="divide-y divide-muted-foreground/10">
            {sentEmails.map((email) => (
              <Link
                key={email.id}
                href={`/sent-emails/${email.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/60 transition group"
                style={{ textDecoration: "none" }}
              >
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 w-10 h-10 flex items-center justify-center font-bold text-lg text-blue-900 dark:text-blue-100">
                    {email.recipient[0].toUpperCase()}
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
              </Link>
            ))}
            {sentEmails.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No sent emails found.</div>
            )}
          </div>
          {/* Pagination controls (mock) */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
            <span className="text-xs text-muted-foreground">Showing 1–3 of 3</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled>Previous</Button>
              <Button size="sm" variant="outline" disabled>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 