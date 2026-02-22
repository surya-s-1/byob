'use client'

import { useRef, useEffect, useState } from 'react'
import { htmlToMarkdown } from '../utils'

const parseInitialMarkdown = (md: string) => {
	if (!md) return ''

	// If it's already complex HTML (has tags with attributes), we skip parsing
	// but allow simple tags like <br> that might be present in markdown.
	if (md.includes('<a') || md.includes('<div') || md.includes('<p')) return md

	let html = md
		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
		.replace(/^# (.*$)/gim, '<h1>$1</h1>')
		.replace(/^\>\s?(.*$)/gim, '<blockquote>$1</blockquote>')

	// Inline styles
	html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
	html = html.replace(/~~(.*?)~~/gim, '<s>$1</s>')
	html = html.replace(/_(.*?)_/gim, '<u>$1</u>')
	html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
	html = html.replace(/`(.*?)`/gim, '<code>$1</code>')

	// Links
	html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')

	// Unordered Lists - Grouping
	html = html.replace(/^[\s]*- (.*$)/gim, '<li>$1</li>')
	html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, (m) => {
		return `<ul>${m}</ul>`.replace(/<\/ul>\s*<ul>/gim, '')
	})

	// Ordered Lists - Grouping
	html = html.replace(/^[\s]*\d+\.\s(.*$)/gim, '<li class="oli">$1</li>')
	html = html.replace(/(<li class="oli">[\s\S]*?<\/li>)/gim, (m) => {
		return `<ol>${m}</ol>`.replace(/<\/ol>\s*<ol>/gim, '')
	})
	html = html.replace(/<li class="oli">/gim, '<li>')

	// Newlines to BR
	html = html.replace(/\n/gim, '<br>')

	// Final cleanup for block tags and double BRs
	html = html.replace(/<\/(h1|h2|h3|blockquote|ul|ol|li)><br>/gim, '</$1>')
	html = html.replace(/<br><(h1|h2|h3|blockquote|ul|ol)/gim, '<$1')

	return html
}

export default function Text({ block, update, isFocused, setFocusId, removeBlock, readOnly }: any) {
	if (readOnly) {
		return (
			<div
				className='wysiwyg-editor my-2 w-full text-lg leading-relaxed text-main'
				dangerouslySetInnerHTML={{ __html: parseInitialMarkdown(block.content) }}
			/>
		)
	}

	const ref = useRef<HTMLDivElement>(null)
	const isEditing = useRef(false)
	const contentRef = useRef(block.content)
	const [linkPopup, setLinkPopup] = useState<{
		show: boolean
		url: string
		text: string
		range: Range | null
	}>({ show: false, url: '', text: '', range: null })

	useEffect(() => {
		if (ref.current && !isEditing.current) {
			if (block.content !== contentRef.current || !ref.current.innerHTML) {
				ref.current.innerHTML = parseInitialMarkdown(block.content)
				contentRef.current = block.content
			}
		}

		if (isFocused && ref.current && document.activeElement !== ref.current) {
			ref.current.focus()
			const range = document.createRange()
			const sel = window.getSelection()
			range.selectNodeContents(ref.current)
			range.collapse(false)
			sel?.removeAllRanges()
			sel?.addRange(range)
		}
	}, [block.content, isFocused])

	const handleInput = () => {
		if (ref.current) {
			contentRef.current = ref.current.innerHTML
			update({ content: ref.current.innerHTML })
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault()
			const selection = window.getSelection()
			const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
			let node = selection?.anchorNode
			let aNode = null
			while (node && node.nodeName !== 'DIV' && node.nodeName !== 'BODY') {
				if (node.nodeName === 'A') {
					aNode = node as HTMLAnchorElement
					break
				}
				node = node.parentNode
			}
			if (aNode) {
				setLinkPopup({ show: true, url: aNode.href, text: aNode.textContent || '', range })
			} else {
				setLinkPopup({ show: true, url: '', text: selection?.toString() || '', range })
			}
			return
		}

		if (e.key === 'Backspace' || e.key === 'Delete') {
			const html = ref.current?.innerHTML || ''
			if (html === '' || html === '<br>') {
				e.preventDefault()
				removeBlock()
			}
		}
	}

	const applyLink = () => {
		if (linkPopup.range) {
			const selection = window.getSelection()
			selection?.removeAllRanges()
			selection?.addRange(linkPopup.range)
		}
		if (linkPopup.url) {
			const html = `<a href="${linkPopup.url}" target="_blank">${linkPopup.text || linkPopup.url}</a>`
			document.execCommand('insertHTML', false, html)
			handleInput()
		}
		setLinkPopup({ show: false, url: '', text: '', range: null })
		setTimeout(() => document.dispatchEvent(new Event('selectionchange')), 10)
	}

	return (
		<div className='relative w-full'>
			<div
				ref={ref}
				contentEditable
				onFocus={() => {
					isEditing.current = true
					setFocusId()
				}}
				onBlur={() => {
					isEditing.current = false
					handleInput()
				}}
				onInput={handleInput}
				onKeyDown={handleKeyDown}
				className='wysiwyg-editor -mx-2 min-h-[2rem] w-full rounded-md p-2 text-lg leading-relaxed text-main transition-colors outline-none empty:before:text-subtle empty:before:content-[attr(data-placeholder)] hover:bg-secondary focus:bg-transparent'
				data-placeholder='Start writing...'
			/>

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
							e.stopPropagation()
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
