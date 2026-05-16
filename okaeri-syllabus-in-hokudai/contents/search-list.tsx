import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import React, { useEffect, useState } from "react"

// 💡 検索結果ページのURLを指定する
export const config: PlasmoCSConfig = {
  matches: [
    "https://gakumu.academic.hokudai.ac.jp/Portal/Public/Syllabus/SearchMain.aspx*"
  ]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    /* 検索結果ページ専用のスタイルをここに書く */
  `
  return style
}

const SyllabusSearchListUI = () => {
  return (
    <div>
      {/* 検索結果ページ用の新しいUI構造をここにガシガシ書いていく */}
      <h1>ここに新しい検索結果一覧をデザインします</h1>
    </div>
  )
}

export default SyllabusSearchListUI