import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sb:token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { rental_id, phone, start_date, end_date } = await req.json()

    // Validation
    if (!rental_id || !phone || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate dates
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check if rental exists and is available
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .select('id, state')
      .eq('id', rental_id)
      .single()

    if (rentalError || !rental) {
      return NextResponse.json(
        { error: 'Rental not found' },
        { status: 404 }
      )
    }

    if (['reserved', 'not_available', 'not available'].includes((rental.state || '').toLowerCase())) {
      return NextResponse.json(
        { error: 'This rental is not available' },
        { status: 400 }
      )
    }

    // Check for overlapping bookings
    const { data: existingBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('rental_id', rental_id)
      .eq('status', 'confirmed')
      .or(
        `and(start_date.lte.${end_date},end_date.gte.${start_date})`
      )

    if (bookingError) {
      console.error('Booking check error:', bookingError)
    }

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'This rental is already booked for those dates' },
        { status: 400 }
      )
    }

    // Create booking
    const { data: booking, error: createError } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: user.id,
          rental_id,
          phone,
          start_date,
          end_date,
          status: 'confirmed',
        },
      ])
      .select()

    if (createError) {
      console.error('Booking creation error:', createError)
      throw new Error(createError.message)
    }

    // Mark rental as not available after a successful booking
    const { error: updateError } = await supabase
      .from('rentals')
      .update({ state: 'not_available' })
      .eq('id', rental_id)

    if (updateError) {
      console.error('Rental update error:', updateError)
      // Still return success since booking was created
    }

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: booking?.[0],
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sb:token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rentals (
          id,
          title,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ bookings })
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
