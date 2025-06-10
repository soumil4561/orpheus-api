import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { makeExecutableSchema } from '@graphql-tools/schema'
import { gql } from 'graphql-tag'

import { resolvers } from '@/resolvers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const typeDefs = gql`
  ${readFileSync(join(__dirname, 'schema.graphql'), 'utf8')}
`

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
