import { userRepository } from '@/repositories'

const getAllUsers = async () => {
  return await userRepository.getAllUsers()
}

export const Query = {
  getAllUsers,
}
