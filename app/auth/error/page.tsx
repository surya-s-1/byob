'use client'

import Card from "@/components/ui/Card"
import Link from "next/link"

export default function ErrorPage() {
	return(
        <Card className="flex flex-col items-center justify-center">
            <div>Error signing in. Please try again.</div>
            <Link href="/login">Login</Link>
        </Card>
    )
}