import 'dotenv/config'
import { db } from '@/lib/db'
import { videos, transcripts, jobs } from '@/lib/drizzle/schema'
import { sql } from 'drizzle-orm'

async function testDB() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const result = await db.execute(sql`SELECT NOW() as current_time`)
    console.log('✅ Connection successful:', result[0])
    
    // Check if tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    console.log('📋 Tables in database:', tables.map((t: any) => t.table_name))
    
    // Test videos table
    const videoCount = await db.select().from(videos).limit(1)
    console.log('✅ Videos table accessible')
    
    // Test jobs table
    const jobCount = await db.select().from(jobs).limit(1)
    console.log('✅ Jobs table accessible')
    
    console.log('🎉 Database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  }
}

testDB().catch(console.error)