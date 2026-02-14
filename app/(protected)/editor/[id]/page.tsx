import Head from './Head'
import Content from './Content'

async function getDraft(id: string) {
	return {
		id,
		cover: 'https://placehold.co/600X400',
		title: '',
		subtitle: '',
		content: '',
	}
}

export default async function Page({ params }: any) {
	const draft = await getDraft(params.id)

	return (
		<div className='min-h-screen bg-primary text-main pb-2xl'>
			<div className='max-w-4xl mx-auto px-xl py-2xl'>
				<Head draft={draft} />
				<Content initial={draft.content} />
			</div>
		</div>
	)
}
