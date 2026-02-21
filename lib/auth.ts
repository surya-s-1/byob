import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import * as schema from '../db/schema'

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL!,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	user: {
		additionalFields: {
			username: {
				type: "string",
				required: false, // We will generate it, so input isn't required
			},
			bio: {
				type: "string",
				required: false,
			},
			dob: {
				type: "date",
				required: false,
			}
		}
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user, context) => {
					let username = '';
					let isUnique = false;
					let attempts = 0;
					const maxAttempts = 5;

					while (!isUnique && attempts < maxAttempts) {
						const prefix = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_')
						const suffix = Math.floor(Math.random() * 10000)

						const generatedUsername = `${prefix}_${suffix}`

						const existingUser = await db.query.user.findFirst({
							where: eq(schema.user.username, generatedUsername)
						})

						if (!existingUser) {
							username = generatedUsername
							isUnique = true
						}

						attempts++
					}

					if (!isUnique) {
						username = `User${Date.now()}`
					}

					return {
						data: {
							...user,
							username: username,
							bio: "New member of the community!"
						}
					}
				}
			}
		}
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
	},
	plugins: [
		admin({
			defaultRole: 'user',
		}),
	],
})
