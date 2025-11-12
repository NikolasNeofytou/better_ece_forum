# Course Resources Feature

## Overview

The Course Resources feature allows students to access course materials including notes, past papers, solutions, slides, assignments, and other educational resources for ECE courses at NTUA.

## Database Models

### Course
- **code**: Unique course code (e.g., ECE101, ECE201)
- **name**: Full course name
- **description**: Course description
- **semester**: Fall/Spring
- **year**: Academic year
- **instructor**: Professor name

### CourseResource
- **title**: Resource title
- **description**: Resource description
- **type**: ResourceType enum (NOTES, PAST_PAPER, SOLUTION, SLIDES, TEXTBOOK, REFERENCE, OTHER)
- **content**: Text content (for inline resources)
- **fileUrl**: URL to file (for downloadable resources)
- **year**: Academic year
- **semester**: Fall/Spring
- **viewCount**: Number of views
- **downloadCount**: Number of downloads
- **isApproved**: Admin approval status
- **uploader**: User who uploaded the resource
- **course**: Associated course

### Assignment
- **title**: Assignment title
- **description**: Assignment description
- **instructions**: Detailed instructions
- **dueDate**: Due date
- **maxPoints**: Maximum points
- **isPublished**: Visibility status
- **course**: Associated course

## Setup & Usage

### 1. Push Database Schema

```bash
npm run db:push
```

This will update your database with the new models (Course, CourseResource, Assignment).

### 2. Seed the Database

```bash
npm run db:seed
```

This will populate your database with:
- 6 users (1 admin, 5 students)
- 4 ECE courses (ECE101 through ECE401)
- 5 course categories
- 10 tags
- 6 forum posts with comments and votes
- 5 course resources (notes, past papers, solutions, slides)
- 3 assignments

**Test Credentials:**
- Admin: `admin@ece.ntua.gr` / `admin123`
- Students: `student1@ece.ntua.gr` through `student5@ece.ntua.gr` / `user123`

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Features

### For Students

1. **Browse Courses** (`/courses`)
   - View all available ECE courses
   - See resource and assignment counts
   - Filter by semester and year
   - View instructor information

2. **Course Details** (`/courses/[code]`)
   - Access course resources (notes, past papers, solutions, slides)
   - View assignments with due dates and points
   - Filter resources by type
   - Download or view resources
   - Track resource popularity (views, downloads)

3. **Resource Types**
   - **Notes**: Lecture notes and study materials
   - **Past Papers**: Previous exams for practice
   - **Solutions**: Exam and homework solutions
   - **Slides**: Lecture presentation slides
   - **Textbook**: Recommended textbooks
   - **Reference**: Additional reference materials
   - **Other**: Other educational resources

### For Admins

- Approve/reject uploaded resources (`isApproved` field)
- Manage courses and assignments
- View resource analytics (views, downloads)

### API Endpoints

- `GET /api/courses` - List all courses
- `GET /api/courses/[code]` - Get course details
- `GET /api/resources` - List resources (with filters)
- `POST /api/resources` - Upload new resource (auth required)

### Navigation

- **Desktop**: Header menu includes "Courses" link
- **Mobile**: Bottom navigation includes "Courses" icon

## Future Enhancements

- File upload functionality for resources
- Resource search and advanced filtering
- Resource rating and reviews
- Bookmarking favorite resources
- Email notifications for new resources
- Resource discussion threads
- Semester-specific views
- Course enrollment tracking

## Data Structure Example

### Sample Course
```typescript
{
  code: "ECE201",
  name: "Data Structures and Algorithms",
  description: "Advanced data structures, algorithm design and analysis",
  semester: "Spring",
  year: 2024,
  instructor: "Prof. K. Dimitriou"
}
```

### Sample Resource
```typescript
{
  title: "ECE201 Midterm Exam 2023",
  description: "Past midterm exam with solutions",
  type: "PAST_PAPER",
  year: 2023,
  semester: "Spring",
  viewCount: 189,
  downloadCount: 142,
  isApproved: true
}
```

### Sample Assignment
```typescript
{
  title: "Project: Binary Search Tree Implementation",
  description: "Create a balanced binary search tree",
  instructions: "Implement an AVL tree in Java...",
  dueDate: "2024-12-20",
  maxPoints: 150,
  isPublished: true
}
```

## Analytics Integration

The seed data also populates:
- Forum posts about courses
- Comments and discussions
- Votes and engagement metrics
- User activity for analytics dashboard

This ensures the analytics dashboard at `/admin/analytics` shows realistic data including:
- Total users, posts, comments, votes
- Active users today
- Trending posts (course-related discussions)
- Popular tags (algorithms, networking, programming, etc.)

## Testing

To verify everything is working:

1. Run the seed script
2. Sign in as admin (`admin@ece.ntua.gr` / `admin123`)
3. Visit `/admin/analytics` to see populated analytics
4. Visit `/courses` to see course listings
5. Click on a course (e.g., ECE201) to see resources and assignments
6. Check mobile view for responsive navigation

## Troubleshooting

### "Cannot find module '@prisma/client'"
Run `npm run db:generate` to regenerate the Prisma client.

### "Database connection failed"
Ensure your PostgreSQL database is running and `DATABASE_URL` in `.env` is correct.

### "No courses showing up"
Make sure you've run `npm run db:seed` after pushing the schema.

### "Authentication issues"
Use the provided test credentials. If issues persist, check your `AUTH_SECRET` in `.env`.
