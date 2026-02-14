# Features

## To be built right now:

### Blogs
- each blog can have zero or more series and articles
- series in a blog can be ordered
- each series can have zero or more articles
- each article should belong to zero or more series
- each series/article can belong to only one blog
- each article should have cover url, title (required), subtitle, content (required)
- articles can be published right now/backdated
- each article can preview some content as selected by user for scheduled articles
- each blog can be public or private for non-followers (shown as private or hidden as chosen by user)
- each article can be public or private for non-followers (shown as private or hidden as chosen by user)
- in each series, articles can be ordered by user (by default newly added is added first in line)

### Draft Editor
- markdown
- image resizing
- mermaid with architecture icons

### Users
- create upto 2 free blogs and 1 free publication
- edit metadata of blogs, series and publications
- can let another user to write in their blog by converting it into a publication
- can convert a blog to a publication but cannot convert a publication back to a blog
- comment and reply on own/others articles
- save own/others articles into collections
- collections can be public or private
- add/edit their required personal details
- follow and unfollow other users and publications
- can edit and save drafts of articles

## To be added later:

### Publications
- each publication should have atleast one owner and can have multiple contributers and reviewers
- owner can mandate review of articles before publishing
- owner can transfer ownership to existing members of the publication
- series and article rules are same as blogs
- Users should be able to collaborate with other contributors on drafts for publications
- An article can be owned by multiple users

### Notifications
- Notify on new articles or replies on comments

### Scheduling
Users should be able to
- schedule articles for future
- receive notifications 24 hours before publishing and upon publishing the article

### Payments
Users should be able to pay to get services beyond free limit
- Pay for more/publications blogs either certain amount per blog and per article in the blog
- Pay once for unlimited blogs and articles

Users should be able to charge for their articles from followers
- Can charge once for following the whole blog
- Can charge per article
- Platform can take a cut on each transaction

### Engagement
- Like/Appreciate/Celebrate etc. reactions on articles

### Draft Editor
- iframes with sizing
- link previews

# Database Schema

```
User {
    id: uuid! (unique)
    username: string! (unique)
    first_name: string!
    middle_name: string
    last_name: string!
    bio: string!
    dp: string | null
    dob: Date!
    email: string!
    created_at: Date!
    deleted_at: Date | null
}

UserFollows {
    following: uuid!
    followed_by: uuid!
    followed_at: Date!
}

# A workspace can be a blog or a publication
Workspace {
    id: uuid! (unique)
    type: 'PERSONAL' | 'PUBLICATION'
    cover: string | null
    slug: string!
    name: string!
    description: string
    visibility: 'PUBLIC' | 'HIDDEN' | 'LOCKED'
    deleted_at: Date | null
}

WorkspaceMember {
    workspace_id: uuid!
    user_id: uuid!
    role: 'OWNER' | 'EDITOR' | 'REVIEWER' | 'ADMIN'
    joined_at: Date!
}

WorkspaceFollows {
    workspace_id: uuid!
    user_id: uuid!
    followed_at: Date!
}

Article {
    id: uuid! (unique)
    workspace_id: uuid!
    slug: string! (unique per workspace)
    published_version: uuid!
    published_at: Date | null
    scheduled_at: Date | null
    updated_at: Date | null
    excerpt: string!
    status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' # Can be moved between DRAFT and SCHEDULED until it is PUBLISHED
    visibility: 'PUBLIC' | 'HIDDEN' | 'LOCKED'
    deleted_at: Date | null
}

ArticleDraft {
  id: uuid! (unique)
  article_id: uuid | null
  workspace_id: uuid!
  title: string!
  subtitle: string!
  content: string!
  cover: string | null
  updated_at: Date!
  created_by: uuid!
}

ArticleVersion {
  id: uuid! (unique)
  article_id: uuid!
  title: string!
  subtitle: string!
  content: string!
  created_at: Date!
  created_by: uuid!
}

ArticleAuthor {
    article_id: uuid!
    user_id: uuid!
    is_primary: boolean!
}

# Not storing user id because logically a series belongs to a workspace 
# which can be a personal blog or a publication with multiple users
Series {
    id: uuid! (unique)
    workspace_id: uuid!
    slug: string! (unique per workspace)
    name: string!
    description: string
    sort_order: number!
    deleted_at: Date | null
}

# Many-to-many ordered relationship is difficult to store in either entity so storing separately
SeriesArticleRelation {
    series_id: uuid!
    article_id: uuid!
    sort_order: number!
}

Collection {
    id: uuid! (unique)
    user_id: uuid!
    name: string!
    visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
    deleted_at: Date | null
}

# Many-to-many relationship
CollectionArticleRelation {
    collection_id: uuid!
    article_id: uuid!
    added_at: Date!
}

Comment {
    id: uuid! (unique)
    user_id: uuid!
    article_id: uuid!
    parent_id: uuid | null # if reply to another comment
    content: string!
    created_at: Date!
    updated_at: Date!
    deleted_at: Date | null
}
```

# Tech Stack

- Next.js
- Code Mirror 6
- Mermaid
- SQL
- TypeORM
- OAuth Brokers (Supabase & Firebase)
- Scheduler Service (TBD)
- Notification Service (TBD)