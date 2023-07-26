import { getServerSession } from 'next-auth'
import { authOptions } from './options'

export const getServerSessionUser = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user // => undefined | foundUser

  return user
}
