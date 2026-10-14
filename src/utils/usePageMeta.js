import { useEffect } from 'react'

const SITE_TITLE = 'Ultimate Clique of Friends Club Abuja | UCFCA'
const descriptionTag = document.querySelector('meta[name="description"]')
const SITE_DESCRIPTION = descriptionTag?.getAttribute('content') ?? ''

// Sets the browser tab title and meta description for the current page.
export default function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | UCFCA` : SITE_TITLE
    descriptionTag?.setAttribute('content', description || SITE_DESCRIPTION)
  }, [title, description])
}
