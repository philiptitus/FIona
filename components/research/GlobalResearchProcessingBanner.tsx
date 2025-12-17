"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store/store"
import { checkResearchNotifications } from "@/store/actions/processingResearchesActions"
import {
  updateResearchStatus,
  removeProcessingResearch,
  incrementRetryCount,
  clearCompletedResearches,
} from "@/store/slices/processingResearchesSlice"
import { fetchNotifications } from "@/store/actions/notificationActions"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { X, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const MAX_POLL_DURATION = 180000 // 3 minutes
const POLL_INTERVAL = 3000 // 3 seconds

export function GlobalResearchProcessingBanner() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { toast } = useToast()
  const { researches, isPolling } = useSelector((state: RootState) => state.processingResearches)
  const [progress, setProgress] = useState<{ [key: number]: number }>({})

  // Simulate progress for better UX
  useEffect(() => {
    if (researches.length === 0) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = { ...prev }
        researches.forEach((research) => {
          if (research.status === "processing") {
            const elapsed = Date.now() - research.startedAt
            const progressPercent = Math.min(90, (elapsed / MAX_POLL_DURATION) * 100)
            newProgress[research.researchId] = progressPercent
          }
        })
        return newProgress
      })
    }, 500)

    return () => clearInterval(progressInterval)
  }, [researches])

  // Main polling logic
  useEffect(() => {
    if (!isPolling || researches.length === 0) return

    const pollInterval = setInterval(async () => {
      for (const research of researches) {
        if (research.status !== "processing") continue

        const elapsed = Date.now() - research.startedAt

        // Check for timeout
        if (elapsed > MAX_POLL_DURATION) {
          toast({
            title: "Research Processing",
            description: `Research for ${research.contactName} is taking longer than expected. We'll notify you when it's ready.`,
            variant: "default",
          })
          dispatch(removeProcessingResearch(research.researchId))
          continue
        }

        try {
          // Check notifications first - this is the most reliable indicator
          const notifResult = await dispatch(checkResearchNotifications(research.researchId)).unwrap()
          
          // Check if the notification token matches our research token
          const notification = notifResult?.notification
          const notificationToken = notification?.metadata?.token
          const isSuccessNotification = notification?.notification_type === "research_complete_success"
          const isFailureNotification = notification?.notification_type === "research_complete_failed"
          
          // Match tokens - this is the definitive check
          const isCompleted = isSuccessNotification && notificationToken === research.token
          const isFailed = isFailureNotification && notificationToken === research.token
          
          if (isCompleted) {
            dispatch(
              updateResearchStatus({
                researchId: research.researchId,
                status: "completed",
                lastPolled: Date.now(),
              })
            )
            
            setProgress((prev) => ({ ...prev, [research.researchId]: 100 }))
            
            // Fetch fresh notifications
            dispatch(fetchNotifications())
            
            // Get contact name from notification metadata or use the stored name
            const contactName = notification?.metadata?.contact_name || research.contactName
            
            toast({
              title: "✨ Research Complete!",
              description: `Personalized research and email generated for ${contactName}.`,
              action: (
                <Button
                  size="sm"
                  onClick={() => router.push("/research")}
                >
                  View Results
                </Button>
              ),
              duration: 10000,
            })

            // Remove after short delay
            setTimeout(() => {
              dispatch(removeProcessingResearch(research.researchId))
            }, 3000)
          } else if (isFailed) {
            dispatch(
              updateResearchStatus({
                researchId: research.researchId,
                status: "failed",
                lastPolled: Date.now(),
              })
            )
            
            toast({
              title: "Research Failed",
              description: `Failed to generate research for ${research.contactName}. Please try again.`,
              variant: "destructive",
              duration: 10000,
            })

            setTimeout(() => {
              dispatch(removeProcessingResearch(research.researchId))
            }, 5000)
          } else {
            // Still processing, update last polled time
            dispatch(
              updateResearchStatus({
                researchId: research.researchId,
                status: "processing",
                lastPolled: Date.now(),
              })
            )
          }
        } catch (error) {
          console.error("Polling error for research:", research.researchId, error)
          dispatch(incrementRetryCount(research.researchId))
        }
      }
    }, POLL_INTERVAL)

    return () => clearInterval(pollInterval)
  }, [isPolling, researches, dispatch, toast, router])

  if (researches.length === 0) return null

  const processingResearches = researches.filter((r) => r.status === "processing")
  const completedResearches = researches.filter((r) => r.status === "completed")
  const failedResearches = researches.filter((r) => r.status === "failed")

  return (
    <div className="fixed top-4 left-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] space-y-2">
      {processingResearches.map((research) => (
        <Card
          key={research.researchId}
          className="p-4 shadow-lg border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="relative">
                <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">
                    Researching...
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 truncate">
                    {research.contactName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => dispatch(removeProcessingResearch(research.researchId))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Progress
                value={progress[research.researchId] || 0}
                className="h-2 bg-purple-100 dark:bg-purple-900"
              />
              <p className="text-xs text-muted-foreground">
                AI is generating personalized research and email... This may take 30-60 seconds
              </p>
            </div>
          </div>
        </Card>
      ))}

      {completedResearches.map((research) => (
        <Card
          key={research.researchId}
          className="p-4 shadow-lg border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 animate-in slide-in-from-left"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                    Research Complete!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 truncate">
                    {research.contactName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => dispatch(removeProcessingResearch(research.researchId))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {failedResearches.map((research) => (
        <Card
          key={research.researchId}
          className="p-4 shadow-lg border-2 border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/40 dark:to-pink-950/40"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                    Research Failed
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 truncate">
                    {research.contactName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => dispatch(removeProcessingResearch(research.researchId))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {researches.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => dispatch(clearCompletedResearches())}
        >
          Clear Completed
        </Button>
      )}
    </div>
  )
}
