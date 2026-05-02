"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, Home, LayoutTemplate, Mail, MailPlus, Send, Settings, Users, Building2, Workflow, Inbox, Sparkles, Bot, Upload, Compass, ChevronDown } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  isMobile?: boolean
  onNavClick?: () => void
}

export default function Sidebar({ isMobile, onNavClick }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
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
      name:"Bulk Lead Uploads",
      href:"/bulk-upload",
      icon: Upload,
    },

    {
      name: "Leads Explorer",
      href: "/leads-explorer",
      icon: Compass,
      dataTour: "sidebar-leads-explorer",
      isExpandable: true,
      subItems: [
        {
          name: "Search",
          href: "/leads-explorer",
        },
        {
          name: "Sessions",
          href: "/leads-explorer/sessions",
        },
        {
          name: "Results",
          href: "/leads-explorer/results",
        },
      ],
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
          {navItems.map((item) => {
            const isItemExpanded = expandedItems.includes(item.href)
            const hasSubItems = (item as any).isExpandable && (item as any).subItems
            const isItemActive = isActive(item.href)
            const isAnySubItemActive = hasSubItems && (item as any).subItems.some((sub: any) => isActive(sub.href))

            return (
              <div key={item.href}>
                {hasSubItems ? (
                  <>
                    <Button
                      variant={isItemActive || isAnySubItemActive ? "secondary" : "ghost"}
                      className={cn(
                        "justify-between w-full",
                        (isItemActive || isAnySubItemActive) && "bg-muted font-medium"
                      )}
                      onClick={() => toggleExpanded(item.href)}
                    >
                      <div className="flex items-center gap-3 px-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isItemExpanded && "rotate-180"
                        )}
                      />
                    </Button>
                    {isItemExpanded && (
                      <div className="pl-6 space-y-1 mt-1">
                        {(item as any).subItems.map((subItem: any) => (
                          <Button
                            key={subItem.href}
                            asChild
                            variant={isActive(subItem.href) ? "secondary" : "ghost"}
                            className={cn(
                              "justify-start w-full text-sm",
                              isActive(subItem.href) && "bg-primary/10 text-primary"
                            )}
                            onClick={onNavClick}
                          >
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex items-center px-3 py-2 rounded transition-colors font-medium",
                                isActive(subItem.href)
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-muted text-muted-foreground"
                              )}
                            >
                              {subItem.name}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    asChild
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className={cn("justify-start", isActive(item.href) && "bg-muted font-medium")}
                    onClick={onNavClick}
                  >
                    <Link
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
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
