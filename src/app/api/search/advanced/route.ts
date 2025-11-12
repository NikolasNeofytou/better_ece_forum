import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// GET /api/search/advanced - Advanced search with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const sortBy = searchParams.get("sortBy") || "recent" // recent, votes, views, comments
    const categoryId = searchParams.get("categoryId")
    const tagSlug = searchParams.get("tag")
    const authorId = searchParams.get("authorId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.PostWhereInput = {
      published: true,
      isRemoved: false
    }

    // Add search query
    if (query && query.trim().length >= 2) {
      where.OR = [
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

    // Add category filter
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Add tag filter
    if (tagSlug) {
      where.tags = {
        some: {
          tag: {
            slug: tagSlug
          }
        }
      }
    }

    // Add author filter
    if (authorId) {
      where.authorId = authorId
    }

    // Add date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Build orderBy clause
    let orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: "desc" }
    
    switch (sortBy) {
      case "votes":
        orderBy = { voteCount: "desc" }
        break
      case "views":
        orderBy = { viewCount: "desc" }
        break
      case "comments":
        orderBy = { comments: { _count: "desc" } }
        break
      case "recent":
      default:
        orderBy = { createdAt: "desc" }
    }

    // Execute search
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
              comments: true,
              votes: true
            }
          }
        }
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        query,
        sortBy,
        categoryId,
        tag: tagSlug,
        authorId,
        dateFrom,
        dateTo
      }
    })
  } catch (error) {
    console.error("Error in advanced search:", error)
    return NextResponse.json(
      { error: "Failed to perform advanced search" },
      { status: 500 }
    )
  }
}
