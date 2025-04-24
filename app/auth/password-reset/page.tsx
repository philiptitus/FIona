"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { handlePasswordReset } from "@/store/actions/authActions"
import type { RootState, AppDispatch } from "@/store/store"

export default function PasswordResetPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()

  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await dispatch(handlePasswordReset(email))

    if (success) {
      setIsSubmitted(true)
      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you will receive a password reset link.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: error || "There was an error processing your request. Please try again.",
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
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {isSubmitted ? "Check your email for a reset link" : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <div className="text-center text-sm">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p>
                  We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow
                  the instructions.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
