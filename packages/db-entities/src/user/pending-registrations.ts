import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

const USERNAME_LENGTH_LIMIT = Number(process.env.USERNAME_LENGTH_LIMIT)
const EMAIL_LENGTH_LIMIT = Number(process.env.EMAIL_LENGTH_LIMIT)

@Entity('pending_user_registrations')
export class PendingUserRegistration {
  @PrimaryColumn('uuid')
  id!: string

  @Column('varchar', { length: EMAIL_LENGTH_LIMIT })
  email!: string

  @Column('varchar', { length: USERNAME_LENGTH_LIMIT })
  username!: string

  @Column('varchar')
  password!: string

  @Column({ type: 'bigint', nullable: true })
  expiresAt?: number

  // Email verification flow
  @Column('varchar', { nullable: true })
  emailVerifyToken?: string

  @Column({ type: 'bigint', nullable: true })
  emailTokenExpiresAt?: number

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt?: Date

  @Column({ type: 'int', default: 0 })
  tokenRegenerationAttempts!: number

  @Column('varchar', { nullable: true })
  ipAddress?: string

  @Column('varchar', { nullable: true })
  userAgent?: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
