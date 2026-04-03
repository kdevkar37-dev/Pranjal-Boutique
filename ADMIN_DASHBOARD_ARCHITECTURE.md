# Admin Dashboard Architecture

## Component Flow Diagram

```
admin-dashboard
    ├── Header with Notifications
    │   ├── 🔔 New Inquiries Count
    │   └── ⭐ Total Reviews Count
    │
    ├── Service Management Section
    │   ├── Form (Add/Edit Service)
    │   │   ├── Title Input
    │   │   ├── Category Select
    │   │   ├── Description Textarea
    │   │   └── Image Upload
    │   │
    │   └── Service Grid (by Category)
    │       ├── Service Card 1 [Edit] [Delete]
    │       ├── Service Card 2 [Edit] [Delete]
    │       └── Service Card N [Edit] [Delete]
    │
    ├── Inquiry Management Section
    │   ├── Stats Row
    │   │   ├── Total Inquiries
    │   │   ├── New/Pending Count
    │   │   ├── Contacted Count
    │   │   └── Closed Count
    │   │
    │   ├── Filter Tabs
    │   │   ├── ALL
    │   │   ├── PENDING
    │   │   ├── NEW
    │   │   ├── CONTACTED
    │   │   └── CLOSED
    │   │
    │   └── Inquiry Cards (sorted by date)
    │       ├── Customer Info
    │       │   ├── Name
    │       │   ├── Phone
    │       │   └── Date
    │       │
    │       ├── Message & Service Type
    │       │
    │       ├── Status Badge (colored)
    │       │
    │       ├── Previous Response (if exists)
    │       │   └── Response text + date
    │       │
    │       ├── Response Form (if no response)
    │       │   ├── Textarea
    │       │   └── [Send Response] Button
    │       │
    │       └── Action Buttons
    │           ├── [Mark Contacted]
    │           ├── [Mark Closed]
    │           └── [Reopen]
    │
    └── Review Management Section
        ├── Analytics Row
        │   ├── Average Rating
        │   └── Total Reviews
        │
        ├── Rating Distribution Chart
        │   ├── 5 stars: [████████] 8
        │   ├── 4 stars: [██████] 6
        │   ├── 3 stars: [████] 4
        │   ├── 2 stars: [██] 2
        │   └── 1 star:  [█] 1
        │
        └── Reviews List (scrollable)
            ├── Review Card 1
            │   ├── Reviewer Name
            │   ├── Star Rating
            │   ├── Date
            │   ├── Message
            │   └── [🗑️ Delete] Button
            │
            └── Review Card N
                ├── Reviewer Name
                ├── Star Rating
                ├── Date
                ├── Message
                └── [🗑️ Delete] Button
```

---

## State Management

### Service Form State
```
serviceForm = {
  title: string,
  category: 'AARI' | 'EMBROIDERY' | ... ,
  description: string,
  imageUrl: string,
  imageFile: File | null
}

editingService = BoutiqueService | null
showServiceForm = boolean
selectedCategory = string (for filtering)
```

### Inquiry State
```
inquiries = Inquiry[]
selectedInquiryStatus = 'ALL' | 'NEW' | 'PENDING' | 'CONTACTED' | 'CLOSED'
inquiryResponses = { [inquiryId]: responseText }
expandedInquiry = string (inquiryId) | null
```

### Review State
```
reviews = Review[]
reviewAnalytics = {
  totalReviews: number,
  averageRating: number,
  starDistribution: { 1: 1, 2: 2, 3: 4, 4: 6, 5: 8 }
}
```

---

## API Endpoints Used

### Services
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/{id}` - Update service
- `DELETE /api/admin/services/{id}` - Delete service
- `POST /api/admin/images/upload` - Upload image
- `GET /api/services` - Get all services

### Inquiries
- `GET /api/admin/inquiries` - Get all inquiries
- `PUT /api/admin/inquiries/{id}/status` - Change status
- `PUT /api/admin/inquiries/{id}/respond` - Send response

### Reviews
- `GET /api/services/reviews` - Get all reviews
- `GET /api/services/reviews/analytics` - Get analytics
- `DELETE /api/admin/reviews/{id}` - Delete review

---

## File Upload Process

```
1. User selects file
   ↓
2. Preview shows immediately
   ↓
3. Submit form
   ↓
4. Backend validates (size, type)
   ↓
5. Save to uploads/images/{UUID}.{ext}
   ↓
6. Return URL: "uploads/images/{UUID}.{ext}"
   ↓
7. Store URL in database
   ↓
8. Serve from /uploads/* endpoint
```

### Image Validation
- **Formats**: JPG, JPEG, PNG, GIF, WebP
- **Max Size**: 5MB (5,242,880 bytes)
- **Storage**: `uploads/images/` directory
- **Served**: Via static resource handler `/uploads/**`

---

## Inquiry Status Workflow

```
                          ┌─────────────────┐
                          │   Initial (NEW) │
                          └────────┬────────┘
                                   │
                      [Mark Contacted]
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   CONTACTED     │
                          │ Can still edit  │
                          └────────┬────────┘
                                   │
                         [Mark Closed]
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   CLOSED        │
                          │ Archived        │
                          └────────┬────────┘
                                   │
                        [Reopen] if needed
                                   │
                                   ▼
                           Back to PENDING
```

---

## Response System

```
Inquiry received
   │
   ├─ If NO response yet:
   │  │
   │  ├─ Show response form
   │  ├─ Admin types message
   │  ├─ Click [Send Response]
   │  │
   │  └─ Response saved with timestamp
   │
   └─ If RESPONSE exists:
      │
      ├─ Show response in green box
      ├─ Display timestamp
      └─ Cannot edit (send new inquiry if needed)
```

---

## UI Color Coding

### Inquiry Status Colors
- **NEW** 🔴 Red - Urgent, needs attention
- **PENDING** ⏳ Yellow - Waiting for response
- **CONTACTED** 📞 Blue - You've replied
- **CLOSED** ✅ Green - Transaction complete

### Categories
- **Aari Work** - Gold/Accent color
- **Embroidery** - Gold/Accent color
- **Mehendi Art** - Gold/Accent color
- **Fabric Painting** - Gold/Accent color
- **Flower Jewellery** - Gold/Accent color
- **Custom Design** - Gold/Accent color

### Reviews
- **Excellent (4-5★)** - Celebrate and share
- **Average (3★)** - Note areas for improvement
- **Poor (1-2★)** - Investigate and improve

---

## Performance Considerations

### Frontend
- Inquiries sorted on client (newest first)
- Reviews sorted on client (newest first)
- Analytics calculated from review data
- Images lazy-loaded (Tailwind responsive)

### Backend
- Image paths relative (for portable uploads)
- No pagination (for small datasets)
- Auto-refresh on any change
- Real-time stats calculation

### Storage
- Images stored on filesystem
- MongoDB stores metadata
- Uploads directory ~100MB limit (5MB × ~20 images)
- Consider cloud storage for production

---

## Error Handling

```
User Action → Validation → API Call → Success/Error

Success:
  ├─ Show success message
  ├─ Update UI immediately
  └─ Refresh data

Error:
  ├─ Show error message
  ├─ User can retry
  └─ No data is corrupted
```

---

## Security Notes

✅ **Protected**:
- Admin endpoints require Bearer token
- Services endpoint requires auth for mutations
- Image upload requires auth

⚠️ **Ensure**:
- Validate image type on backend
- Validate image size before upload
- Sanitize user input in responses
- Don't expose server paths to clients

---

## Accessibility Features

- ✅ Keyboard navigation
- ✅ Clear status indicators
- ✅ Color + icons (not color alone)
- ✅ Semantic HTML structure
- ✅ Form labels present
- ⚠️ Could add: ARIA labels, skip links

---

Created: April 3, 2026
Version: 1.0
