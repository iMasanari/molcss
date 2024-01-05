export { SSRProvider, type SSRProviderProps } from './nextjs.use-client'

export const createCache = () => new Map<string, string>()
