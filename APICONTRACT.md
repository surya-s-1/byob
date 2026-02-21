**User (Public Profile)**

```json
{
  "id": "uuid",
  "username": "string",
  "name": "string",
  "bio": "string | null",
  "image": "string | null",
  "followersCount": "number",
  "followingCount": "number",
  "isFollowing": "boolean"
}

```

**Publication**

```json
{
  "id": "uuid",
  "slug": "string",
  "displayName": "string",
  "displayDescription": "string | null",
  "cover": "string | null",
  "visibility": "PUBLIC | HIDDEN | LOCKED",
  "followersCount": "number",
  "isFollowing": "boolean",
  "isMember": "boolean",
  "myRole": "OWNER | EDITOR | REVIEWER | ADMIN | null"
}

```

**Article (Public)**

```json
{
  "id": "uuid",
  "slug": "string",
  "title": "string",
  "subtitle": "string | null",
  "cover": "string | null",
  "content": "string (HTML/Markdown)",
  "excerpt": "string | null",
  "readTime": "number",
  "publishedAt": "ISO8601 Date",
  "visibility": "PUBLIC | HIDDEN | LOCKED",
  "authors": [ { "id": "uuid", "name": "string", "image": "string", "isPrimary": "boolean" } ],
  "publication": { "id": "uuid", "slug": "string", "displayName": "string" },
  "series": { "id": "uuid", "slug": "string", "name": "string", "order": "number" } | null
}

```

**Draft (Private)**

```json
{
  "id": "uuid",
  "articleId": "uuid | null",
  "title": "string | null",
  "content": "string | null",
  "lockedBy": { "id": "uuid", "name": "string" } | null,
  "lockedUntil": "ISO8601 Date | null",
  "lastUpdated": "ISO8601 Date"
}

```

**Comment**

```json
{
  "id": "uuid",
  "content": "string",
  "createdAt": "ISO8601 Date",
  "user": { "id": "uuid", "name": "string", "image": "string" },
  "parentId": "uuid | null",
  "replyCount": "number"
}

```

---

### II. User API

#### Get User Profile

```
GET /api/user/:username

```

HEADERS:

```
{
    "Authorization": "Bearer <token>" (Optional, affects isFollowing)
}

```

RESPONSE:

```
{
    "user": User | null,
    "error": string | null
}

```

#### Update My Profile

```
PUT /api/user/me

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "name": string,
    "bio": string,
    "image": string
}

```

RESPONSE:

```
{
    "user": User | null,
    "error": string | null
}

```

#### Follow User

```
POST /api/user/:id/follow

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "followed": boolean,
    "error": string | null
}

```

#### Unfollow User

```
POST /api/user/:id/unfollow

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "unfollowed": boolean,
    "error": string | null
}

```

#### Get User's Followers

```
GET /api/user/:username/followers?page=1&limit=20

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "followers": User[],
    "pagination": { "total": number, "page": number },
    "error": string | null
}

```

#### Get User's Following

```
GET /api/user/:username/following?page=1&limit=20

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "following": User[],
    "pagination": { "total": number, "page": number },
    "error": string | null
}

```

---

### III. Publication API

#### Create Publication

```
POST /api/publications

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "slug": string,
    "displayName": string,
    "displayDescription": string,
    "cover": string,
    "visibility": "PUBLIC" | "HIDDEN" | "LOCKED"
}

```

RESPONSE:

```
{
    "publication": Publication | null,
    "error": string | null
}

```

#### Get Publication

```
GET /api/publications/:slug

```

HEADERS:

```
{
    "Authorization": "Bearer <token>" (Optional)
}

```

RESPONSE:

```
{
    "publication": Publication | null,
    "error": string | null
}

```

#### Get Publication Articles

```
GET /api/publications/:slug/articles?include=title,subtitle,cover,readTime,publishedAt,primaryAuthors&page=1&limit=20

```

HEADERS:

```
{
    "Authorization": "Bearer <token>" (Optional)
}

```

RESPONSE:

```
{
    "articles": Article[] | null,
    "pagination": { "total": number, "page": number },
    "error": string | null
}

```

#### Update Publication

```
PUT /api/publications/:id

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "displayName": string,
    "displayDescription": string,
    "cover": string,
    "visibility": "PUBLIC" | "HIDDEN" | "LOCKED"
}

```

RESPONSE:

```
{
    "publication": Publication | null,
    "error": string | null
}

```

#### Delete Publication

```
DELETE /api/publications/:id

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "deleted": boolean,
    "deletedAt": Date,
    "error": string | null
}

```

#### Follow Publication

```
POST /api/publications/:id/follow

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "followed": boolean,
    "error": string | null
}

```

#### Unfollow Publication

```
POST /api/publications/:id/unfollow

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "unfollowed": boolean,
    "error": string | null
}

```

#### Get Publication Members

```
GET /api/publications/:slug/members?include=name,image,role&page=1&limit=20

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "members": [
        {
            "user": User,
            "role": "OWNER" | "EDITOR" | "REVIEWER" | "ADMIN",
            "joinedAt": Date
        }
    ],
    "pagination": { "total": number, "page": number },
    "error": string | null
}

```

#### Add/Invite Member

```
POST /api/publications/:id/members

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "userId": string, // The user to add
    "role": "EDITOR" | "REVIEWER" | "ADMIN"
}

```

RESPONSE:

```
{
    "ok": boolean,
    "error": string | null
}

```

#### Remove Member

```
DELETE /api/publications/:id/members/:userId

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "removed": boolean,
    "error": string | null
}

```

---

### IV. Article & Reading API

#### Get Article Details

```
GET /api/articles/:slug

```

HEADERS:

```
{
    "Authorization": "Bearer <token>" (Optional)
}

```

RESPONSE:

```
{
    "article": Article | null,
    "error": string | null
}

```

#### Delete Article

```
DELETE /api/articles/:id

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "deleted": boolean,
    "error": string | null
}

```

---

### V. Drafts & Writing API

*Note: Drafts are the precursors to Articles. Editing happens here.*

#### Create New Draft

```
POST /api/publications/:id/drafts

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "title": string,
    "subtitle": string,
    "content": string, // Initial content
    "cover": string
}

```

RESPONSE:

```
{
    "draft": Draft,
    "error": string | null
}

```

#### Get Draft (Load Editor)

```
GET /api/drafts/:draftId

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "draft": Draft, // Check lockedBy to see if someone else is editing
    "error": string | null
}

```

#### Save Draft

```
PUT /api/drafts/:draftId

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "title": string,
    "subtitle": string,
    "content": string,
    "cover": string
}

```

RESPONSE:

```
{
    "saved": boolean,
    "updatedAt": Date,
    "error": string | null
}

```

#### Acquire Edit Lock (Concurrency)

```
POST /api/drafts/:draftId/lock

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "locked": boolean,
    "lockedUntil": Date,
    "error": string | null
}

```

#### Publish Draft

*This moves data from `article_drafts` to `articles`.*

```
POST /api/drafts/:draftId/publish

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "slug": string,
    "visibility": "PUBLIC" | "HIDDEN" | "LOCKED",
    "scheduledAt": Date | null,
    "excerpt": string,
    "authors": [ { "userId": string, "isPrimary": boolean } ]
}

```

RESPONSE:

```
{
    "articleSlug": string,
    "publishedAt": Date,
    "status": "PUBLISHED" | "SCHEDULED",
    "error": string | null
}

```

---

### VI. Series API

#### Get All Series in a Publication

```
GET /api/publications/:slug/series?page=1&limit=20

```

HEADERS:

```
{
    "Authorization": "Bearer <token>" (Optional)
}

```

RESPONSE:

```
{
    "series": [
        {
            "id": string,
            "slug": string,
            "displayName": string,
            "sortOrder": number,
            "articleCount": number
        }
    ],
    "pagination": { "total": number, "page": number },
    "error": string | null
}

```

#### Create Series

```
POST /api/publications/:id/series

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "slug": string,
    "displayName": string,
    "description": string,
    "sortOrder": number
}

```

RESPONSE:

```
{
    "series": { "id": string, "slug": string },
    "error": string | null
}

```

#### Get Series Details

```
GET /api/series/:slug

```

HEADERS:

```
{
    "Authorization": "Bearer <token>" (Optional)
}

```

RESPONSE:

```
{
    "series": {
        "id": string,
        "slug": string,
        "displayName": string,
        "description": string,
        "sortOrder": number,
        "articleCount": number,
        "publication": {
            "id": string,
            "slug": string,
            "displayName": string
        }
    },
    "error": string | null
}

```

#### Get Series Articles

```
GET /api/series/:slug/articles?include=title,subtitle,cover,readTime,publishedAt,primaryAuthors&page=1&limit=20

```

HEADERS:

```
{
    "Authorization": "Bearer <token>" (Optional)
}

```

RESPONSE:

```
{
    "articles": Article[] | null,
    "pagination": { "total": number, "page": number },
    "error": string | null
}

```

#### Manage Series Articles

```
PUT /api/series/:id/articles

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "articles": [
        { "articleId": string, "sortOrder": number }
    ]
}

```

RESPONSE:

```
{
    "updated": boolean,
    "error": string | null
}

```

---

### VII. Collections API

#### Get User Collections

```
GET /api/user/:username/collections?page=1&limit=20

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "collections": [
        {
            "id": string,
            "displayName": string,
            "visibility": "PUBLIC" | "PRIVATE",
            "count": number
        }
    ],
    "pagination": { "total": number, "page": number },
    "error": string | null
}

```

#### Create Collection

```
POST /api/collections

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "displayName": string,
    "visibility": "PUBLIC" | "UNLISTED" | "PRIVATE"
}

```

RESPONSE:

```
{
    "collection": { "id": string },
    "error": string | null
}

```

#### Add Article to Collection

```
POST /api/collections/:id/articles

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "articleId": string
}

```

RESPONSE:

```
{
    "added": boolean,
    "error": string | null
}

```

#### Remove Article from Collection

```
DELETE /api/collections/:id/articles/:articleId

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "removed": boolean,
    "error": string | null
}

```

#### Delete Collection

```
DELETE /api/collections/:id

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "deleted": boolean,
    "error": string | null
}

```

---

### VIII. Comments API

#### Get Article Comments

```
GET /api/articles/:slug/comments?page=1&limit=50

```

HEADERS:

```
{
    "Authorization": "Bearer <token>" (Optional)
}

```

RESPONSE:

```
{
    "comments": Comment[], // Top level comments
    "pagination": { "total": number, "page": number },
    "error": string | null
}

```

#### Get Replies (Thread)

```
GET /api/comments/:id/replies?page=1&limit=20

```

HEADERS:

```
{
    "Authorization": "Bearer <token>" (Optional)
}

```

RESPONSE:

```
{
    "replies": Comment[],
    "pagination": { "total": number, "page": number },
    "error": string | null
}

```

#### Post Comment

```
POST /api/articles/:id/comments

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "content": string,
    "parentId": string | null // Null for root comment
}

```

RESPONSE:

```
{
    "comment": Comment,
    "error": string | null
}

```

#### Update Comment

```
PUT /api/comments/:id

```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

```

BODY:

```
{
    "content": string
}

```

RESPONSE:

```
{
    "comment": Comment,
    "error": string | null
}

```

#### Delete Comment

```
DELETE /api/comments/:id

```

HEADERS:

```
{
    "Authorization": "Bearer <token>"
}

```

RESPONSE:

```
{
    "deleted": boolean,
    "deletedAt": Date,
    "error": string | null
}

```