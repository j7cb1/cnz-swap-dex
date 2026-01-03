'use client'

import { useIsMobile as useIsMobileBase } from './use-is-mobile'

export function useIsMobile(): boolean {
  const { isMobile } = useIsMobileBase()
  return isMobile
}
