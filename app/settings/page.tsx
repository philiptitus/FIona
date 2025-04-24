"use client"

import MainLayout from "@/components/layout/main-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store/store"
import {
  setTheme,
  setFontSize,
  setLanguage,
  setNotifications,
} from "@/store/settingsSlice"
import { ChangeEvent } from "react"

const appearanceOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
]

const fontSizeOptions = [
  { label: "Small", value: "sm" },
  { label: "Base", value: "base" },
  { label: "Large", value: "lg" },
]

const languageOptions = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
]

const notificationOptions = [
  { label: "On", value: true },
  { label: "Off", value: false },
]

export default function SettingsPage() {
  const settings = useSelector((state: RootState) => state.settings)
  const dispatch = useDispatch()

  const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setTheme(e.target.value as Theme))
  }
  const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFontSize(e.target.value as FontSize))
  }
  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setLanguage(e.target.value))
  }
  const handleNotificationsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setNotifications(e.target.value === "true"))
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="space-y-10">
          {/* Appearance Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="grid gap-4">
              <label className="flex flex-col">
                <span className="mb-1">Theme</span>
                <select value={settings.theme} onChange={handleThemeChange} className="p-2 rounded border">
                  {appearanceOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col">
                <span className="mb-1">Font Size</span>
                <select value={settings.fontSize} onChange={handleFontSizeChange} className="p-2 rounded border">
                  {fontSizeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
          {/* Language Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Language</h2>
            <div className="grid gap-4">
              <label className="flex flex-col">
                <span className="mb-1">Language</span>
                <select value={settings.language} onChange={handleLanguageChange} className="p-2 rounded border">
                  {languageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
          {/* Notifications Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="grid gap-4">
              <label className="flex flex-col">
                <span className="mb-1">Notifications</span>
                <select value={settings.notifications} onChange={handleNotificationsChange} className="p-2 rounded border">
                  {notificationOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
