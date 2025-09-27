import * as React from "react"

// Breakpoints optimized for Z Fold phones and modern devices
const MOBILE_BREAKPOINT = 768
const Z_FOLD_OUTER_WIDTH = 316 // Samsung Z Fold outer screen width
const Z_FOLD_INNER_WIDTH = 374 // Samsung Z Fold inner screen width (unfolded)
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Enhanced hook for different device types
export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop' | 'z-fold'>('mobile')
  const [screenWidth, setScreenWidth] = React.useState<number>(0)

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth
      setScreenWidth(width)
      
      // Z Fold specific detection
      if (width >= Z_FOLD_OUTER_WIDTH && width <= Z_FOLD_INNER_WIDTH + 50) {
        setDeviceType('z-fold')
      } else if (width < MOBILE_BREAKPOINT) {
        setDeviceType('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    const mql = window.matchMedia('(max-width: 1024px)')
    mql.addEventListener('change', updateDeviceType)
    updateDeviceType()
    
    // Also listen for resize events for more responsive updates
    window.addEventListener('resize', updateDeviceType)
    
    return () => {
      mql.removeEventListener('change', updateDeviceType)
      window.removeEventListener('resize', updateDeviceType)
    }
  }, [])

  return {
    deviceType,
    screenWidth,
    isMobile: deviceType === 'mobile' || deviceType === 'z-fold',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isZFold: deviceType === 'z-fold'
  }
}

// Hook specifically for responsive table behavior
export function useResponsiveBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('xs')
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < 480) {
        setBreakpoint('xs') // Very small screens, Z Fold outer
      } else if (width < 640) {
        setBreakpoint('sm') // Small screens, Z Fold inner
      } else if (width < 768) {
        setBreakpoint('md') // Medium screens
      } else if (width < 1024) {
        setBreakpoint('lg') // Large screens
      } else {
        setBreakpoint('xl') // Extra large screens
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])
  
  return breakpoint
}
