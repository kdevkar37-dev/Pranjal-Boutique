# Admin Dashboard Guide - Pranjal Boutique

## 🎯 Overview

The Admin Dashboard is your central hub for managing all aspects of the Pranjal Boutique platform. This guide helps you maximize all features.

---

## 📋 Dashboard Features

### 1. **Service Management**

#### ✨ Adding a New Service

1. Click the **"+ Add New Service"** button
2. Fill in the form:
   - **Title**: Name of your service (e.g., "Aari Work on Blouse")
   - **Category**: Select from 6 categories:
     - Aari Work
     - Embroidery
     - Mehendi Art
     - Fabric Painting
     - Flower Jewellery
     - Custom Design
   - **Description**: Detailed description of the service
   - **Image**: Upload a high-quality image (JPG, PNG, GIF, WebP - max 5MB)
3. Click **"Create Service"**
4. The service appears immediately in your category view

#### ✏️ Editing Services

1. Browse to the service's category
2. Click the **"✏️ Edit"** button on the service card
3. Modify any fields (you can change the image by uploading a new one)
4. Click **"Update Service"**

#### 🗑️ Deleting Services

1. Find the service in its category
2. Click **"🗑️ Delete"** 
3. Confirm the deletion when prompted
4. Service is permanently removed

#### 🏠 Viewing by Category

Use the category buttons to filter which services you see. This makes it easy to manage services by type.

---

### 2. **Inquiry Management** 🔔

This section shows all customer inquiries about your services.

#### 📊 Inquiry Stats

The dashboard displays real-time statistics:
- **Total Inquiries**: All inquiries ever received
- **New/Pending**: Inquiries awaiting your response
- **Contacted**: Inquiries you've already responded to
- **Closed**: Resolved inquiries

#### 📍 Inquiry Status Workflow

Each inquiry moves through these statuses:

```
PENDING (New) → CONTACTED (Replied) → CLOSED (Done)
                     ↓
             (Can still reopen)
```

#### 🎬 What to Do With Inquiries

**For New/Pending Inquiries:**

1. **Read** the customer message and service type
2. **Write Your Response** in the text area
3. Click **"📤 Send Response"** to contact the customer
4. Mark as **"📞 Mark Contacted"** to move it to CONTACTED status
5. When resolved, click **"✓ Mark Closed"**

**For Contacted Inquiries:**
- Review your previous response (shown in green box)
- Mark as closed when the transaction is complete

**For Closed Inquiries:**
- View archived conversations
- Click **"↻ Reopen"** if you need to contact the customer again

#### 💡 Pro Tips

- **Response Times**: Reply quickly to show customers you're active
- **Professional Tone**: Keep responses polished and professional
- **Clear Info**: Include pricing, timeline, and next steps in your response
- **Phone Follow-up**: Many customers expect a phone call after message response

---

### 3. **Review Management** ⭐

Monitor customer feedback and ratings on this section.

#### 📈 Analytics

- **Average Rating**: Your overall customer satisfaction (out of 5)
- **Total Reviews**: Total feedback received
- **Rating Distribution**: See the breakdown of 5★, 4★, 3★, etc. ratings

#### ✅ Review Actions

Each review shows:
- Customer's name
- Star rating (★★★★★)
- Review message
- Date posted
- **Delete button**: Remove inappropriate or spam reviews

#### 🎯 What to Do

- **Excellent Reviews (4-5 stars)**: Celebrate them! Consider sharing on social media
- **Okay Reviews (3 stars)**: Neutral feedback - room for improvement
- **Poor Reviews (1-2 stars)**: Respond professionally in inquiries if the customer follows up
- **Spam/Inappropriate**: Delete immediately

#### 💡 Pro Tips

- High ratings build trust - share them with new customers
- Even 1-2 star reviews show authenticity to potential customers
- Never publicly reply to reviews - instead, treat related inquiries with extra care
- Monitor trends: Are reviews declining? Check your service quality

---

## 🚀 Quick Start Checklist

- [ ] Add at least 2 services per category
- [ ] Upload quality images for each service
- [ ] Set up admin email in settings
- [ ] Wait for first customer inquiry
- [ ] Respond to first inquiry within 24 hours
- [ ] Share first positive review

---

## 🔧 System Requirements

### Image Requirements
- **Accepted Formats**: JPG, JPEG, PNG, GIF, WebP
- **Maximum Size**: 5MB per image
- **Recommended Size**: 1000x800px for best quality
- **Aspect Ratio**: Any ratio works (will be displayed as-is)

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (responsive design)

---

## ⚠️ Common Issues & Solutions

### "Image upload failed"
- Check file size (must be under 5MB)
- Check file format (only JPG, PNG, GIF, WebP allowed)
- Ensure file isn't corrupted

### "Service save failed"
- Double-check all required fields are filled
- If adding new, ensure image URL is valid
- Try refreshing the page and retry

### "Unable to update inquiry"
- Check your internet connection
- Try refreshing the page
- Contact support if problem persists

### No response sent to customer
- Ensure you typed in the response box
- Response must not be empty
- Check for any error messages

---

## 🎨 Dashboard Sections Overview

| Section | Purpose | Action |
|---------|---------|--------|
| **Notifications** | Quick status alerts | Monitor new inquiries |
| **Services** | Manage offerings | Add, Edit, Delete |
| **Inquiries** | Track customer requests | Respond, Update Status |
| **Reviews** | Monitor feedback | View, Delete spam |

---

## 🔐 Admin Credentials

Your admin account should be created with these environment variables:
```
ADMIN_EMAIL: Your email
ADMIN_NAME: Your name
ADMIN_PASSWORD: Your password
```

Contact your developer if you need to reset credentials.

---

## 📞 Need Help?

- Check this guide for solutions
- Reach out to your development team
- Report bugs with screenshots and details

---

## 🎓 Best Practices

### Service Listings
✅ Use clear, descriptive titles
✅ Include pricing or starting price
✅ Mention timeline/turnaround
✅ Upload clear, well-lit images
❌ Don't use watermarked images
❌ Don't list services twice in different categories

### Inquiry Responses
✅ Reply within 24 hours
✅ Be professional and warm
✅ Ask clarifying questions if needed
✅ Provide clear next steps
❌ Don't make promises you can't keep
❌ Don't ignore inquiries

### Review Management
✅ Include positive reviews in marketing
✅ Follow up on poor reviews professionally
✅ Delete actual spam
❌ Don't delete legitimate negative feedback
❌ Don't respond publicly to reviews

---

**Last Updated**: April 2026  
**Version**: 1.0
