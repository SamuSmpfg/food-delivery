import { useUser } from '@clerk/clerk-expo'

export type Role = 'user' | 'chef'

export function useRole() {
  const { user, isLoaded } = useUser()
  const role: Role = user?.publicMetadata?.role === 'chef' ? 'chef' : 'user'
  return { role, isLoaded }
}