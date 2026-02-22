import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { collections, collectionArticles } from '@/db/schema'
import { eq, and, isNull, count } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		const collection = await db.query.collections.findFirst({
			where: and(eq(collections.id, id), isNull(collections.deletedAt)),
			with: {
				user: true,
			},
		})

		if (!collection) {
			return NextResponse.json(
				{ collection: null, error: 'Collection not found' },
				{ status: 404 }
			)
		}

		// Visibility check
		if (collection.visibility === 'PRIVATE' && collection.userId !== currentUser?.id) {
			return NextResponse.json({ collection: null, error: 'Forbidden' }, { status: 403 })
		}

		const [articleCount] = await db
			.select({ value: count() })
			.from(collectionArticles)
			.where(eq(collectionArticles.collectionId, id))

		const formattedCollection = {
			id: collection.id,
			displayName: collection.displayName,
			visibility: collection.visibility,
			articleCount: articleCount.value,
			user: {
				id: collection.user.id,
				username: collection.user.username,
				name: collection.user.name,
				image: collection.user.image,
			},
			createdAt: collection.createdAt,
		}

		return NextResponse.json({ collection: formattedCollection, error: null })
	} catch (error: any) {
		console.error('Error fetching collection:', error)
		return NextResponse.json(
			{ collection: null, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ updated: false, error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { displayName, visibility } = body

		const collection = await db.query.collections.findFirst({
			where: and(eq(collections.id, id), isNull(collections.deletedAt)),
		})

		if (!collection) {
			return NextResponse.json(
				{ updated: false, error: 'Collection not found' },
				{ status: 404 }
			)
		}

		if (collection.userId !== currentUser.id) {
			return NextResponse.json({ updated: false, error: 'Forbidden' }, { status: 403 })
		}

		await db
			.update(collections)
			.set({
				displayName,
				visibility: visibility,
			})
			.where(eq(collections.id, id))

		return NextResponse.json({ updated: true, error: null })
	} catch (error: any) {
		console.error('Error updating collection:', error)
		return NextResponse.json(
			{ updated: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ deleted: false, error: 'Unauthorized' }, { status: 401 })
		}

		const collection = await db.query.collections.findFirst({
			where: and(eq(collections.id, id), isNull(collections.deletedAt)),
		})

		if (!collection) {
			return NextResponse.json(
				{ deleted: false, error: 'Collection not found' },
				{ status: 404 }
			)
		}

		if (collection.userId !== currentUser.id) {
			return NextResponse.json({ deleted: false, error: 'Forbidden' }, { status: 403 })
		}

		await db.update(collections).set({ deletedAt: new Date() }).where(eq(collections.id, id))

		return NextResponse.json({ deleted: true, error: null })
	} catch (error: any) {
		console.error('Error deleting collection:', error)
		return NextResponse.json(
			{ deleted: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
