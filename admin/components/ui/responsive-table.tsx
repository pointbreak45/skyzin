"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveTableConfig {
  columns: Array<{
    key: string
    label: string
    priority: number // 1 = always show, 2 = show on tablet+, 3 = show on desktop+
    className?: string
  }>
}

interface ResponsiveTableRowProps {
  data: Record<string, React.ReactNode>
  columns: ResponsiveTableConfig['columns']
  className?: string
  onClick?: () => void
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  )
}

export function ResponsiveTableRow({ data, columns, className, onClick }: ResponsiveTableRowProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    // Mobile card layout
    return (
      <Card className={cn("mb-3 cursor-pointer hover:bg-muted/50 transition-colors", className)} onClick={onClick}>
        <CardContent className="p-4">
          <div className="space-y-2">
            {columns
              .filter(col => col.priority <= 2) // Show priority 1 and 2 columns on mobile
              .map(col => {
                const value = data[col.key]
                if (!value) return null
                
                return (
                  <div key={col.key} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">{col.label}:</span>
                    <div className={col.className}>{value}</div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Desktop table row layout
  return (
    <tr className={cn("hover:bg-muted/50 border-b transition-colors", className)} onClick={onClick}>
      {columns.map(col => (
        <td key={col.key} className={cn("p-2 align-middle", col.className)}>
          {data[col.key]}
        </td>
      ))}
    </tr>
  )
}

interface ResponsiveTableHeaderProps {
  columns: ResponsiveTableConfig['columns']
  className?: string
}

export function ResponsiveTableHeader({ columns, className }: ResponsiveTableHeaderProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    // Mobile doesn't need header, cards are self-descriptive
    return null
  }

  return (
    <thead className={className}>
      <tr className="border-b">
        {columns.map(col => (
          <th 
            key={col.key} 
            className={cn(
              "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap",
              col.className
            )}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  )
}

interface ResponsiveTableBodyProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveTableBody({ children, className }: ResponsiveTableBodyProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    // Mobile: render as div container for cards
    return <div className={cn("space-y-2", className)}>{children}</div>
  }

  // Desktop: render as tbody
  return <tbody className={className}>{children}</tbody>
}

interface ResponsiveTableContainerProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveTableContainer({ children, className }: ResponsiveTableContainerProps) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    // Mobile: simple div container
    return <div className={cn("w-full", className)}>{children}</div>
  }

  // Desktop: scrollable table container
  return (
    <div className={cn(
      "relative w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800",
      className
    )}>
      <table className="w-full caption-bottom text-sm min-w-full">
        {children}
      </table>
    </div>
  )
}

// Hook for responsive table configuration
export function useResponsiveTable(baseColumns: ResponsiveTableConfig['columns']) {
  const isMobile = useIsMobile()
  
  const visibleColumns = React.useMemo(() => {
    if (isMobile) {
      return baseColumns.filter(col => col.priority <= 2)
    }
    return baseColumns
  }, [baseColumns, isMobile])
  
  return {
    isMobile,
    visibleColumns,
    ResponsiveTableContainer,
    ResponsiveTableHeader,
    ResponsiveTableBody,
    ResponsiveTableRow
  }
}