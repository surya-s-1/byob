export const generateId = () => 'block-' + Math.random().toString(36).substring(2, 9)

export function htmlToMarkdown(html: string) {
	if (!html) return ''
	let md = html

	md = md.replace(/<h1>(.*?)<\/h1>/gi, '\n# $1\n')
	md = md.replace(/<h2>(.*?)<\/h2>/gi, '\n## $1\n')
	md = md.replace(/<h3>(.*?)<\/h3>/gi, '\n### $1\n')
	md = md.replace(/<blockquote>(.*?)<\/blockquote>/gi, '\n> $1\n')

	md = md.replace(
		/<ul>([\s\S]*?)<\/ul>/gi,
		(m, inner) => '\n' + inner.replace(/<li.*?>(.*?)<\/li>/gi, '- $1\n')
	)
	md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, (m: string, inner: string) => {
		let i = 1
		return '\n' + inner.replace(/<li.*?>(.*?)<\/li>/gi, (m2: string, li: string) => `${i++}. ${li}\n`)
	})

	md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
	md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**')
	md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*')
	md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*')

	// Correctly handle tags and styles for underline and strike-through
	md = md.replace(/<u.*?>(.*?)<\/u>/gi, '_$1_')
	md = md.replace(/<span[^>]*text-decoration\s*:\s*underline[^>]*>(.*?)<\/span>/gi, '_$1_')

	md = md.replace(/<strike.*?>(.*?)<\/strike>/gi, '~~$1~~')
	md = md.replace(/<del.*?>(.*?)<\/del>/gi, '~~$1~~')
	md = md.replace(/<s.*?>(.*?)<\/s>/gi, '~~$1~~')
	md = md.replace(/<span[^>]*text-decoration\s*:\s*line-through[^>]*>(.*?)<\/span>/gi, '~~$1~~')

	md = md.replace(/<font.*?>/gi, '')
	md = md.replace(/<\/font>/gi, '')
	md = md.replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)')
	md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`')

	md = md.replace(/<div><br><\/div>/gi, '\n')
	md = md.replace(/<div>(.*?)<\/div>/gi, '\n$1')
	md = md.replace(/<br>/gi, '\n')
	md = md.replace(/<p.*?>(.*?)<\/p>/gi, '$1\n')

	md = md.replace(/<[^>]+>/g, '')
	md = md
		.replace(/&nbsp;/g, ' ')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&')

	md = md.replace(/\n{3,}/g, '\n\n')
	return md.trim()
}

export function parseToBlocks(md: string) {
	if (!md) return [{ id: `block-init-0`, type: 'text', content: '' }]

	// Split by any newline sequence
	const lines = md.split(/\r?\n/)
	const blocks: any[] = []
	let textBuf: string[] = []
	let counter = 0

	const flushText = () => {
		const content = textBuf.join('\n').trim()
		if (content) blocks.push({ id: `block-init-${counter++}`, type: 'text', content })
		textBuf = []
	}

	let inCode = false
	let lang = ''
	let codeBuf: string[] = []
	let codeIndent = ''

	for (let line of lines) {
		const l = line.trim()

		if (l.startsWith('```')) {
			if (!inCode) {
				flushText()
				inCode = true
				lang = l.replace('```', '').trim()
				codeBuf = []
				// Capture the indentation of the opening ```
				codeIndent = line.match(/^(\s*)/)?.[1] || ''
			} else {
				inCode = false
				const content = codeBuf.join('\n')
				if (lang === 'mermaid')
					blocks.push({ id: `block-init-${counter++}`, type: 'mermaid', content })
				else blocks.push({ id: `block-init-${counter++}`, type: 'code', lang, content })
			}
			continue
		}

		if (inCode) {
			// Strip the same amount of indentation as the opening guard
			let contentLine = line
			if (line.startsWith(codeIndent)) {
				contentLine = line.substring(codeIndent.length)
			} else if (line.trim() === '') {
				contentLine = ''
			}
			codeBuf.push(contentLine)
			continue
		}

		const img = l.match(/^!\[(.*?)\]\((.*?)\)$/)
		if (img) {
			flushText()
			const parts = img[1].split('|')
			let w = 700
			let align = 'center'

			if (parts.length > 0) {
				const num = Number(parts[0])
				if (!isNaN(num) && parts[0].trim() !== '') {
					w = num
					align = parts[1] || 'center'
				} else {
					align = parts[0] || 'center'
				}
			}

			blocks.push({
				id: `block-init-${counter++}`,
				type: 'image',
				w,
				align,
				src: img[2],
			})
			continue
		}

		const ifr = l.match(/^::iframe\[(.*?)x(.*?)(?:\|(.*?))?\]\((.*?)\)$/)
		if (ifr) {
			flushText()
			blocks.push({
				id: `block-init-${counter++}`,
				type: 'iframe',
				w: Number(ifr[1]) || 600,
				h: Number(ifr[2]) || 400,
				align: ifr[3] || 'center',
				src: ifr[4],
			})
			continue
		}

		textBuf.push(line.trim())
	}
	flushText()

	if (blocks.length === 0) {
		blocks.push({ id: `block-init-${counter++}`, type: 'text', content: '' })
	}

	return blocks
}

export function blocksToMarkdown(blocks: any[]) {
	return blocks
		.map((b) => {
			if (b.type === 'text') return htmlToMarkdown(b.content)
			if (b.type === 'image') return `![${b.w}|${b.align}](${b.src})`
			if (b.type === 'iframe') return `::iframe[${b.w}x${b.h}|${b.align}](${b.src})`
			if (b.type === 'code') return `\`\`\`${b.lang || 'text'}\n${b.content}\n\`\`\``
			if (b.type === 'mermaid') return `\`\`\`mermaid\n${b.content}\n\`\`\``
			return ''
		})
		.filter((b) => b !== undefined && b !== null && b.trim() !== '')
		.join('\n')
}
