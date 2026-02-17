import { NextResponse } from 'next/server'
import { AUTH_PROVIDER } from '@/lib/auth/config'
import { supabaseAuth } from '@/lib/auth/providers/supabase'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)

    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    if (AUTH_PROVIDER === 'supabase') {
        const code = searchParams.get('code')

        if (code) {
            try {
                const supabase = await supabaseAuth()

                const { error } = await supabase.auth.exchangeCodeForSession(code)

                if (!error) {
                    return NextResponse.redirect(new URL(callbackUrl, origin))
                }
            } catch (error) {
                console.error('Error fetching session:', error)
                return NextResponse.redirect(new URL('/auth/error', origin))
            }
        } else {
            return NextResponse.redirect(new URL('/auth/error', origin))
        }
    }

    return NextResponse.redirect(new URL('/auth/error', origin))
}