import { relations, sql } from 'drizzle-orm'
import {
	pgTable,
	text,
	date,
	timestamp,
	boolean,
	uuid,
	integer,
	primaryKey,
	index,
	pgEnum,
	unique,
	AnyPgColumn,
} from 'drizzle-orm/pg-core'

/* ********************************************************* */
/* ************************* AUTH ************************* */
/* ********************************************************* */

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	role: text('role'),
	banned: boolean('banned'),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires'),
	bio: text('bio'),
	dob: date('dob'),
	username: text('username').unique().notNull(),
})

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
})

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at'),
})

/* ********************************************************* */
/* ************************* ENUMS ************************* */
/* ********************************************************* */

export const publicationVisibilityEnum = pgEnum('publication_visibility', [
	'PUBLIC',
	'HIDDEN',
	'LOCKED',
])
export const userRoleEnum = pgEnum('user_role', ['OWNER', 'EDITOR', 'REVIEWER', 'ADMIN'])
export const articleStatusEnum = pgEnum('article_status', ['DRAFT', 'SCHEDULED', 'PUBLISHED'])
export const articleVisibilityEnum = pgEnum('article_visibility', ['PUBLIC', 'HIDDEN', 'LOCKED'])
export const collectionVisibilityEnum = pgEnum('collection_visibility', [
	'PUBLIC',
	'UNLISTED',
	'PRIVATE',
])

/* ********************************************************* */
/* ************************ TABLES ************************ */
/* ********************************************************* */

export const userFollows = pgTable(
	'user_follows',
	{
		followedUserId: text('followed_user_id')
			.notNull()
			.references(() => user.id),
		followedByUserId: text('followed_by_user_id')
			.notNull()
			.references(() => user.id),
		followedAt: timestamp('followed_at', { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.followedUserId, t.followedByUserId] }),
		index('idx_user_follows_follower').on(t.followedByUserId),
	]
)

export const publications = pgTable('publications', {
	id: uuid('id').primaryKey().defaultRandom(),
	cover: text('cover'),
	slug: text('slug').unique().notNull(),
	displayName: text('display_name').notNull(),
	displayDescription: text('display_description'),
	publicationVisibility: publicationVisibilityEnum('publication_visibility').notNull(),
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const publicationMembers = pgTable(
	'publication_members',
	{
		publicationId: uuid('publication_id')
			.notNull()
			.references(() => publications.id),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		userRole: userRoleEnum('user_role').notNull(),
		joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.publicationId, t.userId] }),
		index('idx_pub_members_user').on(t.userId),
	]
)

export const publicationFollows = pgTable(
	'publication_follows',
	{
		publicationId: uuid('publication_id')
			.notNull()
			.references(() => publications.id),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		followedAt: timestamp('followed_at', { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.publicationId, t.userId] }),
		index('idx_pub_follows_user').on(t.userId),
	]
)

export const articles = pgTable(
	'articles',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		publicationId: uuid('publication_id')
			.notNull()
			.references(() => publications.id),
		slug: text('slug').unique().notNull(),
		articleStatus: articleStatusEnum('article_status').notNull(),
		articleVisibility: articleVisibilityEnum('article_visibility').notNull(),
		cover: text('cover'),
		title: text('title'),
		subtitle: text('subtitle'),
		content: text('content'),
		excerpt: text('excerpt'),
		publishedAt: timestamp('published_at', { withTimezone: true }),
		scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }),
		createdBy: text('created_by')
			.notNull()
			.references(() => user.id),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
	},
	(t) => [
		index('idx_articles_publication').on(t.publicationId),
		index('idx_articles_author').on(t.createdBy),
		index('idx_articles_pub_date')
			.on(t.publicationId, t.publishedAt.desc())
			.where(sql`${t.articleStatus} = 'PUBLISHED' AND ${t.deletedAt} IS NULL`),
	]
)

export const articleDrafts = pgTable(
	'article_drafts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		publicationId: uuid('publication_id')
			.notNull()
			.references(() => publications.id),
		articleId: uuid('article_id').references(() => articles.id),
		cover: text('cover'),
		title: text('title'),
		subtitle: text('subtitle'),
		content: text('content'),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
		createdBy: text('created_by')
			.notNull()
			.references(() => user.id),
		lockedByUserId: text('locked_by_user_id').references(() => user.id),
		lockedUntil: timestamp('locked_until', { withTimezone: true }),
	},
	(t) => [index('idx_drafts_article').on(t.articleId)]
)

export const articleAuthors = pgTable(
	'article_authors',
	{
		articleId: uuid('article_id')
			.notNull()
			.references(() => articles.id),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		isPrimary: boolean('is_primary').notNull().default(false),
	},
	(t) => [
		primaryKey({ columns: [t.articleId, t.userId] }),
		index('idx_article_authors_user').on(t.userId),
	]
)

export const series = pgTable(
	'series',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		publicationId: uuid('publication_id')
			.notNull()
			.references(() => publications.id),
		slug: text('slug').unique().notNull(),
		displayName: text('display_name').notNull(),
		displayDescription: text('display_description'),
		sortOrder: integer('sort_order').notNull().default(0),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
	}
)

export const seriesArticles = pgTable(
	'series_articles',
	{
		seriesId: uuid('series_id')
			.notNull()
			.references(() => series.id),
		articleId: uuid('article_id')
			.notNull()
			.references(() => articles.id),
		sortOrder: integer('sort_order').notNull().default(0),
	},
	(t) => [
		primaryKey({ columns: [t.seriesId, t.articleId] }),
		index('idx_series_articles_article').on(t.articleId),
	]
)

export const collections = pgTable(
	'collections',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		displayName: text('display_name').notNull(),
		visibility: collectionVisibilityEnum('visibility').notNull(),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
	},
	(t) => [index('idx_collections_user').on(t.userId)]
)

export const collectionArticles = pgTable(
	'collection_articles',
	{
		collectionId: uuid('collection_id')
			.notNull()
			.references(() => collections.id),
		articleId: uuid('article_id')
			.notNull()
			.references(() => articles.id),
		addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.collectionId, t.articleId] }),
		index('idx_collection_articles_article').on(t.articleId),
	]
)

export const comments = pgTable(
	'comments',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		articleId: uuid('article_id')
			.notNull()
			.references(() => articles.id),
		parentId: uuid('parent_id').references((): AnyPgColumn => comments.id),
		content: text('content').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
	},
	(t) => [
		index('idx_comments_article_thread').on(t.articleId, t.createdAt),
		index('idx_comments_user').on(t.userId),
		index('idx_comments_parent').on(t.parentId),
	]
)

/* ********************************************************* */
/* *********************** RELATIONS *********************** */
/* ********************************************************* */

export const usersRelations = relations(user, ({ many }) => ({
	followers: many(userFollows, { relationName: 'followers' }),
	following: many(userFollows, { relationName: 'following' }),
	publicationMemberships: many(publicationMembers),
	publicationsFollowed: many(publicationFollows),
	articlesCreated: many(articles),
	articlesAuthored: many(articleAuthors),
	comments: many(comments),
	collections: many(collections),
	drafts: many(articleDrafts),
}))

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
	followsUser: one(user, {
		fields: [userFollows.followedUserId],
		references: [user.id],
		relationName: 'followers',
	}),
	followedByUser: one(user, {
		fields: [userFollows.followedByUserId],
		references: [user.id],
		relationName: 'following',
	}),
}))

export const publicationsRelations = relations(publications, ({ many }) => ({
	members: many(publicationMembers),
	followers: many(publicationFollows),
	articles: many(articles),
	series: many(series),
	drafts: many(articleDrafts),
}))

export const publicationMembersRelations = relations(publicationMembers, ({ one }) => ({
	publication: one(publications, {
		fields: [publicationMembers.publicationId],
		references: [publications.id],
	}),
	user: one(user, {
		fields: [publicationMembers.userId],
		references: [user.id],
	}),
}))

export const publicationFollowsRelations = relations(publicationFollows, ({ one }) => ({
	publication: one(publications, {
		fields: [publicationFollows.publicationId],
		references: [publications.id],
	}),
	user: one(user, {
		fields: [publicationFollows.userId],
		references: [user.id],
	}),
}))

export const articlesRelations = relations(articles, ({ one, many }) => ({
	uploader: one(user, {
		fields: [articles.createdBy],
		references: [user.id],
	}),
	authors: many(articleAuthors),
	publication: one(publications, {
		fields: [articles.publicationId],
		references: [publications.id],
	}),
	comments: many(comments),
	series: many(seriesArticles),
	collections: many(collectionArticles),
	drafts: many(articleDrafts),
}))

export const articleAuthorsRelations = relations(articleAuthors, ({ one }) => ({
	article: one(articles, {
		fields: [articleAuthors.articleId],
		references: [articles.id],
	}),
	user: one(user, {
		fields: [articleAuthors.userId],
		references: [user.id],
	}),
}))

export const articleDraftsRelations = relations(articleDrafts, ({ one }) => ({
	article: one(articles, {
		fields: [articleDrafts.articleId],
		references: [articles.id],
	}),
	publication: one(publications, {
		fields: [articleDrafts.publicationId],
		references: [publications.id],
	}),
	creator: one(user, {
		fields: [articleDrafts.createdBy],
		references: [user.id],
	}),
	lockedBy: one(user, {
		fields: [articleDrafts.lockedByUserId],
		references: [user.id],
	}),
}))

export const seriesRelations = relations(series, ({ one, many }) => ({
	publication: one(publications, {
		fields: [series.publicationId],
		references: [publications.id],
	}),
	articles: many(seriesArticles),
}))

export const seriesArticlesRelations = relations(seriesArticles, ({ one }) => ({
	series: one(series, {
		fields: [seriesArticles.seriesId],
		references: [series.id],
	}),
	article: one(articles, {
		fields: [seriesArticles.articleId],
		references: [articles.id],
	}),
}))

export const collectionsRelations = relations(collections, ({ one, many }) => ({
	user: one(user, {
		fields: [collections.userId],
		references: [user.id],
	}),
	articles: many(collectionArticles),
}))

export const collectionArticlesRelations = relations(collectionArticles, ({ one }) => ({
	collection: one(collections, {
		fields: [collectionArticles.collectionId],
		references: [collections.id],
	}),
	article: one(articles, {
		fields: [collectionArticles.articleId],
		references: [articles.id],
	}),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
	author: one(user, {
		fields: [comments.userId],
		references: [user.id],
	}),
	article: one(articles, {
		fields: [comments.articleId],
		references: [articles.id],
	}),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: 'child_comments',
	}),
	replies: many(comments, {
		relationName: 'child_comments',
	}),
}))
