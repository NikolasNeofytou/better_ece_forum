import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for updating a post
const updatePostSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  published: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: (await params).id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            reputation: true,
            role: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true
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
        comments: {
          where: {
            parentId: null // Only top-level comments
          },
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
            _count: {
              select: {
                replies: true
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
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.post.update({
      where: { id: (await params).id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

// PATCH /api/posts/[id] - Update a post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id: (await params).id },
      select: { authorId: true }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)

    // Handle tags update if provided
    let tagsUpdate = undefined
    if (validatedData.tags !== undefined) {
      // Delete existing tags and create new ones
      await prisma.postTag.deleteMany({
        where: { postId: (await params).id }
      })
      
      if (validatedData.tags.length > 0) {
        tagsUpdate = {
          create: validatedData.tags.map((tagId) => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      }
    }

    // Update post
    const post = await prisma.post.update({
      where: { id: (await params).id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        published: validatedData.published,
        categoryId: validatedData.categoryId,
        tags: tagsUpdate
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

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error updating post:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if post exists and user is the author or admin
    const existingPost = await prisma.post.findUnique({
      where: { id: (await params).id },
      select: { 
        authorId: true 
      }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    const isAuthor = existingPost.authorId === session.user.id
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR"

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Delete post (cascade will delete comments and tags)
    await prisma.post.delete({
      where: { id: (await params).id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
