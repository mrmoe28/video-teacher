import 'dotenv/config'
import { Pool } from '@neondatabase/serverless'
import OpenAI from 'openai'

async function verifyDB() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Missing DATABASE_URL')
  const pool = new Pool({ connectionString: url, max: 1 })
  const res = await pool.query('select now() as now')
  await pool.end()
  return res.rows[0]?.now
}

async function verifyOpenAI() {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')
  const client = new OpenAI({ apiKey: key })
  const r = await client.responses.create({
    model: 'gpt-4o-mini',
    input: 'ping',
    max_output_tokens: 1,
  })
  const text = r.output_text.trim()
  return text.length > 0 ? 'ok' : 'no text'
}

async function main() {
  try {
    const now = await verifyDB()
    console.log('[DB] OK:', now)
  } catch (e) {
    console.error('[DB] FAIL:', (e as Error).message)
    process.exitCode = 1
  }

  try {
    const status = await verifyOpenAI()
    console.log('[OpenAI] OK:', status)
  } catch (e) {
    console.error('[OpenAI] FAIL:', (e as Error).message)
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error('Unexpected error', e)
  process.exit(1)
})
