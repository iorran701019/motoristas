import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getSupabaseConfig } from '@/lib/supabase-config'
import type { AuditLog } from '@/types/rota'

interface UseAuditLogsReturn {
  logs: AuditLog[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook de leitura do audit log (somente admin via RLS).
 * Leitura direta da tabela — o RLS de audit_logs restringe o SELECT a admin,
 * então não precisa passar por Edge Function.
 */
export function useAuditLogs(): UseAuditLogsReturn {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    const config = getSupabaseConfig()
    if (!config.isConfigured) {
      setError(
        'Configure o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, depois reinicie npm run dev'
      )
      setLogs([])
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLogs([])
    } else {
      setLogs((data as AuditLog[]) ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  }
}
