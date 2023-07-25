import { getToken } from 'next-auth/jwt'
import { NextResponse as res } from 'next/server'

export const GET = async (req) => {
  const token = await getToken({ req })

  if (!token) return res.json({ error: 'Unauthorized' }, { status: 401 })

  return res.json({ message: 'Welcome!' }) // default status appears to be 200
}
