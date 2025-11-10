import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for creating a comment
const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(10000),
  postId: z.string(),
  parentId: z.string().optional(),
})

// GET /api/comments - Get comments for a post (with optional parentId filter for replies)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const postId = searchParams.get("postId")
    const parentId = searchParams.get("parentId")

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      )
    }

    const where: {
      postId: string
      parentId?: string | null
    } = { postId }
    
    // If parentId is provided, get replies to that comment
    // If parentId is null or not provided, get top-level comments
    if (parentId) {
      where.parentId = parentId
    } else if (searchParams.has("parentId")) {
      // Explicitly get top-level comments only
      where.parentId = null
    }

    const comments = await prisma.comment.findMany({
      where,
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
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create a new comment or reply
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
    const validatedData = createCommentSchema.parse(body)

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
      select: { id: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // If parentId is provided, verify parent comment exists and belongs to same post
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        select: { postId: true }
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        )
      }

      if (parentComment.postId !== validatedData.postId) {
        return NextResponse.json(
          { error: "Parent comment does not belong to this post" },
          { status: 400 }
        )
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        postId: validatedData.postId,
        authorId: session.user.id,
        parentId: validatedData.parentId,
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
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
