# Booking Feature - Database Setup & Implementation Guide

## 📋 Database Setup

Run these SQL queries in your Supabase SQL Editor to set up the booking feature.

### 1. Create Bookings Table

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

-- Create index for performance
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_rental_id ON public.bookings(rental_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings"
  ON public.bookings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own bookings
CREATE POLICY "Users can delete their own bookings"
  ON public.bookings
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. Update Rentals Table

```sql
-- Add state column to rentals table
ALTER TABLE public.rentals 
ADD COLUMN state text DEFAULT 'available' CHECK (state IN ('available', 'reserved'));

-- Create index for performance
CREATE INDEX idx_rentals_state ON public.rentals(state);
```

---

## 📁 File Structure

Created files for the booking feature:

```
src/
├── app/
│   ├── api/
│   │   └── bookings/
│   │       └── route.tsx          # POST (create) & GET (fetch user bookings)
│   └── components/
│       ├── rent/
│       │   ├── page.tsx            # Updated with modal & booking logic
│       │   ├── BookingModal.tsx    # Booking form modal
│       │   └── RentalCard.tsx      # Rental card component (optional)
│       └── mybookings/
│           └── page.tsx            # View user's bookings history
└── components/
    └── ui/
        └── badge.tsx              # Status badge component
```

---

## 🎯 Features Implemented

### 1. **BookingModal Component** (`src/app/components/rent/BookingModal.tsx`)
- Pre-filled user info (name, email)
- Phone number input
- Date range picker (with validation)
- Form validation
- Success/error states
- Loading state with spinner
- Prevents booking if rental is reserved

### 2. **Booking API Endpoint** (`src/app/api/bookings/route.tsx`)

#### POST /api/bookings
- Create a new booking
- Validates authentication
- Checks if rental exists and is available
- Prevents double booking (overlapping dates)
- Updates rental state to "reserved"
- Returns booking confirmation

#### GET /api/bookings
- Fetch user's bookings
- Returns rental info with each booking
- Ordered by creation date (newest first)

### 3. **Updated Rent Page** (`src/app/components/rent/page.tsx`)
- Displays "Rent Now" button on each rental card
- Opens booking modal on click
- Shows "Reserved" status for unavailable rentals
- Refreshes rental list after successful booking
- Checks user authentication before booking

### 4. **My Bookings Page** (`src/app/components/mybookings/page.tsx`)
- View all user's bookings
- Shows booking details (dates, rental, price)
- Displays booking status (confirmed, pending, cancelled)
- Calculate total rental days
- Clean card-based UI

---

## 🔧 Validation & Business Logic

### Client-side Validation:
- ✅ Phone number required
- ✅ Start and end dates required
- ✅ End date must be after start date
- ✅ Authentication check before booking

### Server-side Validation:
- ✅ Token verification
- ✅ User authentication
- ✅ Rental existence check
- ✅ Rental availability check (state = 'available')
- ✅ Overlapping booking prevention
- ✅ Atomic transaction (booking + rental state update)

---

## 📌 How to Use

### For Users:
1. Navigate to `/components/rent` page
2. Browse available rentals
3. Click "Rent Now" button
4. Fill in phone number and select dates
5. Confirm booking
6. View booking confirmation
7. Check `/components/mybookings` to see all bookings

### Integration Steps:
1. Run the SQL queries in Supabase
2. Components are ready to use - no additional setup needed
3. Make sure your auth is working (`/api/auth/user`)
4. Add link to "My Bookings" page in your navigation

---

## 🚀 API Examples

### Create Booking
```javascript
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rental_id: 'uuid-here',
    phone: '+1234567890',
    start_date: '2024-05-01',
    end_date: '2024-05-05'
  })
})
```

### Fetch User Bookings
```javascript
const response = await fetch('/api/bookings')
const data = await response.json()
console.log(data.bookings)
```

---

## 🔐 Security Features

- ✅ Row-Level Security (RLS) on bookings table
- ✅ User authentication required
- ✅ Users can only see/modify their own bookings
- ✅ Token validation on all API endpoints
- ✅ Rental ownership verification
- ✅ Input validation and sanitization

---

## 📝 Notes

- All bookings default to "confirmed" status (set to "pending" if you want approval flow)
- Rental state changes to "reserved" after booking
- To allow booking again, manually update rental state to "available" in Supabase
- Dates are stored as ISO strings in the database
- Phone numbers are stored as plain text (consider adding formatting validation)

---

## 🎨 Styling

- Uses existing Tailwind CSS configuration
- Modal uses shadcn/ui Card component
- Responsive design (mobile-friendly)
- Consistent with existing app design

---

## ⚠️ Future Enhancements

- [ ] Booking cancellation
- [ ] Booking approval workflow
- [ ] Email notifications
- [ ] Price calculation
- [ ] Calendar availability view
- [ ] Booking status updates
- [ ] Review/rating system
