"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface VoteButtonsProps {
  targetType: "post" | "comment"
  targetId: string
  initialVoteCount: number
  initialUserVote?: number
}

export function VoteButtons({ 
  targetType, 
  targetId, 
  initialVoteCount,
  initialUserVote = 0
}: VoteButtonsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      // Fetch user's vote
      fetch(`/api/votes?targetType=${targetType}&targetId=${targetId}`)
        .then(res => res.json())
        .then(data => {
          if (data.userVote !== undefined) {
            setUserVote(data.userVote)
          }
        })
        .catch(err => console.error("Error fetching user vote:", err))
    }
  }, [session, targetType, targetId])

  const handleVote = async (value: number) => {
    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    if (isLoading) return

    setIsLoading(true)

    // Optimistic update
    const oldUserVote = userVote
    const oldVoteCount = voteCount
    
    const newUserVote = userVote === value ? 0 : value
    const voteDelta = newUserVote - oldUserVote
    
    setUserVote(newUserVote)
    setVoteCount(oldVoteCount + voteDelta)

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetType,
          targetId,
          value: newUserVote
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to vote")
      }

      const data = await response.json()
      setVoteCount(data.voteCount)
      setUserVote(data.userVote)
    } catch (error) {
      // Revert on error
      setUserVote(oldUserVote)
      setVoteCount(oldVoteCount)
      console.error("Error voting:", error)
      alert(error instanceof Error ? error.message : "Failed to vote")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
          userVote === 1
            ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
            : "text-zinc-600 dark:text-zinc-400"
        } disabled:opacity-50`}
        title="Upvote"
      >
        <ChevronUp className="w-6 h-6" />
      </button>

      <span className={`text-sm font-medium ${
        userVote === 1 
          ? "text-green-600 dark:text-green-400" 
          : userVote === -1 
          ? "text-red-600 dark:text-red-400"
          : "text-zinc-900 dark:text-zinc-100"
      }`}>
        {voteCount}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
          userVote === -1
            ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
            : "text-zinc-600 dark:text-zinc-400"
        } disabled:opacity-50`}
        title="Downvote"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  )
}
