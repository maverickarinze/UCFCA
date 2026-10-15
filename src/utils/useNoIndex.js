import { useEffect } from 'react'

// Keeps private pages (officer area, member attendance) out of search results.
export default function useNoIndex() {
  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.append(tag)
    return () => tag.remove()
  }, [])
}
