"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"

export default function PasswordResetConfirmPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const { uidb64, token } = params as { uidb64: string; token: string }

  useEffect(() => {
    const validateToken = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await validateResetToken(uidb64, token)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsValidToken(true)
      } catch (error) {
        setIsValidToken(false)
        toast({
          variant: "destructive",
          title: "Invalid or expired token",
          description: "This password reset link is invalid or has expired.",
        })
      }
    }

    validateToken()
  }, [uidb64, token, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would be an API call
      // const response = await resetPassword({ password, token, uidb64 })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSuccess(true)
      toast({
        title: "Password reset successful",
        description: "Your password has been reset successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: "There was an error resetting your password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Fiona AI</span>
        </div>
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {isSuccess ? "Your password has been reset successfully" : "Create a new password for your account"}
            </CardDescription>
          </CardHeader>

          {isValidToken === null ? (
            <CardContent className="flex justify-center p-6">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p>Validating your reset link...</p>
              </div>
            </CardContent>
          ) : isValidToken === false ? (
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
                <p>This password reset link is invalid or has expired.</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/auth/password-reset">Request a new link</Link>
              </Button>
            </CardContent>
          ) : isSuccess ? (
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2 p-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="text-center">Your password has been reset successfully.</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special
                  characters.
                </p>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
