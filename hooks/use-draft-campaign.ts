/**
 * Hook for managing draft campaigns
 * Handles CRUD operations and auto-save functionality
 */

import { useEffect, useCallback, useRef } from "react"
import {
  saveDraft,
  deleteDraft,
  getUserDrafts,
  getDraftById,
  generateDraftId,
  DraftCampaign,
} from "@/lib/draftStorage"

interface UseDraftCampaignOptions {
  userId: string | undefined
  draftId?: string
}

export const useDraftCampaign = ({ userId, draftId }: UseDraftCampaignOptions) => {
  // Track if we have a valid draftId for this session
  const sessionDraftIdRef = useRef<string>(draftId || "")

  /**
   * Load a draft by ID (used when restoring from campaigns list)
   */
  const loadDraft = useCallback(
    (loadingDraftId: string): DraftCampaign | null => {
      if (!userId) return null
      const draft = getDraftById(userId, loadingDraftId)
      if (draft) {
        sessionDraftIdRef.current = loadingDraftId
      }
      return draft
    },
    [userId]
  )

  /**
   * Get the current session's draft ID, or generate a new one
   */
  const getOrCreateDraftId = useCallback((): string => {
    if (!sessionDraftIdRef.current) {
      sessionDraftIdRef.current = generateDraftId()
    }
    return sessionDraftIdRef.current
  }, [])

  /**
   * Auto-save draft after field changes (debounced with immediate effect on blur)
   */
  const saveDraftData = useCallback(
    (formData: Partial<DraftCampaign>): void => {
      if (!userId) return

      const draftId = getOrCreateDraftId()
      const now = Date.now()
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

      const draft: DraftCampaign = {
        draftId,
        campaignName: formData.campaignName || "",
        campaignType: formData.campaignType || "",
        contentPreference: formData.contentPreference || "content",
        recipientType: formData.recipientType || "email",
        generateEmailLists: formData.generateEmailLists ?? false,
        allowSequence: formData.allowSequence ?? false,
        copies: formData.copies ?? 1,
        selectedLinks: formData.selectedLinks || [],
        selectedDynamicVariables: formData.selectedDynamicVariables || [],
        createdAt: formData.createdAt || now,
        lastSavedAt: now,
        expiresAt: formData.expiresAt || now + TWO_DAYS_MS,
      }

      saveDraft(userId, draft)
    },
    [userId, getOrCreateDraftId]
  )

  /**
   * Delete the current draft
   */
  const deleteDraftData = useCallback((): void => {
    if (!userId || !sessionDraftIdRef.current) return
    deleteDraft(userId, sessionDraftIdRef.current)
    sessionDraftIdRef.current = ""
  }, [userId])

  /**
   * Get all drafts for the current user
   */
  const getAllDrafts = useCallback((): DraftCampaign[] => {
    if (!userId) return []
    return getUserDrafts(userId)
  }, [userId])

  return {
    loadDraft,
    saveDraftData,
    deleteDraftData,
    getAllDrafts,
    getOrCreateDraftId,
    currentDraftId: sessionDraftIdRef.current,
  }
}
