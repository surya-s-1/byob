import StatCard from '@/components/ui/StatCard'
import { BookOpen, FileText } from 'lucide-react'

interface DashboardStatsProps {
    articlesCount: number
    publicationsCount: number
}

export default function DashboardStats({ articlesCount, publicationsCount }: DashboardStatsProps) {
    return (
        <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
            <StatCard
                title='Published Articles'
                value={articlesCount.toString()}
                icon={<FileText className='text-main' size={20} />}
            />
            <StatCard
                title='Active Publications'
                value={publicationsCount.toString()}
                icon={<BookOpen className='text-main' size={20} />}
            />
        </div>
    )
}
