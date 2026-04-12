import { NextResponse, NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ 
      message: 'Logged out successfully',
      success: true 
    })
    
    // Clear the auth token cookie
    response.cookies.delete('sb:token')
    
    console.log('User logged out successfully')
    
    return response
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed', success: false },
      { status: 500 }
    )
  }
}
