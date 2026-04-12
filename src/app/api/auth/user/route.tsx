import { NextResponse, NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

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

    // Get the current user from the token
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to get user' },
        { status: 401 }
      )
    }

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
          role: 'user',
        },
      })
    }

    return NextResponse.json({
      user: profile || {
        id: user.id,
        email: user.email,
        role: 'user',
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
