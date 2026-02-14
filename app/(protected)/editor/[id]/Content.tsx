"use client"

import { useState, useEffect } from "react"
import Toolbar from "./Toolbar"
import Text from "./blocks/Text"
import Mermaid from "./blocks/Mermaid"
import Image from "./blocks/Image"
import Code from "./blocks/Code"
import Iframe from "./blocks/Iframe"

const generateId = () => "block-" + Math.random().toString(36).substring(2, 9)

function parseToBlocks(md: string) {
	const lines = md.split("\n")
	const blocks: any[] = []
	let textBuf: string[] = []
	
	let counter = 0

	const flushText = () => {
		const content = textBuf.join("\n").trim()
		if (content) blocks.push({ id: `block-init-${counter++}`, type: "text", content })
		textBuf = []
	}

	let inCode = false
	let lang = ""
	let codeBuf: string[] = []

	for (let l of lines) {
		if (l.startsWith("```")) {
			if (!inCode) {
				flushText()
				inCode = true
				lang = l.replace("```", "").trim()
				codeBuf = []
			} else {
				inCode = false
				const content = codeBuf.join("\n")
				if (lang === "mermaid") blocks.push({ id: `block-init-${counter++}`, type: "mermaid", content })
				else blocks.push({ id: `block-init-${counter++}`, type: "code", lang, content })
			}
			continue
		}

		if (inCode) { codeBuf.push(l); continue }

		const img = l.match(/^!\[(.*?)\]\((.*?)\)$/)
		if (img) {
			flushText()
			const [w, align = "center"] = img[1].split("|")
			blocks.push({ id: `block-init-${counter++}`, type: "image", w: Number(w), align, src: img[2] })
			continue
		}

		const ifr = l.match(/^::iframe\[(.*?)x(.*?)(?:\|(.*?))?\]\((.*?)\)$/)
		if (ifr) {
			flushText()
			blocks.push({ id: `block-init-${counter++}`, type: "iframe", w: Number(ifr[1]), h: Number(ifr[2]), align: ifr[3] || "center", src: ifr[4] })
			continue
		}

		textBuf.push(l)
	}
	flushText()

	if (blocks.length === 0 || blocks[blocks.length - 1].type !== "text") {
		blocks.push({ id: `block-init-${counter++}`, type: "text", content: "" })
	}

	return blocks
}

export default function Content({ initial }: any) {
	const [blocks, setBlocks] = useState<any[]>(() => parseToBlocks(initial))
	const [activeId, setActiveId] = useState<string | null>(null)
	const [scrollToId, setScrollToId] = useState<string | null>(null)

	useEffect(() => {
		if (scrollToId) {
			const el = document.getElementById(scrollToId)
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' })
				el.focus()
			}
			setScrollToId(null)
		}
	}, [scrollToId, blocks.length])

	const updateBlock = (id: string, newProps: any | null) => {
		setBlocks(prev => {
			if (newProps === null) {
				if (prev.length === 1) return [{ id: generateId(), type: "text", content: "" }]
				const idx = prev.findIndex(b => b.id === id)

				if (idx > 0) {
					setTimeout(() => {
						const prevEl = document.getElementById(prev[idx - 1].id)
						if (prevEl) {
							prevEl.focus()
							if (prevEl.isContentEditable) {
								const range = document.createRange()
								const sel = window.getSelection()
								range.selectNodeContents(prevEl)
								range.collapse(false)
								sel?.removeAllRanges()
								sel?.addRange(range)
							}
						}
					}, 10)
				}
				return prev.filter(b => b.id !== id)
			}
			return prev.map(b => b.id === id ? { ...b, ...newProps } : b)
		})
	}

	const insertBlock = (newBlock: any) => {
		setBlocks(prev => {
			const idx = activeId ? prev.findIndex(b => b.id === activeId) : prev.length - 1
			const insertIdx = idx >= 0 ? idx + 1 : prev.length

			const blockWithId = { ...newBlock, id: generateId() }
			const arr = [...prev]
			arr.splice(insertIdx, 0, blockWithId)

			setActiveId(blockWithId.id)
			setScrollToId(blockWithId.id)
			return arr
		})
	}

	return (
		<div id="editor-content">
			<Toolbar insert={insertBlock} />
			<div className="space-y-xl">
				{blocks.map((b) => {
					const props = {
						id: b.id,
						...b,
						update: (newProps: any | null) => updateBlock(b.id, newProps),
						onFocus: () => setActiveId(b.id),
						insertBlock: insertBlock
					}

					if (b.type === "image") return <Image key={b.id} {...props} />
					if (b.type === "mermaid") return <Mermaid key={b.id} {...props} />
					if (b.type === "code") return <Code key={b.id} {...props} />
					if (b.type === "iframe") return <Iframe key={b.id} {...props} />
					return <Text key={b.id} {...props} />
				})}
			</div>
		</div>
	)
}