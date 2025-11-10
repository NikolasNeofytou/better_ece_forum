"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { FileText, ChevronLeft, ChevronRight, Lock, Unlock, Pin, PinOff, Trash2, RotateCcw } from "lucide-react"

interface ModerationLog {
  id: string
  action: string
  reason: string
  targetType: string
  targetId: string
  createdAt: string
  moderator: {
    id: string
    name: string | null
    username: string | null
  }
}

export default function ModerationLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<ModerationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchLogs()
    }
  }, [session, fetchLogs])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/moderation?page=${page}&limit=20`)
      
      if (!res.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await res.json()
      setLogs(data.logs)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }, [page])

  const getActionIcon = (action: string) => {
    switch (action) {
      case "LOCK":
        return <Lock className="w-4 h-4 text-orange-500" />
      case "UNLOCK":
        return <Unlock className="w-4 h-4 text-green-500" />
      case "PIN":
        return <Pin className="w-4 h-4 text-blue-500" />
      case "UNPIN":
        return <PinOff className="w-4 h-4 text-zinc-500" />
      case "REMOVE":
        return <Trash2 className="w-4 h-4 text-red-500" />
      case "RESTORE":
        return <RotateCcw className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "LOCK":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
      case "UNLOCK":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
      case "PIN":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
      case "UNPIN":
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
      case "REMOVE":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
      case "RESTORE":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Moderation Logs
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Audit trail of all moderation actions
        </p>
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            No moderation logs found
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Moderator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">
                        {log.targetType}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-500 block font-mono">
                        {log.targetId.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">
                        {log.moderator.name || log.moderator.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {log.reason || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
