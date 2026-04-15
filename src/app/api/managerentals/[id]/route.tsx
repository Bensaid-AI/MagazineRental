import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabaseServer
      .from('rentals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)

    return Response.json({ rental: data })
  } catch (error: any) {
    console.error('Error fetching rental:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const formData = await req.formData()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const published_by = formData.get('published_by') as string
    const image = formData.get('image') as File | null
    const image_url = formData.get('image_url') as string | null

    if (!title || !description || !price || !published_by) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updateData: any = {
      title,
      description,
      price: parseFloat(price),
      published_by,
    }

    // Handle image file
    if (image) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      // Convert to base64
      updateData.image_url = `data:${image.type};base64,${buffer.toString('base64')}`
    } else if (image_url) {
      // Keep existing image if no new file uploaded
      updateData.image_url = image_url
    }

    const { data, error } = await supabaseServer
      .from('rentals')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)

    return Response.json({ rental: data[0] })
  } catch (error: any) {
    console.error('Error updating rental:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { error } = await supabaseServer
      .from('rentals')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)

    return Response.json({ message: 'Rental deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting rental:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
