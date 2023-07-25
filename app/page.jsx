import { getServerSession } from 'next-auth'

import { SignInButton } from '@/components/SignInButton'
import { SignOutButton } from '@/components/SignOutButton'

import { authOptions } from './api/auth/[...nextauth]/options'
import { SessionStatus } from '@/components/SessionStatus'
import Link from 'next/link'

const getServerSessionUser = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user // => undefined | foundUser

  return user
}

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
            {k}: {v}
          </li>
        ))}
      </ul>

      <SessionStatus />
      <Link href="/account" children="Account" style={{ display: 'block' }} />

      <SignOutButton />
    </>
  )
}
