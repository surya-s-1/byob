import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
	dialect: 'postgresql',
	schema: './lib/auth/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: process.env.BETTER_AUTH_DB_URL!,
	},
})
