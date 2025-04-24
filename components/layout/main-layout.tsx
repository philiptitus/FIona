"use client"

import type { ReactNode } from "react"
import Sidebar from "./sidebar"
import Header from "./header"
import { useState } from "react"
import { useIsMobileOrTablet } from "@/lib/useIsMobileOrTablet"

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Use custom hook: treat <1024px (mobile+tablet) as mobile
  const isMobile = useIsMobileOrTablet()
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar: slide-in/out on mobile+tablet, fixed on desktop */}
      <div
        className={
          `z-40 transition-transform duration-300 h-full flex-shrink-0 ` +
          (isMobile
            ? `fixed top-0 left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-[240px] bg-background shadow-lg`
            : 'static w-[240px] border-r bg-background')
        }
        style={isMobile ? {} : { width: 240, minWidth: 240, maxWidth: 240 }}
      >
        <Sidebar isMobile={isMobile} onNavClick={() => setSidebarOpen(false)} />
      </div>
      {/* Overlay for mobile+tablet when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300">
        {/* Header with sidebar toggle */}
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">{children}</main>
      </div>
      {/* Mobile+tablet sidebar toggle button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-white rounded-full p-2 shadow-lg"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Toggle sidebar"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      )}
    </div>
  )
}
