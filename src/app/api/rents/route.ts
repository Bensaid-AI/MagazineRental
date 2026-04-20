import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('sb:token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

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

        const { data, error } = await supabase
            .from('rentals')
            .select(`
                *,
                profiles (fullname, email)
            `)

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ rentals: data })

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}