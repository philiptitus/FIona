"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store/store"
import { pollCampaignStatus, checkCampaignNotifications } from "@/store/actions/processingCampaignsActions"
import {
  updateCampaignStatus,
  removeProcessingCampaign,
  incrementRetryCount,
  clearCompletedCampaigns,
} from "@/store/slices/processingCampaignsSlice"
import { fetchNotifications } from "@/store/actions/notificationActions"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const MAX_POLL_DURATION = 180000 // 3 minutes
const POLL_INTERVAL = 3000 // 3 seconds

export function GlobalCampaignProcessingBanner() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { toast } = useToast()
  const { campaigns, isPolling } = useSelector((state: RootState) => state.processingCampaigns)
  const [progress, setProgress] = useState<{ [key: number]: number }>({})

  // Simulate progress for better UX
  useEffect(() => {
    if (campaigns.length === 0) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = { ...prev }
        campaigns.forEach((campaign) => {
          if (campaign.status === "processing") {
            const elapsed = Date.now() - campaign.startedAt
            const progressPercent = Math.min(90, (elapsed / MAX_POLL_DURATION) * 100)
            newProgress[campaign.campaignId] = progressPercent
          }
        })
        return newProgress
      })
    }, 500)

    return () => clearInterval(progressInterval)
  }, [campaigns])

  // Main polling logic
  useEffect(() => {
    if (!isPolling || campaigns.length === 0) return

    const pollInterval = setInterval(async () => {
      for (const campaign of campaigns) {
        if (campaign.status !== "processing") continue

        const elapsed = Date.now() - campaign.startedAt

        // Check for timeout
        if (elapsed > MAX_POLL_DURATION) {
          toast({
            title: "Campaign Processing",
            description: `"${campaign.name}" is taking longer than expected. We'll notify you when it's ready.`,
            variant: "default",
          })
          dispatch(removeProcessingCampaign(campaign.campaignId))
          continue
        }

        try {
          // Check notifications first - this is the most reliable indicator
          const notifResult = await dispatch(checkCampaignNotifications(campaign.campaignId)).unwrap()
          
          // Check if the notification token matches our campaign token (THE ONLY SURE WAY)
          const notification = notifResult?.notification
          const notificationToken = notification?.metadata?.token
          const isSuccessNotification = notification?.title === "Campaign Created Successfully"
          const isFailureNotification = notification?.title === "Campaign Creation Failed"
          
          // Match tokens - this is the definitive check
          const isCompleted = isSuccessNotification && notificationToken === campaign.token
          const isFailed = isFailureNotification && notificationToken === campaign.token
          
          if (isCompleted) {
            dispatch(
              updateCampaignStatus({
                campaignId: campaign.campaignId,
                status: "completed",
                lastPolled: Date.now(),
              })
            )
            
            setProgress((prev) => ({ ...prev, [campaign.campaignId]: 100 }))
            
            // Fetch fresh notifications
            dispatch(fetchNotifications())
            
            // Get campaign name from notification metadata or use the stored name
            const completedCampaignName = notification?.metadata?.campaign_name || campaign.name
            
            toast({
              title: "✨ Campaign Created!",
              description: `"${completedCampaignName}" is ready to use.`,
              action: (
                <Button
                  size="sm"
                  onClick={() => router.push(`/campaigns/${campaign.campaignId}`)}
                >
                  View Campaign
                </Button>
              ),
            })

            // Remove after short delay
            setTimeout(() => {
              dispatch(removeProcessingCampaign(campaign.campaignId))
            }, 3000)
          } else if (isFailed) {
            dispatch(
              updateCampaignStatus({
                campaignId: campaign.campaignId,
                status: "failed",
                lastPolled: Date.now(),
              })
            )
            
            toast({
              title: "Campaign Creation Failed",
              description: `Failed to create "${campaign.name}". Please try again.`,
              variant: "destructive",
            })

            setTimeout(() => {
              dispatch(removeProcessingCampaign(campaign.campaignId))
            }, 5000)
          } else {
            // Still processing, update last polled time
            dispatch(
              updateCampaignStatus({
                campaignId: campaign.campaignId,
                status: "processing",
                lastPolled: Date.now(),
              })
            )
          }
        } catch (error) {
          console.error("Polling error for campaign:", campaign.campaignId, error)
          dispatch(incrementRetryCount(campaign.campaignId))
        }
      }
    }, POLL_INTERVAL)

    return () => clearInterval(pollInterval)
  }, [isPolling, campaigns, dispatch, toast, router])

  if (campaigns.length === 0) return null

  const processingCampaigns = campaigns.filter((c) => c.status === "processing")
  const completedCampaigns = campaigns.filter((c) => c.status === "completed")
  const failedCampaigns = campaigns.filter((c) => c.status === "failed")

  return (
    <div className="fixed top-4 left-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] space-y-2">
      {processingCampaigns.map((campaign) => (
        <Card
          key={campaign.campaignId}
          className="p-4 shadow-lg border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="relative">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                    Creating Campaign...
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                    {campaign.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => dispatch(removeProcessingCampaign(campaign.campaignId))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Progress
                value={progress[campaign.campaignId] || 0}
                className="h-2 bg-blue-100 dark:bg-blue-900"
              />
              <p className="text-xs text-muted-foreground">
                AI is generating your campaign content... This may take 30-60 seconds
              </p>
            </div>
          </div>
        </Card>
      ))}

      {completedCampaigns.map((campaign) => (
        <Card
          key={campaign.campaignId}
          className="p-4 shadow-lg border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 animate-in slide-in-from-left"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                    Campaign Created!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 truncate">
                    {campaign.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => dispatch(removeProcessingCampaign(campaign.campaignId))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {failedCampaigns.map((campaign) => (
        <Card
          key={campaign.campaignId}
          className="p-4 shadow-lg border-2 border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/40 dark:to-pink-950/40"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                    Creation Failed
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 truncate">
                    {campaign.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => dispatch(removeProcessingCampaign(campaign.campaignId))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {campaigns.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => dispatch(clearCompletedCampaigns())}
        >
          Clear Completed
        </Button>
      )}
    </div>
  )
}
