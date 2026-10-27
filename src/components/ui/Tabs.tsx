import React from 'react'

export interface TabsProps {
  value?: string
  onChange: (value: string) => void
  children?: React.ReactNode
  /** Array style: tabs={[{ id, label }]} active={id} */
  tabs?: Array<{ id?: string; value?: string; label: React.ReactNode; disabled?: boolean }>
  active?: string
  className?: string
}

export interface TabProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

function Tab({ value: tabValue, children, disabled, className }: TabProps & { _active?: boolean; _onChange?: (v: string) => void }) {
  return null
}

function TabsRoot({ value: valueProp, onChange, children, tabs, active: activeProp, className }: TabsProps) {
  const value = valueProp ?? activeProp
  // Both documented styles become one list: <Tabs.Tab> children or a tabs array
  const items: Array<{ tv: string; label: React.ReactNode; disabled?: boolean }> = tabs
    ? tabs.map(t => ({ tv: String(t.id ?? t.value ?? ''), label: t.label, disabled: t.disabled }))
    : (React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<TabProps>[])
        .map(child => ({ tv: child.props.value, label: child.props.children, disabled: child.props.disabled }))
  return (
    <div className={['ui-tabs', className].filter(Boolean).join(' ')} role="tablist">
      {items.map(({ tv, label, disabled }) => {
        const active = tv === value
        return (
          <button
            role="tab"
            aria-selected={active}
            className={['ui-tab', active && 'ui-tab-active'].filter(Boolean).join(' ')}
            onClick={() => !disabled && onChange(tv)}
            disabled={disabled}
            tabIndex={active ? 0 : -1}
            key={tv}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export const Tabs = Object.assign(TabsRoot, { Tab })
Tabs.displayName = 'Tabs'
