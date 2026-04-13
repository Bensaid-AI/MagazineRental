import { supabase } from '@/lib/supabaseClient'
import { supabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password , fullname, cin } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
     
    })

    if (error) throw new Error(error.message)

    console.log('Auth signup response:', { userId: data.user?.id, email: data.user?.email })

    // Create profile for the user
    if (data.user) {
      console.log('Creating profile for user:', data.user.id)
      const { error: profileError, data: profileData } = await supabaseServer
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            role: 'user',
            created_at: new Date().toISOString(),
            fullname: fullname,
            cin: cin,
          },
        ])
        .select()

      if (profileError) {
        console.error('Profile insertion error:', profileError)
      } else {
        console.log('Profile created successfully:', profileData)
      }
    }

    // Create response
    const response = NextResponse.json({ 
      user: data.user,
      message: 'Registration successful!'
    })

    // Set auth token in cookie if available
    if (data.session?.access_token) {
      console.log('Setting token for new user:', data.user?.email)
      response.cookies.set('sb:token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }

    return response
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}