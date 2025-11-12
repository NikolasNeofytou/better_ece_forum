import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get("days") || "7")

    // Get trending posts (high activity in recent period)
    const dateFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const trendingPosts = await prisma.post.findMany({
      where: {
        published: true,
        isRemoved: false,
        createdAt: {
          gte: dateFilter
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      },
      orderBy: [
        { voteCount: "desc" },
        { viewCount: "desc" }
      ],
      take: 10
    })

    return NextResponse.json({ posts: trendingPosts })
  } catch (error) {
    console.error("Trending posts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch trending posts" },
      { status: 500 }
    )
  }
}
