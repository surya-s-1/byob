import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, series } from '@/db/schema'
import { eq, and, count, desc, isNull } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const { slug } = await params
		const { searchParams } = new URL(req.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '20')
		const offset = (page - 1) * limit

		const pub = await db.query.publications.findFirst({
			where: eq(publications.slug, slug),
		})

		if (!pub) {
			return NextResponse.json(
				{ series: null, pagination: null, error: 'Publication not found' },
				{ status: 404 }
			)
		}

		const seriesData = await db.query.series.findMany({
			where: and(eq(series.publicationId, pub.id), isNull(series.deletedAt)),
			with: {
				articles: true,
				publication: true,
			},
			orderBy: [desc(series.sortOrder), desc(series.createdAt)],
			limit: limit,
			offset: offset,
		})

		const [totalCount] = await db
			.select({ value: count() })
			.from(series)
			.where(and(eq(series.publicationId, pub.id), isNull(series.deletedAt)))

		const formattedSeries = seriesData.map((s) => ({
			id: s.id,
			slug: s.slug,
			displayName: s.displayName,
			displayDescription: s.displayDescription,
			sortOrder: s.sortOrder,
			articleCount: s.articles.length,
			publication: {
				id: s.publication.id,
				slug: s.publication.slug,
				displayName: s.publication.displayName,
			},
		}))

		return NextResponse.json({
			series: formattedSeries,
			pagination: {
				total: totalCount.value,
				page,
			},
			error: null,
		})
	} catch (error: any) {
		console.error('Error fetching publication series:', error)
		return NextResponse.json(
			{ series: null, pagination: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
