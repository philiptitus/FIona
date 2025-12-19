"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import MailLoader from "@/components/MailLoader"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { handleFetchWorkflows } from "@/store/actions/workflowActions"
import type { AppDispatch } from "@/store/store"
import { useToast } from "@/components/ui/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Props {
  onWorkflowSelect: (workflow: any) => void
  selectedWorkflowName?: string
}

export default function NeuronWorkflowPicker({ onWorkflowSelect, selectedWorkflowName }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const workflowsState = useSelector((s: any) => s.workflows)
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(5)

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
    setCurrentPage(1)
  }

  const selectWorkflow = (workflow: any) => {
    onWorkflowSelect(workflow)
    toast({
      title: `Selected workflow: ${workflow.name}`,
      description: "Workflow selected. Campaign settings have been updated.",
    })
    setOpen(false)
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {selectedWorkflowName ? `Change Workflow (${selectedWorkflowName})` : "Select Workflow"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Workflow</DialogTitle>
          </DialogHeader>

          <div className="flex-shrink-0 relative px-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows by name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {workflowsState?.isLoading ? (
              <div className="flex items-center justify-center p-4">
                <MailLoader />
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-1">
                {workflowsState?.workflows?.length ? (
                  workflowsState.workflows.map((w: any) => (
                    <Button
                      key={w.id}
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      onClick={() => selectWorkflow(w)}
                    >
                      {w.name}
                    </Button>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-4">No workflows found.</div>
                )}
              </div>
            )}
          </div>

          {!workflowsState?.isLoading && workflowsState?.totalCount > pageSize && (
            <div className="flex-shrink-0 border-t pt-3 px-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, workflowsState.totalCount)} of {workflowsState.totalCount} workflows
                </p>
              </div>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}