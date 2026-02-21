CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    bio TEXT,
    dp TEXT,
    dob DATE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE user_follows (
    followed_user_id UUID NOT NULL REFERENCES users(id),
    followed_by_user_id UUID NOT NULL REFERENCES users(id),
    followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (followed_user_id, followed_by_user_id)
);

CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cover TEXT,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    display_description TEXT,
    publication_visibility TEXT NOT NULL CHECK (publication_visibility IN ('PUBLIC', 'HIDDEN', 'LOCKED')),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE publication_members (
    publication_id UUID NOT NULL REFERENCES publications(id),
    user_id UUID NOT NULL REFERENCES users(id),
    user_role TEXT NOT NULL CHECK (user_role IN ('OWNER', 'EDITOR', 'REVIEWER', 'ADMIN')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (publication_id, user_id)
);

CREATE TABLE publication_follows (
    publication_id UUID NOT NULL REFERENCES publications(id),
    user_id UUID NOT NULL REFERENCES users(id),
    followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (publication_id, user_id)
);

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
    updated_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
);

CREATE TABLE article_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id),
    article_id UUID REFERENCES articles(id),
    cover TEXT,
    title TEXT,
    subtitle TEXT,
    content TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    locked_by_user_id UUID REFERENCES users(id),
    locked_until TIMESTAMPTZ
);

CREATE TABLE article_authors (
    article_id UUID NOT NULL REFERENCES articles(id),
    user_id UUID NOT NULL REFERENCES users(id),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (article_id, user_id)
);

CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id),
    slug TEXT NOT NULL,
    display_name TEXT NOT NULL,
    display_description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    
    UNIQUE (publication_id, slug)
);

CREATE TABLE series_articles (
    series_id UUID NOT NULL REFERENCES series(id),
    article_id UUID NOT NULL REFERENCES articles(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (series_id, article_id)
);

CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    display_name TEXT NOT NULL,
    visibility TEXT NOT NULL CHECK (visibility IN ('PUBLIC', 'UNLISTED', 'PRIVATE')),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE collection_articles (
    collection_id UUID NOT NULL REFERENCES collections(id),
    article_id UUID NOT NULL REFERENCES articles(id),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (collection_id, article_id)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    article_id UUID NOT NULL REFERENCES articles(id),
    parent_id UUID REFERENCES comments(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);