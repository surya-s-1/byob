'use client'

import { useEffect, useState } from 'react'
import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Link as LinkIcon,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	Quote,
	Image as ImageIcon,
	Network,
	Code,
	AppWindow,
	Loader2,
	Link2Off,
	Check,
} from 'lucide-react'

export default function Toolbar({ insert, saveStatus }: any) {
	const [active, setActive] = useState<Record<string, boolean>>({})
	const [linkPopup, setLinkPopup] = useState<{
		show: boolean
		url: string
		text: string
		range: Range | null
	}>({ show: false, url: '', text: '', range: null })

	const isEditorFocused = () => {
		const el = document.activeElement
		const editorContainer = document.getElementById('editor-content')
		return editorContainer && el ? editorContainer.contains(el) : false
	}

	const getActiveTags = () => {
		let node = document.getSelection()?.anchorNode
		const tags = new Set<string>()
		while (node && node.nodeName !== 'DIV' && node.nodeName !== 'BODY') {
			if (node.nodeType === 1) {
				const nodeName = node.nodeName.toUpperCase()
				tags.add(nodeName)
				const style = (node as HTMLElement).style
				if (style.textDecoration) {
					if (style.textDecoration.includes('underline')) tags.add('U')
					if (style.textDecoration.includes('line-through')) tags.add('STRIKE')
				}
			}
			node = node.parentNode
		}
		return tags
	}

	const updateActiveState = () => {
		if (!isEditorFocused()) {
			setActive({})
			return
		}

		const activeTags = getActiveTags()
		const block = document.queryCommandValue('formatBlock').toLowerCase()
		const isHeading = ['h1', 'h2', 'h3'].includes(block)
		const isQuote = block === 'blockquote'

		setActive({
			bold: document.queryCommandState('bold') && !isHeading,
			italic: document.queryCommandState('italic'),
			underline: document.queryCommandState('underline'),
			strikeThrough: document.queryCommandState('strikeThrough'),
			h1: block === 'h1',
			h2: block === 'h2',
			h3: block === 'h3',
			quote: isQuote,
			ul: document.queryCommandState('insertUnorderedList'),
			ol: document.queryCommandState('insertOrderedList'),
			link: activeTags.has('A'),
		})
	}

	useEffect(() => {
		document.addEventListener('selectionchange', updateActiveState)
		document.addEventListener('keyup', updateActiveState)
		document.addEventListener('mouseup', updateActiveState)
		return () => {
			document.removeEventListener('selectionchange', updateActiveState)
			document.removeEventListener('keyup', updateActiveState)
			document.removeEventListener('mouseup', updateActiveState)
		}
	}, [])

	const getBtnClass = (cmd: string) => {
		const isActive = active[cmd]
		return `w-8 h-8 flex items-center justify-center text-sm rounded-sm transition-colors cursor-pointer border ${
			isActive
				? 'bg-brand/5 border-brand text-brand'
				: 'bg-transparent border-transparent text-subtle hover:bg-secondary hover:text-main'
		}`
	}

	const actionBtnClass =
		'w-8 h-8 flex items-center justify-center text-sm rounded-sm transition-colors cursor-pointer bg-transparent text-subtle hover:bg-secondary hover:text-main'

	const handleCommand = (
		e: React.MouseEvent,
		cmd: string,
		val: string | undefined = undefined
	) => {
		e.preventDefault()
		if (!isEditorFocused()) return

		const el = document.activeElement as HTMLElement
		if (el && el.isContentEditable) {
			if (cmd === 'createLink') {
				const selection = window.getSelection()
				const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
				let node = selection?.anchorNode
				let linkNode = null
				while (node && node.nodeName !== 'DIV' && node.nodeName !== 'BODY') {
					if (node.nodeName === 'A') {
						linkNode = node as HTMLAnchorElement
						break
					}
					node = node.parentNode
				}

				if (linkNode) {
					setLinkPopup({
						show: true,
						url: linkNode.href,
						text: linkNode.textContent || '',
						range,
					})
				} else {
					setLinkPopup({
						show: true,
						url: '',
						text: selection ? selection.toString() : '',
						range,
					})
				}
				return
			}

			if (cmd === 'formatBlock' && val) {
				const currentBlock = document.queryCommandValue('formatBlock').toLowerCase()
				val = currentBlock === val.toLowerCase() ? 'P' : val
			}

			document.execCommand(cmd, false, val)
			el.dispatchEvent(new Event('input', { bubbles: true }))
			setTimeout(updateActiveState, 10)
		}
	}

	const applyLink = () => {
		if (linkPopup.range) {
			const selection = window.getSelection()
			selection?.removeAllRanges()
			selection?.addRange(linkPopup.range)
		}

		const el = document.activeElement as HTMLElement
		if (el && el.isContentEditable && linkPopup.url) {
			const html = `<a href="${linkPopup.url}" target="_blank">${linkPopup.text || linkPopup.url}</a>`
			document.execCommand('insertHTML', false, html)
			el.dispatchEvent(new Event('input', { bubbles: true }))
		}
		setLinkPopup({ show: false, url: '', text: '', range: null })
		setTimeout(updateActiveState, 10)
	}

	return (
		<div className='sticky top-0 z-20 mb-lg flex flex-wrap items-center gap-1 border-b border-border bg-primary/90 py-3 backdrop-blur-sm'>
			<button
				onMouseDown={(e) => handleCommand(e, 'bold')}
				className={getBtnClass('bold')}
				title='Bold (Ctrl+B)'
			>
				<Bold size={16} />
			</button>
			<button
				onMouseDown={(e) => handleCommand(e, 'italic')}
				className={getBtnClass('italic')}
				title='Italic (Ctrl+I)'
			>
				<Italic size={16} />
			</button>
			<button
				onMouseDown={(e) => handleCommand(e, 'underline')}
				className={getBtnClass('underline')}
				title='Underline (Ctrl+U)'
			>
				<Underline size={16} />
			</button>
			<button
				onMouseDown={(e) => handleCommand(e, 'strikeThrough')}
				className={getBtnClass('strikeThrough')}
				title='Strikethrough'
			>
				<Strikethrough size={16} />
			</button>
			<button
				onMouseDown={(e) => handleCommand(e, 'createLink')}
				className={getBtnClass('link')}
				title='Link (Ctrl+K)'
			>
				<LinkIcon size={16} />
			</button>
			{active.link && (
				<button
					onMouseDown={(e) => handleCommand(e, 'unlink')}
					className={actionBtnClass}
					title='Unlink'
				>
					<Link2Off size={16} />
				</button>
			)}

			<div className='mx-1 h-5 w-px bg-border'></div>

			<button
				onMouseDown={(e) => handleCommand(e, 'formatBlock', 'H1')}
				className={getBtnClass('h1')}
				title='Heading 1'
			>
				<Heading1 size={18} />
			</button>
			<button
				onMouseDown={(e) => handleCommand(e, 'formatBlock', 'H2')}
				className={getBtnClass('h2')}
				title='Heading 2'
			>
				<Heading2 size={18} />
			</button>
			<button
				onMouseDown={(e) => handleCommand(e, 'formatBlock', 'H3')}
				className={getBtnClass('h3')}
				title='Heading 3'
			>
				<Heading3 size={18} />
			</button>

			<div className='mx-1 h-5 w-px bg-border'></div>

			<button
				onMouseDown={(e) => handleCommand(e, 'insertUnorderedList')}
				className={getBtnClass('ul')}
				title='Bullet List'
			>
				<List size={18} />
			</button>
			<button
				onMouseDown={(e) => handleCommand(e, 'insertOrderedList')}
				className={getBtnClass('ol')}
				title='Numbered List'
			>
				<ListOrdered size={18} />
			</button>

			<button
				onMouseDown={(e) => handleCommand(e, 'formatBlock', 'BLOCKQUOTE')}
				className={getBtnClass('quote')}
				title='Quote'
			>
				<Quote size={16} />
			</button>

			<div className='mx-2 h-5 w-px bg-border'></div>

			<button
				onClick={() => insert({ type: 'image', src: '', w: 700, align: 'center' })}
				className={actionBtnClass}
				title='Insert Image'
			>
				<ImageIcon size={16} />
			</button>
			<button
				onClick={() => insert({ type: 'mermaid', content: 'graph TD\nA-->B' })}
				className={actionBtnClass}
				title='Insert Mermaid Diagram'
			>
				<Network size={16} />
			</button>
			<button
				onClick={() =>
					insert({ type: 'code', lang: 'python', content: '# write code here' })
				}
				className={actionBtnClass}
				title='Insert Code Block'
			>
				<Code size={16} />
			</button>
			<button
				onClick={() =>
					insert({
						type: 'iframe',
						src: 'https://example.com',
						w: 600,
						h: 400,
						align: 'center',
					})
				}
				className={actionBtnClass}
				title='Insert Iframe'
			>
				<AppWindow size={16} />
			</button>

			<div className='ml-auto flex items-center pr-2' title='Saving...'>
				{(saveStatus === 'idle' || saveStatus === 'saving') && (
					<Loader2 size={14} className='text-brand animate-spin' />
				)}
				{saveStatus === 'saved' && <Check size={14} className='text-brand' />}
			</div>

			{linkPopup.show && (
				<div className='absolute top-full left-0 z-50 mt-2 flex w-[300px] flex-col gap-2 rounded-md border border-border bg-elevated p-3 shadow-xl'>
					<h3 className='text-xs font-bold tracking-wider text-subtle uppercase'>
						Insert Link
					</h3>
					<input
						value={linkPopup.text}
						onChange={(e) => setLinkPopup({ ...linkPopup, text: e.target.value })}
						placeholder='Display text (optional)'
						className='focus:border-brand ring-brand rounded-sm border border-border bg-secondary px-3 py-1.5 text-sm text-main transition-all outline-none focus:ring-1'
					/>
					<input
						autoFocus
						value={linkPopup.url}
						onChange={(e) => setLinkPopup({ ...linkPopup, url: e.target.value })}
						placeholder='https://...'
						className='focus:border-brand ring-brand rounded-sm border border-border bg-secondary px-3 py-1.5 text-sm text-main transition-all outline-none focus:ring-1'
						onKeyDown={(e) => {
							if (e.key === 'Enter') applyLink()
							if (e.key === 'Escape') setLinkPopup({ ...linkPopup, show: false })
						}}
					/>
					<div className='mt-1 flex justify-end gap-2'>
						<button
							onClick={() => setLinkPopup({ ...linkPopup, show: false })}
							className='px-2 text-sm text-subtle hover:text-main'
						>
							Cancel
						</button>
						<button
							onClick={applyLink}
							className='rounded-sm bg-main px-3 py-1.5 text-sm text-inverse'
						>
							Save
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
