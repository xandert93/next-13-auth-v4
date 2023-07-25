import CredentialsProvider from 'next-auth/providers/credentials'

const users = [
  {
    _id: '001',
    firstName: 'Fat',
    lastName: 'Cat',
    username: 'fatcat',
    password: '123456',
    avatarUrl: 'some-url',
  },
  {
    _id: '002',
    firstName: 'Kitty',
    lastName: 'Liapi',
    username: 'lapkitty',
    password: '123456',
    avatarUrl: 'some-url',
  },
]

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days (default)
    updateAge: 24 * 60 * 60, // 1 day (default) i.e. max once per day
  },

  providers: [
    CredentialsProvider({
      name: 'Username',
      credentials: {
        username: { type: 'text' },
        password: { type: 'password' },
      },
      authorize: async ({ username, password }, req) => {
        const foundUser = users.find((user) => user.username === username)
        if (!foundUser) return null

        const isPasswordsMatching = foundUser.password === password
        if (!isPasswordsMatching) return null

        return foundUser // we will add some of its data to JWT payload
      },
    }),
  ],

  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const tokenUser = {
          _id: user._id,
          avatarUrl: user.avatarUrl,
        }

        token.user = tokenUser
      }

      return token
      // client is issued token with some user data. Client's subsequent API requests will have it attached
      // crucially, at route-handler level, this token can be decoded, exposing this user data
      // the user data can then be used to determine route handler logic
      // e.g. if client wants to update their post - if token.user._id !== post.author._id, don't allow update
    },

    session: ({ token, session }) => {
      if (session) {
        console.log('session inspected + user fetched')
        const { password, ...foundUser } = users.find((user) => user._id === token.user._id)
        session.user = foundUser
      }

      return session
    },
  },
}
