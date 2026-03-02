import bcrypt from 'bcrypt'
import {
  countAllUsers,
  findUsersPaginated,
  findUserById,
  findUserByEmail,
  createUserInDb,
  updateUserInDb,
  deleteUserInDb,
} from '../repositories/user.repository'
import { User } from '../../types'
import { paginate } from '../utils/pagination'

export const getAllUsers = async (page?: number, limit?: number) => {
  return paginate(
    page,
    limit,
    async (limit, offset) => findUsersPaginated(limit, offset),
    async () => countAllUsers()
  )
}

export const getUserById = async (id: string) => {
  return findUserById(id)
}

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
  const existingUser = await findUserByEmail(userData.email)
  if (existingUser) {
    throw new Error('Email already in use')
  }

  let hashedPassword = ''
  if (userData.password) {
    hashedPassword = await bcrypt.hash(userData.password, 10)
  } else {
    throw new Error('Password is required')
  }

  const newUser = {
    ...userData,
    password: hashedPassword,
  }

  return createUserInDb(newUser)
}

export const updateUser = async (id: string, updateData: Partial<User>) => {
  const existingUser = await findUserById(id)
  if (!existingUser) {
    throw new Error('User not found')
  }

  if (updateData.email && updateData.email !== existingUser.email) {
    const emailInUse = await findUserByEmail(updateData.email)
    if (emailInUse) {
      throw new Error('Email already in use by another user')
    }
  }

  const dataToUpdate = { ...updateData }
  if (dataToUpdate.password) {
    dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10)
  }

  return updateUserInDb(id, dataToUpdate)
}

export const deleteUser = async (id: string) => {
  const existingUser = await findUserById(id)
  if (!existingUser) {
    throw new Error('User not found')
  }
  return deleteUserInDb(id)
}
