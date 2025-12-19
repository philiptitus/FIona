"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, Home, LayoutTemplate, Mail, MailPlus, Send, Settings, Users, Building2, Workflow, Inbox, Sparkles, Bot } from "lucide-react"

interface SidebarProps {
  isMobile?: boolean
  onNavClick?: () => void
}

export default function Sidebar({ isMobile, onNavClick }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      dataTour: "sidebar-dashboard",
    },
    {
      name: "Inbox",
      href: "/inbox",
      icon: Inbox,
      dataTour: "sidebar-inbox",
    },
    {
      name: "Campaigns",
      href: "/campaigns",
      icon: Mail,
      dataTour: "sidebar-campaigns",
    },
    {
      name: "Companies",
      href: "/companies",
      icon: Building2,
    },
    {
      name: "Templates",
      href: "/templates",
      icon: LayoutTemplate,
      dataTour: "sidebar-templates",
    },
    {
      name: "Send Email",
      href: "/email-sending",
      icon: Mail,
    },
    {
      name: "Contacts",
      href: "/emails",
      icon: Users,
    },
    {
      name: "Neuron",
      href: "/neuron",
      icon: Bot,
    },
    {
      name: "Workflows",
      href: "/workflows",
      icon: Workflow,
    },
    {
      name: "Research",
      href: "/research",
      icon: Sparkles,
    },
    {
      name: "Sent",
      href: "/sent-emails",
      icon: Send,
      dataTour: "sidebar-sent",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      dataTour: "analytics-nav",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className={cn("flex h-full w-[240px] flex-col border-r bg-background", isMobile && "w-full")}>
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={onNavClick}>
          <Mail className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Fiona AI</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={isActive(item.href) ? "secondary" : "ghost"}
              className={cn("justify-start", isActive(item.href) && "bg-muted font-medium")}
              onClick={onNavClick}
            >
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded transition-colors font-medium text-base",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                )}
                data-tour={item.dataTour}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}
