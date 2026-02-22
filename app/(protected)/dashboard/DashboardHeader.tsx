import Button from '@/components/ui/Button'
import Link from 'next/link'

interface DashboardHeaderProps {
    userName: string
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
    return (
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 text-center sm:text-left'>
            <div className='space-y-1 mx-auto sm:mx-0'>
                <h1 className='text-2xl sm:text-3xl font-extrabold text-main tracking-tight'>
                    Welcome, {userName}.
                </h1>
                <p className='text-sm sm:text-base text-subtle'>
                    Here's a snapshot of your content and community.
                </p>
            </div>
            <div className='hidden lg:flex flex-col xs:flex-row gap-3'>
                <Link href='/publications/new' className='w-full xs:w-auto'>
                    <Button className='btn-brand w-full'>Create Publication</Button>
                </Link>
            </div>
        </div>
    )
}
