"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { handleFetchWorkflows } from "@/store/actions/workflowActions"
import { handleFetchLinks } from "@/store/actions/linksActions"
import { handleFetchNeuron, handleCreateNeuron, handleUpdateNeuron, handleToggleNeuron, handleDeleteNeuron, handleFetchExecutions } from "@/store/actions/neuronActions"
import { fetchMailboxes } from "@/store/actions/mailboxActions"
import type { AppDispatch, RootState } from "@/store/store"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bot, Clock, Play, Pause, Trash2, Edit, History } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import NeuronWorkflowPicker from '@/components/NeuronWorkflowPicker'

export default function NeuronPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    workflow: 0,
    campaign_type: "",
    content_preference: "both" as "template" | "content" | "both",
    recipient_type: "email" as "email" | "company",
    generate_email_lists: false,
    allow_sequence: false,
    copies: 1,
    selected_dynamic_variables: [] as string[],
    selected_links: [] as string[],
    scheduled_time: "09:00",
    max_daily_campaigns: 3,
    send_email_notification: false,
    notification_mailbox: null as number | null,
  })

  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { neuron, executions, isLoading } = useSelector((state: RootState) => state.neuron)
  const { workflows } = useSelector((state: RootState) => state.workflows)
  const { links } = useSelector((state: RootState) => state.links)
  const { mailboxes } = useSelector((state: RootState) => state.mailbox)

  const AVAILABLE_DYNAMIC_VARIABLES = [
    { value: 'organization_name', label: 'Organization Name' },
    { value: 'first_name', label: 'First Name' },
    { value: 'last_name', label: 'Last Name' },
    { value: 'title', label: 'Job Title' },
    { value: 'industry', label: 'Industry' },
    { value: 'keywords', label: 'Keywords' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'country', label: 'Country' },
    { value: 'company_name_for_emails', label: 'Company Name (for emails)' },
    { value: 'seniority', label: 'Seniority Level' },
    { value: 'departments', label: 'Departments' },
    { value: 'website', label: 'Website' },
    { value: 'num_employees', label: 'Number of Employees' },
    { value: 'annual_revenue', label: 'Annual Revenue' },
    { value: 'technologies', label: 'Technologies' }
  ]

  const COMPANY_DYNAMIC_VARIABLES = [
    { value: 'company_name', label: 'Company Name' },
    { value: 'company_email', label: 'Company Email' },
    { value: 'company_phone', label: 'Company Phone' },
    { value: 'industry', label: 'Industry' },
    { value: 'company_city', label: 'City' },
    { value: 'company_state', label: 'State' },
    { value: 'company_country', label: 'Country' },
    { value: 'website', label: 'Website' },
    { value: 'number_of_employees', label: 'Number of Employees' },
    { value: 'annual_revenue', label: 'Annual Revenue' },
    { value: 'founded_year', label: 'Founded Year' },
    { value: 'technologies', label: 'Technologies' },
    { value: 'account_stage', label: 'Account Stage' },
    { value: 'total_funding', label: 'Total Funding' },
    { value: 'latest_funding', label: 'Latest Funding' },
    { value: 'sic_codes', label: 'SIC Codes' }
  ]

  useEffect(() => {
    dispatch(handleFetchNeuron() as any)
    dispatch(handleFetchWorkflows() as any)
    dispatch(handleFetchLinks() as any)
    dispatch(handleFetchExecutions() as any)
    dispatch(fetchMailboxes() as any)
  }, [dispatch])

  useEffect(() => {
    if (neuron) {
      setFormData({
        workflow: neuron.workflow,
        campaign_type: neuron.campaign_type,
        content_preference: neuron.content_preference,
        recipient_type: neuron.recipient_type,
        generate_email_lists: neuron.generate_email_lists,
        allow_sequence: neuron.allow_sequence,
        copies: neuron.copies,
        selected_dynamic_variables: neuron.selected_dynamic_variables,
        selected_links: neuron.selected_links,
        scheduled_time: neuron.scheduled_time,
        max_daily_campaigns: neuron.max_daily_campaigns,
        send_email_notification: neuron.send_email_notification || false,
        notification_mailbox: neuron.notification_mailbox || null,
      })
    }
  }, [neuron])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = neuron 
      ? await dispatch(handleUpdateNeuron(formData) as any)
      : await dispatch(handleCreateNeuron(formData) as any)

    if (result.success) {
      toast({
        title: neuron ? "Neuron updated" : "Neuron created",
        description: neuron ? "Your AI assistant has been updated successfully." : "Your AI assistant is now ready to create campaigns automatically.",
      })
      setIsEditing(false)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error as string,
      })
    }
  }

  const handleToggle = async () => {
    const result = await dispatch(handleToggleNeuron() as any)
    if (result.success) {
      toast({
        title: result.data.is_active ? "Neuron activated" : "Neuron deactivated",
        description: result.data.message,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error as string,
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your Neuron? This action cannot be undone.")) return
    
    const result = await dispatch(handleDeleteNeuron() as any)
    if (result.success) {
      toast({
        title: "Neuron deleted",
        description: "Your AI assistant has been removed.",
      })
      setIsEditing(false)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error as string,
      })
    }
  }

  const getStatusBadge = () => {
    if (!neuron) return null
    
    if (!neuron.is_active) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    if (neuron.daily_campaign_count >= neuron.max_daily_campaigns) {
      return <Badge variant="outline">Daily Limit Reached</Badge>
    }
    
    return <Badge variant="default">Active</Badge>
  }

  if (!neuron && !isEditing) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-6 px-2 md:px-0 min-h-screen pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bot className="h-8 w-8" />
              Neuron AI Assistant
            </h1>
            <p className="text-muted-foreground">Set up your AI assistant to automatically create campaigns</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle>No Neuron Configured</CardTitle>
              <CardDescription>
                Create your AI assistant to automatically generate campaigns based on your preferences and schedule.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button onClick={() => setIsEditing(true)}>
                Create Neuron
              </Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (neuron && !isEditing) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-6 px-2 md:px-0 min-h-screen pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Bot className="h-8 w-8" />
                Neuron AI Assistant
              </h1>
              <p className="text-muted-foreground">Your automated campaign creation assistant</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggle}
                disabled={isLoading}
              >
                {neuron.is_active ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {neuron.is_active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Configuration
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Workflow</Label>
                  <p className="text-sm text-muted-foreground">{neuron.workflow_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Campaign Type</Label>
                  <p className="text-sm text-muted-foreground">{neuron.campaign_type}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Schedule</Label>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {neuron.scheduled_time}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Daily Limit</Label>
                    <p className="text-sm text-muted-foreground">
                      {neuron.daily_campaign_count}/{neuron.max_daily_campaigns}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Neuron
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {executions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No executions yet</p>
                ) : (
                  <div className="space-y-2">
                    {executions.slice(0, 5).map((execution) => (
                      <div key={execution.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{execution.campaign_name || "Failed execution"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(execution.executed_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={execution.status === "completed" ? "default" : "destructive"}>
                          {execution.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 px-2 md:px-0 min-h-screen pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8" />
            {neuron ? "Edit Neuron" : "Create Neuron"}
          </h1>
          <p className="text-muted-foreground">Configure your AI assistant for automated campaign creation</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Neuron Configuration</CardTitle>
              <CardDescription>
                Set up your AI assistant to automatically create campaigns based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Workflow *</Label>
                <NeuronWorkflowPicker
                  onWorkflowSelect={(workflow) => {
                    setFormData({
                      ...formData,
                      workflow: workflow.id,
                      campaign_type: workflow.prompt || formData.campaign_type,
                      generate_email_lists: workflow.findleads || formData.generate_email_lists,
                    })
                  }}
                  selectedWorkflowName={neuron?.workflow_name}
                />
                <p className="text-xs text-muted-foreground">
                  Select a workflow to auto-fill campaign settings. You can modify the description after selection.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign_type">Campaign Description *</Label>
                <Textarea
                  id="campaign_type"
                  placeholder="Describe the type of campaigns this neuron should create..."
                  value={formData.campaign_type}
                  onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Scheduled Time *</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_daily_campaigns">Max Daily Campaigns *</Label>
                  <Input
                    id="max_daily_campaigns"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.max_daily_campaigns}
                    onChange={(e) => setFormData({ ...formData, max_daily_campaigns: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates when campaigns are created</p>
                  </div>
                  <Switch
                    id="send_email_notification"
                    checked={formData.send_email_notification}
                    onCheckedChange={(checked) => setFormData({ ...formData, send_email_notification: checked })}
                  />
                </div>
                
                {formData.send_email_notification && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary">
                    <Label htmlFor="notification_mailbox">Send notifications from *</Label>
                    <Select
                      value={formData.notification_mailbox?.toString() || ""}
                      onValueChange={(value) => setFormData({ ...formData, notification_mailbox: parseInt(value) })}
                    >
                      <SelectTrigger id="notification_mailbox">
                        <SelectValue placeholder="Select a mailbox..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mailboxes && mailboxes.length > 0 ? (
                          mailboxes.map((mailbox) => (
                            <SelectItem key={mailbox.id} value={mailbox.id.toString()}>
                              {mailbox.email}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No mailboxes available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Notifications will be sent to your account email address when campaigns are created or fail.
                    </p>
                  </div>
                )}
              </div>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline">Advanced Settings</Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Content Preference</Label>
                    <RadioGroup
                      value={formData.content_preference}
                      onValueChange={(value: any) => setFormData({ ...formData, content_preference: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="template" id="template" />
                        <Label htmlFor="template">Generate HTML Template Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="content" id="content" />
                        <Label htmlFor="content">Generate Email Content Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both">Generate Both Template and Content</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Recipient Type</Label>
                    <RadioGroup
                      value={formData.recipient_type}
                      onValueChange={(value: any) => setFormData({ ...formData, recipient_type: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email-recipient" />
                        <Label htmlFor="email-recipient">Email - Individual addresses</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="company-recipient" />
                        <Label htmlFor="company-recipient">Company - Company addresses</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="generate_email_lists"
                      checked={formData.generate_email_lists}
                      onCheckedChange={(checked) => setFormData({ ...formData, generate_email_lists: checked })}
                    />
                    <Label htmlFor="generate_email_lists">Allow Fiona to find potential leads</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow_sequence"
                      checked={formData.allow_sequence}
                      onCheckedChange={(checked) => setFormData({ ...formData, allow_sequence: checked })}
                    />
                    <Label htmlFor="allow_sequence">Generate Email Sequence</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="copies">Number of Copies: {formData.copies}</Label>
                    <input
                      id="copies"
                      type="range"
                      min="1"
                      max="10"
                      value={formData.copies}
                      onChange={(e) => setFormData({ ...formData, copies: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dynamic Variables</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(formData.recipient_type === "email" ? AVAILABLE_DYNAMIC_VARIABLES : COMPANY_DYNAMIC_VARIABLES).map(({ value, label }) => (
                        <div key={value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dynamic-${value}`}
                            checked={formData.selected_dynamic_variables.includes(value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  selected_dynamic_variables: [...formData.selected_dynamic_variables, value]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  selected_dynamic_variables: formData.selected_dynamic_variables.filter(v => v !== value)
                                })
                              }
                            }}
                          />
                          <Label htmlFor={`dynamic-${value}`} className="text-sm">{label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Include Links</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {links && [
                        { key: 'personal_website', label: 'Personal Website' },
                        { key: 'linkedin', label: 'LinkedIn' },
                        { key: 'twitter', label: 'Twitter' },
                        { key: 'github', label: 'GitHub' },
                        { key: 'facebook', label: 'Facebook' },
                        { key: 'instagram', label: 'Instagram' },
                        { key: 'youtube', label: 'YouTube' },
                        { key: 'medium', label: 'Medium' },
                      ].map(({ key, label }) => {
                        const url = links[key as keyof typeof links] as string
                        if (!url?.trim()) return null
                        
                        return (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={key}
                              checked={formData.selected_links.includes(key)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    selected_links: [...formData.selected_links, key]
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    selected_links: formData.selected_links.filter(link => link !== key)
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={key} className="text-sm">{label}</Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : neuron ? "Update Neuron" : "Create Neuron"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}