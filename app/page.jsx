import { SignInButton } from '@/components/SignInButton'
import { SignOutButton } from '@/components/SignOutButton'
import { SessionStatus } from '@/components/SessionStatus'

import Link from 'next/link'

import { getServerSessionUser } from './api/auth/[...nextauth]/utils'

export default async function HomePage() {
  const user = await getServerSessionUser()

  if (!user) return <SignInButton />
  else return <Dashboard {...user} />
}

const Dashboard = ({ username, ...user }) => {
  return (
    <>
      <h1>Dashboard</h1>
      <h2>Welcome, {username}</h2>

      <ul>
        {Object.entries(user).map(([k, v]) => (
          <li key={k}>
            {k}: {String(v)}
          </li>
        ))}
      </ul>

      <SessionStatus />
      <Link href="/account" children="Account" style={{ display: 'block' }} />
      <SignOutButton />
    </>
  )
}
