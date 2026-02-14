'use client'

import { useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

const LANGUAGES = [
	{ label: 'Plain Text', value: 'text' },
	{ label: 'Python', value: 'python' },
	{ label: 'JavaScript', value: 'javascript' },
	{ label: 'Markdown', value: 'markdown' },
	{ label: 'C', value: 'c' },
	{ label: 'C#', value: 'csharp' },
	{ label: 'C++', value: 'cpp' },
	{ label: 'Java', value: 'java' },
	{ label: 'Groovy', value: 'groovy' },
]

export default function Code({ block, update, removeBlock, readOnly }: any) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		if (textareaRef.current && !readOnly) {
			textareaRef.current.style.height = 'auto'
			textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
		}
	}, [block.content, readOnly])

	if (readOnly) {
		return (
			<div className='my-8 rounded-md overflow-hidden border border-border shadow-sm bg-elevated'>
				<div className='bg-secondary px-4 py-2 border-b border-border text-xs text-subtle font-mono uppercase tracking-wider'>
					{block.lang || 'text'}
				</div>
				<div className='p-4 overflow-x-auto'>
					<pre className='font-mono text-sm text-main leading-relaxed'>
						<code>{block.content}</code>
					</pre>
				</div>
			</div>
		)
	}

	return (
		<div className='my-8 rounded-md overflow-hidden border border-border bg-elevated'>
			<div className='bg-secondary px-4 py-2 flex items-center justify-between border-b border-border'>
				<select
					value={LANGUAGES.find((l) => l.value === block.lang) ? block.lang : 'text'}
					onChange={(e) => update({ lang: e.target.value })}
					className='text-sm bg-elevated text-main border border-border rounded-sm px-2 py-1 outline-none focus:border-main min-w-[140px] shadow-sm cursor-pointer'
				>
					{LANGUAGES.map((l) => (
						<option key={l.value} value={l.value}>
							{l.label}
						</option>
					))}
				</select>

				<button
					onClick={removeBlock}
					className='p-1 text-subtle hover:text-error transition-colors'
					title='Delete Code Block'
				>
					<Trash2 size={16} />
				</button>
			</div>
			<textarea
				ref={textareaRef}
				value={block.content}
				onChange={(e) => update({ content: e.target.value })}
				className='w-full bg-transparent text-main p-4 font-mono text-sm outline-none resize-none block leading-relaxed'
				spellCheck={false}
				onKeyDown={(e) => e.stopPropagation()}
			/>
		</div>
	)
}
