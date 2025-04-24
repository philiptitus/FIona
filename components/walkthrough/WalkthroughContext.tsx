"use client"
import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export type WalkthroughStep = {
  id: string
  target: string // CSS selector or data attribute
  title: string
  description: string
  placement?: "top" | "bottom" | "left" | "right" | "center"
}

interface WalkthroughContextType {
  currentStep: number
  steps: WalkthroughStep[]
  isActive: boolean
  hasRun: boolean
  start: () => void
  next: () => void
  prev: () => void
  skip: () => void
}

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined)

const walkthroughKey = "fiona_walkthrough_complete"

const defaultSteps: WalkthroughStep[] = [
  {
    id: "sidebar-dashboard",
    target: "[data-tour='sidebar-dashboard']",
    title: "Dashboard",
    description: "Get a quick overview of your campaigns, templates, and engagement.",
    placement: "right",
  },
  {
    id: "sidebar-campaigns",
    target: "[data-tour='sidebar-campaigns']",
    title: "Campaigns",
    description: "Access and manage all your Campaigns here.",
    placement: "right",
  },
  {
    id: "sidebar-templates",
    target: "[data-tour='sidebar-templates']",
    title: "Templates",
    description: "View or create Templates for your campaigns.",
    placement: "right",
  },
  {
    id: "sidebar-content",
    target: "[data-tour='sidebar-content']",
    title: "Content",
    description: "Manage and generate Content with AI.",
    placement: "right",
  },
  {
    id: "main-stats",
    target: "[data-tour='main-stats']",
    title: "Key Stats",
    description: "These cards show your key stats at a glance.",
    placement: "bottom",
  },
  {
    id: "create-template-btn",
    target: "[data-tour='create-template-btn']",
    title: "Create Template",
    description: "Click here to create a new Template with AI.",
    placement: "bottom",
  },
  {
    id: "create-content-btn",
    target: "[data-tour='create-content-btn']",
    title: "Create Content",
    description: "Create new Content with AI for your campaigns.",
    placement: "bottom",
  },
  {
    id: "analytics-nav",
    target: "[data-tour='analytics-nav']",
    title: "Analytics",
    description: "See detailed Analytics and insights here.",
    placement: "right",
  },
]

export function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [hasRun, setHasRun] = useState<boolean>(false)
  const steps = defaultSteps

  // Strictly check localStorage before ever showing the walkthrough
  useEffect(() => {
    if (typeof window !== "undefined") {
      const complete = localStorage.getItem(walkthroughKey)
      setHasRun(!!complete)
      if (!complete) {
        setIsActive(true)
      }
    }
  }, [])

  const start = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
    localStorage.removeItem(walkthroughKey)
    setHasRun(false)
  }, [])
  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      localStorage.setItem(walkthroughKey, "true")
      setHasRun(true)
      setIsActive(false)
    }
  }, [currentStep, steps.length])
  const prev = useCallback(() => {
    setCurrentStep((s) => (s > 0 ? s - 1 : 0))
  }, [])
  const skip = useCallback(() => {
    localStorage.setItem(walkthroughKey, "true")
    setHasRun(true)
    setIsActive(false)
  }, [])

  // If walkthrough is marked complete, forcibly prohibit showing it again
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(walkthroughKey)) {
      setIsActive(false)
    }
  }, [isActive])

  return (
    <WalkthroughContext.Provider value={{ currentStep, steps, isActive, hasRun, start, next, prev, skip }}>
      {children}
    </WalkthroughContext.Provider>
  )
}

export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext)
  if (!ctx) throw new Error("useWalkthrough must be used within WalkthroughProvider")
  return ctx
}
