import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

const users = [
  {
    _id: 1,
    email: 'fatcat@gmail.com',
    firstName: 'Fat',
    lastName: 'Cat',
    username: 'fatcat',
    password: '123456',
    avatarUrl: 'some-url',
  },
  {
    _id: 2,
    email: 'kittyliapi@gmail.com',
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
        username: { type: 'text', label: 'Username:' },
        password: { type: 'password', label: 'Password:' },
      },
      authorize: async ({ username, password }, req) => {
        const foundUser = await User.findOne({ username })
        if (!foundUser) return null

        const isPasswordsMatching = foundUser.password === password // compare hashish
        if (!isPasswordsMatching) return null

        return foundUser // we will add some of its data to JWT payload
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],

  callbacks: {
    signIn: async ({ account, profile, user }) => {
      // for credentials auth, user => foundUser (fetched from DB above)
      // for OAuth, user => oauthUser of { id, name, email, image }...using this info, fetch or create the DB user

      // account.type can be 'credentials' | 'oauth' | 'email' | 'magiclink'
      // `profile` only defined for OAuth log in

      if (account.type === 'oauth') {
        const oAuth = {
          provider: account.provider,
          id: account.providerAccountId,
        }

        let oauthUser = await User.findOne({ oAuth })

        if (!oauthUser) {
          // following profile fields are specific to google OAuth though. Facebook or GitHub will be different, for example
          oauthUser = await new User({
            oAuth,
            firstName: profile.given_name,
            lastName: profile.family_name,
            email: profile.email,
            avatarUrl: profile.picture,
          }).save()
        }

        // `user` cannot be reassigned to the DB user...my crappy workaround:
        for (const key in user) delete user[key]
        for (const key in foundUser) user[key] = oauthUser[key]

        // `jwt` cb's `user` will now always be a DB user, irrespective of sign in strategy
        // this means we can add user data predictably to JWT payload
      }

      return true
    },

    jwt: ({ token, user }) => {
      if (user) {
        const tokenUser = {
          _id: user._id,
          email: user.email,
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

    session: async ({ token, session }) => {
      if (session) {
        const { password, ...foundUser } = await User.findById(token.user._id)
        session.user = foundUser
      }

      return session
    },
  },
}
