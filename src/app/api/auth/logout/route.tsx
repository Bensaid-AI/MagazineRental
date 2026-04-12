import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  // Clear the auth token cookie
  response.cookies.delete('sb:token')
  
  return response
}
