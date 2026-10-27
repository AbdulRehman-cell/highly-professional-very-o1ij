import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

/** Whether the signed-in user is on this site's staff list. The database only
 *  ever shows a user their own staff_members entry, so one row means "staff". */
export function useStaff() {
  const { user, loading: sessionLoading } = useSession()
  const [isStaff, setIsStaff] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true
    if (sessionLoading) return
    if (!user) {
      setIsStaff(false)
      setChecking(false)
      return
    }
    setChecking(true)
    supabase.from('staff_members').select('email').limit(1).then(({ data, error }) => {
      if (!active) return
      setIsStaff(!error && Array.isArray(data) && data.length > 0)
      setChecking(false)
    })
    return () => { active = false }
  }, [user, sessionLoading])

  return { user, isStaff, loading: sessionLoading || checking }
}
