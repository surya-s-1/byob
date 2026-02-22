import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { publications, publicationMembers } from '@/db/schema'
import { eq, count } from 'drizzle-orm'

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
				{ members: null, pagination: null, error: 'Publication not found' },
				{ status: 404 }
			)
		}

		const membersData = await db.query.publicationMembers.findMany({
			where: eq(publicationMembers.publicationId, pub.id),
			with: {
				user: true,
			},
			limit: limit,
			offset: offset,
		})

		const [totalCount] = await db
			.select({ value: count() })
			.from(publicationMembers)
			.where(eq(publicationMembers.publicationId, pub.id))

		const formattedMembers = membersData.map((m) => ({
			user: {
				id: m.user.id,
				username: m.user.username,
				name: m.user.name,
				image: m.user.image,
			},
			role: m.userRole,
			joinedAt: m.joinedAt,
		}))

		return NextResponse.json({
			members: formattedMembers,
			pagination: {
				total: totalCount.value,
				page,
			},
			error: null,
		})
	} catch (error: any) {
		console.error('Error fetching members:', error)
		return NextResponse.json(
			{ members: null, pagination: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
