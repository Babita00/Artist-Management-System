import bcrypt from 'bcrypt'
import { User } from '../../types'
import { createUserInDb, findUserByEmail } from '../repositories/user.repository'
import { generateToken } from '../utils/jwt'

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')

export const registerSuperAdmin = async (
  userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'role'>
) => {
  const existingUser = await findUserByEmail(userData.email)

  if (existingUser) {
    throw new Error('Email already exists')
  }

  if (!userData.password) {
    throw new Error('Password is required')
  }

  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS)

  const newUser = await createUserInDb({
    ...userData,
    password: hashedPassword,
    role: 'super_admin',
  })

  // Exclude password from the return object
  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

export const loginUser = async (email: string, passwordString: string) => {
  const user = await findUserByEmail(email)
  if (!user || !user.password) {
    throw new Error('Invalid email or password')
  }

  const isPasswordValid = await bcrypt.compare(passwordString, user.password)
  if (!isPasswordValid) {
    throw new Error('Invalid email or password')
  }

  const token = generateToken(user)

  // Exclude password from the return object
  const { password, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword,
    token,
  }
}

export const logoutUser = async (token?: string) => {
  return true
}
