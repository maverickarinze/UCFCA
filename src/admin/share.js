// Sharing setup links with members by WhatsApp or copy/paste.

// 08031234567 / +2348031234567 -> 2348031234567 (the form wa.me expects), else null.
export function whatsappNumber(phone) {
  const d = (phone ?? '').replace(/\D/g, '')
  if (/^0[789]\d{9}$/.test(d)) return '234' + d.slice(1)
  if (/^234[789]\d{9}$/.test(d)) return d
  return null
}

export function setupUrl(token) {
  return `${window.location.origin}/setup?token=${token}`
}

export function setupMessage(fullName, url) {
  const first = fullName.split(' ')[0]
  return (
    `Hi ${first}, here is your personal UCFCA meeting check-in link: ${url}\n\n` +
    'Open it on your phone and choose a 4-digit PIN. It works once and expires in 14 days. ' +
    'At meetings, just scan the code on screen to check in.'
  )
}

// With a usable number WhatsApp opens that chat; otherwise it asks who to send to.
export function whatsappLink(phone, text) {
  const number = whatsappNumber(phone)
  return `https://wa.me/${number ?? ''}?text=${encodeURIComponent(text)}`
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.append(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    textarea.remove()
    return ok
  }
}
