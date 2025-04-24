"use client"

import MainLayout from "@/components/layout/main-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Mail, User, Lock, Eye, EyeOff, Shield, Download, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { handleUpdateProfile, deleteUserAccount } from "@/store/actions/authActions"
import type { RootState, AppDispatch } from "@/store/store"
import { validatePassword, validateEmail } from "@/lib/utils/validation"

// Helper for avatar
function getInitials(name: string, email: string) {
  if (!name && !email) return "?"
  if (name) {
    const parts = name.split(" ").filter(Boolean)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return email[0].toUpperCase()
}

export default function ProfilePage() {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)
  const [name, setName] = useState(user?.first_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [activeSection, setActiveSection] = useState<string>("personalInfo")
  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()

  // For activity and preferences placeholders
  const [activity, setActivity] = useState<string[]>([])
  const [preferences, setPreferences] = useState<any>({})

  useEffect(() => {
    // Could fetch activity/preferences here if backend supports
    setActivity(["Logged in", "Updated profile", "Changed password"])
    setPreferences({ theme: "system", notifications: true })
  }, [])

  if (!user) {
    return <div className="p-8 text-center">Loading user info...</div>
  }

  // Role logic
  const role = (user as any).isAdmin ? "Admin" : "User"
  const joinDate = (user as any).date_joined ? new Date((user as any).date_joined).toLocaleDateString() : "-"

  // Section rendering
  const renderSection = () => {
    switch (activeSection) {
      case "personalInfo":
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your name and email address</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setFormError("")
                  // Validate email if changed
                  if (email !== user?.email) {
                    const emailValidation = validateEmail(email)
                    if (!emailValidation.isValid) {
                      setFormError(emailValidation.error)
                      return
                    }
                  }
                  // Validate password if provided
                  if (password) {
                    const passwordValidation = validatePassword(password, name, email)
                    if (!passwordValidation.isValid) {
                      setFormError(passwordValidation.error)
                      return
                    }
                  }
                  try {
                    const success = await dispatch(
                      handleUpdateProfile({
                        name: name !== user?.first_name ? name : undefined,
                        email: email !== user?.email ? email : undefined,
                        password: password || undefined,
                      })
                    )
                    if (success) {
                      toast({
                        title: "Profile updated",
                        description: "Your profile has been updated successfully.",
                      })
                      setPassword("")
                    }
                  } catch {
                    setFormError("Failed to update profile.")
                  }
                }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                    {getInitials(name, email)}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{name}</div>
                    <div className="text-muted-foreground">{email}</div>
                    <div className="text-xs mt-1">Role: <span className="font-medium">{role}</span></div>
                    <div className="text-xs">Joined: <span className="font-medium">{joinDate}</span></div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full">Update Profile</Button>
                  </div>
                </div>
                {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}
              </form>
            </CardContent>
          </Card>
        )
      case "security":
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password or manage security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => setActiveSection("personalInfo") /* Focus password field */}>
                  <Lock size={16} /> Change Password
                </Button>
                <div className="text-muted-foreground text-sm">Two-factor authentication coming soon.</div>
              </div>
            </CardContent>
          </Card>
        )
      case "preferences":
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your application preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div>Theme: <span className="font-semibold">{preferences.theme}</span></div>
                <div>Notifications: <span className="font-semibold">{preferences.notifications ? "On" : "Off"}</span></div>
                <div className="text-muted-foreground text-sm">More preferences coming soon.</div>
              </div>
            </CardContent>
          </Card>
        )
      case "activity":
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Recent account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6">
                {activity.length === 0 ? (
                  <li className="text-muted-foreground">No recent activity.</li>
                ) : (
                  activity.map((act, idx) => <li key={idx}>{act}</li>)
                )}
              </ul>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar navigation */}
          <nav className="md:w-1/4 flex flex-row md:flex-col gap-2 md:gap-4 mb-4 md:mb-0">
            <Button variant={activeSection === "personalInfo" ? "default" : "outline"} onClick={() => setActiveSection("personalInfo")}>Personal Info</Button>
            <Button variant={activeSection === "security" ? "default" : "outline"} onClick={() => setActiveSection("security")}>Security</Button>
            <Button variant={activeSection === "preferences" ? "default" : "outline"} onClick={() => setActiveSection("preferences")}>Preferences</Button>
            <Button variant={activeSection === "activity" ? "default" : "outline"} onClick={() => setActiveSection("activity")}>Activity</Button>
          </nav>
          {/* Main section */}
          <div className="flex-1">
            {renderSection()}
            {/* Actions row */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => toast({ title: "Export Data", description: "Data export coming soon." })}>
                <Download size={16} /> Export Data
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2"><Trash2 size={16} /> Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your account? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                      await dispatch(deleteUserAccount())
                      router.push("/auth/login")
                    }}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
