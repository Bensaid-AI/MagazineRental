import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  try {
    const { data, error } = await supabaseServer
      .from('profiles')
      .select('*')

    if (error) throw new Error(error.message)

    return Response.json({ profiles: data })
  } catch (error: any) {
    console.error('Error fetching profiles:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}


