import { Role } from '@prisma/client'

export type UserWithRelations = {
  id: string
  name: string | null
  email: string
  role: Role
  username: string | null
  teamId: string | null
  orgCompanyId: string | null
  createdAt: Date
  team: {
    id: string
    name: string
  } | null
  orgCompany: {
    id: string
    name: string
  } | null
}
