import { supabase } from '@/lib/supabaseClient'
import { supabaseServer } from '@/lib/supabaseServer'

export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw new Error(error.message)

  // Insert user data into users table
  if (data.user) {
 
    const { error: insertError } = await supabaseServer
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
        },
      ])

    if (insertError) {
      console.error('Error inserting user into database:', insertError)
      // Don't throw - user is created in auth, just log the error
    }
  }

  return data
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
  return data
}