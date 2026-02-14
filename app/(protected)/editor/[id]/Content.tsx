'use client'

import { useState, useEffect } from 'react'
import Toolbar from './Toolbar'
import Text from './blocks/Text'
import Mermaid from './blocks/Mermaid'
import Image from './blocks/Image'
import Code from './blocks/Code'
import Iframe from './blocks/Iframe'

function parse(md: string) {
	const lines = md.split('\n')
	const blocks: any[] = []
	let textBuf: string[] = []

	const flushText = () => {
		const content = textBuf.join('\n').trim()
		if (content) {
			blocks.push({ type: 'text', content, raw: content })
		}
		textBuf = []
	}

	let inCode = false
	let lang = ''
	let codeBuf: string[] = []

	for (let l of lines) {
		if (l.startsWith('```')) {
			if (!inCode) {
				flushText()
				inCode = true
				lang = l.replace('```', '').trim()
				codeBuf = []
			} else {
				inCode = false
				const raw = '```' + lang + '\n' + codeBuf.join('\n') + '\n```'
				if (lang === 'mermaid') {
					blocks.push({ type: 'mermaid', content: codeBuf.join('\n'), raw })
				} else {
					blocks.push({ type: 'code', lang, content: codeBuf.join('\n'), raw })
				}
			}
			continue
		}

		if (inCode) {
			codeBuf.push(l)
			continue
		}

		const img = l.match(/^!\[(.*?)\]\((.*?)\)$/)
		if (img) {
			flushText()
			const [w, align = 'center'] = img[1].split('|')
			blocks.push({ type: 'image', w, align, src: img[2], raw: l })
			continue
		}

		const ifr = l.match(/^::iframe\[(.*?)x(.*?)(?:\|(.*?))?\]\((.*?)\)$/)
		if (ifr) {
			flushText()
			blocks.push({
				type: 'iframe',
				w: ifr[1],
				h: ifr[2],
				align: ifr[3] || 'center',
				src: ifr[4],
				raw: l,
			})
			continue
		}

		textBuf.push(l)
	}
	flushText()

	// Always guarantee an empty block at the end so users can click the bottom of the page to type
	if (blocks.length === 0 || blocks[blocks.length - 1].type !== 'text') {
		blocks.push({ type: 'text', content: '<br>', raw: '<br>' })
	}

	return blocks
}

export default function Content({ initial }: any) {
	const [markdown, setMarkdown] = useState(initial)
	const [activeIndex, setActiveIndex] = useState(0)
	const [scrollToIndex, setScrollToIndex] = useState<number | null>(null)

	const blocks = parse(markdown)

	useEffect(() => {
		if (scrollToIndex !== null) {
			const el = document.getElementById(`block-${scrollToIndex}`)
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' })
				if (el.focus) el.focus()
			}
			setScrollToIndex(null)
		}
	}, [scrollToIndex, blocks.length])

	const updateBlock = (i: number, newContent: string | null) => {
		const arr = [...blocks]
		if (newContent === null) {
			// Prevent deleting the very last block if it's the only one
			if (arr.length === 1) {
				arr[0].raw = '<br>'
			} else {
				arr.splice(i, 1)
				// Shift focus smoothly to the previous block
				setTimeout(() => {
					const prevIndex = Math.max(0, i - 1)
					const prev = document.getElementById(`block-${prevIndex}`)
					if (prev) {
						prev.focus()
						if (prev.isContentEditable) {
							const range = document.createRange()
							const sel = window.getSelection()
							range.selectNodeContents(prev)
							range.collapse(false) // Move caret to the end
							sel?.removeAllRanges()
							sel?.addRange(range)
						}
					}
				}, 10)
			}
		} else {
			arr[i].raw = newContent.trim() // Keep strings tightly packed
		}
		setMarkdown(arr.map((b) => b.raw).join('\n\n'))
	}

	const insertBlock = (txt: string) => {
		const arr = blocks.map((b) => b.raw)
		arr.splice(activeIndex + 1, 0, txt)
		setMarkdown(arr.join('\n\n'))
		setActiveIndex(activeIndex + 1)
		setScrollToIndex(activeIndex + 1)
	}

	return (
		<div id='editor-content'>
			<Toolbar insert={insertBlock} />
			<div className='space-y-xl'>
				{blocks.map((b: any, i: number) => {
					const props = {
						id: `block-${i}`,
						...b,
						update: (v: string | null) => updateBlock(i, v),
						onFocus: () => setActiveIndex(i),
						insertBlock: insertBlock,
					}

					if (b.type === 'image') return <Image key={i} {...props} />
					if (b.type === 'mermaid') return <Mermaid key={i} {...props} />
					if (b.type === 'code') return <Code key={i} {...props} />
					if (b.type === 'iframe') return <Iframe key={i} {...props} />
					return <Text key={i} {...props} />
				})}
			</div>
		</div>
	)
}
