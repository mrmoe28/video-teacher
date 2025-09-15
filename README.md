# Video Teacher - AI-Powered Learning Platform

Transform any video into an interactive learning experience with AI-powered analysis, transcripts, and study materials.

## 🚀 Features

- **YouTube Video Processing**: Extract metadata and transcripts from YouTube videos
- **AI-Powered Analysis**: Generate educational insights, key points, and study materials
- **Interactive Learning Decks**: Create structured presentations with slides and quizzes
- **Real-time Progress Tracking**: Monitor learning progress with interactive checklists
- **Multiple Transcript Sources**: Support for YouTube captions and Whisper AI transcription

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 with PostCSS
- **Database**: PostgreSQL (Neon serverless) + Drizzle ORM
- **AI/ML**: OpenAI GPT for content analysis
- **Video Processing**: youtube-transcript, ytdl-core
- **Build**: Turbopack for development and production
- **Deployment**: Vercel with automatic Git integration

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL database (Neon recommended)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mrmoe28/video-teacher.git
cd video-teacher
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Add your DATABASE_URL and OPENAI_API_KEY
```

4. Set up the database:
```bash
npm run db:generate
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
├── app/                    # Next.js 15 App Router
├── lib/
│   ├── drizzle/
│   │   ├── schema.ts      # Database schema with Zod validation
│   │   └── migrations/    # Auto-generated SQL migrations
│   └── db.ts              # Database connection setup
├── components/            # Reusable React components
└── vercel.json           # Deployment configuration
```

## 🗄️ Database Schema

The application uses a hierarchical content structure:

- **Videos**: YouTube video metadata and basic info
- **Transcripts**: Extracted captions or Whisper-generated transcripts
- **Decks**: Generated teaching presentations from video content
- **Slides**: Individual slides within a deck with timing information
- **Steps**: Interactive checklist items within slides
- **Jobs**: Processing status tracking for video analysis pipeline
- **Quizzes**: Quiz questions associated with slides

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run db:generate  # Generate database migrations
npm run db:migrate   # Apply database migrations
npm run db:studio    # Open Drizzle Studio
npm test             # Run tests with Vitest
```

## 🚀 Deployment

This project is configured for automatic deployment on Vercel:

1. **Automatic Git Integration**: Pushes to `main` branch trigger deployments
2. **Environment Variables**: Set `DATABASE_URL` and `OPENAI_API_KEY` in Vercel dashboard
3. **Function Configuration**: Optimized for 60s timeout and 1024MB memory

### Manual Deployment

```bash
vercel --prod
```

## 🔐 Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string (Neon format)
- `OPENAI_API_KEY`: OpenAI API key for content analysis
- `NEXT_PUBLIC_APP_URL`: Your application URL

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Guide](https://orm.drizzle.team/)
- [Vercel Deployment](https://vercel.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
