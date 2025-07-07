"use client"

import MainLayout from "@/components/layout/main-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { fetchMailboxes, startGmailOAuth, finishGmailOAuth, deleteMailbox } from '@/store/actions/mailboxActions'
import MailLoader from '@/components/MailLoader'
import { Dialog, DialogTrigger, DialogContent, DialogHeader as DialogHeaderUI, DialogTitle as DialogTitleUI, DialogDescription as DialogDescriptionUI, DialogFooter as DialogFooterUI, DialogClose } from '@/components/ui/dialog'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Cookies from 'js-cookie'

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

  const mailboxState = useSelector((state: any) => state.mailbox) || {}
  const { mailboxes = [], loading, error, gmailAuthUrl } = mailboxState
  const [mailboxFinishSuccess, setMailboxFinishSuccess] = useState(false)
  const [mailboxFinishError, setMailboxFinishError] = useState("")

  const [redirecting, setRedirecting] = useState(false)
  const [connectSuccess, setConnectSuccess] = useState(false)
  const [connectError, setConnectError] = useState("")
  const searchParams = useSearchParams()

  const [selectedMailbox, setSelectedMailbox] = useState<any>(null)
  const [showMailboxModal, setShowMailboxModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  // Add state for localStorage user info
  const [localUser, setLocalUser] = useState<any>(null)

  useEffect(() => {
    // Could fetch activity/preferences here if backend supports
    setActivity(["Logged in", "Updated profile", "Changed password"])
    setPreferences({ theme: "system", notifications: true })
  }, [])

  useEffect(() => {
    dispatch(fetchMailboxes())
  }, [dispatch])

  useEffect(() => {
    // Check for OAuth callback (e.g., ?mailbox_connected=1 or ?mailbox_error=msg)
    const connected = searchParams.get("mailbox_connected")
    const error = searchParams.get("mailbox_error")
    if (connected) {
      setConnectSuccess(true)
      dispatch(fetchMailboxes())
    } else if (error) {
      setConnectError(error)
    }
  }, [searchParams, dispatch])

  useEffect(() => {
    if (gmailAuthUrl) {
      setRedirecting(true)
      window.location.href = gmailAuthUrl
    }
  }, [gmailAuthUrl])

  useEffect(() => {
    const mailboxCode = searchParams.get("mailbox_code")
    if (mailboxCode) {
      dispatch(finishGmailOAuth(mailboxCode) as any)
        .unwrap()
        .then(() => {
          setMailboxFinishSuccess(true)
          setMailboxFinishError("")
          dispatch(fetchMailboxes())
        })
        .catch((err: any) => {
          setMailboxFinishError(err || "Failed to add mailbox.")
          setMailboxFinishSuccess(false)
        })
    }
  }, [searchParams, dispatch])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          setLocalUser(JSON.parse(userStr))
        } catch {}
      }
    }
  }, [])

  if (searchParams.get("mailbox_code") && loading) {
    return <MailLoader />
  }

  if (!user) {
    return <MailLoader />
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
                    const success = await handleUpdateProfile({
                      name: name !== user?.first_name ? name : undefined,
                      email: email !== user?.email ? email : undefined,
                      password: password || undefined,
                    })(dispatch)
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
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{name}</div>
                    <div className="text-muted-foreground">{email}</div>
                  </div>
                </div>
                {/* Show user info from localStorage below the profile icon */}
                {localUser && (
                  <div className="mt-2 mb-4 p-4 rounded bg-muted/40 text-sm">
                    <div><span className="font-semibold">ID:</span> {localUser.id}</div>
                    <div><span className="font-semibold">Username:</span> {localUser.username}</div>
                    <div><span className="font-semibold">Email:</span> {localUser.email}</div>
                    <div><span className="font-semibold">First Name:</span> {localUser.first_name}</div>
                    <div><span className="font-semibold">Last Name:</span> {localUser.last_name || <span className="italic text-muted-foreground">(none)</span>}</div>
                  </div>
                )}
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
      case "mailboxes":
        return (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Connected Mailboxes</h3>
            {mailboxFinishSuccess && (
              <div className="mb-2 px-3 py-2 rounded bg-green-100 text-green-800 border border-green-300 text-sm w-fit">Gmail mailbox added successfully!</div>
            )}
            {mailboxFinishError && (
              <div className="mb-2 px-3 py-2 rounded bg-red-100 text-red-800 border border-red-300 text-sm w-fit">{mailboxFinishError}</div>
            )}
            {redirecting && <p className="text-blue-500">Redirecting to Google for authentication...</p>}
            {connectSuccess && <p className="text-green-600">Mailbox connected successfully!</p>}
            {connectError && <p className="text-red-500">{connectError}</p>}
            {loading && <p>Loading mailboxes...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="mb-4">
              {mailboxes && mailboxes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mailboxes.map((mb: any) => (
                      <TableRow key={mb.id}>
                        <TableCell className="font-medium">{mb.email}</TableCell>
                        <TableCell><Badge variant="secondary">{mb.provider}</Badge></TableCell>
                        <TableCell>{mb.created_at ? new Date(mb.created_at).toLocaleString() : '-'}</TableCell>
                        <TableCell>{mb.updated_at ? new Date(mb.updated_at).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <Dialog open={showMailboxModal && selectedMailbox?.id === mb.id} onOpenChange={(open) => { setShowMailboxModal(open); if (!open) setSelectedMailbox(null) }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => { setSelectedMailbox(mb); setShowMailboxModal(true) }}>View</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeaderUI>
                                <DialogTitleUI>Mailbox Details</DialogTitleUI>
                                <DialogDescriptionUI>View all mailbox information and manage this connection.</DialogDescriptionUI>
                              </DialogHeaderUI>
                              <div className="space-y-2 text-sm">
                                <div><span className="font-semibold">Email:</span> {mb.email}</div>
                                <div><span className="font-semibold">Provider:</span> {mb.provider}</div>
                                <div><span className="font-semibold">Access Token:</span> <span className="break-all">{mb.access_token ? mb.access_token.slice(0, 8) + '...' : '-'}</span></div>
                                <div><span className="font-semibold">Refresh Token:</span> <span className="break-all">{mb.refresh_token ? mb.refresh_token.slice(0, 8) + '...' : '-'}</span></div>
                                <div><span className="font-semibold">Token Expiry:</span> {mb.token_expiry ? new Date(mb.token_expiry).toLocaleString() : '-'}</div>
                                <div><span className="font-semibold">Created At:</span> {mb.created_at ? new Date(mb.created_at).toLocaleString() : '-'}</div>
                                <div><span className="font-semibold">Updated At:</span> {mb.updated_at ? new Date(mb.updated_at).toLocaleString() : '-'}</div>
                              </div>
                              {deleteError && <div className="mt-2 px-3 py-2 rounded bg-red-100 text-red-800 border border-red-300 text-sm w-fit">{deleteError}</div>}
                              {deleteSuccess && <div className="mt-2 px-3 py-2 rounded bg-green-100 text-green-800 border border-green-300 text-sm w-fit">Mailbox deleted successfully!</div>}
                              {deleteLoading && <MailLoader />}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" className="mt-4 w-full">Delete Mailbox</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Mailbox</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this mailbox? This action cannot be undone and will revoke Google access.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={async () => {
                                      setDeleteLoading(true)
                                      setDeleteError("")
                                      setDeleteSuccess(false)
                                      try {
                                        await dispatch(deleteMailbox(mb.id) as any).unwrap()
                                        setDeleteSuccess(true)
                                        setTimeout(() => {
                                          setShowMailboxModal(false)
                                          setSelectedMailbox(null)
                                          setDeleteSuccess(false)
                                        }, 1200)
                                      } catch (err: any) {
                                        setDeleteError(err || "Failed to delete mailbox.")
                                      } finally {
                                        setDeleteLoading(false)
                                      }
                                    }}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-muted-foreground">No mailboxes connected.</div>
              )}
            </div>
            <Button onClick={handleConnectGmail} disabled={redirecting}>
              {redirecting ? "Redirecting..." : "Connect Gmail"}
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  const handleConnectGmail = () => {
    setConnectError("")
    setConnectSuccess(false)
    dispatch(startGmailOAuth())
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar navigation */}
          <nav className="md:w-1/4 flex flex-row md:flex-col gap-2 md:gap-4 mb-4 md:mb-0">
            <Button variant={activeSection === "personalInfo" ? "default" : "outline"} onClick={() => setActiveSection("personalInfo")}>Personal Info</Button>
            <Button variant={activeSection === "mailboxes" ? "default" : "outline"} onClick={() => setActiveSection("mailboxes")}>Mailboxes</Button>
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
                      await deleteUserAccount()(dispatch)
                      // Replicate sign out logic from header
                      Cookies.remove('token')
                      Cookies.remove('refreshToken')
                      localStorage.removeItem('user')
                      // Redirect to Cognito logout
                      const clientId = "3cv6n93ibe6f3sfltfjrtf8j17";
                      const logoutUri = "http://localhost:3000/";
                      const cognitoDomain = "https://auth.mrphilip.cv";
                      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
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

