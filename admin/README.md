# Built by Denny - Blog Admin System

## Overview

This admin dashboard allows Denny to write and publish blog posts directly to the website without needing to edit code.

## How to Access

1. Go to `https://builtbydenny.com/admin/`
2. Enter the admin password
3. You're in!

## How to Write a Post

### Step 1: Click "New Post"

This opens the post editor.

### Step 2: Fill in the Details

- **Title**: The headline of your post (shows in browser tab and at top of article)
- **Featured Image**: Optional - upload an image to show at the top of the post and in the blog listing
- **Content**: Write your post here

### Step 3: Writing Tips

You can write naturally - the system will format it for you. But if you want more control:

**To make text bold:**
```
**this text will be bold**
```

**To make text italic:**
```
_this text will be italic_
```

**To add a link:**
```
[click here](https://example.com)
```

**To create a heading:**
```
## This Is a Section Heading
```

**To create a bullet list:**
```
- First item
- Second item
- Third item
```

**To create a numbered list:**
```
1. First step
2. Second step
3. Third step
```

### Step 4: Preview

Click "Preview" to see how your post will look before publishing.

### Step 5: Publish

Click "Publish" when you're ready. The post will go live immediately.

## Managing Posts

From the dashboard you can:
- **Edit** any existing post
- **Unpublish** a post (removes it from the site but keeps the draft)
- **Delete** a post permanently

## Images

### Featured Images
- These appear at the top of your post and in the blog listing
- Recommended size: 1200 x 630 pixels
- Supported formats: JPG, PNG, WebP

### Images in Posts
- You can add images within your post content
- Images are automatically compressed to save space
- All images are stored in `/images/blog/`

## Technical Details

### How It Works
1. You write a post in the admin dashboard
2. When you publish, the system:
   - Generates an HTML file from your content
   - Compresses any images
   - Saves everything to the website via GitHub
   - Updates the blog listing page

### File Locations
- Posts: `/blog/[post-slug].html`
- Images: `/images/blog/`
- Blog listing: `/blog/index.html`

### Password Security
The admin password is stored securely and checked on each request. If you need to change the password, contact your website administrator.

## Troubleshooting

### Post not appearing?
- Wait 1-2 minutes for GitHub Pages to update
- Try refreshing with Ctrl+Shift+R (hard refresh)

### Image not uploading?
- Check that the file is JPG, PNG, or WebP
- Make sure the file is under 5MB
- Try a different browser

### Forgot password?
- Contact your website administrator

## Need Help?

Contact Micaiah for technical support.
