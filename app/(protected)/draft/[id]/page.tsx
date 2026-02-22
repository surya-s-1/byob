import Head from '@/components/editor/Head'
import Content from '@/components/editor/Content'
import { db } from '@/db/client'
import { articleDrafts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

async function getDraft(id: string) {
	const draft = await db.query.articleDrafts.findFirst({
		where: eq(articleDrafts.id, id),
	})
	return draft || null
}

export default async function Page({ params }: any) {
	const { id } = await params
	const draft = await getDraft(id)

	if (!draft) {
		notFound()
	}

	return (
		<div className='bg-primary text-main pb-2xl'>
			<div className='max-w-4xl mx-auto px-xl py-2xl'>
				<Head draft={draft} />
				<Content initialMarkdown={draft.content || ''} />
			</div>
		</div>
	)
}
