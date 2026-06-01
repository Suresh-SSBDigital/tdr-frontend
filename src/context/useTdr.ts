import { useContext } from 'react'
import { TdrContext } from './TDRContext'

export const useTdr = () => {
  const context = useContext(TdrContext)
  if (!context) {
    throw new Error('useTdr must be used within TdrProvider')
  }
  return context
}
