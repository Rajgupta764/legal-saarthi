import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param {Object} options - IntersectionObserver options
 * @returns {[React.RefObject, boolean]} - Ref to attach and visibility state
 */
export const useScrollAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef(null)

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
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
          if (defaultOptions.triggerOnce) {
            observer.disconnect()
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

    return () => observer.disconnect()
  }, [])

  return [elementRef, isVisible]
}

/**
 * Animated Section Wrapper Component
 */
export const AnimatedSection = ({ 
  children, 
  animation = 'fade-in-up',
  delay = 0,
  className = '',
  ...props 
}) => {
  const [ref, isVisible] = useScrollAnimation()

  const animationClasses = {
    'fade-in-up': 'animate-fade-in-up',
    'fade-in-down': 'animate-fade-in-down',
    'fade-in-left': 'animate-fade-in-left',
    'fade-in-right': 'animate-fade-in-right',
    'scale-in': 'animate-scale-in',
  }

  return (
    <div
      ref={ref}
      className={`
        ${className}
        ${isVisible ? animationClasses[animation] : 'opacity-0'}
      `}
      style={{ 
        animationDelay: isVisible ? `${delay}ms` : '0ms',
        animationFillMode: 'forwards'
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Staggered children animation wrapper
 */
export const StaggeredContainer = ({ 
  children, 
  staggerDelay = 100,
  animation = 'fade-in-up',
  className = '' 
}) => {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <div
              key={index}
              className={isVisible ? `animate-${animation}` : 'opacity-0'}
              style={{ 
                animationDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
                animationFillMode: 'forwards'
              }}
            >
              {child}
            </div>
          ))
        : children
      }
    </div>
  )
}

export default useScrollAnimation
