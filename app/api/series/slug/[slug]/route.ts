import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { series } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const { slug } = await params

		const seriesData = await db.query.series.findFirst({
			where: and(eq(series.slug, slug), isNull(series.deletedAt)),
			with: {
				publication: true,
			},
		})

		if (!seriesData) {
			return NextResponse.json({ series: null, error: 'Series not found' }, { status: 404 })
		}

		const formattedSeries = {
			id: seriesData.id,
			slug: seriesData.slug,
			displayName: seriesData.displayName,
			displayDescription: seriesData.displayDescription,
			sortOrder: seriesData.sortOrder,
			createdAt: seriesData.createdAt,
			publication: {
				id: seriesData.publication.id,
				slug: seriesData.publication.slug,
				displayName: seriesData.publication.displayName,
				cover: seriesData.publication.cover,
			},
		}

		return NextResponse.json({ series: formattedSeries, error: null })
	} catch (error: any) {
		console.error('Error fetching series details:', error)
		return NextResponse.json({ series: null, error: 'Internal server error' }, { status: 500 })
	}
}
