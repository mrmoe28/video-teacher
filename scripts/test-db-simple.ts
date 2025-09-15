import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

async function testDB() {
  try {
    console.log('Testing database connection...')
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found in environment')
    }
    
    const sql = neon(process.env.DATABASE_URL)
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`
    console.log('✅ Connection successful:', result[0])
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    console.log('📋 Tables in database:', tables.map((t: any) => t.table_name))
    
    console.log('🎉 Database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  }
}

testDB().catch(console.error)