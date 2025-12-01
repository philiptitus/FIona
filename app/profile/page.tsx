"use client"
export const dynamic = "force-dynamic";
import React, { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout"
import { frontendUrl } from "@/lib/route"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { User, Lock, Eye, EyeOff, Shield, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
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
import { handleUpdateProfile, deleteUserAccount, fetchUserProfile } from "@/store/actions/authActions"
import type { RootState, AppDispatch } from "@/store/store"
import { validatePassword, validateEmail } from "@/lib/utils/validation"
import { fetchMailboxes, startGmailOAuth, finishGmailOAuth, deleteMailbox } from '@/store/actions/mailboxActions'
import MailLoader from '@/components/MailLoader'
import MailboxStatistics from '@/components/mailbox/MailboxStatistics'
import { Dialog, DialogTrigger, DialogContent, DialogHeader as DialogHeaderUI, DialogTitle as DialogTitleUI, DialogDescription as DialogDescriptionUI, DialogFooter as DialogFooterUI } from '@/components/ui/dialog'
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

function ProfilePageContent() {
  const { user, isProfileLoading, isLoading } = useSelector((state: RootState) => state.auth);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [name, setName] = useState(user?.first_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [careerField, setCareerField] = useState(user?.career_field || "")
  const [careerDescription, setCareerDescription] = useState(user?.career_description || "")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState("")
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
  const [isFinishingMailbox, setIsFinishingMailbox] = useState(false)

  // State for form fields
  // const [name, setName] = useState('')
  // const [email, setEmail] = useState('')
  // const [password, setPassword] = useState('')

  useEffect(() => {
    // Fetch user profile when component mounts
    // Always fetch fresh data to avoid caching issues
    const loadProfile = async () => {
      try {
        // Always fetch to get the latest data from backend
        const result = await dispatch(fetchUserProfile() as any).unwrap();
        // Force re-render by ensuring state updates
        if (result) {
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setIsInitialLoad(false);
      }
    };
    
    loadProfile();
    
    // Set activity and preferences
    setActivity(["Logged in", "Updated profile", "Changed password"]);
    setPreferences({ theme: "system", notifications: true });
  }, [dispatch]);
  
  // Update form fields when user data changes
  // Always combine first_name and last_name for display
  useEffect(() => {
    if (user) {
      // Combine first_name and last_name for proper full name display
      const fullName = [
        user.first_name || '',
        user.last_name || ''
      ].filter(Boolean).join(' ').trim();
      
      setName(fullName);
      setEmail(user.email || '');
      setBio(user?.bio || '');
      setCareerField(user?.career_field || '');
      setCareerDescription(user?.career_description || '');
      
      // Save user data to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchMailboxes())
  }, [dispatch])

  useEffect(() => {
    // Check for OAuth callback (e.g., ?mailbox_connected=1 or ?mailbox_error=msg)
    const connected = searchParams.get("mailbox_connected")
    const error = searchParams.get("mailbox_error")
    if (connected) {
      setConnectSuccess(true)
      setActiveSection("mailboxes")
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
      setActiveSection("mailboxes")
      setIsFinishingMailbox(true)
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
        .finally(() => {
          setIsFinishingMailbox(false)
        })
    }
  }, [searchParams, dispatch])

  // (optional) persist user to localStorage for quick access
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      try { localStorage.setItem('user', JSON.stringify(user)) } catch {}
    }
  }, [user])

  if (searchParams.get("mailbox_code") && (loading || isFinishingMailbox)) {
    return <MailLoader />
  }

  // Show loading state only on initial load
  if (isInitialLoad || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we're not loading but still don't have a user, show error
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-destructive">Failed to load user profile. Please try again.</p>
      </div>
    );
  }

  // Role logic
  const role = (user as any).isAdmin ? "Admin" : "User"
  const joinDate = (user as any).date_joined ? new Date((user as any).date_joined).toLocaleDateString() : "-"

  // Section rendering
  const renderSection = () => {
    switch (activeSection) {
      case "personalInfo":
        return (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your account basics.</CardDescription>
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
                    setUpdateSuccess(false)
                    setUpdateError("")
                    
                    // Check if name has actually changed
                    const currentFullName = [
                      user?.first_name || '',
                      user?.last_name || ''
                    ].filter(Boolean).join(' ').trim();
                    
                    const nameChanged = name !== currentFullName;
                    
                    // Split the full name into first and last name
                    const nameParts = name.trim().split(/\s+/);
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    
                    const success = await dispatch(handleUpdateProfile({
                      name: nameChanged ? firstName : undefined,
                      email: email !== user?.email ? email : undefined,
                      password: password || undefined,
                      bio: bio || undefined,
                      career_field: careerField || undefined,
                      career_description: careerDescription || undefined,
                    })).unwrap()
                    if (success) {
                      toast({
                        title: "Profile updated",
                        description: "Your profile has been updated successfully.",
                      })
                      setPassword("")
                      setUpdateSuccess(true)
                      // clear success after a short delay
                      setTimeout(() => setUpdateSuccess(false), 3000)
                    }
                  } catch (err: any) {
                    const msg = err || "Failed to update profile."
                    setFormError(msg)
                    setUpdateError(msg)
                  }
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white">
                      {getInitials(name, email)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="font-semibold">{name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}</div>
                      <div>{email}</div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setActiveSection('personalInfo')}><Edit2 size={14}/> Edit</Button>
                    </div>
                  </div>
                  <div>
                    <div className="mb-3">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <Label htmlFor="bio">Bio</Label>
                      <Input id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself" />
                    </div>
                    <div className="mb-3">
                      <Label htmlFor="careerField">Career Field</Label>
                      <Input id="careerField" value={careerField} onChange={e => setCareerField(e.target.value)} placeholder="e.g., Software Engineering" />
                    </div>
                    <div className="mb-3">
                      <Label htmlFor="careerDescription">Career Description</Label>
                      <Input id="careerDescription" value={careerDescription} onChange={e => setCareerDescription(e.target.value)} placeholder="e.g., Full-stack developer with 5+ years experience" />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                          ) : null}
                          {isLoading ? 'Saving...' : 'Save changes'}
                        </Button>
                      </div>
                      {updateSuccess && <div className="text-green-600 text-sm">Profile updated successfully.</div>}
                      {(formError || updateError) && <div className="text-red-500 text-sm">{formError || updateError}</div>}
                    </div>
                  </div>
                </div>
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
      case "statistics":
        return (
          <div className="mt-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Mailbox Statistics</h3>
              <p className="text-sm text-muted-foreground">Real-time sending performance and analytics for your connected mailboxes</p>
            </div>
            <MailboxStatistics />
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
            <Button variant={activeSection === "statistics" ? "default" : "outline"} onClick={() => setActiveSection("statistics")}>Statistics</Button>
          </nav>
          {/* Main section */}
          <div className="flex-1">
            {renderSection()}

            {/* Actions row */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
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
                      const logoutUri = frontendUrl + "/";
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

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={null}>
      <ProfilePageContent />
    </Suspense>
  );
}

