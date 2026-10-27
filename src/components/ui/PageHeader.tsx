import React from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: React.ReactNode
  /** Alias of subtitle */
  description?: React.ReactNode
  badge?: React.ReactNode
  /** Buttons shown on the right (children also land there) */
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

function cn(...c: (string | undefined | false | null)[]) { return c.filter(Boolean).join(' ') }

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, description, badge, actions, children, className }) => {
  const sub = subtitle ?? description
  return (
  <div className={cn('ui-page-hd', className)}>
    <div className="ui-page-hd-left">
      {badge && <div>{badge}</div>}
      <h1 className="ui-page-hd-title">{title}</h1>
      {sub && <p className="ui-page-hd-sub">{sub}</p>}
    </div>
    {(actions || children) && <div className="ui-page-hd-right">{actions}{children}</div>}
  </div>
  )
}
PageHeader.displayName = 'PageHeader'
