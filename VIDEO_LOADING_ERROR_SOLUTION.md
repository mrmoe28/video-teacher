# Video Loading Error Solution

## Problem
The application shows "Error Loading Video" with the message "Failed to load video data. Please check if the video ID is valid." when trying to load videos.

## Root Cause
The YouTube API key (`YOUTUBE_API_KEY`) has HTTP referrer restrictions enabled, which blocks requests from the application. The error "Requests from referer <empty> are blocked" indicates that the API key is configured to only accept requests from specific domains or referrers.

## Solution

### Step 1: Fix YouTube API Key Restrictions
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your YouTube API key and click on it to edit
4. Under "Application restrictions", change from "HTTP referrers" to "None" for development
   - **For production**: Set HTTP referrers to include your domain (e.g., `https://yourdomain.com/*`)
   - **For development**: Set to "None" to allow requests from localhost
5. Save the changes

### Step 2: Configure Environment Variables
Create a `.env.local` file in the project root with the following content:

```bash
# YouTube API Configuration
YOUTUBE_API_KEY="your_youtube_api_key_here"

# Other required variables (if not already set)
OPENAI_API_KEY="your_openai_api_key_here"
DATABASE_URL="postgresql://username:password@localhost:5432/video_teacher"
```

### Step 3: Restart the Development Server
After creating the `.env.local` file, restart the development server:

```bash
npm run dev
```

### Step 4: Test the Fix
1. Navigate to the upload page with a video ID: `http://localhost:3000/upload?videoId=KRWQTF0iAdM`
2. The video should now load successfully

## Additional Notes

- The YouTube API key is required for fetching video metadata, titles, thumbnails, and duration
- HTTP referrer restrictions are a security feature that limits which domains can use your API key
- The error message "Video may be private or unavailable" is misleading when the real issue is API key restrictions
- For development, setting restrictions to "None" allows requests from any domain (including localhost)
- For production, always set proper HTTP referrer restrictions to your domain for security

## Verification
To verify the fix is working:
1. Check that the API endpoint `/api/progress?videoId=VIDEO_ID` returns video data instead of an error
2. The upload page should successfully process YouTube URLs
3. Video detail pages should display proper video information

## Date Created
January 2025

## Status
Ready for implementation