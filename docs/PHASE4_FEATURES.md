# Phase 4 Features Documentation

## Overview

Phase 4 adds advanced features to the Better ECE Forum, focusing on analytics, progressive web app capabilities, and intelligent search and recommendations.

## Week 13: Analytics & Insights

### Features

#### Admin Analytics Dashboard
- **Location**: `/admin/analytics`
- **Access**: Admin only
- **Features**:
  - Overall platform statistics (users, posts, comments, votes)
  - Growth metrics (new users this month, new posts this month)
  - Active users tracking (last 24 hours)
  - Trending posts (last 7 days, sorted by votes and views)
  - Popular tags (sorted by post count)

#### API Endpoints

**GET /api/analytics/stats**
- Returns overall platform statistics
- Requires admin authentication

**GET /api/analytics/trending**
- Returns trending posts
- Query params: `days` (default: 7)
- Requires admin authentication

**GET /api/analytics/popular**
- Returns popular tags by post count
- Requires admin authentication

### Usage Example

```typescript
// Fetch analytics stats
const response = await fetch('/api/analytics/stats')
const { stats } = await response.json()

console.log(stats.totalUsers) // Total registered users
console.log(stats.activeUsersToday) // Users active in last 24h
```

## Week 14: PWA & Mobile Optimization

### Progressive Web App

#### Manifest (`/manifest.json`)
- App name: "Better ECE Forum"
- Display mode: standalone
- Theme color: #2563eb
- Shortcuts for quick access (Posts, Create, Search)

#### Service Worker (`/sw.js`)
- Offline caching strategy
- Static asset caching
- Dynamic content caching
- Offline fallback page
- Push notification support (ready for future use)

#### PWA Features
1. **Installable**: Users can install the forum as an app on mobile/desktop
2. **Offline Support**: Previously visited pages work offline
3. **Install Prompt**: Smart prompt appears after 5 seconds (respects dismissal)
4. **Offline Page**: Custom offline experience at `/offline`

### Mobile Optimization

#### Bottom Navigation Bar
- Fixed bottom navigation for mobile devices
- Auto-hides on scroll down, shows on scroll up
- Touch-optimized tap targets (44x44px minimum)
- Safe area insets for notched devices

#### CSS Utilities
```css
.touch-action-pan       /* Better touch scrolling */
.tap-target             /* Minimum 44px tap targets */
.no-select              /* Prevent text selection on tap */
.momentum-scroll        /* iOS momentum scrolling */
```

#### Responsive Design
- Mobile-first approach
- Bottom navigation hidden on desktop (md: breakpoint)
- 16px bottom padding on mobile for navigation
- Optimized touch interactions

### Usage

#### PWA Installation
```typescript
import { registerServiceWorker, isPWA } from '@/lib/pwa'

// Register service worker
registerServiceWorker()

// Check if running as PWA
if (isPWA()) {
  console.log('Running as installed PWA')
}
```

#### Request Notifications
```typescript
import { requestNotificationPermission, showNotification } from '@/lib/pwa'

// Request permission
const permission = await requestNotificationPermission()

if (permission === 'granted') {
  // Show notification
  showNotification('New Post', {
    body: 'Check out the latest discussion',
    icon: '/icon-192.png'
  })
}
```

## Week 15: Advanced Search & Recommendations

### Advanced Search

#### Features
- **Multiple Filters**:
  - Search query (title and content)
  - Sort by: recent, votes, views, comments
  - Category filter
  - Tag filter
  - Date range (from/to)
  - Author filter

#### API Endpoint

**GET /api/search/advanced**
- Query parameters:
  - `q`: Search query
  - `sortBy`: recent | votes | views | comments
  - `categoryId`: Filter by category ID
  - `tag`: Filter by tag slug
  - `authorId`: Filter by author ID
  - `dateFrom`: ISO date string
  - `dateTo`: ISO date string
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 10)

#### Advanced Search Page
- **Location**: `/search/advanced`
- **Features**:
  - Collapsible filter panel
  - Active filter count badge
  - Clear all filters button
  - Real-time search
  - Result count display

### Recommendations

#### Personalized Recommendations
Based on user activity:
- Posts from categories user engages with
- Posts with tags user interacts with
- Excludes user's own posts
- Sorted by votes and recency

#### Related Posts
For any post:
- Posts in same category
- Posts with shared tags
- Excludes the current post
- Sorted by votes and views

#### Trending Posts
For non-logged-in users:
- Posts from last 7 days
- Sorted by votes and views
- Fresh content discovery

#### API Endpoint

**GET /api/recommendations**
- Query parameters:
  - `postId`: Get related posts for specific post
  - `limit`: Number of recommendations (default: 10)
- Returns different results based on:
  - Logged-in user: personalized recommendations
  - Non-logged-in: trending posts
  - With postId: related posts

### Usage Examples

#### Advanced Search
```typescript
// Search with filters
const params = new URLSearchParams({
  q: 'algorithms',
  sortBy: 'votes',
  categoryId: 'cs-123',
  dateFrom: '2025-01-01',
  limit: '20'
})

const response = await fetch(`/api/search/advanced?${params}`)
const { posts, pagination, filters } = await response.json()
```

#### Get Recommendations
```typescript
// Get personalized recommendations
const response = await fetch('/api/recommendations?limit=10')
const { posts, type } = await response.json()

console.log(type) // 'personalized' | 'trending' | 'related'

// Get related posts
const relatedRes = await fetch(`/api/recommendations?postId=${postId}`)
const { posts: relatedPosts } = await relatedRes.json()
```

## Security Features

### HTML Sanitization
Safe HTML stripping for search previews:

```typescript
import { stripHtml, getTextPreview } from '@/lib/sanitize/html'

// Strip HTML tags safely
const plainText = stripHtml(htmlContent)

// Get preview with length limit
const preview = getTextPreview(htmlContent, 200)
```

Protects against:
- Script injection
- Double-escaping vulnerabilities
- Incomplete tag sanitization

### Security Scanning
- CodeQL security scanning integrated
- No security vulnerabilities in Phase 4 code
- Input validation on all API endpoints
- Authentication checks on admin endpoints

## Performance Optimizations

### Caching Strategy
- Static assets cached by service worker
- Dynamic content cached with network-first strategy
- Stale-while-revalidate for better UX

### Search Performance
- Database indexing on searchable fields
- Pagination to limit result sets
- Efficient query building with Prisma

### Mobile Performance
- Lazy loading for images
- Reduced animation on low-power mode
- Touch action optimizations
- Momentum scrolling on iOS

## Best Practices

### Using Analytics
```typescript
// Check admin role before accessing analytics
if (user?.role === 'ADMIN') {
  // Show analytics link
}
```

### PWA Deployment
1. Ensure HTTPS in production
2. Configure service worker scope
3. Test offline functionality
4. Monitor cache size
5. Update service worker version on changes

### Search Implementation
1. Use advanced search for complex queries
2. Implement search suggestions
3. Track popular searches
4. Monitor search performance

### Recommendations
1. Fetch on page load
2. Update based on user actions
3. Mix personalized and trending
4. A/B test recommendation algorithms

## Future Enhancements

### Analytics
- [ ] Export analytics data
- [ ] Custom date ranges
- [ ] User engagement heatmaps
- [ ] Content performance metrics

### PWA
- [ ] Background sync for offline actions
- [ ] Push notifications for real-time updates
- [ ] App shortcuts customization
- [ ] Share target integration

### Search & Recommendations
- [ ] Saved searches
- [ ] Search history
- [ ] ML-based recommendations
- [ ] Collaborative filtering
- [ ] Content-based filtering improvements

## Testing

### Manual Testing Checklist

**Analytics**:
- [ ] Admin can access analytics dashboard
- [ ] Non-admin users cannot access analytics
- [ ] Stats display correctly
- [ ] Trending posts update properly

**PWA**:
- [ ] App installs on mobile
- [ ] Offline page appears when offline
- [ ] Service worker caches content
- [ ] Install prompt appears and works

**Search**:
- [ ] Basic search works
- [ ] Advanced filters work correctly
- [ ] Search results are relevant
- [ ] Pagination works

**Recommendations**:
- [ ] Personalized recommendations for logged-in users
- [ ] Trending posts for non-logged-in users
- [ ] Related posts show relevant content

## Troubleshooting

### PWA Not Installing
- Check HTTPS is enabled
- Verify manifest.json is accessible
- Check browser console for service worker errors
- Clear browser cache and retry

### Analytics Not Loading
- Verify user has admin role
- Check API endpoint authentication
- Review database connection
- Check for CORS issues

### Search Not Working
- Verify database indexes exist
- Check search query length (min 2 characters)
- Review API endpoint logs
- Test with simple queries first

### Recommendations Empty
- Verify user has interaction history
- Check if posts exist in database
- Review recommendation algorithm logic
- Test with different user accounts

## Support

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check GitHub issues
4. Contact development team
