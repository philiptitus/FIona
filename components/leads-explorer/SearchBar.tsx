"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Search, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import businessKeywords from "./data/business_keywords.json"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  isLoading?: boolean
  placeholder?: string
}

interface BusinessItem {
  category: string
  name: string
  keywords: string[]
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = "Search or browse businesses...",
}: SearchBarProps) {
  const [input, setInput] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter businesses and keywords
  const getFilteredResults = (): BusinessItem[] => {
    const searchTerm = input.toLowerCase().trim()

    if (!searchTerm) {
      return []
    }

    const results: BusinessItem[] = []

    businessKeywords.forEach((categoryData: any) => {
      categoryData.businesses.forEach((business: any) => {
        // Check if business name matches
        if (business.name.toLowerCase().includes(searchTerm)) {
          results.push({
            category: categoryData.category,
            name: business.name,
            keywords: business.keywords,
          })
        } else {
          // Check if any keyword matches
          const matchingKeywords = business.keywords.filter((kw: string) =>
            kw.toLowerCase().includes(searchTerm)
          )
          if (matchingKeywords.length > 0) {
            results.push({
              category: categoryData.category,
              name: business.name,
              keywords: business.keywords,
            })
          }
        }
      })
    })

    return results
  }

  const getGroupedResults = (results: BusinessItem[]) => {
    const grouped: { [key: string]: BusinessItem[] } = {}
    results.forEach((result) => {
      if (!grouped[result.category]) {
        grouped[result.category] = []
      }
      grouped[result.category].push(result)
    })
    return grouped
  }

  const getCategoryBrowse = () => {
    const categories = businessKeywords.map((cat: any) => cat.category)
    return categories
  }

  const filteredResults = getFilteredResults()
  const groupedResults = getGroupedResults(filteredResults)
  const showCategoryBrowse = !input.trim()
  const categories = getCategoryBrowse()

  const handleSelectKeyword = (keyword: string) => {
    onChange(keyword)
    setInput("")
    setShowDropdown(false)
  }

  const handleSelectBusiness = (business: BusinessItem) => {
    // Select the keyword that matches the search term, or first keyword if no match
    const searchTerm = input.toLowerCase().trim()
    const matchingKeyword = business.keywords.find((kw) =>
      kw.toLowerCase().includes(searchTerm)
    )
    onChange(matchingKeyword || business.keywords[0])
    setInput("")
    setShowDropdown(false)
  }

  const handleCategoryClick = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(category)
      setInput("") // Clear search input when browsing categories
    }
  }

  const handleClear = () => {
    onChange("")
    setInput("")
    setExpandedCategory(null)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && value) {
      onSearch()
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="flex gap-3 items-center w-full">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowDropdown(true)
              setExpandedCategory(null) // Close expanded category when typing
              setHighlightedIndex(-1)
            }}
            onFocus={() => {
              setShowDropdown(true)
            }}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 200)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-12 pr-4 h-12 text-base rounded-lg border border-input focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all w-full"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={onSearch}
          disabled={!value || isLoading}
          size="lg"
          className="h-12 px-6 sm:px-8 rounded-lg font-semibold flex-shrink-0"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Selected keyword tag */}
      {value && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="default"
            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm"
          >
            {value}
            <button
              onClick={handleClear}
              className="ml-1 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
          <span className="text-xs text-muted-foreground self-center">
            Click X to select a different business
          </span>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="bg-background border border-input rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {/* Category Browse - shown when input is empty */}
          {!input.trim() && !expandedCategory && (
            <div className="p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                📋 Browse Categories
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleCategoryClick(category)
                    }}
                    className={cn(
                      "p-3 text-left text-sm font-medium rounded-lg border transition-all cursor-pointer",
                      expandedCategory === category
                        ? "bg-primary/10 border-primary/50 text-primary"
                        : "bg-muted/30 border-border/50 hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{category}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform flex-shrink-0",
                          expandedCategory === category && "rotate-90"
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expanded category businesses */}
          {!input.trim() && expandedCategory && (
            <div className="p-4 space-y-2">
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleCategoryClick(expandedCategory)
                }}
                className="text-sm font-semibold text-primary flex items-center gap-2 mb-3 hover:underline"
              >
                ← Back to Categories
              </button>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {expandedCategory}
              </p>
              <div className="space-y-2">
                {businessKeywords
                  .find((cat: any) => cat.category === expandedCategory)
                  ?.businesses.map((business: any) => (
                    <button
                      key={business.name}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelectBusiness({
                          category: expandedCategory,
                          name: business.name,
                          keywords: business.keywords,
                        })
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/30 cursor-pointer"
                    >
                      <div className="font-semibold text-sm">{business.name}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {business.keywords.slice(0, 3).map((kw: string) => (
                          <Badge
                            key={kw}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-primary/20"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleSelectKeyword(kw)
                            }}
                          >
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {input.trim() && filteredResults.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No businesses found for '<span className="font-semibold">{input}</span>'
              <p className="text-xs mt-2">Try another search term</p>
            </div>
          )}

          {input.trim() &&
            filteredResults.length > 0 &&
            Object.entries(groupedResults).map(([category, results]) => (
              <div key={category} className="border-b last:border-b-0">
                <div className="px-4 py-2 bg-muted/50 font-semibold text-xs text-muted-foreground uppercase tracking-wide sticky top-0">
                  {category}
                </div>
                {results.map((result, idx) => (
                  <button
                    key={`${result.name}-${idx}`}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelectBusiness(result)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 cursor-pointer"
                  >
                    <div className="font-semibold text-sm">{result.name}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.keywords.slice(0, 3).map((kw) => (
                        <Badge
                          key={kw}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-primary/20"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleSelectKeyword(kw)
                          }}
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
