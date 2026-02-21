import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { user, collections } from '@/db/schema'
import { eq, and, sql, count, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
	try {
		const { username } = await params
		const { searchParams } = new URL(req.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '20')
		const offset = (page - 1) * limit

		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		const targetUser = await db.query.user.findFirst({
			where: eq(user.username, username),
		})

		if (!targetUser) {
			return NextResponse.json(
				{ collections: null, pagination: null, error: 'User not found' },
				{ status: 404 }
			)
		}

		// Check visibility
		let visibilityCondition = eq(collections.visibility, 'PUBLIC')
		if (currentUser && currentUser.id === targetUser.id) {
			visibilityCondition = sql`TRUE` // Show all for owner
		}

		const collectionsData = await db.query.collections.findMany({
			where: and(
				eq(collections.userId, targetUser.id),
				isNull(collections.deletedAt),
				visibilityCondition
			),
			with: {
				articles: true,
				user: true,
			},
			limit: limit,
			offset: offset,
		})

		const [totalCount] = await db
			.select({ value: count() })
			.from(collections)
			.where(
				and(
					eq(collections.userId, targetUser.id),
					isNull(collections.deletedAt),
					visibilityCondition
				)
			)

		const formattedCollections = collectionsData.map((col) => ({
			id: col.id,
			displayName: col.displayName,
			visibility: col.visibility,
			articleCount: col.articles.length,
			createdAt: col.createdAt,
			ownedBy: {
				id: col.user.id,
				name: col.user.name,
				image: col.user.image,
			},
		}))

		return NextResponse.json({
			collections: formattedCollections,
			pagination: {
				total: totalCount.value,
				page,
			},
			error: null,
		})
	} catch (error: any) {
		console.error('Error fetching user collections:', error)
		return NextResponse.json(
			{ collections: null, pagination: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
