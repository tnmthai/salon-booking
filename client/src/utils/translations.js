// Re-export from unified i18n module (backward compatibility)
export { setLanguage, getLanguage, t } from './i18n'

import { getLanguage, t } from './i18n'

// Keep the proxy pattern for any code that imports `translations` as an object
export const translations = new Proxy({}, {
  get(_, prop) {
    if (prop === 'then') return undefined // React thenable check
    return t(prop)
  }
})
