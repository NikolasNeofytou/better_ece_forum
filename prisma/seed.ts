import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create users
  console.log("Creating users...")
  const adminPassword = await hash("admin123", 10)
  const userPassword = await hash("user123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@ece.ntua.gr" },
    update: {},
    create: {
      email: "admin@ece.ntua.gr",
      username: "admin",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      reputation: 1000,
      bio: "Forum administrator"
    }
  })

  const students = []
  const studentNames = [
    { name: "Maria Papadopoulou", username: "maria_p" },
    { name: "Nikos Konstantinou", username: "nikos_k" },
    { name: "Sofia Georgiou", username: "sofia_g" },
    { name: "Dimitris Nikolaou", username: "dimitris_n" },
    { name: "Elena Ioannou", username: "elena_i" }
  ]

  for (let i = 0; i < studentNames.length; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i + 1}@ece.ntua.gr` },
      update: {},
      create: {
        email: `student${i + 1}@ece.ntua.gr`,
        username: studentNames[i].username,
        name: studentNames[i].name,
        password: userPassword,
        role: "USER",
        reputation: Math.floor(Math.random() * 500) + 50,
        bio: `ECE student at NTUA`
      }
    })
    students.push(student)
  }

  console.log(`✓ Created ${students.length + 1} users`)

  // Create courses
  console.log("Creating courses...")
  const courses = [
    {
      code: "ECE101",
      name: "Introduction to Computer Engineering",
      description: "Fundamentals of computer systems and programming",
      semester: "Fall",
      year: 2024,
      instructor: "Prof. A. Papadimitriou"
    },
    {
      code: "ECE201",
      name: "Data Structures and Algorithms",
      description: "Advanced data structures, algorithm design and analysis",
      semester: "Spring",
      year: 2024,
      instructor: "Prof. K. Dimitriou"
    },
    {
      code: "ECE301",
      name: "Digital Signal Processing",
      description: "Signal processing theory and applications",
      semester: "Fall",
      year: 2024,
      instructor: "Prof. M. Nikolaidis"
    },
    {
      code: "ECE401",
      name: "Computer Networks",
      description: "Network protocols, architectures, and security",
      semester: "Spring",
      year: 2024,
      instructor: "Prof. S. Georgiadis"
    }
  ]

  const createdCourses = []
  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { code: courseData.code },
      update: {},
      create: courseData
    })
    createdCourses.push(course)
  }

  console.log(`✓ Created ${createdCourses.length} courses`)

  // Create categories
  console.log("Creating categories...")
  const categories = [
    {
      name: "General Discussion",
      slug: "general",
      description: "General topics and announcements",
      color: "#3B82F6",
      icon: "message-circle"
    },
    {
      name: "Course Help",
      slug: "course-help",
      description: "Questions about specific courses",
      color: "#10B981",
      icon: "book-open"
    },
    {
      name: "Study Groups",
      slug: "study-groups",
      description: "Find study partners and groups",
      color: "#8B5CF6",
      icon: "users"
    },
    {
      name: "Projects",
      slug: "projects",
      description: "Project discussions and collaborations",
      color: "#F59E0B",
      icon: "code"
    },
    {
      name: "Career & Internships",
      slug: "career",
      description: "Career advice and internship opportunities",
      color: "#EF4444",
      icon: "briefcase"
    }
  ]

  const createdCategories = []
  for (const catData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {},
      create: catData
    })
    createdCategories.push(category)
  }

  console.log(`✓ Created ${createdCategories.length} categories`)

  // Create tags
  console.log("Creating tags...")
  const tags = [
    { name: "algorithms", slug: "algorithms", description: "Algorithm design and analysis" },
    { name: "networking", slug: "networking", description: "Computer networks and protocols" },
    { name: "signal-processing", slug: "signal-processing", description: "Signal processing topics" },
    { name: "programming", slug: "programming", description: "Programming questions" },
    { name: "python", slug: "python", description: "Python programming" },
    { name: "java", slug: "java", description: "Java programming" },
    { name: "c++", slug: "cpp", description: "C++ programming" },
    { name: "homework", slug: "homework", description: "Homework help" },
    { name: "exam-prep", slug: "exam-prep", description: "Exam preparation" },
    { name: "project-help", slug: "project-help", description: "Project assistance" }
  ]

  const createdTags = []
  for (const tagData of tags) {
    const tag = await prisma.tag.upsert({
      where: { slug: tagData.slug },
      update: {},
      create: tagData
    })
    createdTags.push(tag)
  }

  console.log(`✓ Created ${createdTags.length} tags`)

  // Create posts
  console.log("Creating posts...")
  const posts = [
    {
      title: "Question about Binary Search Trees in ECE201",
      content: "<p>I'm having trouble understanding how to balance a binary search tree. Can someone explain the AVL tree rotation process?</p>",
      authorId: students[0].id,
      categoryId: createdCategories[1].id, // Course Help
      published: true,
      viewCount: 45,
      voteCount: 8
    },
    {
      title: "Study Group for ECE301 Final Exam",
      content: "<p>Looking for students interested in forming a study group for the Digital Signal Processing final exam. We can meet at the library this weekend.</p>",
      authorId: students[1].id,
      categoryId: createdCategories[2].id, // Study Groups
      published: true,
      viewCount: 32,
      voteCount: 12
    },
    {
      title: "Computer Networks Project - Need Team Members",
      content: "<p>Working on a network simulation project for ECE401. Looking for 2-3 team members who are interested in implementing TCP/IP protocols.</p>",
      authorId: students[2].id,
      categoryId: createdCategories[3].id, // Projects
      published: true,
      viewCount: 28,
      voteCount: 5
    },
    {
      title: "Tips for ECE101 Midterm",
      content: "<p>For those preparing for the ECE101 midterm, make sure to review chapters 3-5 thoroughly. The professor emphasized pointers and memory management.</p>",
      authorId: students[3].id,
      categoryId: createdCategories[1].id, // Course Help
      published: true,
      viewCount: 67,
      voteCount: 15
    },
    {
      title: "Internship Opportunity at Tech Company",
      content: "<p>A local tech company is looking for ECE interns for summer 2025. They're specifically interested in students with networking and embedded systems experience.</p>",
      authorId: admin.id,
      categoryId: createdCategories[4].id, // Career
      published: true,
      viewCount: 89,
      voteCount: 23,
      isPinned: true
    },
    {
      title: "FFT Implementation in Python",
      content: "<p>Has anyone implemented the Fast Fourier Transform for ECE301? I'm trying to optimize my code but it's running too slowly.</p>",
      authorId: students[4].id,
      categoryId: createdCategories[1].id,
      published: true,
      viewCount: 41,
      voteCount: 7
    }
  ]

  const createdPosts = []
  for (const postData of posts) {
    const post = await prisma.post.create({
      data: postData
    })
    createdPosts.push(post)
  }

  console.log(`✓ Created ${createdPosts.length} posts`)

  // Add tags to posts
  console.log("Adding tags to posts...")
  await prisma.postTag.createMany({
    data: [
      { postId: createdPosts[0].id, tagId: createdTags[0].id }, // algorithms
      { postId: createdPosts[0].id, tagId: createdTags[3].id }, // programming
      { postId: createdPosts[1].id, tagId: createdTags[8].id }, // exam-prep
      { postId: createdPosts[2].id, tagId: createdTags[1].id }, // networking
      { postId: createdPosts[2].id, tagId: createdTags[9].id }, // project-help
      { postId: createdPosts[3].id, tagId: createdTags[8].id }, // exam-prep
      { postId: createdPosts[5].id, tagId: createdTags[2].id }, // signal-processing
      { postId: createdPosts[5].id, tagId: createdTags[4].id }, // python
    ],
    skipDuplicates: true
  })

  // Create comments
  console.log("Creating comments...")
  const comments = [
    {
      content: "<p>AVL trees use rotations to maintain balance. A left rotation moves the right child up, and a right rotation moves the left child up. You need to check the balance factor after each insertion.</p>",
      authorId: students[1].id,
      postId: createdPosts[0].id,
      voteCount: 5
    },
    {
      content: "<p>I'd be interested! What time works best for you?</p>",
      authorId: students[0].id,
      postId: createdPosts[1].id,
      voteCount: 3
    },
    {
      content: "<p>I have experience with socket programming. Count me in!</p>",
      authorId: students[3].id,
      postId: createdPosts[2].id,
      voteCount: 4
    },
    {
      content: "<p>Thanks for the tip! Did the professor mention anything about recursion?</p>",
      authorId: students[2].id,
      postId: createdPosts[3].id,
      voteCount: 2
    },
    {
      content: "<p>Try using numpy's FFT implementation instead of writing your own. It's much faster and well-optimized.</p>",
      authorId: students[1].id,
      postId: createdPosts[5].id,
      voteCount: 6,
      isAccepted: true
    }
  ]

  const createdComments = []
  for (const commentData of comments) {
    const comment = await prisma.comment.create({
      data: commentData
    })
    createdComments.push(comment)
  }

  console.log(`✓ Created ${createdComments.length} comments`)

  // Create votes
  console.log("Creating votes...")
  const voteData = []
  
  // Votes on posts
  for (let i = 0; i < createdPosts.length; i++) {
    const numVotes = Math.floor(Math.random() * 5) + 3
    for (let j = 0; j < Math.min(numVotes, students.length); j++) {
      voteData.push({
        userId: students[j].id,
        postId: createdPosts[i].id,
        value: Math.random() > 0.2 ? 1 : -1
      })
    }
  }

  // Votes on comments
  for (let i = 0; i < createdComments.length; i++) {
    const numVotes = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < Math.min(numVotes, students.length); j++) {
      if (createdComments[i].authorId !== students[j].id) {
        voteData.push({
          userId: students[j].id,
          commentId: createdComments[i].id,
          value: Math.random() > 0.15 ? 1 : -1
        })
      }
    }
  }

  await prisma.vote.createMany({
    data: voteData,
    skipDuplicates: true
  })

  console.log(`✓ Created ${voteData.length} votes`)

  // Create course resources
  console.log("Creating course resources...")
  const resources: Array<{
    title: string
    description: string
    type: "NOTES" | "PAST_PAPER" | "SOLUTION" | "SLIDES" | "REFERENCE"
    content?: string
    year?: number
    semester?: string
    courseId: string
    uploaderId: string
    isApproved: boolean
    viewCount: number
    downloadCount: number
  }> = [
    {
      title: "ECE101 Lecture Notes - Week 1-4",
      description: "Introduction to programming, variables, and control structures",
      type: "NOTES",
      content: "Comprehensive notes covering the first four weeks of ECE101",
      year: 2024,
      semester: "Fall",
      courseId: createdCourses[0].id,
      uploaderId: students[0].id,
      isApproved: true,
      viewCount: 234,
      downloadCount: 156
    },
    {
      title: "ECE201 Midterm Exam 2023",
      description: "Past midterm exam with solutions",
      type: "PAST_PAPER",
      year: 2023,
      semester: "Spring",
      courseId: createdCourses[1].id,
      uploaderId: students[1].id,
      isApproved: true,
      viewCount: 189,
      downloadCount: 142
    },
    {
      title: "Data Structures Cheat Sheet",
      description: "Quick reference for common data structures and their time complexities",
      type: "REFERENCE",
      content: "Arrays: O(1) access, O(n) search...",
      courseId: createdCourses[1].id,
      uploaderId: students[2].id,
      isApproved: true,
      viewCount: 312,
      downloadCount: 267
    },
    {
      title: "ECE301 Signal Processing Slides",
      description: "Professor's slides from lectures 5-8",
      type: "SLIDES",
      year: 2024,
      semester: "Fall",
      courseId: createdCourses[2].id,
      uploaderId: admin.id,
      isApproved: true,
      viewCount: 156,
      downloadCount: 98
    },
    {
      title: "Computer Networks Final Exam 2023 Solutions",
      description: "Detailed solutions to last year's final exam",
      type: "SOLUTION",
      year: 2023,
      semester: "Spring",
      courseId: createdCourses[3].id,
      uploaderId: students[3].id,
      isApproved: true,
      viewCount: 278,
      downloadCount: 201
    }
  ]

  for (const resourceData of resources) {
    await prisma.courseResource.create({
      data: resourceData
    })
  }

  console.log(`✓ Created ${resources.length} course resources`)

  // Create assignments
  console.log("Creating assignments...")
  const assignments = [
    {
      title: "Programming Assignment 1: Sorting Algorithms",
      description: "Implement and compare different sorting algorithms",
      instructions: "Implement Bubble Sort, Merge Sort, and Quick Sort. Compare their performance on different input sizes.",
      dueDate: new Date("2024-12-15"),
      maxPoints: 100,
      isPublished: true,
      courseId: createdCourses[0].id
    },
    {
      title: "Project: Binary Search Tree Implementation",
      description: "Create a balanced binary search tree with insert, delete, and search operations",
      instructions: "Implement an AVL tree in Java. Your implementation should include automatic rebalancing.",
      dueDate: new Date("2024-12-20"),
      maxPoints: 150,
      isPublished: true,
      courseId: createdCourses[1].id
    },
    {
      title: "Lab Assignment: FFT Implementation",
      description: "Implement the Fast Fourier Transform algorithm",
      instructions: "Use Python to implement FFT and analyze a sample audio signal.",
      dueDate: new Date("2024-12-10"),
      maxPoints: 80,
      isPublished: true,
      courseId: createdCourses[2].id
    }
  ]

  for (const assignmentData of assignments) {
    await prisma.assignment.create({
      data: assignmentData
    })
  }

  console.log(`✓ Created ${assignments.length} assignments`)

  console.log("✅ Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
