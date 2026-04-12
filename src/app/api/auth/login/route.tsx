import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Sign in user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(error.message)

    // Create response
    const response = NextResponse.json({ 
      session: data.session,
      user: data.user 
    })

    // Set auth token in cookie for middleware
    if (data.session?.access_token) {
      response.cookies.set('sb:token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}