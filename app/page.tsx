"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, BarChart, Users, LayoutTemplate, Send, Zap, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import LandingHeroAnimation from "@/components/landing-hero-animation"
import { LandingFeatureCard } from "@/components/landing-feature-card"
import { motion } from "framer-motion"
import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { loginSuccess,  } from "@/store/slices/authSlice"
import Cookies from "js-cookie"
import { handleUpdateProfile } from "@/store/actions/authActions"
import { useToast } from "@/components/ui/use-toast"
import React from "react"
import { toast } from "sonner"
const FEATURES = [
  {
    icon: Zap,
    title: "AI Campaign Generation",
    description: "Create complete campaigns in seconds with AI"
  },
  {
    icon: LayoutTemplate,
    title: "Smart Templates",
    description: "AI-powered template creation and optimization"
  },
  {
    icon: BarChart,
    title: "Advanced Analytics",
    description: "Real-time insights and performance tracking"
  },
  {
    icon: Send,
    title: "Automated Dispatch",
    description: "Schedule and automate email delivery"
  },
  {
    icon: Users,
    title: "List Management",
    description: "Smart contact organization and segmentation"
  },
  {
    icon: Sparkles,
    title: "AI Content Creation",
    description: "Generate engaging email content instantly"
  },
]

const HOW_IT_WORKS = [
  {
    number: "01",
    title: "Create Campaign",
    description: "Use AI to generate content and design"
  },
  {
    number: "02",
    title: "Set Automation",
    description: "Configure sending rules and schedules"
  },
  {
    number: "03",
    title: "Track Results",
    description: "Monitor performance with real-time analytics"
  }
]

const SOCIAL_PROOF = [
  { number: "99.9%", label: "Delivery Rate" },
  { number: "2M+", label: "Emails Sent" },
  { number: "35%", label: "Higher Open Rates" }
]

const PRICING = [
  {
    name: "Starter",
    price: "$29",
    features: ["5,000 emails/month", "Basic analytics", "AI templates"]
  },
  {
    name: "Professional",
    price: "$79",
    features: ["20,000 emails/month", "Advanced analytics", "Priority support"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited emails", "Custom integration", "Dedicated support"]
  }
]

export default function LandingPage() {
  const auth = useAuth()
  const router = useRouter()
  const dispatch = useDispatch()
  const { toast } = useToast()

  // Handle Cognito callback
  useEffect(() => {
    // Check if we have auth code in URL (Cognito callback)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      
      if (code && state) {
        // We have a Cognito callback, wait for auth to complete
        if (auth.isAuthenticated && auth.user) {
          // Set cookies and Redux state to match your existing auth flow
          const user = {
            id: auth.user.profile.sub,
            username: auth.user.profile.preferred_username || auth.user.profile.email,
            email: auth.user.profile.email,
            first_name: auth.user.profile.given_name || auth.user.profile.email?.split('@')[0] || 'User',
            last_name: auth.user.profile.family_name || '',
          }
          
          // Set cookies to match your existing auth flow
          Cookies.set('token', auth.user.id_token)
          if (auth.user.refresh_token) {
            Cookies.set('refreshToken', auth.user.refresh_token)
          }
          
          // Set user in localStorage
          localStorage.setItem('user', JSON.stringify(user))
          
          // Dispatch to Redux store
          dispatch(loginSuccess({ 
            user, 
            token: auth.user.id_token, 
            refreshToken: auth.user.refresh_token 
          }))

          // --- Background sync with backend profile ---
          // Only send name and email as per backend expectations
          const name = auth.user.profile.given_name || auth.user.profile.email?.split('@')[0] || 'User';
          const email = auth.user.profile.email;
          dispatch(handleUpdateProfile({ name, email }));
          // --- End background sync ---
          
          // Redirect to dashboard
          router.replace('/dashboard')
        }
      }
    }
  }, [auth.isAuthenticated, auth.user, router, dispatch])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FionaAI</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium hover:text-primary">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium hover:text-primary">
                How It Works
              </Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-primary">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/login">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            className="flex-1 flex flex-col items-start gap-8"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
              AI-Powered Email Campaigns, Instantly Delivered
            </h1>
            <p className="text-xl text-muted-foreground mt-4">
              Create, automate, and optimize your email campaigns with AI-driven insights and powerful analytics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" className="bg-primary text-primary-foreground" asChild>
                <Link href="/auth/login">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-secondary text-secondary-foreground" asChild>
                <Link href="#demo">View Demo</Link>
              </Button>
            </div>
          </motion.div>
          <LandingHeroAnimation />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to launch, automate, and analyze your campaigns in one AI-powered platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <LandingFeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get up and running in three easy steps.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            {HOW_IT_WORKS.map((step) => (
              <motion.div
                key={step.number}
                className="flex-1 bg-white dark:bg-card rounded-xl shadow-md p-8 flex flex-col items-center text-center border border-muted"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <span className="text-4xl font-bold text-primary mb-2">{step.number}</span>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-base text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {SOCIAL_PROOF.map((stat) => (
              <motion.div
                key={stat.label}
                className="bg-white dark:bg-card rounded-xl shadow-md p-8 border border-muted"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-base text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent pricing for teams of all sizes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING.map((plan) => (
              <motion.div
                key={plan.name}
                className="bg-white dark:bg-card rounded-xl shadow-md p-8 flex flex-col items-center border border-muted"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="text-2xl font-bold mb-2">{plan.name}</div>
                <div className="text-3xl font-extrabold text-primary mb-4">{plan.price}</div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-base text-muted-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary inline-block"></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="w-full">Start Free Trial</Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white/80 dark:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">FionaAI</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FionaAI. All rights reserved. Built by {" "}
            <a
              href="https://mrphilip.cv"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Philip Titus
            </a>.
          </div>
        </div>
      </footer>
    </div>
  )
}
