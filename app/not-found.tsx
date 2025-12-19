"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Home, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold">FionaAI</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-md space-y-6">
          {/* 404 Display */}
          <div className="space-y-2">
            <div className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              404
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Page Not Found</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Illustration/Icon */}
          <div className="py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10">
              <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard" className="flex items-center gap-2">
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Additional Help Text */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at{" "}
              <a href="mailto:support@fionaai.com" className="text-primary hover:underline">
                support@fionaai.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FionaAI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
