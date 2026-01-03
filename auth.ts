import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { validateCredentialsUseCase } from '@/use-cases/auth/validate-credentials-use-case'
import { getLogger, LoggerModule } from '@/services/logger/logger'
import { Role } from './utilities/roles'

export const { handlers, signIn, signOut, auth } = NextAuth({
  logger: {
    error: () => {},
  },
  providers: [
    Credentials({
      id: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const log = getLogger({ module: LoggerModule.App })

        const { data: user, error: authError } = await validateCredentialsUseCase({
          email: credentials.email as string,
          password: credentials.password as string,
          log,
        })

        if (authError) {
          return null
        }

        return user
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})
