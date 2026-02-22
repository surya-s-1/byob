**User**

```json
{
	"id": "uuid",
	"username": "string",
	"email": "string",
	"name": "string",
	"bio": "string | null",
	"dob": "ISO8601 Date | null",
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

**Article**

```json
{
  "id": "uuid",
  "slug": "string",
  "title": "string",
  "subtitle": "string | null",
  "cover": "string | null",
  "content": "string (Markdown)",
  "excerpt": "string | null",
  "readTime": "number",
  "publishedAt": "ISO8601 Date",
  "visibility": "PUBLIC | HIDDEN | LOCKED",
  "authors": [ { "id": "text", "name": "string", "image": "string", "isPrimary": "boolean" } ],
  "publication": { "id": "uuid", "slug": "string", "displayName": "string" },
  "series": { "id": "uuid", "slug": "string", "displayName": "string", "sortOrder": "number" } | null
}
```

**Series**

```json
{
	"id": "uuid",
	"slug": "string",
	"displayName": "string",
	"displayDescription": "string | null",
	"sortOrder": "number",
	"articleCount": "number",
	"publication": { "id": "uuid", "slug": "string", "displayName": "string" }
}
```

**Draft (Private)**

```json
{
  "id": "uuid",
  "articleId": "uuid | null",
  "title": "string | null",
  "content": "string | null",
  "lockedBy": { "id": "text", "name": "string" } | null,
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
	"user": { "id": "text", "name": "string", "image": "string" },
	"parentId": "uuid | null",
	"articleId": "uuid",
	"replyCount": "number"
}
```

**Collection**

```json
{
	"id": "uuid",
	"displayName": "string",
	"visibility": "PUBLIC | UNLISTED | PRIVATE",
	"articleCount": "number",
	"createdAt": "ISO8601 Date",
	"ownedBy": { "id": "text", "name": "string", "image": "string" }
}
```

---

### II. User API

#### Get User's Profile

```
GET /api/user/username/:username/profile

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
    "user": Partial<User> | null,
    "error": string | null
}
```

---

#### Update User's Profile

```
PUT /api/user/username/:username/profile

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
    "dob": string,
    "image": string
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

#### Follow User

```
POST /api/user/id/:id/follow

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
POST /api/user/id/:id/unfollow

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
GET /api/user/username/:username/followers?page=1&limit=20
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
    "followers": Partial<User>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

#### Get User's Following

```
GET /api/user/username/:username/following?page=1&limit=20
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
    "following": Partial<User>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

---

#### Get User's Articles

```
GET /api/user/username/:username/articles?page=1&limit=20
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
    "articles": Partial<Article>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

---

#### Get User's Publications Membership

```
GET /api/user/username/:username/publications?page=1&limit=20
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
    "publications": Partial<Publication>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

---

#### Get User's Publication Invitations

```
GET /api/user/username/:username/invitations?page=1&limit=20
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
    "publications": Partial<Publication>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

---

#### Accept Invitation

```
POST /api/invitations/:id/accept
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
    "accepted": boolean,
    "error": string | null
}
```

---

#### Reject Invitation

```
POST /api/invitations/:id/reject
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
    "rejected": boolean,
    "error": string | null
}
```

---

#### Get User's Collections

```
GET /api/user/username/:username/collections?page=1&limit=20
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
    "collections": Partial<Collection>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

---

#### Get User's Comments

```
GET /api/user/username/:username/comments?page=1&limit=20
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
    "comments": Partial<Comment>[] | null,
    "pagination": { "total": number, "page": number } | null,
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
    "displayName": string,
    "displayDescription": string,
    "cover": string,
    "visibility": "PUBLIC" | "HIDDEN" | "LOCKED"
}
```

RESPONSE:

```
{
    "publication": { "id": string, "slug": string } | null,
    "error": string | null
}
```

#### Get Publication

```
GET /api/publications/slug/:slug

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
GET /api/publications/slug/:slug/articles?page=1&limit=20
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
    "articles": Partial<Article>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

#### Get Publication Series

```
GET /api/publications/slug/:slug/series?page=1&limit=20
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
    "series": Partial<Series>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

#### Update Publication

```
PUT /api/publications/id/:id

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

#### Manage Publication Series Order

```
PUT /api/publications/id/:id/series

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
    "series": { "seriesId": string, "sortOrder": number }[]
}
```

RESPONSE:

```
{
    "updated": boolean,
    "error": string | null
}
```

#### Delete Publication

```
DELETE /api/publications/id/:id
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

#### Follow Publication

```
POST /api/publications/id/:id/follow
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
POST /api/publications/id/:id/unfollow
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
GET /api/publications/slug/:slug/members?page=1&limit=20
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
            "user": Partial<User>,
            "role": "OWNER" | "EDITOR" | "REVIEWER" | "ADMIN",
            "joinedAt": Date
        }
    ] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

#### Invite Member

```
POST /api/publications/id/:id/members/invite
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
    "userId": string,
    "role": "EDITOR" | "REVIEWER" | "ADMIN"
}
```

RESPONSE:

```
{
    "invited": boolean,
    "error": string | null
}
```

#### Remove Member

```
DELETE /api/publications/id/:id/members/:userId
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

#### Get Publication Invitations

```
GET /api/publications/slug/:slug/invitations?page=1&limit=20
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
    "invitations": [
        {
            "user": Partial<User>,
            "role": "EDITOR" | "REVIEWER" | "ADMIN",
            "invitedAt": Date
        }
    ] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

---

#### Update Member Role

```
PUT /api/publications/id/:id/members/:userId
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
    "role": "EDITOR" | "REVIEWER" | "ADMIN"
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

### IV. Articles API

#### Get Article

```
GET /api/articles/slug/:slug
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
DELETE /api/articles/id/:id

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

### V. Drafts API

#### Create Draft

```
POST /api/drafts
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
    "publicationId": string
}
```

RESPONSE:

```
{
    "draft": { "id": string } | null,
    "error": string | null
}
```

#### Get Draft

```
GET /api/drafts/:id
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
    "draft": Draft | null, // Check lockedBy to see if someone else is editing
    "error": string | null
}
```

#### Save Draft

```
PUT /api/drafts/:id/save
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
    "cover": string,
    "visibility": "PUBLIC" | "HIDDEN" | "LOCKED",
    "scheduledAt": Date | null,
    "excerpt": string
}
```

RESPONSE:

```
{
    "saved": boolean,
    "error": string | null
}
```

---

#### Lock Draft

```
POST /api/drafts/:id/lock
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
    "lockedUntil": Date | null,
    "error": string | null
}
```

---

#### Add Authors to Draft

```
POST /api/drafts/:id/authors
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
    "authors": [ { "userId": string, "isPrimary": boolean } ]
}
```

RESPONSE:

```
{
    "added": boolean,
    "error": string | null
}
```

---

#### Remove Authors from Draft

```
DELETE /api/drafts/:id/authors/:userId
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

#### Publish Draft

```
POST /api/drafts/:id/publish
```

HEADERS:

```
{
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}
```

RESPONSE:

```
{
    "status": "PUBLISHED" | "SCHEDULED" | null,
    "error": string | null
}
```

---

### VI. Series API

#### Create Series

```
POST /api/series
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
    "publicationId": string,
    "displayName": string,
    "description": string,
    "sortOrder": number
}
```

RESPONSE:

```
{
    "series": { "id": string, "slug": string } | null,
    "error": string | null
}
```

#### Get Series Details

```
GET /api/series/slug/:slug
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
    "series": Series | null,
    "error": string | null
}
```

#### Get Series Articles

```
GET /api/series/slug/:slug/articles?page=1&limit=20
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
    "articles": Partial<Article>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

#### Manage Series Articles Order

```
PUT /api/series/id/:id/articles/order
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
    "articles": { "articleId": string, "sortOrder": number }[]
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

#### Delete Series

```
DELETE /api/series/id/:id
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

#### Update Series

```
PUT /api/series/id/:id
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
    "description": string
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

#### Get Collection Details

```
GET /api/collections/:id
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
    "collection": Partial<Collection> | null,
    "error": string | null
}
```

#### Get Collection Articles

```
GET /api/collections/:id/articles?page=1&limit=20
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
    "articles": Partial<Article>[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

---

#### Update Collection Details

```
PUT /api/collections/:id
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
    "updated": boolean,
    "error": string | null
}
```

---

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
    "collection": { "id": string } | null,
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

#### Get Comments

```
GET /api/articles/slug/:slug/comments?page=1&limit=50
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
    "comments": Comment[] | null, // Top level comments
    "pagination": { "total": number, "page": number } | null,
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
    "replies": Comment[] | null,
    "pagination": { "total": number, "page": number } | null,
    "error": string | null
}
```

#### Post Comment

```
POST /api/articles/id/:id/comments
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
    "commented": boolean,
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
    "updated": boolean,
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
    "error": string | null
}
```

## TODO

#### Get article based on article hidden or locked or public status

#### Add draft authors table in schema file

#### Unpublish Article

#### Move article to review after publish

#### On review success/failure move article to published/draft
