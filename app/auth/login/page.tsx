"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { handleLogin } from "@/store/actions/authActions"
import type { RootState, AppDispatch } from "@/store/store"
import { validateEmail, validatePassword } from "@/lib/utils/validation"
import Cookies from "js-cookie"
import { useAuth } from "react-oidc-context"

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempted, setLoginAttempted] = useState(false)

  const { isLoading, isAuthenticated, error } = useSelector((state: RootState) => state.auth)
  const auth = useAuth()
  // Avoid useSearchParams to prevent Next.js build errors. Use a fallback.
  let redirectTo = "/dashboard"
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href)
    const param = url.searchParams.get("redirect")
    if (param) redirectTo = param
  }

  // Handle authentication state changes and error display
  useEffect(() => {
    const token = Cookies.get("token")
    if (token && isAuthenticated) {
      toast({
        title: "Login successful",
        description: "Welcome back to Fiona AI!",
      })
      router.replace(redirectTo)
    }
  }, [isAuthenticated, redirectTo, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: emailValidation.error,
      })
      return
    }
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: passwordValidation.error,
      })
      return
    }
    await dispatch(handleLogin({ email, password }))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FionaAI</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Access FionaAI</CardTitle>
            <CardDescription className="text-center">Access your account securely with Philip Auth</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 py-8">
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2 text-lg py-6"
              variant="outline"
              onClick={() => auth.signinRedirect()}
              disabled={auth.isLoading}
            >
              <span role="img" aria-label="lock">🔒</span>
              {auth.isLoading ? "Redirecting..." : "Continue with Philip Auth"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
