/**
 * Browser detection and mobile-specific utilities
 */

export interface BrowserInfo {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isPrivateMode: boolean | null
  userAgent: string
}

export function getBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isPrivateMode: null,
      userAgent: 'SSR'
    }
  }

  const userAgent = navigator.userAgent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
  const isAndroid = /Android/.test(userAgent)
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
  const isChrome = /Chrome/.test(userAgent)
  const isFirefox = /Firefox/.test(userAgent)

  return {
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    isPrivateMode: detectPrivateMode(),
    userAgent
  }
}

function detectPrivateMode(): boolean | null {
  if (typeof window === 'undefined') return null

  try {
    // Test localStorage availability
    const testKey = '__private_mode_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return false
  } catch {
    return true
  }
}

export function logBrowserInfo(): void {
  const info = getBrowserInfo()
  console.log('[Browser Info]', {
    ...info,
    localStorage: typeof Storage !== 'undefined' && window.localStorage ? 'available' : 'unavailable',
    sessionStorage: typeof Storage !== 'undefined' && window.sessionStorage ? 'available' : 'unavailable'
  })
}
