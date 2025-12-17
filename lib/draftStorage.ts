/**
 * Draft Campaign Storage Utilities
 * Manages localStorage persistence of campaign drafts
 */

export interface DraftCampaign {
  draftId: string
  campaignName: string
  campaignType: string
  contentPreference: "template" | "content" | "both"
  recipientType: "email" | "company"
  generateEmailLists: boolean
  allowSequence: boolean
  copies: number
  selectedLinks: string[]
  selectedDynamicVariables: string[]
  createdAt: number
  lastSavedAt: number
  expiresAt: number
}

const STORAGE_KEY = "fiona_draft_campaigns"

/**
 * Generate a unique draft ID based on timestamp and random string
 */
export const generateDraftId = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `draft_${timestamp}_${random}`
}

/**
 * Get all drafts for a specific user
 */
export const getUserDrafts = (userId: string): DraftCampaign[] => {
  if (typeof window === "undefined") return []
  
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    if (!storage) return []
    
    const allDrafts = JSON.parse(storage)
    return allDrafts[userId] || []
  } catch (error) {
    console.error("Error reading drafts from localStorage:", error)
    return []
  }
}

/**
 * Save or update a draft for a user
 */
export const saveDraft = (userId: string, draft: DraftCampaign): void => {
  if (typeof window === "undefined") return
  
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    const allDrafts = storage ? JSON.parse(storage) : {}
    
    if (!allDrafts[userId]) {
      allDrafts[userId] = []
    }
    
    // Check if draft already exists
    const existingIndex = allDrafts[userId].findIndex(
      (d: DraftCampaign) => d.draftId === draft.draftId
    )
    
    if (existingIndex >= 0) {
      allDrafts[userId][existingIndex] = draft
    } else {
      allDrafts[userId].push(draft)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allDrafts))
  } catch (error) {
    console.error("Error saving draft to localStorage:", error)
  }
}

/**
 * Delete a specific draft
 */
export const deleteDraft = (userId: string, draftId: string): void => {
  if (typeof window === "undefined") return
  
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    if (!storage) return
    
    const allDrafts = JSON.parse(storage)
    if (!allDrafts[userId]) return
    
    allDrafts[userId] = allDrafts[userId].filter(
      (d: DraftCampaign) => d.draftId !== draftId
    )
    
    // If no more drafts for this user, remove the user key
    if (allDrafts[userId].length === 0) {
      delete allDrafts[userId]
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allDrafts))
  } catch (error) {
    console.error("Error deleting draft from localStorage:", error)
  }
}

/**
 * Delete all expired drafts for a user
 * Returns the count of deleted drafts
 */
export const deleteExpiredDrafts = (userId: string): number => {
  if (typeof window === "undefined") return 0
  
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    if (!storage) return 0
    
    const allDrafts = JSON.parse(storage)
    if (!allDrafts[userId]) return 0
    
    const now = Date.now()
    const initialLength = allDrafts[userId].length
    
    allDrafts[userId] = allDrafts[userId].filter(
      (d: DraftCampaign) => d.expiresAt > now
    )
    
    const deletedCount = initialLength - allDrafts[userId].length
    
    // If no more drafts for this user, remove the user key
    if (allDrafts[userId].length === 0) {
      delete allDrafts[userId]
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allDrafts))
    return deletedCount
  } catch (error) {
    console.error("Error deleting expired drafts:", error)
    return 0
  }
}

/**
 * Get a specific draft by draftId
 */
export const getDraftById = (userId: string, draftId: string): DraftCampaign | null => {
  const drafts = getUserDrafts(userId)
  return drafts.find(d => d.draftId === draftId) || null
}

/**
 * Check if a draft exists
 */
export const draftExists = (userId: string, draftId: string): boolean => {
  return getDraftById(userId, draftId) !== null
}
