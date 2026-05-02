"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { AppDispatch, RootState } from "@/store/store"
import { toggleContact, selectMultiple, deselectMultiple, clearSelection } from "@/store/slices/selectedContactsSlice"
import { handleStartBulkResearch } from "@/store/actions/researchActions"
import { addProcessingResearch } from "@/store/slices/processingResearchesSlice"
import { addProcessingCampaign } from "@/store/slices/processingCampaignsSlice"
import { useToast } from "@/components/ui/use-toast"

const MAX_BULK_RESEARCH_CONTACTS = 50

export function useBulkResearch(contactType: "emaillist" | "company") {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { toast } = useToast()
  
  const selectedIds = useSelector((state: RootState) => state.selectedContacts[contactType])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSelected = (id: number) => selectedIds.includes(id)
  
  const handleToggle = (id: number) => {
    dispatch(toggleContact({ id, type: contactType }))
  }

  const handleSelectAll = (ids: number[]) => {
    dispatch(selectMultiple({ ids, type: contactType }))
  }

  const handleDeselectAll = (ids: number[]) => {
    dispatch(deselectMultiple({ ids, type: contactType }))
  }

  const handleClearSelection = () => {
    dispatch(clearSelection(contactType))
  }

  const handleResearchClick = () => {
    if (selectedIds.length === 0 || selectedIds.length > MAX_BULK_RESEARCH_CONTACTS) {
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmResearch = async (createCampaign: boolean, contactNames: { id: number; name: string }[]) => {
    setIsSubmitting(true)
    
    try {
      const result = await dispatch(handleStartBulkResearch({
        contact_ids: selectedIds,
        contact_type: contactType,
        create_campaign: createCampaign,
      }))

      if (result.success) {
        // Add to processing researches for tracking
        selectedIds.forEach((contactId) => {
          const contactName = contactNames.find(c => c.id === contactId)?.name || "Unknown"
          dispatch(addProcessingResearch({
            researchId: Date.now() + contactId, // Temporary ID until we get real ones
            contactId,
            contactType,
            contactName,
            token: result.data?.token || "",
            status: "processing",
            startedAt: Date.now(),
            lastPolled: Date.now(),
            retryCount: 0,
          }))
        })

        // If campaign creation was requested, show loading float immediately
        if (createCampaign) {
          // Generate campaign name from selected contact names
          const campaignName = selectedIds.length === 1 
            ? `Campaign for ${contactNames[0]?.name || "Unknown"}`
            : `Campaign for ${selectedIds.length} contacts`

          dispatch(addProcessingCampaign({
            campaignId: result.data?.campaign_id || Date.now(), // Use temp ID if not available yet
            token: result.data?.campaign_token || "",
            name: campaignName,
            status: "processing",
            startedAt: Date.now(),
            lastPolled: Date.now(),
            retryCount: 0,
          }))
        }

        toast({
          title: "Research Started!",
          description: `Generating personalized research for ${selectedIds.length} contact${selectedIds.length > 1 ? "s" : ""}. You'll be notified when complete.`,
          duration: 5000,
        })

        // Clear selection and close modal
        handleClearSelection()
        setShowConfirmModal(false)
        
        // Navigate based on createCampaign flag
        const destination = createCampaign ? "/campaigns" : "/research"
        router.push(destination)
      } else {
        toast({
          title: "Research Failed",
          description: result.error || "Failed to start bulk research. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    maxCount: MAX_BULK_RESEARCH_CONTACTS,
    isSelected,
    handleToggle,
    handleSelectAll,
    handleDeselectAll,
    handleClearSelection,
    handleResearchClick,
    showConfirmModal,
    setShowConfirmModal,
    handleConfirmResearch,
    isSubmitting,
  }
}
