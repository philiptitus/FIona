"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { handleRegister } from "@/store/actions/authActions"
import type { RootState, AppDispatch } from "@/store/store"
import { validatePassword, validateEmail } from "@/lib/utils/validation"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()

  const { isLoading, isAuthenticated, error } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const validateForm = (): boolean => {
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setValidationError(emailValidation.error)
      return false
    }

    // Validate password
    const passwordValidation = validatePassword(password, name, email)
    if (!passwordValidation.isValid) {
      setValidationError(passwordValidation.error)
      return false
    }

    setValidationError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validationError,
      })
      return
    }

    const success = await dispatch(handleRegister({ name, email, password }))

    if (success) {
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      })
      router.push("/auth/login")
    } else {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error || "There was an error creating your account. Please try again.",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Fiona AI</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
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
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      // Clear validation error when user types
                      if (validationError) setValidationError("")
                    }}
                    required
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
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Password must:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    <li>Be at least 8 characters long</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Include numbers and special characters</li>
                    <li>Not contain your name or email</li>
                  </ul>
                </div>
                {validationError && (
                  <p className="text-sm text-destructive mt-2">{validationError}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Register"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
