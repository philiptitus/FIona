"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMailboxProfile } from "@/store/actions/mailboxActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, MessagesSquare, Calendar, Database } from "lucide-react"

interface MailboxStatsProps {
  mailboxId: number
}

export default function MailboxStats({ mailboxId }: MailboxStatsProps) {
  const dispatch = useAppDispatch()
  const { mailboxProfile, isLoading, error } = useAppSelector((state) => state.mailbox)

  useEffect(() => {
    if (mailboxId) {
      dispatch(fetchMailboxProfile(mailboxId))
    }
  }, [dispatch, mailboxId])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading || !mailboxProfile) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Email Address",
      value: mailboxProfile.email,
      icon: Mail,
      description: "Connected mailbox",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Messages",
      value: mailboxProfile.messages_total.toLocaleString(),
      icon: Mail,
      description: "All messages in mailbox",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Total Threads",
      value: mailboxProfile.threads_total.toLocaleString(),
      icon: MessagesSquare,
      description: "Conversation threads",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Connected Since",
      value: formatDate(mailboxProfile.mailbox_linked_at),
      icon: Calendar,
      description: "Mailbox linked date",
      gradient: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold truncate" title={stat.value}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Additional Info Card */}
      <Card className="overflow-hidden sm:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Mailbox Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Email</p>
              <p className="font-medium break-all">{mailboxProfile.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">History ID</p>
              <p className="font-medium">{mailboxProfile.history_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Messages</p>
              <p className="font-medium">{mailboxProfile.messages_total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Threads</p>
              <p className="font-medium">{mailboxProfile.threads_total.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
