"use client"
import React, { useEffect, useState } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"

const walkthroughKey = "fiona_walkthrough_complete"

const steps: Step[] = [
  {
    target: "[data-tour='sidebar-dashboard']",
    content: "This is your Dashboard. Get a quick overview of your campaigns, templates, and engagement.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='sidebar-campaigns']",
    content: "Access and manage all your Campaigns here.",
    placement: "right",
  },
  {
    target: "[data-tour='sidebar-templates']",
    content: "View or create Templates for your campaigns.",
    placement: "right",
  },
  {
    target: "[data-tour='sidebar-content']",
    content: "Manage and generate Content with AI.",
    placement: "right",
  },
  {
    target: "[data-tour='main-stats']",
    content: "These cards show your key stats at a glance.",
    placement: "bottom",
  },
  {
    target: "[data-tour='create-template-btn']",
    content: "Click here to create a new Template with AI.",
    placement: "bottom",
  },
  {
    target: "[data-tour='create-content-btn']",
    content: "Create new Content with AI for your campaigns.",
    placement: "bottom",
  },
  {
    target: "[data-tour='analytics-nav']",
    content: "See detailed Analytics and insights here.",
    placement: "right",
  },
  {
    target: "[data-tour='user-menu']",
    content: "Access your profile, settings, and logout options.",
    placement: "bottom-end",
  },
]

export default function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(walkthroughKey)) {
      setTimeout(() => setRun(true), 700) // slight delay for UI render
    }
  }, [])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status)
    if (finished) {
      localStorage.setItem(walkthroughKey, "true")
      setRun(false)
    }
  }

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        disableScrolling
        styles={{
          options: {
            zIndex: 9999,
            primaryColor: "#6366f1",
            textColor: "#111",
            arrowColor: "#fff",
            backgroundColor: "#fff",
            overlayColor: "rgba(30,41,59,0.6)",
          },
        }}
        locale={{ last: "Finish", skip: "Skip", next: "Next", back: "Back" }}
        callback={handleJoyrideCallback}
      />
      {children}
    </>
  )
}
