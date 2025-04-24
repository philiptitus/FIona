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

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempted, setLoginAttempted] = useState(false)

  const { isLoading, isAuthenticated, error } = useSelector((state: RootState) => state.auth)
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
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/password-reset" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
