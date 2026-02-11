# Database Setup Instructions

The application requires certain tables to be created in your Supabase database. If you see 404 errors for `post_reactions` or `posts` tables, follow these steps:

## Step 1: Access Your Supabase Database

1. Go to https://supabase.com and sign in
2. Select your project: `yaso` (or the project name matching your `VITE_SUPABASE_URL`)
3. Click on **SQL Editor** in the left sidebar

## Step 2: Run the Setup SQL Scripts

Execute these SQL scripts in order:

### Script 1: Create Posts and Post Reactions Tables
Run the SQL from this file: `/scripts/create_posts_tables.sql`

Go to SQL Editor → New Query and paste the contents of:
```
/workspaces/yaso/scripts/create_posts_tables.sql
```

### Script 2: Create Community Tables (Optional)
If you need community features, also run:
```
/workspaces/yaso/scripts/new_tables_only.sql
```

### Script 3: Set Up Policies and Indexes (Recommended)
Run the security and indexing script:
```
/workspaces/yaso/scripts/policies_indexes_security.sql
```

## Step 3: Verify Setup

After running the scripts, you should see these tables in your Supabase dashboard:
- `posts`
- `post_reactions`
- `communities` (if you ran script 2)
- `channels` (if you ran script 2)
- And other related tables

## Troubleshooting

**Error: "relation 'public.posts' does not exist"**
- Make sure you ran `create_posts_tables.sql` first

**Error: "relation 'public.profiles' does not exist"**
- The `profiles` table should already exist from your Supabase auth setup
- If not, create it with: `CREATE TABLE profiles (id uuid PRIMARY KEY REFERENCES auth.users(id))`

**Error: "relation 'public.post_reactions' does not exist"**
- Run `create_posts_tables.sql` again
- Wait a moment for the database to sync
- Refresh your browser

## What These Tables Do

- **posts**: Stores user-created posts with content and metadata
- **post_reactions**: Stores emoji reactions to posts (like 👍, ❤️, etc.)
- **communities**: Groups for organizing users
- **channels**: Discussion channels within communities
- **channel_messages**: Messages sent in channels
- **message_reactions**: Reactions to channel messages
