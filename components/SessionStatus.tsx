'use client'

import { useSession } from 'next-auth/react'

export const SessionStatus = () => {
  const { status } = useSession()

  return <p>Session status: {status}</p>
}
