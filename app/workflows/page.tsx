"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import type { AppDispatch } from "@/store/store"
import {
  handleFetchWorkflows,
  handleCreateWorkflow,
  handleUpdateWorkflow,
  handleDeleteWorkflow,
  handleBulkDeleteWorkflows,
} from "@/store/actions/workflowActions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import MailLoader from "@/components/MailLoader"
import { Trash2, Edit, Plus, AlertCircle, CheckCircle2, Copy, Search } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import WorkflowForm from "./components/WorkflowForm"
import WorkflowList from "./components/WorkflowList"
import TagManager from "./components/TagManager"

export default function WorkflowsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const workflowsState = useSelector((state: any) => state.workflows)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null)
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<number>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const fetchWorkflowsWithParams = useCallback(async () => {
    await dispatch(
      handleFetchWorkflows({
        page: currentPage,
        pageSize,
        search: searchQuery || undefined,
      })
    )
  }, [dispatch, currentPage, pageSize, searchQuery])

  useEffect(() => {
    fetchWorkflowsWithParams()
  }, [fetchWorkflowsWithParams])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleCreateWorkflowSubmit = async (data: any) => {
    const result = await dispatch(handleCreateWorkflow(data))
    if (result.success) {
      toast({
        title: "Success",
        description: `Workflow "${data.name}" created successfully`,
      })
      setCreateDialogOpen(false)
    } else {
      toast({
        title: "Error",
        description: result.error?.message || "Failed to create workflow",
        variant: "destructive",
      })
    }
  }

  const handleUpdateWorkflowSubmit = async (data: any) => {
    if (!editingWorkflow) return
    
    const result = await dispatch(handleUpdateWorkflow({
      id: editingWorkflow.id,
      ...data,
    }))
    
    if (result.success) {
      toast({
        title: "Success",
        description: `Workflow "${data.name}" updated successfully`,
      })
      setEditingWorkflow(null)
    } else {
      toast({
        title: "Error",
        description: result.error?.message || "Failed to update workflow",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSingle = async (id: number) => {
    setDeleteTarget(id)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteSingle = async () => {
    if (deleteTarget === null) return
    
    const result = await dispatch(handleDeleteWorkflow(deleteTarget))
    if (result.success) {
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      })
      setSelectedWorkflows(prev => {
        const newSet = new Set(prev)
        newSet.delete(deleteTarget)
        return newSet
      })
    } else {
      toast({
        title: "Error",
        description: result.error?.message || "Failed to delete workflow",
        variant: "destructive",
      })
    }
    setShowDeleteConfirm(false)
    setDeleteTarget(null)
  }

  const handleBulkDelete = () => {
    if (selectedWorkflows.size === 0) return
    setShowBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    const idsToDelete = Array.from(selectedWorkflows)
    const result = await dispatch(handleBulkDeleteWorkflows(idsToDelete))
    
    if (result.success) {
      toast({
        title: "Success",
        description: `${result.deletedCount} workflow(s) deleted successfully`,
      })
      setSelectedWorkflows(new Set())
    } else {
      toast({
        title: "Error",
        description: result.error?.message || "Failed to delete workflows",
        variant: "destructive",
      })
    }
    setShowBulkDeleteConfirm(false)
  }

  const toggleWorkflowSelection = (id: number) => {
    const newSet = new Set(selectedWorkflows)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedWorkflows(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedWorkflows.size === workflowsState.workflows.length) {
      setSelectedWorkflows(new Set())
    } else {
      setSelectedWorkflows(new Set(workflowsState.workflows.map((w: any) => w.id)))
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Workflow Management</h1>
        <p className="text-muted-foreground">Create and manage AI workflows for smart campaigns. Use tags like name to personalize prompts.</p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows by name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Workflow
        </Button>
        
        {selectedWorkflows.size > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <span className="text-sm text-muted-foreground">{selectedWorkflows.size} selected</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Workflows List */}
      {workflowsState.isLoading ? (
        <div className="flex items-center justify-center p-12">
          <MailLoader />
        </div>
      ) : workflowsState.workflows.length > 0 ? (
        <>
          <div className="bg-card rounded-lg border">
            <WorkflowList
              workflows={workflowsState.workflows}
              selectedWorkflows={selectedWorkflows}
              onToggleSelect={toggleWorkflowSelection}
              onToggleSelectAll={toggleSelectAll}
              onEdit={setEditingWorkflow}
              onDelete={handleDeleteSingle}
            />
          </div>

          {/* Pagination */}
          {workflowsState.totalCount > pageSize && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, workflowsState.totalCount)} of {workflowsState.totalCount} workflows
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.ceil(workflowsState.totalCount / pageSize) }, (_, i) => i + 1).map((page) => {
                    const totalPages = Math.ceil(workflowsState.totalCount / pageSize)
                    const isNearCurrent = Math.abs(page - currentPage) <= 1
                    const isFirstOrLast = page === 1 || page === totalPages

                    if (!isNearCurrent && !isFirstOrLast) {
                      if (page === 2 && currentPage > 3) return <PaginationEllipsis key={page} />
                      if (page === totalPages - 1 && currentPage < totalPages - 2) return <PaginationEllipsis key={page} />
                      return null
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, Math.ceil(workflowsState.totalCount / pageSize))
                        )
                      }
                      className={
                        currentPage >= Math.ceil(workflowsState.totalCount / pageSize)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-dashed gap-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg">No workflows yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first workflow to get started with AI-powered campaigns.</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Workflow
          </Button>
        </div>
      )}

      {/* Create/Edit Workflow Dialog */}
      <Dialog open={createDialogOpen || !!editingWorkflow} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false)
          setEditingWorkflow(null)
        } else if (!editingWorkflow) {
          setCreateDialogOpen(true)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWorkflow ? "Edit Workflow" : "Create New Workflow"}
            </DialogTitle>
          </DialogHeader>
          
          <WorkflowForm
            workflow={editingWorkflow}
            onSubmit={editingWorkflow ? handleUpdateWorkflowSubmit : handleCreateWorkflowSubmit}
            onCancel={() => {
              setCreateDialogOpen(false)
              setEditingWorkflow(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Single Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this workflow? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSingle}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bulk Confirmation */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflows</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete {selectedWorkflows.size} workflow(s)? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </MainLayout>
  )
}
