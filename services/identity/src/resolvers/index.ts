import { mergeResolvers } from '@graphql-tools/merge'
import * as userResolvers from './user.resolver'

export const resolvers = mergeResolvers([userResolvers])
