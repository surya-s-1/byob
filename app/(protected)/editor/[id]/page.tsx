import Head from '@/components/editor/Head'
import Content from '@/components/editor/Content'

async function getDraft(id: string) {
	return {
		id,
		cover: '',
		title: '',
		subtitle: '',
		content: '',
	}
}

export default async function Page({ params }: any) {
	const { id } = await params
	const draft = await getDraft(id)

	return (
		<div className='bg-primary text-main pb-2xl'>
			<div className='max-w-4xl mx-auto px-xl py-2xl'>
				<Head draft={draft} />
				<Content initialMarkdown={draft.content} />
			</div>
		</div>
	)
}
