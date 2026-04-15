import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  try {
    const { data, error } = await supabaseServer
      .from('rentals')
      .select('*')

    if (error) throw new Error(error.message)

    return Response.json({ rentals: data })
  } catch (error: any) {
    console.error('Error fetching rentals:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const published_by = formData.get('published_by') as string

    const image = formData.get('image') as File | null

    if (!title || !description || !price ) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let image_url = ''

    // Handle image file
    if (image) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      // Convert to base64
      image_url = `data:${image.type};base64,${buffer.toString('base64')}`
    }

    const { data, error } = await supabaseServer
      .from('rentals')
      .insert([{ 
        title, 
        description, 
        price: parseFloat(price), 
        published_by,
        image_url 
      }])

    if (error) throw new Error(error.message)

    return Response.json({ rental: data })
  } catch (error: any) {
    console.error('Error creating rental:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

