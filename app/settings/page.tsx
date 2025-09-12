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
import { handleFetchLinks, handleCreateLinks, handleUpdateLinks } from "@/store/actions/linksActions"
import MailLoader from "@/components/MailLoader"
import { ChangeEvent, useEffect, useState } from "react"



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
  const { links, isLoading, error } = useSelector((state: RootState) => state.links)
  const dispatch = useDispatch()
  const [linksData, setLinksData] = useState({
    personal_website: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    github: '',
    youtube: '',
    tiktok: '',
    medium: '',
    dribbble: '',
    behance: '',
    stackoverflow: '',
    angel_list: ''
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    dispatch(handleFetchLinks() as any)
  }, [])

  useEffect(() => {
    if (links) {
      setLinksData({
        personal_website: links.personal_website || '',
        linkedin: links.linkedin || '',
        twitter: links.twitter || '',
        facebook: links.facebook || '',
        instagram: links.instagram || '',
        github: links.github || '',
        youtube: links.youtube || '',
        tiktok: links.tiktok || '',
        medium: links.medium || '',
        dribbble: links.dribbble || '',
        behance: links.behance || '',
        stackoverflow: links.stackoverflow || '',
        angel_list: links.angel_list || ''
      })
    }
  }, [links])

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setLanguage(e.target.value))
  }
  const handleNotificationsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setNotifications(e.target.value === "true"))
  }

  const handleLinksChange = (field: string, value: string) => {
    setLinksData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveLinks = async () => {
    const result = links 
      ? await dispatch(handleUpdateLinks(links.id, linksData) as any)
      : await dispatch(handleCreateLinks(linksData) as any)
    
    if (result) {
      setSuccessMessage('Links saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="space-y-10">
          {/* Links Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Social & Profile Links</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Add your social media and professional profile links. These can be used in your email signatures and campaigns to build credibility and provide recipients with ways to connect with you.
            </p>
            
            {isLoading ? (
              <MailLoader />
            ) : (
              <div className="grid gap-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                    {successMessage}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">Personal Website</span>
                    <input 
                      type="url" 
                      value={linksData.personal_website} 
                      onChange={(e) => handleLinksChange('personal_website', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://yourwebsite.com"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">LinkedIn</span>
                    <input 
                      type="url" 
                      value={linksData.linkedin} 
                      onChange={(e) => handleLinksChange('linkedin', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">Twitter</span>
                    <input 
                      type="url" 
                      value={linksData.twitter} 
                      onChange={(e) => handleLinksChange('twitter', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://twitter.com/yourusername"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">GitHub</span>
                    <input 
                      type="url" 
                      value={linksData.github} 
                      onChange={(e) => handleLinksChange('github', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://github.com/yourusername"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">Facebook</span>
                    <input 
                      type="url" 
                      value={linksData.facebook} 
                      onChange={(e) => handleLinksChange('facebook', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://facebook.com/yourprofile"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">Instagram</span>
                    <input 
                      type="url" 
                      value={linksData.instagram} 
                      onChange={(e) => handleLinksChange('instagram', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://instagram.com/yourusername"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">YouTube</span>
                    <input 
                      type="url" 
                      value={linksData.youtube} 
                      onChange={(e) => handleLinksChange('youtube', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://youtube.com/c/yourchannel"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">TikTok</span>
                    <input 
                      type="url" 
                      value={linksData.tiktok} 
                      onChange={(e) => handleLinksChange('tiktok', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://tiktok.com/@yourusername"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">Medium</span>
                    <input 
                      type="url" 
                      value={linksData.medium} 
                      onChange={(e) => handleLinksChange('medium', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://medium.com/@yourusername"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">Dribbble</span>
                    <input 
                      type="url" 
                      value={linksData.dribbble} 
                      onChange={(e) => handleLinksChange('dribbble', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://dribbble.com/yourusername"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">Behance</span>
                    <input 
                      type="url" 
                      value={linksData.behance} 
                      onChange={(e) => handleLinksChange('behance', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://behance.net/yourusername"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">Stack Overflow</span>
                    <input 
                      type="url" 
                      value={linksData.stackoverflow} 
                      onChange={(e) => handleLinksChange('stackoverflow', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://stackoverflow.com/users/yourid"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-sm font-medium">AngelList</span>
                    <input 
                      type="url" 
                      value={linksData.angel_list} 
                      onChange={(e) => handleLinksChange('angel_list', e.target.value)}
                      className="p-2 rounded border" 
                      placeholder="https://angel.co/u/yourprofile"
                    />
                  </label>
                </div>
                
                <Button onClick={handleSaveLinks} className="w-fit">
                  Save Links
                </Button>
              </div>
            )}
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
