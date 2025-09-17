/**
 * Comprehensive YouTube URL Parser
 * Handles all possible YouTube URL formats including:
 * - Standard watch URLs
 * - Short URLs (youtu.be)
 * - Embed URLs
 * - Mobile URLs
 * - URLs with timestamps
 * - URLs with playlists
 * - URLs copied from address bar or share button
 */

export interface YouTubeUrlInfo {
  videoId: string;
  startTime?: number;
  playlistId?: string;
  isValid: boolean;
  originalUrl: string;
  normalizedUrl: string;
}

/**
 * Extracts YouTube video ID from any YouTube URL format
 * @param input - Any YouTube URL or video ID
 * @returns Video ID string or null if invalid
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Clean the input
  const cleanInput = input.trim();

  // If it's already an 11-character video ID, return it
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanInput)) {
    return cleanInput;
  }

  // Comprehensive regex patterns for all YouTube URL formats
  const patterns = [
    // Standard watch URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    
    // Short URLs (youtu.be)
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    
    // Embed URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    
    // Mobile URLs (m.youtube.com)
    /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    
    // Gaming URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/gaming\/watch\?v=([a-zA-Z0-9_-]{11})/,
    
    // YouTube TV URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/tv\/watch\/([a-zA-Z0-9_-]{11})/,
    
    // YouTube Music URLs
    /(?:https?:\/\/)?music\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    
    // Shorts URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    
    // Live URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    
    // Attribution URLs (from YouTube Studio)
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/attribution_link\?.*v=([a-zA-Z0-9_-]{11})/,
    
    // URLs with additional parameters
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*[&?]v=([a-zA-Z0-9_-]{11})/,
  ];

  // Try each pattern
  for (const pattern of patterns) {
    const match = cleanInput.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Parses a YouTube URL and extracts comprehensive information
 * @param input - YouTube URL or video ID
 * @returns YouTubeUrlInfo object with parsed information
 */
export function parseYouTubeUrl(input: string): YouTubeUrlInfo {
  const videoId = extractYouTubeVideoId(input);
  const isValid = videoId !== null;
  
  let startTime: number | undefined;
  let playlistId: string | undefined;

  if (isValid && input.includes('?')) {
    try {
      const url = new URL(input.startsWith('http') ? input : `https://youtube.com${input.startsWith('/') ? '' : '/watch?v='}${input}`);
      
      // Extract start time (t parameter or start parameter)
      const tParam = url.searchParams.get('t') || url.searchParams.get('start');
      if (tParam) {
        startTime = parseTimeParameter(tParam);
      }
      
      // Extract playlist ID
      playlistId = url.searchParams.get('list') || undefined;
    } catch (e) {
      // If URL parsing fails, try regex for time extraction
      const timeMatch = input.match(/[&?]t=([^&]+)/);
      if (timeMatch) {
        startTime = parseTimeParameter(timeMatch[1]);
      }
      
      const playlistMatch = input.match(/[&?]list=([^&]+)/);
      if (playlistMatch) {
        playlistId = playlistMatch[1];
      }
    }
  }

  const normalizedUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : input;

  return {
    videoId: videoId || '',
    startTime,
    playlistId,
    isValid,
    originalUrl: input,
    normalizedUrl
  };
}

/**
 * Parses time parameter (supports formats like "1m30s", "90", "1:30")
 * @param timeParam - Time parameter string
 * @returns Time in seconds
 */
function parseTimeParameter(timeParam: string): number {
  if (!timeParam) return 0;

  // If it's just a number, return as seconds
  if (/^\d+$/.test(timeParam)) {
    return parseInt(timeParam, 10);
  }

  // Handle formats like "1m30s", "2h5m30s"
  const timeRegex = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;
  const match = timeParam.match(timeRegex);
  
  if (match) {
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Handle formats like "1:30" or "1:30:45"
  const colonFormat = timeParam.split(':').reverse();
  let totalSeconds = 0;
  
  for (let i = 0; i < colonFormat.length; i++) {
    const value = parseInt(colonFormat[i], 10);
    if (!isNaN(value)) {
      totalSeconds += value * Math.pow(60, i);
    }
  }

  return totalSeconds;
}

/**
 * Validates if a string is a valid YouTube URL or video ID
 * @param input - String to validate
 * @returns boolean indicating if input is valid
 */
export function isValidYouTubeUrl(input: string): boolean {
  return parseYouTubeUrl(input).isValid;
}

/**
 * Normalizes any YouTube URL to standard format
 * @param input - YouTube URL or video ID
 * @returns Normalized YouTube URL or null if invalid
 */
export function normalizeYouTubeUrl(input: string): string | null {
  const parsed = parseYouTubeUrl(input);
  return parsed.isValid ? parsed.normalizedUrl : null;
}

/**
 * Creates a YouTube URL with timestamp
 * @param videoId - YouTube video ID
 * @param startTime - Start time in seconds
 * @returns YouTube URL with timestamp
 */
export function createYouTubeUrlWithTime(videoId: string, startTime: number): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${startTime}s`;
}

/**
 * Test function to validate the parser with various URL formats
 * Only runs in development mode
 */
export function testYouTubeUrlParser(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const testUrls = [
    // Standard URLs
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=dQw4w9WgXcQ',
    'www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube.com/watch?v=dQw4w9WgXcQ',
    
    // Short URLs
    'https://youtu.be/dQw4w9WgXcQ',
    'youtu.be/dQw4w9WgXcQ',
    
    // With timestamps
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s',
    'https://youtu.be/dQw4w9WgXcQ?t=1m30s',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90',
    
    // With playlists
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmRdnEQy6nuLMt9xrTwCu0AxjLw9h',
    
    // Mobile URLs
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    
    // Embed URLs
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    
    // Shorts
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    
    // Just video ID
    'dQw4w9WgXcQ',
    
    // Invalid URLs
    'https://vimeo.com/123456',
    'not-a-url',
    'https://www.youtube.com/watch?v=invalid',
  ];

  console.log('🧪 Testing YouTube URL Parser:');
  testUrls.forEach(url => {
    const result = parseYouTubeUrl(url);
    console.log(`${result.isValid ? '✅' : '❌'} ${url} → ${result.videoId || 'INVALID'}`);
  });
}
