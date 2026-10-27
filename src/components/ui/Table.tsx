import React from 'react'

function cn(...c: (string | undefined | false | null)[]) { return c.filter(Boolean).join(' ') }

function Th({ children, sortable, className, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement> & { sortable?: boolean }) {
  return (
    <th className={cn('ui-table-th', sortable && 'ui-table-th-sort', className)} {...rest}>
      {children}
      {sortable && <span className="ui-table-th-sort-icon" aria-hidden>↕</span>}
    </th>
  )
}

function Td({ children, className, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('ui-table-td', className)} {...rest}>{children}</td>
}

function Head({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>
}

function Body({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

function Row({ children, clickable, className, onClick, ...rest }: React.HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean }) {
  return (
    <tr
      className={cn('ui-table-tr', clickable && 'ui-table-tr-clickable', className)}
      onClick={onClick}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? e => { if (e.key === 'Enter' || e.key === ' ') onClick?.(e as unknown as React.MouseEvent<HTMLTableRowElement>) } : undefined}
      {...rest}
    >
      {children}
    </tr>
  )
}

type Column = string | { key: string; label?: React.ReactNode; render?: (row: any) => React.ReactNode }

/** Sub-component style (Table.Head / Table.Body …) or data-driven: columns + rows. */
function TableRoot({ children, className, columns, rows, onRowClick }: {
  children?: React.ReactNode
  className?: string
  columns?: Column[]
  rows?: any[]
  onRowClick?: (row: any) => void
}) {
  const body = children ?? (columns && (
    <>
      <thead>
        <tr className="ui-table-tr">
          {columns.map(c => {
            const key = typeof c === 'string' ? c : c.key
            const label = typeof c === 'string' ? c.replace(/_/g, ' ') : (c.label ?? c.key)
            return <th key={key} className="ui-table-th">{label}</th>
          })}
        </tr>
      </thead>
      <tbody>
        {(rows ?? []).map((row, i) => (
          <Row key={row?.id ?? i} clickable={!!onRowClick} onClick={onRowClick ? () => onRowClick(row) : undefined}>
            {columns.map(c => {
              const key = typeof c === 'string' ? c : c.key
              const cell = typeof c !== 'string' && c.render ? c.render(row) : row?.[key]
              return <Td key={key}>{cell === null || cell === undefined ? '—' : typeof cell === 'object' && !React.isValidElement(cell) ? JSON.stringify(cell) : cell}</Td>
            })}
          </Row>
        ))}
      </tbody>
    </>
  ))
  return (
    <div className={cn('ui-table-wrap', className)}>
      <table className="ui-table">{body}</table>
    </div>
  )
}

export const Table = Object.assign(TableRoot, { Head, Body, Row, Th, Td })
Table.displayName = 'Table'
