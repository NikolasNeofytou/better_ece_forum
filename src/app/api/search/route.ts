import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/search - Search posts by title and content
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // Use PostgreSQL full-text search
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive"
              }
            },
            {
              content: {
                contains: query,
                mode: "insensitive"
              }
            }
          ]
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              reputation: true
            }
          },
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
      prisma.post.count({
        where: {
          published: true,
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive"
              }
            },
            {
              content: {
                contains: query,
                mode: "insensitive"
              }
            }
          ]
        }
      })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      query
    })
  } catch (error) {
    console.error("Error searching posts:", error)
    return NextResponse.json(
      { error: "Failed to search posts" },
      { status: 500 }
    )
  }
}
