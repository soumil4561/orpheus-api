import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

// Load values from env with defaults (must be numbers)
const USERNAME_LENGTH_LIMIT = Number(process.env.USERNAME_LENGTH_LIMIT)
const EMAIL_LENGTH_LIMIT = Number(process.env.EMAIL_LENGTH_LIMIT)

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('varchar', { length: USERNAME_LENGTH_LIMIT })
  username!: string

  @Column('varchar', { length: EMAIL_LENGTH_LIMIT })
  email!: string

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
