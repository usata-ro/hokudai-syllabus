import React, { useState } from "react"

const IndexPopup = () => {
  // 💡 各画面のON/OFF状態を個別に管理
  const [isSearchActive, setIsSearchActive] = useState(true) // search.tsx
  const [isSearchListActive, setIsSearchListActive] = useState(true) // search-list.tsx
  const [isDetailActive, setIsDetailActive] = useState(true) // detail.tsx

  return (
    <div
      style={{
        width: "320px",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        color: "#001C0C"
      }}>
      {/* ヘッダー部分（北大グリーン） */}
      <div
        style={{
          backgroundColor: "#1F8C32",
          color: "#ffffff",
          padding: "16px",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: "bold",
            letterSpacing: "0.05em"
          }}>
          Okaeri-Hokudai-Syllabus
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "0.75rem", opacity: 0.8 }}>
          北大シラバスダッシュボード
        </p>
      </div>

      {/* コンテンツ設定部分 */}
      <div style={{ padding: "16px" }}>
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "0.9rem",
            color: "#1F8C32",
            borderBottom: "1px solid #d1e6d5",
            paddingBottom: "4px"
          }}>
          機能の有効化
        </h3>

        {/* 1. 検索入力画面 (search.tsx) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px"
          }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
              検索入力
            </div>
            <div style={{ fontSize: "0.7rem", color: "#666" }}>
              シラバス検索への適用のオンオフ
            </div>
          </div>
          <input
            type="checkbox"
            checked={isSearchActive}
            onChange={(e) => setIsSearchActive(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
        </div>

        {/* 2. 検索結果一覧画面 (search-list.tsx) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px"
          }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
              検索結果
            </div>
            <div style={{ fontSize: "0.7rem", color: "#666" }}>
              シラバス検索結果への適用のオンオフ
            </div>
          </div>
          <input
            type="checkbox"
            checked={isSearchListActive}
            onChange={(e) => setIsSearchListActive(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
        </div>

        {/* 3. シラバス詳細画面 (detail.tsx) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px"
          }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>詳細</div>
            <div style={{ fontSize: "0.7rem", color: "#666" }}>
              シラバス詳細画面への適用のオンオフ
            </div>
          </div>
          <input
            type="checkbox"
            checked={isDetailActive}
            onChange={(e) => setIsDetailActive(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
        </div>

        {/* 💡 GitHubリンクセクション */}
        <div
          style={{
            marginTop: "24px",
            padding: "10px",
            backgroundColor: "#f5faf6",
            borderRadius: "8px",
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
              gap: "6px"
            }}>
            <svg
              height="16"
              width="16"
              viewBox="0 0 16 16"
              style={{ fill: "currentColor" }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            GitHub: usata-ro/hokudai-syllabus
          </a>
        </div>

        {/* フッター */}
        <div
          style={{
            marginTop: "16px",
            paddingTop: "8px",
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
            fontSize: "0.7rem",
            color: "#999",
            lineHeight: "1.4"
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
