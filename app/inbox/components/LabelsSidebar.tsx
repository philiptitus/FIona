"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMailboxLabels } from "@/store/actions/mailboxActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tag, Inbox, Send, Archive, Trash2, Star, FileText } from "lucide-react"

interface LabelsSidebarProps {
  mailboxId: number
}

export default function LabelsSidebar({ mailboxId }: LabelsSidebarProps) {
  const dispatch = useAppDispatch()
  const { labels, isLoading, error } = useAppSelector((state) => state.mailbox)

  useEffect(() => {
    if (mailboxId) {
      dispatch(fetchMailboxLabels(mailboxId))
    }
  }, [dispatch, mailboxId])

  const getLabelIcon = (labelName: string) => {
    const name = labelName.toUpperCase()
    switch (name) {
      case "INBOX":
        return <Inbox className="h-4 w-4" />
      case "SENT":
        return <Send className="h-4 w-4" />
      case "DRAFT":
        return <FileText className="h-4 w-4" />
      case "TRASH":
        return <Trash2 className="h-4 w-4" />
      case "STARRED":
        return <Star className="h-4 w-4" />
      case "IMPORTANT":
        return <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  const systemLabels = labels?.labels?.filter((label) => label.type === "system") || []
  const userLabels = labels?.labels?.filter((label) => label.type === "user") || []

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="text-xs">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="h-[calc(100vh-280px)] md:h-[calc(100vh-250px)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4" />
          Labels
          {labels?.total !== undefined && (
            <Badge variant="secondary" className="ml-auto">
              {labels.total}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-380px)] md:h-[calc(100vh-350px)]">
            <div className="px-4 pb-4 space-y-4">
              {/* System Labels */}
              {systemLabels.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    System
                  </h4>
                  {systemLabels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors group"
                    >
                      <div className="text-muted-foreground group-hover:text-foreground">
                        {getLabelIcon(label.name)}
                      </div>
                      <span className="text-sm flex-1 truncate">{label.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* User Labels */}
              {userLabels.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Custom Labels
                  </h4>
                  {userLabels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors group"
                    >
                      <div className="text-muted-foreground group-hover:text-foreground">
                        {getLabelIcon(label.name)}
                      </div>
                      <span className="text-sm flex-1 truncate">{label.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {label.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {(!systemLabels.length && !userLabels.length) && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No labels found
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
