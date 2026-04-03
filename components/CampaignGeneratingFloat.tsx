"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { X, Loader2 } from "lucide-react"
import { removeProcessingCampaign } from "@/store/slices/processingCampaignsSlice"

export const CampaignGeneratingFloat = () => {
  const dispatch = useDispatch()
  
  // Get processing campaigns
  const processingCampaigns = useSelector(
    (state: RootState) => state.processingCampaigns?.campaigns || []
  )

  if (processingCampaigns.length === 0) return null

  // Display the first campaign being generated
  const campaign = processingCampaigns[0]

  const handleDismiss = () => {
    dispatch(removeProcessingCampaign(campaign.campaignId))
  }

  return (
    <div className="fixed top-6 right-6 pointer-events-none z-[9999]">
      <div className="pointer-events-auto bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-2xl flex gap-3 animate-in fade-in slide-in-from-top-4 max-w-sm opacity-100 backdrop-blur-md">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-blue-700 mb-1">
            Campaign Generation in Progress
          </p>
          <p className="text-sm text-blue-700 opacity-90">
            {campaign.name}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Creating campaign content. This usually takes 30-60 seconds...
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-700 hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
