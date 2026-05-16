import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

/**
 * 💡 開発者メモ:
 * エラー解消のため、@plasmohq/storage が正しくインストールされていることを前提としています。
 * グラデーションヘッダー、ストレージ同期、使い方の説明、GitHubリンクを統合しました。
 */

const IndexPopup = () => {
  // ストレージを利用して設定を永続化（各画面のContent Scriptと同期します）
  const [isSearchActive, setIsSearchActive] = useStorage("isSearchActive", true)
  const [isSearchListActive, setIsSearchListActive] = useStorage(
    "isSearchListActive",
    true
  )
  const [isDetailActive, setIsDetailActive] = useStorage("isDetailActive", true)

  return (
    <div
      style={{
        width: "320px",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        color: "#001C0C",
        boxSizing: "border-box",
        overflow: "hidden"
      }}>
      {/* 💡 ヘッダー部分：左右にグラデーションをかけて洗練された印象に */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #166524 0%, #1F8C32 50%, #2eb845 100%)",
          color: "#ffffff",
          padding: "20px 16px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)"
        }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.2rem",
            fontWeight: "bold",
            letterSpacing: "0.05em",
            textShadow: "0 1px 2px rgba(0,0,0,0.2)"
          }}>
          Okaeri-Hokudai-Syllabus
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: "0.8rem", opacity: 0.9 }}>
          北大シラバスダッシュボード
        </p>
      </div>

      {/* メイン設定エリア */}
      <div style={{ padding: "20px 16px" }}>
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "0.95rem",
            color: "#1F8C32",
            borderLeft: "4px solid #1F8C32",
            paddingLeft: "8px",
            lineHeight: "1"
          }}>
          機能の有効化
        </h3>

        {/* 設定トグル群 */}
        {[
          {
            id: "isSearchActive",
            label: "検索入力",
            desc: "シラバス検索への適用のオンオフ",
            state: isSearchActive,
            setter: setIsSearchActive
          },
          {
            id: "isSearchListActive",
            label: "検索結果",
            desc: "シラバス検索結果への適用のオンオフ",
            state: isSearchListActive,
            setter: setIsSearchListActive
          },
          {
            id: "isDetailActive",
            label: "詳細",
            desc: "シラバス詳細画面への適用のオンオフ",
            state: isDetailActive,
            setter: setIsDetailActive
          }
        ].map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px"
            }}>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#666" }}>
                {item.desc}
              </div>
            </div>
            <input
              type="checkbox"
              checked={item.state}
              onChange={(e) => item.setter(e.target.checked)}
              style={{
                width: "20px",
                height: "20px",
                cursor: "pointer",
                accentColor: "#1F8C32"
              }}
            />
          </div>
        ))}

        {/* 💡 使い方ガイダンス */}
        <div
          style={{
            marginTop: "24px",
            padding: "14px",
            backgroundColor: "#f9f9f9",
            border: "1px solid #eeeeee",
            borderRadius: "10px",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)"
          }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: "bold",
              color: "#1F8C32",
              marginBottom: "6px"
            }}>
            使い方
          </div>
          <div
            style={{ fontSize: "0.75rem", color: "#444", lineHeight: "1.6" }}>
            ポップアップから必要な機能だけをON/OFF切り替えできます✓
            <br />
            切り替えるだけで自動保存され、対象ページをリロードすると反映されます
          </div>
        </div>

        {/* プロジェクトリンク */}
        <div
          style={{
            marginTop: "24px",
            padding: "12px",
            backgroundColor: "#f0f7f1",
            borderRadius: "10px",
            textAlign: "center"
          }}>
          <a
            href="https://github.com/usata-ro/hokudai-syllabus"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.8rem",
              color: "#006085",
              textDecoration: "none",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
            <svg
              height="18"
              width="18"
              viewBox="0 0 16 16"
              style={{ fill: "currentColor" }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            GitHub: usata-ro/hokudai-syllabus
          </a>
        </div>

        {/* 開発者クレジット */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "12px",
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#888",
            lineHeight: "1.5"
          }}>
          Version 1.0.0
          <br />
          Developed for hokudai by usata
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
