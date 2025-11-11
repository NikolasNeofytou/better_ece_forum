"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Ban, UserX, Shield } from "lucide-react"

export default function BansPage() {
  const { status } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/moderation/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          reason,
          duration: duration ? parseInt(duration) : undefined
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "User banned successfully" })
        setUsername("")
        setReason("")
        setDuration("")
      } else {
        setMessage({ type: "error", text: data.error || "Failed to ban user" })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to ban user" })
    } finally {
      setLoading(false)
    }
  }

  const handleUnban = async () => {
    if (!username) {
      setMessage({ type: "error", text: "Please enter a username" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/moderation/ban?username=${username}`, {
        method: "DELETE"
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "User unbanned successfully" })
        setUsername("")
      } else {
        setMessage({ type: "error", text: data.error || "Failed to unban user" })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to unban user" })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Ban className="w-8 h-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Manage User Bans
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Ban or unban users from the platform (Admin only)
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Ban User Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserX className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Ban User
          </h2>
        </div>

        <form onSubmit={handleBan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Reason (required, min 10 characters)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={10}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              placeholder="Explain why this user is being banned"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Duration (days, leave empty for permanent ban)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              placeholder="e.g., 7, 30, 90"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              Leave empty for permanent ban. Common durations: 7, 30, 90 days
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Banning..." : "Ban User"}
          </button>
        </form>
      </div>

      {/* Unban User Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Unban User
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              placeholder="Enter username to unban"
            />
          </div>

          <button
            onClick={handleUnban}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Unbanning..." : "Unban User"}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Important Notes:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Only administrators can ban users</li>
          <li>Cannot ban other administrators</li>
          <li>Ban reason must be at least 10 characters</li>
          <li>Temporary bans will automatically expire after the specified duration</li>
          <li>All moderation actions are logged in the audit trail</li>
        </ul>
      </div>
    </div>
  )
}
