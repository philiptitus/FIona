"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export default function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg">
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{startItem}</span>
        {" – "}
        <span className="font-semibold text-foreground">{endItem}</span> of{" "}
        <span className="font-semibold text-foreground">{totalCount}</span> results
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-20 h-9 text-sm rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-9 w-9 p-0 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1
              const isNearCurrent =
                Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages

              if (!isNearCurrent && i > 0 && i < totalPages - 1) return null

              if (
                !isNearCurrent &&
                i > 0 &&
                i < totalPages - 1 &&
                i === Math.floor(totalPages / 2)
              ) {
                return (
                  <span key="dots" className="text-xs text-muted-foreground px-2">
                    ...
                  </span>
                )
              }

              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-9 w-9 p-0 text-xs rounded-lg"
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-9 w-9 p-0 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
