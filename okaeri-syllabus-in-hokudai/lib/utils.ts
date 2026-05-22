// 🌟 1. 文字列に日本語が含まれているかを判定（全体の20%以上が日本語文字ならtrue）
export const isJapaneseText = (text: string): boolean => {
  if (!text) return false
  const jpCount = (text.match(/[\u3040-\u30FF\u4E00-\u9FFF]/g) || []).length
  return jpCount >= text.length * 0.2
}

// 🌟 2. innerHTMLを排除した安全なテキスト抽出・言語分割
export const splitLang = (cell: HTMLTableCellElement | null) => {
  if (!cell) return { ja: "", en: "" }

  let text = ""
  // innerHTMLの代わりにchildNodesを辿って安全にテキストを復元
  cell.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent
    } else if (node.nodeName.toLowerCase() === "br") {
      text += "\n"
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      text += node.textContent
    }
  })

  const lines = text
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p !== "")

  const jaLines: string[] = []
  const enLines: string[] = []

  lines.forEach((line) => {
    if (isJapaneseText(line)) {
      jaLines.push(line)
    } else {
      enLines.push(line)
    }
  })

  return {
    ja: jaLines.join("\n") || "",
    en: enLines.length > 0 ? enLines.join("\n") : jaLines.join("\n") || ""
  }
}

// 🌟 3. キャッシュのLRU化（無限肥大化防止）
export const cleanCache = async (
  storage: any,
  key: string,
  newEntries: Record<string, any>,
  max: number = 1000
) => {
  const oldCache = (await storage.get(key)) || {}
  const merged = { ...oldCache, ...newEntries }

  const keys = Object.keys(merged)
  if (keys.length > max) {
    const keysToRemove = keys.slice(0, keys.length - max)
    keysToRemove.forEach((k) => delete merged[k])
  }

  await storage.set(key, merged)
}

// 🌟 4. デバウンス関数（サーバー負荷軽減・連打防止用）
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
) => {
  // 💡 修正：NodeJS.Timeout から ReturnType<typeof setTimeout> に変更
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 🌟 5. MutationObserverによるDOM更新完了検知（安全な抽出の保証）
export const observeDOM = (
  targetNode: Node,
  callback: () => void,
  timeoutMs: number = 150
) => {
  // 💡 修正：NodeJS.Timeout から ReturnType<typeof setTimeout> に変更
  let timeoutId: ReturnType<typeof setTimeout>
  
  const observer = new MutationObserver(() => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      observer.disconnect()
      callback()
    }, timeoutMs)
  })

  // 初回もタイマーをセットしておく（変更が起きなかった場合への備え）
  timeoutId = setTimeout(() => {
    observer.disconnect()
    callback()
  }, timeoutMs)

  observer.observe(targetNode, { childList: true, subtree: true })
  return observer
}