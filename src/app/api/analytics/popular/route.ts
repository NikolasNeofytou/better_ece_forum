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

    // Get popular tags by post count
    const popularTags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        posts: {
          _count: "desc"
        }
      },
      take: 20
    })

    return NextResponse.json({ tags: popularTags })
  } catch (error) {
    console.error("Popular tags error:", error)
    return NextResponse.json(
      { error: "Failed to fetch popular tags" },
      { status: 500 }
    )
  }
}
