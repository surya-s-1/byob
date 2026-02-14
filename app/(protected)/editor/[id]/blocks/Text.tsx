'use client'

import { useRef, useEffect, useState } from 'react'

const parseInitialMarkdown = (md: string) => {
	if (!md) return ''
	if (md.includes('<') && md.includes('>')) return md
	return md
		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
		.replace(/^# (.*$)/gim, '<h1>$1</h1>')
		.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
		.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/gim, '<em>$1</em>')
		.replace(/`(.*?)`/gim, '<code>$1</code>')
		.replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
		.replace(/\n/gim, '<br>')
}

export default function Text({ id, content, update, onFocus, insertBlock }: any) {
	const ref = useRef<HTMLDivElement>(null)
	const isEditing = useRef(false)
	const contentRef = useRef(content)
	const [linkPopup, setLinkPopup] = useState<{
		show: boolean
		url: string
		text: string
		range: Range | null
	}>({ show: false, url: '', text: '', range: null })

	useEffect(() => {
		if (ref.current && !isEditing.current) {
			if (content !== contentRef.current || !ref.current.innerHTML) {
				ref.current.innerHTML = parseInitialMarkdown(content)
				contentRef.current = content
			}
		}
	}, [content])

	const handleInput = () => {
		if (ref.current) {
			const html = ref.current.innerHTML
			contentRef.current = html
			update(html)
		}
	}

	const handlePaste = (e: React.ClipboardEvent) => {
		const text = e.clipboardData.getData('text/plain')
		if (/(^```|^!\[|^::iframe)/m.test(text)) {
			e.preventDefault()
			insertBlock(text.trim())
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
				update(null)
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

	const handleKeyUp = (e: React.KeyboardEvent) => {
		if (e.key === ' ') {
			const selection = window.getSelection()
			if (!selection || selection.rangeCount === 0) return

			const node = selection.focusNode
			if (node && node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || ''
				if (text === '- ') {
					node.textContent = ''
					document.execCommand('insertUnorderedList')
					handleInput()
				} else if (text === '1. ') {
					node.textContent = ''
					document.execCommand('insertOrderedList')
					handleInput()
				}
			}
		}
		setTimeout(handleInput, 10)
	}

	return (
		<div className='relative'>
			<div
				id={id}
				ref={ref}
				contentEditable
				onFocus={() => {
					isEditing.current = true
					if (onFocus) onFocus()
				}}
				onBlur={() => {
					isEditing.current = false
					handleInput()
				}}
				onInput={handleInput}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				onPaste={handlePaste}
				className='w-full outline-none text-lg leading-relaxed text-main wysiwyg-editor min-h-[2rem] p-sm -mx-sm rounded-md transition-colors hover:bg-secondary focus:bg-transparent'
			/>

			{linkPopup.show && (
				<div className='absolute top-full left-0 mt-2 bg-elevated border border-border p-3 rounded-md shadow-xl z-50 flex flex-col gap-2 w-75'>
					<h3 className='text-xs font-bold text-subtle uppercase tracking-wider'>
						Insert Link
					</h3>
					<input
						value={linkPopup.text}
						onChange={(e) => setLinkPopup({ ...linkPopup, text: e.target.value })}
						placeholder='Display text (optional)'
						className='bg-secondary text-main border border-border px-3 py-1.5 rounded-sm outline-none focus:border-brand focus:ring-1 ring-brand text-sm transition-all'
					/>
					<input
						autoFocus
						value={linkPopup.url}
						onChange={(e) => setLinkPopup({ ...linkPopup, url: e.target.value })}
						placeholder='https://...'
						className='bg-secondary text-main border border-border px-3 py-1.5 rounded-sm outline-none focus:border-brand focus:ring-1 ring-brand text-sm transition-all'
						onKeyDown={(e) => {
							e.stopPropagation()
							if (e.key === 'Enter') applyLink()
							if (e.key === 'Escape') setLinkPopup({ ...linkPopup, show: false })
						}}
					/>
					<div className='flex justify-end gap-2 mt-1'>
						<button
							onClick={() => setLinkPopup({ ...linkPopup, show: false })}
							className='text-sm text-subtle hover:text-main px-2'
						>
							Cancel
						</button>
						<button
							onClick={applyLink}
							className='bg-main text-inverse px-3 py-1.5 rounded-sm text-sm'
						>
							Save
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
