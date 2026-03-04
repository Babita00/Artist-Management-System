import { Gender } from './gender'
import { Role } from './userRole'
export interface AppBaseEntity {
  id: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
}
export interface User extends AppBaseEntity {
  first_name: string
  last_name: string
  email: string
  password?: string
  phone: string
  dob: Date | string
  gender: Gender
  address: string
  role: Role
}
export interface Artist extends AppBaseEntity {
  name: string
  dob: Date | string
  gender: Gender
  address: string
  first_release_year: number
  no_of_albums_released: number
}
export interface Song extends AppBaseEntity {
  artist_id: string
  title: string
  album_name: string
  genre: string
}
//# sourceMappingURL=index.d.ts.map
