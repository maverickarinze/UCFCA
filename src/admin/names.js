// Fixes names typed in ALL CAPS or all lowercase ("JOSEPH BABATUNDE", "Henry ETUK",
// "kassim ubaidullah"). Words that already mix capitals on purpose ("McDonald") are
// left alone, as are initials ("E.") and Roman numerals ("II").

const ROMAN = /^(I|II|III|IV|V|VI)$/

function capitalise(part) {
  return part.charAt(0).toLocaleUpperCase() + part.slice(1).toLocaleLowerCase()
}

function tidyWord(word) {
  const letters = word.replace(/[^\p{L}]/gu, '')
  if (letters.length <= 1 || ROMAN.test(word)) return word
  const allCaps = letters === letters.toLocaleUpperCase()
  const allLower = letters === letters.toLocaleLowerCase()
  if (!allCaps && !allLower) return word
  // Capitalise each part of hyphenated or apostrophe names: Okonkwo-Adebayo, O'Neil.
  return word
    .split(/([-'’])/)
    .map((part) => (/^[-'’]$/.test(part) ? part : capitalise(part)))
    .join('')
}

export function tidyName(name) {
  return name.trim().replace(/\s+/g, ' ').split(' ').map(tidyWord).join(' ')
}
