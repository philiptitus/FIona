"use client"
import React, { useEffect, useRef } from "react"
import { useWalkthrough } from "./WalkthroughContext"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

function getTargetRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector)
  if (el) return el.getBoundingClientRect()
  return null
}

export default function WalkthroughOverlay() {
  const { isActive, steps, currentStep, next, prev, skip } = useWalkthrough()
  const step = steps[currentStep]
  const [rect, setRect] = React.useState<DOMRect | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return
    function updateRect() {
      setRect(getTargetRect(step.target))
    }
    updateRect()
    window.addEventListener("resize", updateRect)
    window.addEventListener("scroll", updateRect, true)
    return () => {
      window.removeEventListener("resize", updateRect)
      window.removeEventListener("scroll", updateRect, true)
    }
  }, [isActive, step.target])

  if (!isActive || !rect) return null

  // Overlay and highlight logic
  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] pointer-events-auto"
        style={{ background: "rgba(30,41,59,0.6)" }}
      >
        {/* Highlighted area */}
        <div
          style={{
            position: "absolute",
            top: rect.top - 8 + window.scrollY,
            left: rect.left - 8 + window.scrollX,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: "0 0 0 4px #6366f1, 0 0 0 9999px rgba(30,41,59,0.6)",
            borderRadius: 12,
            pointerEvents: "none",
            transition: "all 0.2s cubic-bezier(.4,2,.6,1)",
          }}
        />
        {/* Tooltip/Popover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed z-[10001] max-w-xs w-full bg-white dark:bg-zinc-900 border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-3"
          style={{
            top: (() => {
              if (step.placement === "top") return rect.top - 120 + window.scrollY
              if (step.placement === "bottom") return rect.bottom + 16 + window.scrollY
              if (step.placement === "left") return rect.top + rect.height / 2 - 40 + window.scrollY
              if (step.placement === "right") return rect.top + rect.height / 2 - 40 + window.scrollY
              return rect.top + rect.height + 20 + window.scrollY
            })(),
            left: (() => {
              if (step.placement === "left") return rect.left - 280 + window.scrollX
              if (step.placement === "right") return rect.right + 24 + window.scrollX
              return rect.left + rect.width / 2 - 140 + window.scrollX
            })(),
          }}
        >
          <div className="font-bold text-lg text-primary mb-1">{step.title}</div>
          <div className="text-base text-muted-foreground mb-2">{step.description}</div>
          <div className="flex gap-2 justify-end mt-2">
            <Button size="sm" variant="ghost" onClick={skip}>Skip</Button>
            <Button size="sm" variant="outline" onClick={prev} disabled={currentStep === 0}>Back</Button>
            <Button size="sm" onClick={next}>{currentStep === steps.length - 1 ? "Finish" : "Next"}</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
