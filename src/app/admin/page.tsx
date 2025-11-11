"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, Flag, FileText, Ban } from "lucide-react"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    pendingReports: 0,
    totalLogs: 0,
    activeBans: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const [reportsRes, logsRes] = await Promise.all([
        fetch("/api/reports?status=PENDING&limit=1"),
        fetch("/api/moderation?limit=1")
      ])

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setStats(prev => ({ ...prev, pendingReports: reportsData.pagination?.total || 0 }))
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setStats(prev => ({ ...prev, totalLogs: logsData.pagination?.total || 0 }))
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Manage reports, moderation actions, and user bans
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Flag className="w-6 h-6 text-red-500" />
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.pendingReports}
            </span>
          </div>
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Pending Reports
          </h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-6 h-6 text-blue-500" />
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.totalLogs}
            </span>
          </div>
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Moderation Logs
          </h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Ban className="w-6 h-6 text-orange-500" />
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              0
            </span>
          </div>
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Active Bans
          </h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/reports"
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <Flag className="w-8 h-8 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Manage Reports
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Review and resolve user reports on posts and comments
          </p>
        </Link>

        <Link
          href="/admin/moderation"
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <FileText className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Moderation Logs
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            View audit trail of all moderation actions taken
          </p>
        </Link>

        <Link
          href="/admin/bans"
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <Ban className="w-8 h-8 text-orange-500 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Manage Bans
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Ban or unban users from the platform
          </p>
        </Link>
      </div>
    </div>
  )
}
