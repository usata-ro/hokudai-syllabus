export const isJapaneseText = (text: string): boolean => {
  if (!text) return false
  const jpCount = (text.match(/[\u3040-\u30FF\u4E00-\u9FFF]/g) || []).length
  return jpCount >= text.length * 0.2
}

export const splitLang = (cell: HTMLTableCellElement | null) => {
  const text = cell?.textContent?.trim() || ""
  if (!text) return { ja: "", en: "" }
  // 簡易判定ロジック
  return isJapaneseText(text) ? { ja: text, en: "" } : { ja: "", en: text }
}

export const cleanCache = async (
  storage: any,
  key: string,
  max: number = 1000
) => {
  const cache = (await storage.get(key)) || {}
  const entries = Object.entries(cache as Record<string, any>)
  if (entries.length <= max) return

  const sorted = entries.sort(
    (a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0)
  )
  const optimized = Object.fromEntries(sorted.slice(0, max))
  await storage.set(key, optimized)
}
