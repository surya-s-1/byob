import { NextResponse } from 'next/server'
import { AUTH_PROVIDER } from '@/lib/auth/config'
import { supabaseAdapter } from '@/lib/auth/providers/supabase'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)

    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    if (AUTH_PROVIDER === 'supabase') {
        const code = searchParams.get('code')

        if (code) {
            return supabaseAdapter.exchangeCode(code, callbackUrl)
        } else {
            return NextResponse.redirect(new URL('/auth/error', origin))
        }
    }

    return NextResponse.redirect(new URL('/auth/error', origin))
}