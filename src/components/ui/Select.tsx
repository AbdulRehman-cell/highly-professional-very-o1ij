import React from 'react'

export interface SelectOption { value: string; label: string; disabled?: boolean }

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  /** Either options, or plain <option> children */
  options?: Array<SelectOption | string>
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
}

function cn(...c: (string | undefined | false | null)[]) { return c.filter(Boolean).join(' ') }

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, hint, required, className, id, children, ...rest }, ref) => {
    const sid = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
      <div className={cn('ui-field', error && 'ui-has-err', className)}>
        {label && <label className={cn('ui-label', required && 'ui-label-req')} htmlFor={sid}>{required ? label.replace(/\s*\*+\s*$/, '') : label}</label>}
        <select ref={ref} id={sid} className="ui-select" aria-invalid={!!error} required={required} {...rest}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options
            ? options.map(o => {
                const opt = typeof o === 'string' ? { value: o, label: o } : o
                return <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
              })
            : children}
        </select>
        {error && <span className="ui-err-msg" role="alert">⚠ {error}</span>}
        {!error && hint && <span className="ui-hint">{hint}</span>}
      </div>
    )
  }
)
Select.displayName = 'Select'
