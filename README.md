Features to be built right now:
## Blogs
- each blog can have zero or more series and articles
- series in a blog can be ordered
- each series can have zero or more articles
- each article should belong to zero or more series
- each series/article can belong to only one blog
- each article should have cover url, title (required), subtitle, content (required)
- articles can be published right now/backdated/scheduled for future
- each article can preview some content as selected by user for scheduled articles
- each blog can be public or private for non-followers (shown as private or hidden as chosen by user)
- each article can be public or private for non-followers (shown as private or hidden as chosen by user)
- in each series, articles can be ordered by user (by default newly added is added first in line)

## Publications
- each publication should have atleast one owner and can have multiple contributers and reviewers
- owner can mandate review of articles before publishing
- owner can transfer ownership to existing members of the publication
- series and article rules are same as blogs

## Users
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

Features to be added later:
## Payments
Users should be able to pay to get services beyond free limit
- Pay for more/publications blogs either certain amount per blog and per article in the blog
- Pay once for unlimited blogs and articles

Users should be able to charge for their articles from followers
- Can charge once for following the whole blog
- Can charge per article
- Platform can take a cut on each transaction

## Publications
- Users should be able to collaborate with other contributors on drafts for publications
- An article can be owned by multiple users

## Notifications
- Notify on new articles or replies on comments

## Engagement
- Like/Appreciate/Celebrate etc. reactions on articles

```
User {
    id: uuid!
    username: string! (unique)
    firstName: string!
    middleName: string
    lastName: string!
    bio: string!
    dp: string | null
    dob: Date!
    email: string!
    createdAt: Date!
}

UserFollows {
    following: uuid!
    followedBy: uuid!
    followedAt: Date!
}

# A workspace can be a blog or a publication
Workspace {
    id: uuid!
    ownerId: uuid!
    type: 'PERSONAL' | 'PUBLICATION'
    cover: string | null # link to cover image
    slug: string!
    name: string!
    description: string
    visibility: 'PUBLIC' | 'HIDDEN' | 'LOCKED'
}

WorkspaceMember {
    workspaceId: uuid!
    userId: uuid!
    role: 'EDITOR' | 'REVIEWER' | 'ADMIN'
    joinedAt: Date!
}

WorkspaceFollows {
    workspaceId: uuid!
    userId: uuid!
    followedAt: Date!
}

Article {
    id: uuid!
    workspaceId: uuid!
    cover: string | null
    slug: string!
    title: string!
    subtitle: string!
    content: string!
    publishedAt: Date | null
    scheduledAt: Date | null
    updatedAt: Date | null
    excerpt: string!
    status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' # Can be moved between DRAFT and SCHEDULED until it is PUBLISHED
    visibility: 'PUBLIC' | 'HIDDEN' | 'LOCKED'
}

ArticleAuthor {
    articleId: uuid!
    userId: uuid!
    isPrimary: boolean!
}

# Not storing user id because logically a series  belongs to a workspace 
# which can be a personal blog or a publication with multiple users
Series {
    id: uuid!
    workspaceId: uuid!
    slug: string!
    name: string!
    description: string
    sortOrder: number!
}

# Many-to-many ordered relationship is difficult to store in either entity so storing separately
SeriesArticleRelation {
    seriesId: uuid!
    articleId: uuid!
    sortOrder: number!
}

Collection {
    id: uuid!
    userId: uuid!
    name: string!
    visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
}

# Many-to-many relationship
CollectionArticleRelation {
    collectionId: uuid!
    articleId: uuid!
    addedAt: Date!
}

Comment {
    id: uuid!
    userId: uuid!
    articleId: uuid!
    parentId: uuid | null # if reply to another comment
    content: string!
    createdAt: Date!
    updatedAt: Date!
}
```