import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/users/[id]/activity - Get user activity (posts and comments)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "all" // all, posts, comments
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Find user by username or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: (await params).id },
          { username: (await params).id }
        ]
      },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const skip = (page - 1) * limit

    const activity: {
      posts?: unknown[]
      comments?: unknown[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    } = {
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    }

    if (type === "all" || type === "posts") {
      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: { authorId: user.id, published: true },
          skip: type === "posts" ? skip : 0,
          take: type === "posts" ? limit : 5,
          orderBy: { createdAt: "desc" },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            },
            tags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            },
            _count: {
              select: {
                comments: true
              }
            }
          }
        }),
        type === "posts" ? prisma.post.count({ where: { authorId: user.id, published: true } }) : 0
      ])

      activity.posts = posts
      if (type === "posts") {
        activity.pagination.total = total
        activity.pagination.totalPages = Math.ceil(total / limit)
      }
    }

    if (type === "all" || type === "comments") {
      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: { authorId: user.id },
          skip: type === "comments" ? skip : 0,
          take: type === "comments" ? limit : 5,
          orderBy: { createdAt: "desc" },
          include: {
            post: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }),
        type === "comments" ? prisma.comment.count({ where: { authorId: user.id } }) : 0
      ])

      activity.comments = comments
      if (type === "comments") {
        activity.pagination.total = total
        activity.pagination.totalPages = Math.ceil(total / limit)
      }
    }

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error fetching user activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch user activity" },
      { status: 500 }
    )
  }
}
