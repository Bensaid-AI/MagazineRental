import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = req.cookies.get('sb:token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Create a client with the user's token to verify it
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

    // Get current user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 401 }
      )
    }

    // Create a server client to fetch profile
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the user's profile data
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      // Return auth user data even if profile not found
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
        },
      })
    }

    return NextResponse.json({
      user: {
        id: profile?.id || user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
        ...profile,
      },
    })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
