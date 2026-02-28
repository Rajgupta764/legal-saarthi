import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for animated counter effect
 * @param {number} end - The target number to count to
 * @param {number} duration - Animation duration in milliseconds
 * @param {boolean} enabled - Whether to start the animation
 * @returns {number} - The current animated value
 */
export const useAnimatedCounter = (end, duration = 2000, enabled = true) => {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const startTimeRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      
      // Easing function (easeOutExpo)
      const easeOutExpo = 1 - Math.pow(2, -10 * progress)
      
      const currentCount = Math.floor(easeOutExpo * end)
      
      if (currentCount !== countRef.current) {
        countRef.current = currentCount
        setCount(currentCount)
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setCount(end) // Ensure we end at exact value
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [end, duration, enabled])

  return count
}

/**
 * Custom hook for intersection observer
 * Triggers when element comes into view
 */
export const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef(null)

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
    ...options
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (defaultOptions.triggerOnce && !hasAnimated) {
            setHasAnimated(true)
          }
        } else if (!defaultOptions.triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold: defaultOptions.threshold,
        rootMargin: defaultOptions.rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [hasAnimated, defaultOptions.triggerOnce])

  return [elementRef, isVisible || hasAnimated]
}

/**
 * Animated Counter Component
 */
export const AnimatedCounter = ({ 
  value, 
  suffix = '', 
  prefix = '',
  duration = 2000,
  className = '' 
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3 })
  const count = useAnimatedCounter(value, duration, isVisible)

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  )
}

export default useAnimatedCounter
