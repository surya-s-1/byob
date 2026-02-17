# Features

## To be built right now:

### Publications
- each publication can have zero or more series and articles
- series in a publication can be ordered
- each series can have zero or more articles
- each article can belong to zero or more series
- each series/article can belong to only one publication
- each publication must have at least one OWNER and can have multiple contributors and reviewers
- owner can mandate review of articles before publishing
- owner can transfer ownership to existing members of the publication
- publications can be public or private for non-followers (shown as private or hidden as chosen by user)
- in each series, articles can be ordered by user (by default newly added is added first in line)

### Articles
- each article should have cover url, title (required), subtitle, content (required)
- articles can be published right now or backdated
- each article can preview some content as selected by user for scheduled articles
- each article can be public or private for non-followers (shown as private or hidden as chosen by user)

### Draft Editor
- markdown
- image and iframe resizing
- mermaid with architecture icons
- **Pessimistic Locking:** prevents multiple users from editing the same draft simultaneously by locking it to one active user.

### Users
- create up to 3 free publications
- edit metadata of publications and series
- comment and reply on own/others articles
- save own/others articles into collections
- collections can be public or private
- add/edit their required personal details
- follow and unfollow other users and publications
- can edit and save drafts of articles

## To be added later:

### Collaboration
- Users should be able to collaborate with other contributors on drafts for publications
- An article can be owned by multiple users

### Notifications
- Notify on new articles or replies on comments

### Scheduling
Users should be able to:
- schedule articles for future
- receive notifications 24 hours before publishing and upon publishing the article

### Payments
Users should be able to pay to get services beyond free limit:
- Pay for more publications (either a certain amount per publication or per article)
- Pay once for unlimited publications and articles

Users should be able to charge for their articles from followers:
- Can charge once for following the whole publication
- Can charge per article
- Platform can take a cut on each transaction

### Engagement
- Like/Appreciate/Celebrate etc. reactions on articles

### Draft Editor
- link previews

---

# Database Schema

```
User {
    id: uuid! (unique)
    username: string! (unique)
    first_name: string!
    middle_name: string | null
    last_name: string!
    bio: string | null
    dp: string | null
    dob: Date!
    email: string!
    created_at: Date!
    deleted_at: Date | null
}

UserFollows {
    followed_user_id: uuid!
    followed_by_user_id: uuid!
    followed_at: Date!
}

Publication {
    id: uuid! (unique)
    cover: string | null
    slug: string! (unique)
    display_name: string!
    display_description: string
    publication_visibility: 'PUBLIC' | 'HIDDEN' | 'LOCKED'
    deleted_at: Date | null
}

PublicationMember {
    publication_id: uuid!
    user_id: uuid!
    user_role: 'OWNER' | 'EDITOR' | 'REVIEWER' | 'ADMIN'
    joined_at: Date!
}

PublicationFollows {
    publication_id: uuid!
    user_id: uuid!
    followed_at: Date!
}

Article {
    id: uuid! (unique)
    publication_id: uuid!
    slug: string! (unique per publication)
    article_status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'
    published_at: Date | null
    scheduled_at: Date | null
    cover: string | null
    title: string | null
    subtitle: string | null
    content: string | null
    excerpt: string | null
    created_at: Date!
    created_by: uuid!
    updated_at: Date | null
    article_visibility: 'PUBLIC' | 'HIDDEN' | 'LOCKED'
    deleted_at: Date | null
}

ArticleDraft {
    id: uuid! (unique)
    publication_id: uuid!
    article_id: uuid | null
    cover: string | null
    title: string | null
    subtitle: string | null
    content: string | null
    updated_at: Date!
    created_by: uuid!
    locked_by_user_id: uuid | null
    locked_until: Date | null
}

ArticleAuthor {
    article_id: uuid!
    user_id: uuid!
    is_primary: boolean!
}

Series {
    id: uuid! (unique)
    publication_id: uuid!
    slug: string! (unique per publication)
    display_name: string!
    display_description: string | null
    sort_order: number!
    deleted_at: Date | null
}

SeriesArticleRelation {
    series_id: uuid!
    article_id: uuid!
    sort_order: number!
}

Collection {
    id: uuid! (unique)
    user_id: uuid!
    display_name: string!
    visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
    deleted_at: Date | null
}

CollectionArticleRelation {
    collection_id: uuid!
    article_id: uuid!
    added_at: Date!
}

Comment {
    id: uuid! (unique)
    user_id: uuid!
    article_id: uuid!
    parent_id: uuid | null
    content: string!
    created_at: Date!
    updated_at: Date!
    deleted_at: Date | null
}
```

---

# Tech Stack

- Next.js
- Mermaid
- Neon for Postgres
- TypeORM
- OAuth Brokers (Supabase & Firebase)
- Scheduler Service (TBD)
- Notification Service (TBD)