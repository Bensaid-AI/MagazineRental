# Booking Feature - Architecture & Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE (Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────────┐     │
│  │  Rent Page       │         │  My Bookings Page    │     │
│  │  (/rent)         │         │  (/mybookings)       │     │
│  ├──────────────────┤         ├──────────────────────┤     │
│  │ - Show rentals   │         │ - Show user bookings │     │
│  │ - "Rent Now" btn │         │ - Booking details    │     │
│  │ - Filter/search  │         │ - Status display     │     │
│  └────────┬─────────┘         └──────────┬───────────┘     │
│           │                              │                  │
│           │ open modal                   │ GET /bookings    │
│           ▼                              ▼                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         BookingModal Component                        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ User Info (pre-filled from auth)               │  │   │
│  │  │ - Name / Email                                 │  │   │
│  │  │                                                │  │   │
│  │  │ Form Inputs                                    │  │   │
│  │  │ - Phone number (required)                      │  │   │
│  │  │ - Start date (date picker)                     │  │   │
│  │  │ - End date (date picker)                       │  │   │
│  │  │                                                │  │   │
│  │  │ Validation                                     │  │   │
│  │  │ - Check dates valid                            │  │   │
│  │  │ - Check end > start                            │  │   │
│  │  │                                                │  │   │
│  │  │ Submit ────────────────────────────────────┐   │  │   │
│  │  └────────────────────────────────────────────┤───┘   │   │
│  └──────────────────────────────────────────────┤────────┘   │
│                                                │             │
└────────────────────────────────────────────────┼─────────────┘
                                                │ POST /api/bookings
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVER SIDE (Next.js API)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  POST /api/bookings                                    │ │
│  │                                                        │ │
│  │  1. Validate Authentication ────────────────────────┐ │ │
│  │     └─ Check token in cookies                       │ │ │
│  │                                                     │ │ │
│  │  2. Validate Input Data ───────────────────────────┤─┐ │
│  │     └─ phone, dates required                       │ │ │
│  │     └─ end_date > start_date                       │ │ │
│  │                                                   │ │ │ │
│  │  3. Check Rental Exists ──────────────────────────┤─┤─┐ │
│  │     └─ Query rentals table                        │ │ │ │
│  │                                                   │ │ │ │
│  │  4. Check Availability ──────────────────────────┤─┤─┤─┐ │
│  │     └─ rental.state = 'available'                 │ │ │ │ │
│  │                                                   │ │ │ │ │
│  │  5. Prevent Double Booking ──────────────────────┤─┤─┤─┤─┐ │
│  │     └─ Check overlapping bookings                │ │ │ │ │ │
│  │                                                   │ │ │ │ │ │
│  │  6. CREATE BOOKING ────────────────────────────┐ │ │ │ │ │ │
│  │     └─ Insert into bookings table              │ │ │ │ │ │ │
│  │                                                │ │ │ │ │ │ │
│  │  7. UPDATE RENTAL STATE ──────────────────────┤─┤─┤─┤─┤─┐ │
│  │     └─ Set state = 'reserved'                 │ │ │ │ │ │ │
│  │                                                │ │ │ │ │ │ │
│  │  8. Return Response ──────────────────────────┤─┤─┤─┤─┤─┤─┐ │
│  │     └─ Success: 201 + booking data            │ │ │ │ │ │ │ │
│  │     └─ Error: 400/401/404 + message           │ │ │ │ │ │ │ │
│  └────────────────────────────────────────────────┤─┘ │ │ │ │ │
│                                                   │  │ │ │ │ │
│  ┌────────────────────────────────────────────────┘──┼─┼─┤ │ │
│  │  GET /api/bookings                                │ │ │ │ │
│  │  - Validate auth token                           │ │ │ │ │
│  │  - Get current user                              │ │ │ │ │
│  │  - Query bookings where user_id = current_user   │ │ │ │ │
│  │  - Include rental details                        │ │ │ │ │
│  │  - Return bookings array                         │ │ │ │ │
│  └───────────────────────────────────────────────────┘ │ │ │ │
│                                                         │ │ │ │
└─────────────────────────────────────────────────────────┼─┼─┼─┘
                                                          │ │ │
                                                          ▼ ▼ ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Supabase)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐      ┌──────────────────────────┐  │
│  │  bookings table    │      │   rentals table          │  │
│  ├────────────────────┤      ├──────────────────────────┤  │
│  │ id (uuid) PK       │      │ id (uuid) PK             │  │
│  │ user_id (fk)       │◄─────┤ ... other fields ...     │  │
│  │ rental_id (fk) ──────────►│ state (available/reserved)  │
│  │ phone              │      │                          │  │
│  │ start_date         │      └──────────────────────────┘  │
│  │ end_date           │                                     │
│  │ status             │      ┌──────────────────────────┐  │
│  │ created_at         │      │   auth.users            │  │
│  │ updated_at         │      ├──────────────────────────┤  │
│  │                    │      │ id (uuid) PK            │  │
│  │ RLS Enabled ✓      │      │ email                  │  │
│  │ - Users can see    │      │ user_metadata          │  │
│  │   their own only   │      │                        │  │
│  │                    │      └──────────────────────────┘  │
│  └────────────────────┘                                     │
│                                                              │
│  Indexes:                                                   │
│  - idx_bookings_user_id                                    │
│  - idx_bookings_rental_id                                  │
│  - idx_rentals_state                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Sequence

```
User clicks "Rent Now"
    │
    ▼
BookingModal Opens
    │
    ├─ Fetch user from auth
    │  └─ Display name, email
    │
    ▼
User enters data
    │
    ├─ Phone number
    ├─ Start date
    └─ End date
    │
    ▼
Form Validation (Client)
    │
    ├─ Phone not empty? ✓
    ├─ Dates filled? ✓
    └─ End > Start? ✓
    │
    ▼
Submit to POST /api/bookings
    │
    ▼
Server Validation
    │
    ├─ Token valid? ✓
    ├─ User authenticated? ✓
    ├─ Input complete? ✓
    ├─ Rental exists? ✓
    ├─ Rental available? ✓
    └─ No conflicts? ✓
    │
    ▼
Create Booking Record
    INSERT INTO bookings (...)
    │
    ▼
Update Rental State
    UPDATE rentals SET state='reserved'
    │
    ▼
Return 201 + Success Message
    │
    ▼
Client Shows Success Modal
    │
    ├─ Show checkmark
    ├─ "Booking Successful"
    └─ Redirect after 2s
    │
    ▼
Refresh Rentals List
    │
    ├─ Rent Now button disabled
    └─ Show "Reserved" badge
    │
    ▼
User can view in "My Bookings"
    │
    └─ GET /api/bookings returns all user bookings
```

---

## 🔐 Security Layers

```
CLIENT LAYER
├─ Required authentication check
├─ Form validation
└─ Date sanity checks

API LAYER
├─ Token validation
├─ User identification
├─ Input sanitization
├─ Business logic validation
└─ Atomic transaction

DATABASE LAYER
├─ RLS (Row Level Security) enabled
├─ Foreign key constraints
├─ NOT NULL constraints
├─ ENUM constraints (status, state)
└─ User ownership verification
```

---

## 📈 Component Dependencies

```
RentPage
├─ BookingModal
│  ├─ Input (UI)
│  ├─ Button (UI)
│  ├─ Card (UI)
│  └─ Icons
├─ RentalCard (optional)
│  ├─ Card (UI)
│  ├─ Button (UI)
│  └─ Icons
├─ Input (UI)
├─ Button (UI)
├─ Card (UI)
└─ Icons

MyBookingsPage
├─ Badge (UI)
├─ Card (UI)
├─ Loader icon
└─ Other icons

API Bookings
├─ Supabase client
├─ NextResponse
├─ NextRequest
└─ TypeScript
```

---

## 🎯 User Journey Map

```
GUEST
  │
  ├─ Browse rentals (public)
  └─ Try to book
     └─ Redirect to login
     
AUTHENTICATED USER
  │
  ├─ Browse rentals (/components/rent)
  │  │
  │  ├─ Search/filter
  │  └─ See available & reserved items
  │
  ├─ Click "Rent Now"
  │  │
  │  ├─ Modal opens
  │  └─ Pre-filled info loads
  │
  ├─ Fill booking form
  │  │
  │  ├─ Phone number (required)
  │  ├─ Pick dates
  │  └─ Validation happens
  │
  ├─ Submit booking
  │  │
  │  ├─ Loading state
  │  └─ API processes
  │
  ├─ See success/error
  │  │
  │  ├─ Success: show modal 2s
  │  └─ Error: show message
  │
  └─ View booking history
     │
     └─ /components/mybookings
        ├─ All bookings listed
        ├─ See rental details
        ├─ Check status
        └─ View dates & price
```

---

## 🔗 API Integration Points

```
Frontend                          Backend                  Database
┌──────────┐                   ┌──────────┐              ┌────────┐
│ RentPage │                   │  API     │              │ Supabase
└──────────┘                   └──────────┘              └────────┘
     │                              │                        │
     │ GET /api/rents              │                         │
     ├─────────────────────────►   │ SELECT * FROM rentals   │
     │                              ├────────────────────────►│
     │◄─────────────────────────    │◄─────────────────────────│
     │ [rentals array]             │ [rows]                   │
     │                              │                         │
     │ POST /api/bookings          │                         │
     ├─────────────────────────►   │ INSERT INTO bookings    │
     │ {rental_id, dates}          │ UPDATE rentals.state    │
     │                              ├────────────────────────►│
     │                              │◄────────────────────────│
     │◄─────────────────────────    │ ✓ success              │
     │ {success, booking}          │                         │
     │                              │                         │
     │ GET /api/bookings           │                         │
     ├─────────────────────────►   │ SELECT * FROM bookings  │
     │ (no params needed)           │ WHERE user_id = $1      │
     │                              ├────────────────────────►│
     │◄─────────────────────────    │◄────────────────────────│
     │ [bookings array]            │ [rows + rentals]        │
     │                              │                         │
```

---

## 📋 Validation Chain

```
Input → Client → Server → Database → Response

PHONE:
  Client: ✓ Not empty → Server: ✓ Validated → DB: ✓ Stored as text

DATES:
  Client: ✓ Both filled → Server: ✓ End > Start → DB: ✓ ISO format
  Client: ✓ End > Start    Server: ✓ Overlap check

RENTAL:
  Client: ✓ Check state   Server: ✓ Verify exists → DB: ✓ Check state
                         Server: ✓ Check available

USER:
  Client: ✓ Auth check    Server: ✓ Token valid → DB: ✓ RLS check
                         Server: ✓ User ID match
```

---

## 🚦 State Management

```
RentPage Component
├─ rentals[]           (list of all rentals)
├─ loading (bool)      (fetch status)
├─ error (string)      (error message)
├─ searchQuery         (search filter)
├─ user (object)       (current user)
├─ isModalOpen (bool)  (modal visibility)
└─ selectedRental      (rental being booked)

BookingModal Component
├─ phone               (form input)
├─ startDate           (form input)
├─ endDate             (form input)
├─ loading (bool)      (submit status)
├─ error (string)      (form error)
└─ success (bool)      (submit result)

MyBookingsPage Component
├─ bookings[]          (user's bookings)
├─ loading (bool)      (fetch status)
└─ error (string)      (error message)
```

---

This architecture ensures:
✅ **Security** - Auth, RLS, validation
✅ **Reliability** - Error handling, atomic ops
✅ **Performance** - Indexed queries
✅ **UX** - Loading states, feedback
✅ **Maintainability** - Clear separation of concerns
