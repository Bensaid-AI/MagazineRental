import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.cookies.get('sb:token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('rentals')
      .select('*')
      .eq('id', id)
      .eq('published_by', user.id)
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ rental: data })
  } catch (error: any) {
    console.error('Error fetching rental:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.cookies.get('sb:token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const formData = await req.formData()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const image = formData.get('image') as File | null
    const image_url = formData.get('image_url') as string | null

    // Validate required fields
    if (!title || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate price is a valid number
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Price must be a valid number' }, { status: 400 })
    }

    // Create authenticated client with user's token
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

    // Get current user to verify ownership
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const updateData: any = {
      title,
      description,
      price: parsedPrice,
    }

    // Handle image file
    if (image) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      // Convert to base64
      updateData.image_url = `data:${image.type};base64,${buffer.toString('base64')}`
    } else if (image_url && image_url !== 'undefined') {
      // Keep existing image if no new file uploaded (and it's valid)
      updateData.image_url = image_url
    }

    // Use authenticated client - RLS will verify ownership
    const { data, error } = await supabase
      .from('rentals')
      .update(updateData)
      .eq('id', id)
      .eq('published_by', user.id) // Ensure user owns this rental
      .select()

    if (error) throw new Error(error.message)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Rental not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ rental: data[0] })
  } catch (error: any) {
    console.error('Error updating rental:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.cookies.get('sb:token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Create authenticated client with user's token
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

    // Get current user to verify ownership
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use authenticated client with ownership check
    const { error } = await supabase
      .from('rentals')
      .delete()
      .eq('id', id)
      .eq('published_by', user.id) // Ensure user owns this rental

    if (error) throw new Error(error.message)

    return NextResponse.json({ message: 'Rental deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting rental:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.cookies.get('sb:token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { state } = await req.json()
    const allowedStates = ['not_rented', 'not_available']

    if (!allowedStates.includes(state)) {
      return NextResponse.json(
        { error: 'Invalid state value' },
        { status: 400 }
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

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('rentals')
      .update({ state })
      .eq('id', id)
      .eq('published_by', user.id)
      .select()

    if (error) throw new Error(error.message)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Rental not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ rental: data[0] })
  } catch (error: any) {
    console.error('Error updating rental state:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
