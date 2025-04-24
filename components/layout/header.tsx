"use client"

import { Bell, Mail, Menu, Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Sidebar from "./sidebar"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { handleLogout } from "@/store/actions/authActions"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { RootState, AppDispatch } from "@/store/store"
import Fuse from "fuse.js"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // Redux state for dynamic entities
  const { user } = useSelector((state: RootState) => state.auth)
  const { campaigns } = useSelector((state: RootState) => state.campaigns)
  const { templates } = useSelector((state: RootState) => state.template)
  const { contents } = useSelector((state: RootState) => state.content)
  const { emails } = useSelector((state: RootState) => state.emails)

  // Static and dynamic search index
  const searchIndex = [
    { label: "Dashboard", path: "/dashboard", type: "page" },
    { label: "Campaigns", path: "/campaigns", type: "page" },
    { label: "Create Campaign", path: "/campaigns/new", type: "page" },
    ...campaigns.map((c: any) => ({ label: c.name, path: `/campaigns/${c.id}`, type: "campaign" })),
    { label: "Templates", path: "/templates", type: "page" },
    ...templates.map((t: any) => ({ label: t.name, path: `/templates/${t.id}`, type: "template" })),
    { label: "Content", path: "/content", type: "page" },
    ...contents.map((c: any) => ({ label: c.name, path: `/content/${c.id}`, type: "content" })),
    { label: "Emails", path: "/emails", type: "page" },
    ...emails.map((e: any) => ({ label: e.organization_name || e.email, path: `/emails/${e.id}`, type: "email" })),
    { label: "Dispatches", path: "/dispatches", type: "page" },
    { label: "Email Lists", path: "/email-lists", type: "page" },
    { label: "Analytics", path: "/analytics", type: "page" },
    { label: "Profile", path: "/profile", type: "page" },
    { label: "Settings", path: "/settings", type: "page" },
  ]

  // Fuse.js fuzzy search config
  const fuse = new Fuse(searchIndex, { keys: ["label", "type"], threshold: 0.4 })

  useEffect(() => {
    if (search.trim().length > 0) {
      setResults(fuse.search(search).map(r => r.item).slice(0, 6))
      setShowResults(true)
    } else {
      setResults([])
      setShowResults(false)
    }
    setActiveIndex(-1)
  }, [search, campaigns, templates, contents, emails])

  const handleSelect = (item: any) => {
    setSearch("")
    setShowResults(false)
    router.push(item.path)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(results.length - 1, prev + 1))
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(0, prev - 1))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(results[activeIndex])
    } else if (e.key === "Escape") {
      setShowResults(false)
    }
  }

  // Rename to avoid recursion
  const handleLogoutClick = () => {
    dispatch(handleLogout())
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar isMobile onNavClick={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="w-full flex items-center gap-4 md:gap-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search..."
            className="w-full pl-8 bg-background"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setShowResults(search.length > 0)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {showResults && results.length > 0 && (
            <div className="absolute left-0 mt-1 w-full bg-popover border rounded-md shadow-lg z-50 max-h-72 overflow-auto">
              {results.map((item, idx) => (
                <div
                  key={item.path}
                  className={`px-4 py-2 cursor-pointer hover:bg-muted ${idx === activeIndex ? "bg-muted" : ""}`}
                  onMouseDown={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{item.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="relative">
            <Mail className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              5
            </span>
            <span className="sr-only">Messages</span>
          </Button>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
            <span className="sr-only">Notifications</span>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={user?.first_name || "User"} />
                  <AvatarFallback>
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              {user && (
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.first_name}</div>
                  <div className="text-muted-foreground text-xs">{user.email}</div>
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/profile">Profile</a>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/settings">Settings</a>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogoutClick}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
