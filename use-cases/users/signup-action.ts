'use server'

import { getLogger, LoggerModule } from '@/services/logger/logger'
import { signupUseCase } from './signup-use-case'

export async function signupAction(args: {
  email: string
  password: string
  name?: string
}) {
  const log = getLogger({ module: LoggerModule.App })

  return signupUseCase({
    email: args.email,
    password: args.password,
    name: args.name,
    log,
  })
}
