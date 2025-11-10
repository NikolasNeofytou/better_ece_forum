import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for creating a post
const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  published: z.boolean().default(false),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/posts - List posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const categoryId = searchParams.get("categoryId")
    const tagId = searchParams.get("tagId")
    const authorId = searchParams.get("authorId")
    const published = searchParams.get("published") !== "false" // Default to true

    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      published?: boolean
      categoryId?: string
      authorId?: string
      tags?: {
        some: {
          tagId: string
        }
      }
    } = {}
    if (published) {
      where.published = true
    }
    if (categoryId) {
      where.categoryId = categoryId
    }
    if (authorId) {
      where.authorId = authorId
    }
    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId
        }
      }
    }

    // Fetch posts with author and category info
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Create post with tags
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        published: validatedData.published,
        authorId: session.user.id,
        categoryId: validatedData.categoryId,
        tags: validatedData.tags?.length ? {
          create: validatedData.tags.map((tagId) => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined
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
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}
