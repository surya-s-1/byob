CREATE TABLE user (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    emailVerified BOOLEAN NOT NULL,
    image TEXT,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    role TEXT,
    banned BOOLEAN,
    banReason TEXT,
    banExpires TIMESTAMPTZ,
    bio TEXT,
    dob DATE,
    username TEXT UNIQUE NOT NULL,
);
-- user: No extra indexes needed (PK and UNIQUE constraints handle IDs and Usernames).

CREATE TABLE user_follows (
    followed_user_id TEXT NOT NULL REFERENCES user(id),
    followed_by_user_id TEXT NOT NULL REFERENCES user(id),
    followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (followed_user_id, followed_by_user_id)
    -- "Who follows this user?" is covered by this Primary Key.
);

-- "Who is this user following?" (Reverse lookup)
CREATE INDEX idx_user_follows_follower ON user_follows(followed_by_user_id);

CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cover TEXT,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    display_description TEXT,
    publication_visibility TEXT NOT NULL CHECK (publication_visibility IN ('PUBLIC', 'HIDDEN', 'LOCKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL REFERENCES user(id),
    deleted_at TIMESTAMPTZ
    deleted_by TEXT NOT NULL REFERENCES user(id)
);

CREATE TABLE publication_members (
    publication_id UUID NOT NULL REFERENCES publications(id),
    user_id TEXT NOT NULL REFERENCES user(id),
    user_role TEXT NOT NULL CHECK (user_role IN ('OWNER', 'EDITOR', 'REVIEWER', 'ADMIN')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (publication_id, user_id)
    -- "Who are members of this publication?" is covered by this Primary Key.
);

CREATE TABLE publication_invitations (
    publication_id UUID NOT NULL REFERENCES publications(id),
    user_id TEXT NOT NULL REFERENCES user(id),
    user_role TEXT NOT NULL CHECK (user_role IN ('OWNER', 'EDITOR', 'REVIEWER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
    deleted_by TEXT NOT NULL REFERENCES user(id)
    rejected_at TIMESTAMPTZ
    PRIMARY KEY (publication_id, user_id)
    -- "Who are invited to this publication?" is covered by this Primary Key.
);

-- "Which publications is this user a member of?"
CREATE INDEX idx_pub_members_user ON publication_members(user_id);

-- "Which publications is this user invited to?"
CREATE INDEX idx_pub_invitations_user ON publication_invitations(user_id);

CREATE TABLE publication_follows (
    publication_id UUID NOT NULL REFERENCES publications(id),
    user_id TEXT NOT NULL REFERENCES user(id),
    followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (publication_id, user_id)
    -- "Who are followers of this publication?" is covered by this Primary Key.
);

-- "Which publications does this user follow?"
CREATE INDEX idx_pub_follows_user ON publication_follows(user_id);

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id),
    slug TEXT UNIQUE NOT NULL,
    article_status TEXT NOT NULL CHECK (article_status IN ('DRAFT', 'SCHEDULED', 'PUBLISHED')),
    article_visibility TEXT NOT NULL CHECK (article_visibility IN ('PUBLIC', 'HIDDEN', 'LOCKED')),
    cover TEXT,
    title TEXT,
    subtitle TEXT,
    content TEXT,
    excerpt TEXT,
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL REFERENCES user(id),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
    deleted_by TEXT NOT NULL REFERENCES user(id)
);

-- "Find all articles in a publication"
CREATE INDEX idx_articles_publication ON articles(publication_id);

-- "Find all articles created by a specific user"
CREATE INDEX idx_articles_author ON articles(created_by);

-- "Get the main feed for a publication" (Sorted by date)
CREATE INDEX idx_articles_pub_date ON articles(publication_id, published_at DESC) 
WHERE article_status = 'PUBLISHED' AND deleted_at IS NULL;

CREATE TABLE article_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id),
    article_id UUID REFERENCES articles(id),
    cover TEXT,
    title TEXT,
    subtitle TEXT,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL REFERENCES user(id),
    updated_at TIMESTAMPTZ,
    locked_by_user_id TEXT REFERENCES user(id),
    locked_until TIMESTAMPTZ
);

-- "Find drafts linked to this article"
CREATE INDEX idx_drafts_article ON article_drafts(article_id);

CREATE TABLE article_authors (
    article_id UUID NOT NULL REFERENCES articles(id),
    user_id TEXT NOT NULL REFERENCES user(id),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (article_id, user_id)
    -- "Who are authors of this article?" is covered by this Primary Key.
);

-- "Find all articles where this user is a co-author"
CREATE INDEX idx_article_authors_user ON article_authors(user_id);

CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id),
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    display_description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL REFERENCES user(id),
    deleted_at TIMESTAMPTZ
    deleted_by TEXT NOT NULL REFERENCES user(id)
);

CREATE TABLE series_articles (
    series_id UUID NOT NULL REFERENCES series(id),
    article_id UUID NOT NULL REFERENCES articles(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (series_id, article_id)
    -- "Which articles belong to this series?" is covered by this Primary Key.
);

-- "Which series does this article belong to?"
CREATE INDEX idx_series_articles_article ON series_articles(article_id);

CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES user(id),
    display_name TEXT NOT NULL,
    visibility TEXT NOT NULL CHECK (visibility IN ('PUBLIC', 'UNLISTED', 'PRIVATE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- "Find all collections created by this user"
CREATE INDEX idx_collections_user ON collections(user_id);

CREATE TABLE collection_articles (
    collection_id UUID NOT NULL REFERENCES collections(id),
    article_id UUID NOT NULL REFERENCES articles(id),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (collection_id, article_id)
    -- "Which articles belong to this collection?" is covered by this Primary Key.
);

-- "Which collections is this article in?"
CREATE INDEX idx_collection_articles_article ON collection_articles(article_id);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES user(id),
    article_id UUID NOT NULL REFERENCES articles(id),
    parent_id UUID REFERENCES comments(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- "Load the comment section for an article" (Chronological)
CREATE INDEX idx_comments_article_thread ON comments(article_id, created_at) WHERE deleted_at IS NULL;

-- "Find all comments made by this user" (Profile history)
CREATE INDEX idx_comments_user ON comments(user_id);

-- "Find replies to a specific comment"
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;