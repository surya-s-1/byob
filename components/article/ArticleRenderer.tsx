'use client'

import { parseToBlocks } from '@/components/editor/utils'
import Text from '@/components/editor/blocks/Text'
import Image from '@/components/editor/blocks/Image'
import Iframe from '@/components/editor/blocks/Iframe'
import Code from '@/components/editor/blocks/Code'
import Mermaid from '@/components/editor/blocks/Mermaid'

export default function ArticleRenderer({ markdown }: { markdown: string }) {
	if (!markdown) return null
	const blocks = parseToBlocks(markdown)

	return (
		<div className='wysiwyg-editor'>
			{blocks.map((block) => {
				const props = { block, readOnly: true }

				if (block.type === 'image') return <Image key={block.id} {...props} />
				if (block.type === 'iframe') return <Iframe key={block.id} {...props} />
				if (block.type === 'code') return <Code key={block.id} {...props} />
				if (block.type === 'mermaid') return <Mermaid key={block.id} {...props} />

				return <Text key={block.id} {...props} />
			})}
		</div>
	)
}
