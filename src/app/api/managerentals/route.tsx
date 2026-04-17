import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sb:token')?.value

    // Create authenticated client if token exists, otherwise use service role for public listings
    const supabase = token ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    ) : createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data, error } = await supabase
      .from('rentals')
      .select('*')

    if (error) throw new Error(error.message)

    return NextResponse.json({ rentals: data })
  } catch (error: any) {
    console.error('Error fetching rentals:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let image_url = ''

    // Handle image file
    if (image) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      // Convert to base64
      image_url = `data:${image.type};base64,${buffer.toString('base64')}`
    }

    const insertData: any = {
      title, 
      description, 
      price: parsedPrice, 
      published_by: user.id,
    }

    // Only include image_url if it has a value
    if (image_url) {
      insertData.image_url = image_url
    }

    const { data, error } = await supabase
      .from('rentals')
      .insert([insertData])

    if (error) throw new Error(error.message)

    return NextResponse.json({ rental: data })
  } catch (error: any) {
    console.error('Error creating rental:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

