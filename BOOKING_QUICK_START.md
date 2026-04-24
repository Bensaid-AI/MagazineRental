# 🎯 Booking Feature - Quick Start Guide

## ✅ What's Been Implemented

### Components Created:
1. **BookingModal.tsx** - Modal form for making reservations
2. **RentalCard.tsx** - Reusable rental card component
3. **MyBookings Page** - User booking history view
4. **Badge Component** - Status indicators

### API Endpoint:
- **POST /api/bookings** - Create new booking + update rental state
- **GET /api/bookings** - Fetch user's bookings

### Updated Components:
- **Rent Page** - Integrated booking modal & Rent Now button

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Database Queries
Copy & paste these SQL queries into your Supabase SQL Editor:

```sql
-- Create bookings table
CREATE TABLE public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rental_id uuid NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  phone text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamp DEFAULT current_timestamp,
  updated_at timestamp DEFAULT current_timestamp
);

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_rental_id ON public.bookings(rental_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
  ON public.bookings FOR DELETE USING (auth.uid() = user_id);

-- Add state to rentals
ALTER TABLE public.rentals ADD COLUMN state text DEFAULT 'available' CHECK (state IN ('available', 'reserved'));
```

### Step 2: Verify Files Created
Check these files exist:
- ✅ `src/app/api/bookings/route.tsx`
- ✅ `src/app/components/rent/BookingModal.tsx`
- ✅ `src/app/components/rent/RentalCard.tsx`
- ✅ `src/app/components/rent/page.tsx` (updated)
- ✅ `src/app/components/mybookings/page.tsx`
- ✅ `src/components/ui/badge.tsx`

### Step 3: Add Navigation Link (Optional)
Add to your navigation menu:
```tsx
<Link href="/components/mybookings">My Bookings</Link>
```

---

## 🎨 User Flow

```
1. User browses rentals (/components/rent)
   ↓
2. Clicks "Rent Now" button
   ↓
3. Booking modal opens with pre-filled user info
   ↓
4. User enters phone + selects dates
   ↓
5. Form validates & submits to /api/bookings
   ↓
6. Booking created + rental state set to "reserved"
   ↓
7. Success message shown
   ↓
8. User can view booking at /components/mybookings
```

---

## 📌 Key Features

| Feature | Status | Notes |
|---------|--------|-------|
| Create booking | ✅ | Automatic rental state update |
| View bookings | ✅ | User-only, ordered by date |
| Date validation | ✅ | End date > start date |
| Prevent double booking | ✅ | Checks overlapping dates |
| Pre-filled user info | ✅ | From auth user data |
| Reserved status | ✅ | Disables booking button |
| Error handling | ✅ | Form validation + API errors |
| Loading states | ✅ | Spinner on submit |
| Responsive design | ✅ | Mobile-friendly |
| RLS security | ✅ | Users can only see own bookings |

---

## 🔗 API Endpoints

### Create Booking
```
POST /api/bookings
Content-Type: application/json

{
  "rental_id": "uuid",
  "phone": "+1234567890",
  "start_date": "2024-05-01",
  "end_date": "2024-05-05"
}

Response: 201
{
  "message": "Booking created successfully",
  "booking": { id, rental_id, ... }
}
```

### Fetch User's Bookings
```
GET /api/bookings

Response: 200
{
  "bookings": [
    {
      "id": "uuid",
      "rental_id": "uuid",
      "phone": "+1234567890",
      "start_date": "2024-05-01",
      "end_date": "2024-05-05",
      "status": "confirmed",
      "rentals": {
        "id": "uuid",
        "title": "Garage",
        "price": "50",
        "image_url": "..."
      }
    }
  ]
}
```

---

## 🛡️ Security

- ✅ All endpoints require authentication
- ✅ Row-level security on bookings table
- ✅ Users can only see their own bookings
- ✅ Server-side validation of all inputs
- ✅ Rental availability verification

---

## 🐛 Testing Checklist

- [ ] Create a test booking with valid dates
- [ ] Try booking with end date before start date (should fail)
- [ ] Try booking reserved rental (button should be disabled)
- [ ] View bookings in My Bookings page
- [ ] Verify rental shows "Reserved" status after booking
- [ ] Check that only authenticated users can book

---

## 📧 Email Integration (Optional)

To add email notifications, add this to `route.tsx`:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'bookings@example.com',
  to: user.email,
  subject: 'Booking Confirmed',
  html: `<p>Your booking for ${rental.title} is confirmed!</p>`
});
```

---

## 🎯 Next Steps

1. ✅ Database setup
2. ✅ Component integration
3. ✅ API endpoints
4. 📌 Add booking cancellation
5. 📌 Add approval workflow
6. 📌 Email notifications
7. 📌 Payment integration

---

## 📖 Full Documentation

See `BOOKING_FEATURE.md` for detailed setup and architecture.
