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
import { handleFetchCleanupSettings, handleUpdateCleanupSettings } from "@/store/actions/mailboxCleanupActions"
import { handleFetchUserSettings, handleUpdateUserSettings } from "@/store/actions/userSettingsActions"
import MailLoader from "@/components/MailLoader"
import { ChangeEvent, useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Clock } from "lucide-react"



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
  const { settings: cleanupSettings, isLoading: cleanupLoading, error: cleanupError } = useSelector((state: RootState) => state.mailboxCleanup)
  const { settings: userSettings, isLoading: userSettingsLoading, error: userSettingsError } = useSelector((state: RootState) => state.userSettings)
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
  const [cleanupSuccessMessage, setCleanupSuccessMessage] = useState('')
  const [userSettingsSuccessMessage, setUserSettingsSuccessMessage] = useState('')
  const [wordLimits, setWordLimits] = useState({
    default_email_word_limit: 100,
    default_template_word_limit: 100,
    sequence_initial: 100,
    sequence_followup: 70,
    sequence_final: 50
  })

  useEffect(() => {
    dispatch(handleFetchLinks() as any)
    dispatch(handleFetchCleanupSettings() as any)
    dispatch(handleFetchUserSettings() as any)
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

  useEffect(() => {
    if (userSettings) {
      setWordLimits({
        default_email_word_limit: userSettings.default_email_word_limit,
        default_template_word_limit: userSettings.default_template_word_limit,
        sequence_initial: userSettings.sequence_initial,
        sequence_followup: userSettings.sequence_followup,
        sequence_final: userSettings.sequence_final
      })
    }
  }, [userSettings])

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

  const handleCleanupToggle = async (enabled: boolean) => {
    const payload: any = { enable_mailbox_cleanup: enabled }
    
    if (enabled && !cleanupSettings?.cleanup_scheduled_time) {
      payload.cleanup_scheduled_time = "02:00:00"
    }

    const result = await dispatch(handleUpdateCleanupSettings(payload) as any)
    if (result.success) {
      setCleanupSuccessMessage('Cleanup settings updated successfully!')
      setTimeout(() => setCleanupSuccessMessage(''), 3000)
    }
  }

  const handleCleanupTimeChange = async (time: string) => {
    const result = await dispatch(handleUpdateCleanupSettings({ 
      cleanup_scheduled_time: time + ":00" 
    }) as any)
    if (result.success) {
      setCleanupSuccessMessage('Cleanup time updated successfully!')
      setTimeout(() => setCleanupSuccessMessage(''), 3000)
    }
  }

  const handleWordLimitChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0
    setWordLimits(prev => ({ ...prev, [field]: numValue }))
  }

  const handleSaveWordLimits = async () => {
    const result = await dispatch(handleUpdateUserSettings(wordLimits) as any)
    if (result.success) {
      setUserSettingsSuccessMessage('AI word limits updated successfully!')
      setTimeout(() => setUserSettingsSuccessMessage(''), 3000)
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
          {/* AI Word Limits Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">AI Generation Word Limits</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configure default word limits for AI-generated content. These limits help control the length of emails and templates generated by the AI.
            </p>
            
            {userSettingsLoading ? (
              <MailLoader />
            ) : (
              <div className="space-y-4">
                {userSettingsError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {typeof userSettingsError === 'string' ? userSettingsError : 'Failed to load settings'}
                  </div>
                )}
                {userSettingsSuccessMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                    {userSettingsSuccessMessage}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label htmlFor="default_email_word_limit" className="mb-2">Default Email Word Limit</Label>
                    <Input
                      id="default_email_word_limit"
                      type="number"
                      min="10"
                      max="500"
                      value={wordLimits.default_email_word_limit}
                      onChange={(e) => handleWordLimitChange('default_email_word_limit', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <Label htmlFor="default_template_word_limit" className="mb-2">Default Template Word Limit</Label>
                    <Input
                      id="default_template_word_limit"
                      type="number"
                      min="10"
                      max="500"
                      value={wordLimits.default_template_word_limit}
                      onChange={(e) => handleWordLimitChange('default_template_word_limit', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <Label htmlFor="sequence_initial" className="mb-2">Sequence Initial Email</Label>
                    <Input
                      id="sequence_initial"
                      type="number"
                      min="10"
                      max="500"
                      value={wordLimits.sequence_initial}
                      onChange={(e) => handleWordLimitChange('sequence_initial', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <Label htmlFor="sequence_followup" className="mb-2">Sequence Follow-up Email</Label>
                    <Input
                      id="sequence_followup"
                      type="number"
                      min="10"
                      max="500"
                      value={wordLimits.sequence_followup}
                      onChange={(e) => handleWordLimitChange('sequence_followup', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <Label htmlFor="sequence_final" className="mb-2">Sequence Final Email</Label>
                    <Input
                      id="sequence_final"
                      type="number"
                      min="10"
                      max="500"
                      value={wordLimits.sequence_final}
                      onChange={(e) => handleWordLimitChange('sequence_final', e.target.value)}
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveWordLimits} className="w-fit">
                  Save Word Limits
                </Button>
              </div>
            )}
          </section>

          {/* Mailbox Cleanup Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Mailbox Cleanup Automation
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Automatically detect and remove bounced email addresses from your database to maintain list hygiene and improve delivery rates.
            </p>
            
            {cleanupLoading ? (
              <MailLoader />
            ) : (
              <div className="space-y-4">
                {cleanupError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {cleanupError}
                  </div>
                )}
                {cleanupSuccessMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                    {cleanupSuccessMessage}
                  </div>
                )}
                
                <div className="border rounded-lg p-4 bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">Enable Automatic Cleanup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically remove bounced email addresses daily
                      </p>
                    </div>
                    <Switch
                      checked={cleanupSettings?.enable_mailbox_cleanup || false}
                      onCheckedChange={handleCleanupToggle}
                    />
                  </div>
                  
                  {cleanupSettings?.enable_mailbox_cleanup && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary">
                      <Label htmlFor="cleanup_time" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Cleanup Time (UTC)
                      </Label>
                      <Input
                        id="cleanup_time"
                        type="time"
                        value={cleanupSettings.cleanup_scheduled_time?.slice(0, 5) || "02:00"}
                        onChange={(e) => handleCleanupTimeChange(e.target.value)}
                        className="w-32"
                      />
                      <p className="text-xs text-muted-foreground">
                        Daily cleanup will run at this time (UTC). All your connected mailboxes will be processed to detect and remove bounced addresses.
                      </p>
                    </div>
                  )}
                </div>
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
