import { useEffect } from 'react'

export default function CustomCursor() {
  useEffect(() => {
    // Create cursor elements
    const cursor = document.createElement('div')
    cursor.id = 'custom-cursor'
    document.body.appendChild(cursor)

    const ring = document.createElement('div')
    ring.id = 'custom-cursor-ring'
    document.body.appendChild(ring)

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      cursor.style.left = mouseX + 'px'
      cursor.style.top = mouseY + 'px'
    }

    // Smooth ring follow
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15
      ringY += (mouseY - ringY) * 0.15
      ring.style.left = ringX + 'px'
      ring.style.top = ringY + 'px'
      requestAnimationFrame(animateRing)
    }

    const onMouseDown = () => {
      cursor.classList.add('cursor-click')
    }
    const onMouseUp = () => {
      cursor.classList.remove('cursor-click')
    }

    // Hover detection — zoom in on interactive elements
    const hoverTargets = 'a, button, input, select, textarea, [role="button"], .card, .sidebar-link, [data-hover]'

    const onMouseOver = (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.add('cursor-hover')
        ring.classList.add('cursor-hover')
      }
    }
    const onMouseOut = (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.remove('cursor-hover')
        ring.classList.remove('cursor-hover')
      }
    }

    const onMouseLeave = () => {
      cursor.style.opacity = '0'
      ring.style.opacity = '0'
    }
    const onMouseEnter = () => {
      cursor.style.opacity = '1'
      ring.style.opacity = '1'
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
    document.documentElement.addEventListener('mouseenter', onMouseEnter)

    animateRing()

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
      document.documentElement.removeEventListener('mouseenter', onMouseEnter)
      cursor.remove()
      ring.remove()
    }
  }, [])

  return null
}