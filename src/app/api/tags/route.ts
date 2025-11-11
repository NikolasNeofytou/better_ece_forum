import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for creating a tag
const createTagSchema = z.object({
  name: z.string().min(2).max(30),
  slug: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
})

// GET /api/tags - List all tags (with optional search)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } }
      ]
    } : undefined

    const tags = await prisma.tag.findMany({
      where,
      orderBy: {
        name: "asc"
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      take: search ? 10 : undefined // Limit autocomplete results
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create a new tag (any authenticated user)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTagSchema.parse(body)

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag already exists" },
        { status: 409 }
      )
    }

    const tag = await prisma.tag.create({
      data: validatedData
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error("Error creating tag:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    )
  }
}
