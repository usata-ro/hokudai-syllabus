import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

const Toggle = ({
  checked,
  onChange
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "44px",
        height: "24px",
        backgroundColor: checked ? "#1F8C32" : "#ccc",
        borderRadius: "12px",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        display: "flex",
        alignItems: "center",
        padding: "0 2px",
        boxSizing: "border-box"
      }}>
      <div
        style={{
          width: "20px",
          height: "20px",
          backgroundColor: "#fff",
          borderRadius: "50%",
          position: "absolute",
          left: checked ? "22px" : "2px",
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
        }}
      />
    </div>
  )
}

const IndexPopup = () => {
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
      <div
        style={{
          background:
            "linear-gradient(135deg, #4CAF50 0%, #1F8C32 50%, #166524 100%)",
          color: "#ffffff",
          padding: "18px 16px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          borderBottom: "1px solid #d1e6d5"
        }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: "bold",
            letterSpacing: "0.05em",
            color: "#ffffff",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)"
          }}>
          北大シラバス検索システム
        </h2>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "0.8rem",
            opacity: 0.9,
            color: "#ffffff",
            fontWeight: "bold"
          }}>
          Okaeri Syllabus in Hokudai
        </p>
      </div>

      {/* メイン設定エリア */}
      <div style={{ padding: "20px 16px" }}>
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "0.9rem",
            color: "#1F8C32",
            borderLeft: "4px solid #1F8C32",
            paddingLeft: "8px",
            lineHeight: "1",
            fontWeight: "bold"
          }}>
          機能の有効化 / Enable Features
        </h3>

        {/* 設定トグル群 */}
        {[
          {
            id: "isSearchActive",
            label: "検索入力",
            desc: "Search Page",
            state: isSearchActive,
            setter: setIsSearchActive
          },
          {
            id: "isSearchListActive",
            label: "検索結果",
            desc: "Search Results",
            state: isSearchListActive,
            setter: setIsSearchListActive
          },
          {
            id: "isDetailActive",
            label: "詳細表示",
            desc: "Details Page",
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
              marginBottom: "18px",
              padding: "4px 0"
            }}>
            <div style={{ flex: 1, paddingRight: "12px" }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  marginBottom: "2px"
                }}>
                {item.label}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#666" }}>
                {item.desc}
              </div>
            </div>
            {/* 💡 トグルスイッチへの置き換え */}
            <Toggle
              checked={!!item.state}
              onChange={(val) => item.setter && item.setter(val)}
            />
          </div>
        ))}

        {/* GitHubリンク */}
        <div
          style={{
            marginTop: "20px",
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
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
            fontSize: "0.7rem",
            color: "#999",
            lineHeight: "1.5"
          }}>
          Version 2.0.1 | Okaeri Syllabus in Hokudai
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
