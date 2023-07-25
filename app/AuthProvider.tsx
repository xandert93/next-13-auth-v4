'use client'

import { SessionProvider } from 'next-auth/react'

type Props = {
  children: React.ReactNode
}

export const AuthProvider = (props: Props) => {
  return <SessionProvider {...props} />
}
