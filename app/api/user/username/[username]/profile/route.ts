import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { user, userFollows } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
	try {
		const { username } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		const targetUser = await db.query.user.findFirst({
			where: eq(user.username, username),
			with: {
				followers: true,
				following: true,
			},
		})

		if (!targetUser) {
			return NextResponse.json({ user: null, error: 'User not found' }, { status: 404 })
		}

		let isFollowing = false
		if (currentUser) {
			const followRecord = await db.query.userFollows.findFirst({
				where: and(
					eq(userFollows.followedUserId, targetUser.id),
					eq(userFollows.followedByUserId, currentUser.id)
				),
			})
			isFollowing = !!followRecord
		}

		const responseUser = {
			id: targetUser.id,
			username: targetUser.username,
			email: targetUser.email,
			name: targetUser.name,
			bio: targetUser.bio,
			dob: targetUser.dob,
			image: targetUser.image,
			followersCount: targetUser.followers.length,
			followingCount: targetUser.following.length,
			isFollowing,
		}

		return NextResponse.json({ user: responseUser, error: null })
	} catch (error: any) {
		console.error('Error fetching user profile:', error)
		return NextResponse.json({ user: null, error: 'Internal server error' }, { status: 500 })
	}
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
	try {
		const { username } = await params
		const session = await auth.api.getSession({ headers: req.headers })
		const currentUser = session?.user

		if (!currentUser) {
			return NextResponse.json({ updated: false, error: 'Unauthorized' }, { status: 401 })
		}

		// Check if current user is the owner of the profile
		if (currentUser.username !== username) {
			return NextResponse.json({ updated: false, error: 'Forbidden' }, { status: 403 })
		}

		const body = await req.json()
		const { name, bio, dob, image } = body

		await db
			.update(user)
			.set({
				name,
				bio,
				dob: dob ? new Date(dob).toISOString().split('T')[0] : null,
				image,
				updatedAt: new Date(),
			})
			.where(eq(user.id, currentUser.id))

		return NextResponse.json({ updated: true, error: null })
	} catch (error: any) {
		console.error('Error updating user profile:', error)
		return NextResponse.json(
			{ updated: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
