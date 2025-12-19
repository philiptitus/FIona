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

  const handleCognitoLogin = () => {
    // Store the redirect URL in sessionStorage before Cognito redirect
    if (typeof window !== "undefined" && redirectTo) {
      sessionStorage.setItem("authRedirect", redirectTo)
    }
    auth.signinRedirect()
  }

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
      <div className="flex h-14 sm:h-16 items-center justify-between border-b px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-xl font-bold">FionaAI</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="mx-auto max-w-sm sm:max-w-md w-full">
          <CardHeader className="space-y-2 sm:space-y-1 px-4 sm:px-6 pt-6 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">Access FionaAI</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">Access your account securely with Philip Auth</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 py-6 sm:py-8 px-4 sm:px-6">
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2 text-base sm:text-lg py-4 sm:py-6 min-h-[48px] sm:min-h-[56px]"
              variant="outline"
              onClick={handleCognitoLogin}
              disabled={auth.isLoading}
            >
              <span role="img" aria-label="lock" className="text-base sm:text-lg">🔒</span>
              <span className="truncate">{auth.isLoading ? "Redirecting..." : "Continue with Philip Auth"}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
