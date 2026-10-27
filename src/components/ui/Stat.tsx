import React from 'react'

export type DeltaType = 'up' | 'down' | 'neutral'

export interface StatProps {
  value: string | number
  label: string
  delta?: string
  /** Alias of delta */
  change?: string
  deltaType?: DeltaType
  icon?: React.ReactNode
  className?: string
}

const ARROW = { up: '↑', down: '↓', neutral: '→' } as const
function cn(...c: (string | undefined | false | null)[]) { return c.filter(Boolean).join(' ') }

export const Stat: React.FC<StatProps> = ({ value, label, delta: deltaProp, change, deltaType: typeProp, icon, className }) => {
  const delta = deltaProp ?? change
  // "+12%" / "-3%" imply a direction when none was given
  const deltaType: DeltaType = typeProp ?? (/^\s*\+/.test(String(delta ?? '')) ? 'up' : /^\s*-/.test(String(delta ?? '')) ? 'down' : 'neutral')
  return (
  <div className={cn('ui-stat', className)}>
    {icon && <div className="ui-stat-icon" aria-hidden="true">{icon}</div>}
    <div className="ui-stat-label">{label}</div>
    <div className="ui-stat-value">{value}</div>
    {delta && (
      <div className={cn('ui-stat-delta', `ui-stat-${deltaType}`)} aria-label={`${deltaType}: ${delta}`}>
        <span aria-hidden="true">{ARROW[deltaType]}</span> {delta}
      </div>
    )}
  </div>
  )
}
Stat.displayName = 'Stat'
