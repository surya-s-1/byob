'use client'

import { useRef, useEffect } from 'react'

const LANGUAGES = [
	{ label: 'Python', value: 'python' },
	{ label: 'C', value: 'c' },
	{ label: 'C++', value: 'cpp' },
	{ label: 'Java', value: 'java' },
	{ label: 'JavaScript', value: 'javascript' },
	{ label: 'Groovy', value: 'groovy' },
	{ label: 'C#', value: 'csharp' },
	{ label: 'Markdown', value: 'markdown' },
	{ label: 'HTML', value: 'html' },
	{ label: 'CSS', value: 'css' },
	{ label: 'Plain Text', value: 'text' },
]

export default function Code({ block, update, readOnly }: any) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		if (textareaRef.current && !readOnly) {
			textareaRef.current.style.height = 'auto'
			textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
		}
	}, [block.content, readOnly])

	if (readOnly) {
		return (
			<div className='my-8 w-full overflow-hidden rounded-lg border border-border bg-elevated shadow-sm'>
				<div className='border-b border-border bg-secondary px-4 py-2 font-mono text-xs tracking-wider text-subtle uppercase'>
					{block.lang || 'text'}
				</div>
				<div className='overflow-x-auto p-4'>
					<pre className='font-mono text-sm leading-relaxed text-main'>
						<code>{block.content}</code>
					</pre>
				</div>
			</div>
		)
	}

	return (
		<div className='w-full overflow-hidden rounded-lg border border-border bg-elevated'>
			<div className='flex items-center justify-between border-b border-border bg-secondary px-4 py-2'>
				<select
					value={LANGUAGES.find((l) => l.value === block.lang) ? block.lang : 'text'}
					onChange={(e) => update({ lang: e.target.value })}
					className='min-w-[140px] cursor-pointer rounded-sm border border-border bg-elevated px-2 py-1 text-sm text-main shadow-sm outline-none focus:border-main'
				>
					{LANGUAGES.map((l) => (
						<option key={l.value} value={l.value}>
							{l.label}
						</option>
					))}
				</select>
			</div>
			<textarea
				ref={textareaRef}
				value={block.content}
				onChange={(e) => update({ content: e.target.value })}
				className='block w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-main outline-none'
				spellCheck={false}
				onKeyDown={(e) => e.stopPropagation()}
			/>
		</div>
	)
}
