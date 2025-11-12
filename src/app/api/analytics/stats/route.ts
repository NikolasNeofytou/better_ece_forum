import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get overall statistics
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalVotes,
      newUsersThisMonth,
      newPostsThisMonth,
      activeUsersToday
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { published: true, isRemoved: false } }),
      prisma.comment.count({ where: { isRemoved: false } }),
      prisma.vote.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.post.count({
        where: {
          published: true,
          isRemoved: false,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        totalVotes,
        newUsersThisMonth,
        newPostsThisMonth,
        activeUsersToday
      }
    })
  } catch (error) {
    console.error("Analytics stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics stats" },
      { status: 500 }
    )
  }
}
