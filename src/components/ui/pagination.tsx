// src/components/ui/pagination.tsx
// Kontrol paginasi generik untuk endpoint yang mengembalikan Spring Page<T>
// ({ content, totalElements, totalPages, number, size, first, last }).
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface PaginationProps {
  /** Halaman saat ini, 0-based (sesuai konvensi Spring Page.number). */
  page: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

function getPageWindow(current: number, total: number): (number | "ellipsis")[] {
  const windowSize = 1
  const pages: (number | "ellipsis")[] = []
  const start = Math.max(0, current - windowSize)
  const end = Math.min(total - 1, current + windowSize)

  if (start > 0) {
    pages.push(0)
    if (start > 1) pages.push("ellipsis")
  }
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) {
    if (end < total - 2) pages.push("ellipsis")
    pages.push(total - 1)
  }
  return pages
}

function Pagination({ page, totalPages, totalElements, pageSize, onPageChange, className }: PaginationProps) {
  if (totalPages <= 0) return null

  const from = totalElements === 0 ? 0 : page * pageSize + 1
  const to = Math.min(totalElements, (page + 1) * pageSize)
  const pageWindow = getPageWindow(page, totalPages)

  return (
    <div
      data-slot="pagination"
      className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 pt-4", className)}
    >
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Menampilkan <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> dari{" "}
        <span className="font-medium text-foreground">{totalElements}</span>
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 0}
          onClick={() => onPageChange(0)}
          aria-label="Halaman pertama"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageWindow.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Halaman ${p + 1}`}
            >
              {p + 1}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          aria-label="Halaman terakhir"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export { Pagination }
