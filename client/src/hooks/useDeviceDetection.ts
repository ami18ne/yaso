import { useState, useEffect, useCallback } from 'react'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  isLandscape: boolean
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  isHighDPI: boolean
  prefersReducedMotion: boolean
  prefersColorScheme: 'light' | 'dark'
  prefersContrast: boolean
  hasNotch: boolean
}

/**
 * Hook for detecting device characteristics and responsive behavior
 * Provides real-time updates to device properties
 */
export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo())

  const updateDeviceInfo = useCallback(() => {
    setDeviceInfo(getDeviceInfo())
  }, [])

  useEffect(() => {
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    // Listen for media query changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: more)')

    darkModeQuery.addEventListener('change', updateDeviceInfo)
    reducedMotionQuery.addEventListener('change', updateDeviceInfo)
    contrastQuery.addEventListener('change', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
      darkModeQuery.removeEventListener('change', updateDeviceInfo)
      reducedMotionQuery.removeEventListener('change', updateDeviceInfo)
      contrastQuery.removeEventListener('change', updateDeviceInfo)
    }
  }, [updateDeviceInfo])

  return deviceInfo
}

/**
 * Get current device information
 */
function getDeviceInfo(): DeviceInfo {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const pixelRatio = window.devicePixelRatio || 1

  // Detect device type
  const isMobile = screenWidth < 641
  const isTablet = screenWidth >= 641 && screenWidth < 1025
  const isDesktop = screenWidth >= 1025

  // Detect touch capability
  const isTouchDevice = () => {
    return (
      (typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0) ||
          ((navigator as any).msMaxTouchPoints !== undefined && (navigator as any).msMaxTouchPoints > 0))) ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    )
  }

  // Detect orientation
  const isLandscape = screenWidth > screenHeight

  // Detect high DPI
  const isHighDPI = pixelRatio >= 2

  // Detect accessibility preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches

  // Detect notch (for iPhone 12/13)
  const hasNotch = CSS.supports('padding-top', 'max(0px)') &&
    (screenWidth === 390 || screenWidth === 844 || screenWidth === 1179)

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: isTouchDevice(),
    isLandscape,
    screenWidth,
    screenHeight,
    pixelRatio,
    isHighDPI,
    prefersReducedMotion,
    prefersColorScheme,
    prefersContrast,
    hasNotch,
  }
}

/**
 * Hook to get breakpoint-specific boolean
 */
export function useBreakpoint(breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'): boolean {
  const { screenWidth } = useDeviceDetection()

  const breakpoints = {
    'xs': 320,
    'sm': 480,
    'md': 640,
    'lg': 1024,
    'xl': 1280,
    '2xl': 1536,
  }

  return screenWidth >= breakpoints[breakpoint]
}

/**
 * Hook for touch detection and handling
 */
export function useTouchDetection() {
  const { isTouchDevice } = useDeviceDetection()

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Provide haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Optional haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(5)
    }
  }, [])

  return {
    isTouchDevice,
    handleTouchStart,
    handleTouchEnd,
  }
}

/**
 * Hook for safe area detection (notch support)
 */
export function useSafeArea() {
  const { hasNotch, isLandscape } = useDeviceDetection()

  const safeAreaInsetTop = hasNotch && !isLandscape ? 'env(safe-area-inset-top)' : '0'
  const safeAreaInsetBottom = hasNotch ? 'env(safe-area-inset-bottom)' : '0'
  const safeAreaInsetLeft = hasNotch && isLandscape ? 'env(safe-area-inset-left)' : '0'
  const safeAreaInsetRight = hasNotch && isLandscape ? 'env(safe-area-inset-right)' : '0'

  return {
    top: safeAreaInsetTop,
    bottom: safeAreaInsetBottom,
    left: safeAreaInsetLeft,
    right: safeAreaInsetRight,
  }
}
