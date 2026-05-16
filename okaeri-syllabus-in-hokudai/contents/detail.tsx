import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

// 1. 動作対象のURL設定
export const config: PlasmoCSConfig = {
  matches: [
    "https://gakumu.academic.hokudai.ac.jp/Portal/Public/Syllabus/DetailMain.aspx*"
  ]
}

// 2. スタイルとフォントの注入
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    /* 指定されたWebフォントの読み込み */
    @import url('https://cdn.jsdelivr.net/npm/gen-interface-jp@latest/cdn/400.css');
    @import url('https://cdn.jsdelivr.net/npm/gen-interface-jp@latest/cdn/display-800.css');

    :host {
      --text-color: #001C0C;
      --main-color: #1F8C32;
      --accent-color: #89bf80;
      --bg-color: #ffffff;
      --table-th-bg: #f5faf6;
      --border-color: #d1e6d5;
      --header-text: #ffffff;
      --inazo-color: #006085;
    }

    /* ダークモードへの対応 */
    @media (prefers-color-scheme: dark) {
      :host {
        --text-color: #e6f2ec;
        --main-color: #2eb845;
        --accent-color: #4a7543;
        --bg-color: #0d1a12;
        --table-th-bg: #152b1d;
        --border-color: #21402b;
        --header-text: #e6f2ec;
        --inazo-color: #0a7ea3;
      }
    }

    /* 💡 メインラッパー（全画面を覆い、Flexboxで中央寄せするアプローチに変更） */
    .modern-wrapper {
      min-width: 100vw;
      min-height: 100vh;
      z-index: 10000;
      font-family: "Gen Interface JP", sans-serif;
      font-weight: 400;
      color: var(--text-color);
      background-color: var(--bg-color);
      display: flex;
      flex-direction: column;
      align-items: center; /* 💡 ここで横方向の中央寄せを確実にする */
    }

    /* 上部固定エリア（全幅を維持） */
    .sticky-header-container {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(31, 140, 50, 0.15);
      background-color: var(--bg-color);
      width: 100%;
      min-width: 1100px;
      display: flex;
      flex-direction: column;
      align-items: center; /* 💡 ヘッダーも中央寄せの軸を合わせる */
    }

    /* ヘッダーとコントロールバーの背景を確実に全幅かつ最低1100pxにする */
    .modern-header-bg, .control-bar-bg {
      width: 100%;
      min-width: 1100px;
      display: flex;
      justify-content: center; /* 💡 中身を中央に寄せる */
    }
    
    .modern-header-bg {
      background-color: var(--main-color);
    }

    .control-bar-bg {
      background-color: rgba(137, 191, 128, 0.05);
      border-bottom: 1px solid var(--border-color);
    }
    
    /* ヘッダーの中身（横幅固定1100px） */
    .modern-header {
      width: 1100px;
      color: var(--header-text);
      padding: 12px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .modern-header h1 {
      font-family: "Gen Interface JP Display", sans-serif;
      font-weight: 800;
      margin: 0;
      font-size: 1.25rem;
      letter-spacing: 0.05em;
    }

    .lang-toggle {
      display: inline-flex;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    .lang-btn {
      background: transparent;
      border: none;
      color: var(--header-text);
      padding: 6px 14px;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .lang-btn.active {
      background-color: var(--bg-color);
      color: var(--main-color);
    }

    .lang-btn:not(.active):hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .header-sub-nav {
      display: flex;
      gap: 20px;
      font-size: 0.95rem;
    }

    .header-sub-nav a {
      color: var(--header-text);
      text-decoration: none;
      opacity: 0.8;
      transition: all 0.2s ease;
      font-weight: bold;
    }

    .header-sub-nav a:hover {
      opacity: 1;
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    /* コントロールバーの中身（横幅固定1100px） */
    .control-bar {
      width: 1100px;
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
    }

    .breadcrumb {
      font-size: 0.95rem;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .breadcrumb a {
      color: var(--main-color);
      text-decoration: none;
      font-weight: bold;
      transition: color 0.2s;
    }

    .breadcrumb a:hover {
      color: var(--accent-color);
      text-decoration: underline;
    }

    .breadcrumb span {
      color: var(--accent-color);
    }
    
    .button-group {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-common {
      background-color: var(--bg-color);
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-family: "Gen Interface JP", sans-serif;
      font-weight: bold;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-back {
      color: var(--main-color);
      border: 1px solid var(--main-color);
    }

    .btn-back:hover {
      background-color: var(--main-color);
      color: #ffffff;
      box-shadow: 0 4px 8px rgba(31, 140, 50, 0.2);
      transform: translateY(-1px);
    }

    .btn-inazo {
      color: var(--inazo-color);
      border: 1px solid var(--inazo-color);
    }

    .btn-inazo:hover {
      background-color: var(--inazo-color);
      color: #ffffff;
      box-shadow: 0 4px 8px rgba(0, 96, 133, 0.2);
      transform: translateY(-1px);
    }

    /* メインコンテンツ（横幅固定1100px） */
    .main-content {
      width: 1100px;
      padding: 40px 32px;
      box-sizing: border-box;
    }

    /* カード型・2列グリッドレイアウト */
    .syllabus-card {
      background-color: var(--border-color);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 28, 12, 0.06);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .syllabus-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background-color: var(--border-color);
    }

    .syllabus-item {
      display: flex;
      background-color: var(--bg-color);
    }

    .syllabus-item.full-width {
      grid-column: span 2;
    }

    .syllabus-item-label {
      background-color: var(--table-th-bg);
      flex: 0 0 200px;
      padding: 16px 20px;
      font-family: "Gen Interface JP Display", sans-serif;
      font-weight: 800;
      font-size: 1.15rem;
      color: var(--text-color);
      position: relative;
      box-sizing: border-box;
      border-right: 1px solid var(--border-color);
    }

    .syllabus-item-label::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: var(--accent-color);
    }

    .syllabus-item-value {
      flex: 1;
      padding: 16px 20px;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 1.15rem;
      line-height: 1.75;
      box-sizing: border-box;
    }

    /* コンパクト版の表（前半の基本情報用） */
    .syllabus-grid.compact .syllabus-item-label,
    .syllabus-grid.compact .syllabus-item-value {
      padding: 10px 16px;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    /* テキスト内URLのリンクデザイン */
    .auto-link {
      color: var(--inazo-color);
      text-decoration: none;
      font-weight: bold;
    }
    .auto-link:hover {
      text-decoration: underline;
    }

    /* ブラウザの印刷機能対応 */
    @media print {
      .modern-wrapper {
        position: static !important;
        height: auto !important;
        width: 100% !important;
        min-width: 0 !important;
        overflow: visible !important;
      }
      .sticky-header-container {
        display: none !important;
      }
      .main-content {
        padding: 0 !important;
        margin: 0 !important;
      }
      .syllabus-card {
        box-shadow: none !important;
        border: 1px solid #ccc !important;
      }
      .syllabus-grid {
        background-color: #ccc !important;
      }
      .syllabus-item-label {
        background-color: #f9f9f9 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `
  return style
}

// 3. データ抽出定義
type TargetData = {
  id: string
  fallbackIds?: string[]
  ja: string
  en: string
  fullWidth: boolean
}

const targetDataList: TargetData[] = [
  {
    id: "ctl00_phContents_ucSummary_txtsbj_name_double_lbl",
    ja: "科目名",
    en: "Course Title",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucSummary_txttheme_name_double_lbl",
    ja: "講義題目",
    en: "Course Theme",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucSummary_txtadmin_staff_alias_double_lbl",
    ja: "責任教員（所属）",
    en: "Responsible Teacher",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucSummary_txtstaff_name_lbl",
    ja: "担当教員（所属）",
    en: "Teacher",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucSummary_txtsbj_area_name_double_lbl",
    ja: "科目種別",
    en: "Course Type",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtother_fac_lbl",
    ja: "他学部履修等の可否",
    en: "Available for other faculties",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtlct_year_lbl",
    ja: "開講年度",
    en: "Year",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtterm_name_lbl",
    ja: "期間",
    en: "Term",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtlct_cd_lbl",
    ja: "時間割番号",
    en: "Timetable Code",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txttype_name_lbl",
    ja: "授業形態",
    en: "Format",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtcredits_lbl",
    ja: "単位数",
    en: "Credits",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtgrad_range_lbl",
    ja: "対象年次",
    en: "Target Year",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtclass_name_double_lbl",
    ja: "対象学科・クラス",
    en: "Target Class",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucSummary_txtsyl_note_lbl",
    ja: "補足事項",
    en: "Notes",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucSummary_txtnumbering_cd_lbl",
    ja: "ナンバリングコード",
    en: "Numbering Code",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtdiv_l_cd_lbl",
    ja: "大分類コード",
    en: "Large Div Code",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtdiv_l_name_double_lbl",
    ja: "大分類名称",
    en: "Large Div Name",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtlevel_cd_lbl",
    ja: "レベルコード",
    en: "Level Code",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtlevel_name_double_lbl",
    ja: "レベル",
    en: "Level",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucSummary_txtdiv_m_cd_lbl",
    ja: "中分類コード",
    en: "Medium Div Code",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtdiv_m_name_double_lbl",
    ja: "中分類名称",
    en: "Medium Div Name",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtdiv_s_cd_lbl",
    ja: "小分類コード",
    en: "Small Div Code",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtdiv_s_name_double_lbl",
    ja: "小分類名称",
    en: "Small Div Name",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtnum_language_name_lbl",
    ja: "言語",
    en: "Language",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucContents_ItemLctDoTypeCd_lblCodeJpnJ",
    ja: "授業実施方式",
    en: "Class Method",
    fullWidth: false
  },
  {
    id: "ctl00_phContents_ucSummary_txtexperienced_name_lbl",
    ja: "実務経験のある教員等による授業科目",
    en: "Class by experienced teachers",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemKeyword_lblNormalJ",
    ja: "教育キーワード",
    en: "Key Words",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemAim_lblNormalJ",
    ja: "授業の目標",
    en: "Course Objectives",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemTarget_lblNormalJ",
    ja: "到達目標",
    en: "Course Goals",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemSchedule_lblNormalJ",
    ja: "授業計画",
    en: "Course Schedule",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemPreStudy_lblNormalJ",
    ja: "準備学習(予習・復習)等の内容と分量",
    en: "Homework",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemGrading_lblNormalJ",
    ja: "成績評価の基準と方法",
    en: "Grading System",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemExperienceNote_lblNormalJ",
    ja: "有する実務経験と授業への活用",
    en: "Practical experience and utilization for classes",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemOtherFacNote_lblNormalJ",
    ja: "他学部履修の条件",
    en: "Condition of tasking the subject",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemText_lblNormalJ",
    fallbackIds: ["ctl00_phContents_ucContents_ItemText_pBooks"],
    ja: "テキスト・教科書",
    en: "Textbooks",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemReference_lblNormalJ",
    fallbackIds: ["ctl00_phContents_ucContents_ItemReference_pBooks"],
    ja: "講義指定図書",
    en: "Reading List",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemUrl_lblNormalJ",
    ja: "参照ホームページ",
    en: "Websites",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemWebsite_lblNormalJ",
    ja: "研究室のホームページ",
    en: "Website of Laboratory",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemNote_lblNormalJ",
    ja: "備考",
    en: "Additional Information",
    fullWidth: true
  },
  {
    id: "ctl00_phContents_ucContents_ItemSDGs_pSDGs",
    fallbackIds: ["ctl00_phContents_ucContents_ItemSDGs_pSDGsPct"],
    ja: "持続可能な開発目標（SDGs）",
    en: "Sustainable Development Goals（SDGs）",
    fullWidth: true
  }
]

type TableRow = {
  id: string
  labelJa: string
  labelEn: string
  valueJa: string
  valueEn: string
  fullWidth: boolean
}

const extractTextWithLinks = (el: HTMLElement | null): string => {
  if (!el) return ""

  let html = el.innerHTML
  html = html.replace(/<br\s*\/?>/gi, "\n")
  html = html.replace(/<\/span>/gi, "</span>\n")
  html = html.replace(/<\/p>/gi, "</p>\n")
  html = html.replace(/<\/div>/gi, "</div>\n")

  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html

  const links = tempDiv.querySelectorAll("a")
  links.forEach((a) => {
    const url = a.href
    if (url && url.startsWith("http") && a.textContent?.trim() !== url) {
      a.textContent = `${a.textContent?.trim()}\n${url}\n`
    }
  })

  let text = tempDiv.textContent || ""

  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n")

  text = text.replace(/\n{3,}/g, "\n\n").trim()

  return text
}

const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+)/g
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="auto-link">
          {part}
        </a>
      )
    }
    return part
  })
}

// 4. メインのUIコンポーネント
const SyllabusModernUI = () => {
  const [tableData, setTableData] = useState<TableRow[]>([])
  const [lang, setLang] = useState<"ja" | "en">("ja")

  useEffect(() => {
    // 元のシラバス要素を非表示にする処理
    const oldForm = document.getElementById("aspnetForm")
    if (oldForm) {
      oldForm.style.display = "none"
    }

    // bodyの最小幅を1100pxに固定し、横スクロールに対応
    document.body.style.overflow = "auto"
    document.body.style.minWidth = "1100px"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.backgroundColor = "#ffffff"

    // データのスクレイピングと「日本語/英語」の自動分離
    const extracted = targetDataList.map((item) => {
      let text = extractTextWithLinks(document.getElementById(item.id))

      if (item.fallbackIds) {
        item.fallbackIds.forEach((fid) => {
          const fallbackText = extractTextWithLinks(
            document.getElementById(fid)
          )
          if (fallbackText) {
            text += (text ? "\n\n" : "") + fallbackText
          }
        })
      }

      text = text || "　"

      let valJa = text
      let valEn = text

      if (!text.includes("\n") && text.endsWith("]")) {
        const lastBracketIndex = text.lastIndexOf("[")
        if (lastBracketIndex !== -1 && lastBracketIndex !== 0) {
          valJa = text.substring(0, lastBracketIndex).trim() || "　"
          valEn =
            text.substring(lastBracketIndex + 1, text.length - 1).trim() || "　"
        }
      }

      return {
        id: item.id,
        labelJa: item.ja,
        labelEn: item.en,
        valueJa: valJa,
        valueEn: valEn,
        fullWidth: item.fullWidth
      }
    })
    setTableData(extracted)
  }, [])

  if (tableData.length === 0) return null

  // --- iNAZO検索用のクエリを取得する処理 ---
  const subjectNameRow = tableData.find(
    (r) => r.id === "ctl00_phContents_ucSummary_txtsbj_name_double_lbl"
  )
  const subjectQuery = encodeURIComponent(subjectNameRow?.valueJa || "")

  const teacherRow = tableData.find(
    (r) => r.id === "ctl00_phContents_ucSummary_txtstaff_name_lbl"
  )
  let teacherName = teacherRow?.valueJa || ""
  if (teacherName.includes("(")) teacherName = teacherName.split("(")[0]
  if (teacherName.includes("（")) teacherName = teacherName.split("（")[0]
  const teacherQuery = encodeURIComponent(teacherName.trim())

  // 「教育キーワード」の位置で表を2つに分割
  const splitIndex = tableData.findIndex(
    (row) => row.id === "ctl00_phContents_ucContents_ItemKeyword_lblNormalJ"
  )
  const table1 = splitIndex !== -1 ? tableData.slice(0, splitIndex) : tableData
  const table2 = splitIndex !== -1 ? tableData.slice(splitIndex) : []

  const SyllabusDetailUI = () => {
    // 💡 ポップアップと同じキー名（"isDetailActive"）を指定して状態を受け取る
    const [isDetailActive] = useStorage("isDetailActive", true)

    // 💡 もし設定が「オフ」なら、何も新しいUIを表示しない（＝元のシラバス画面のままにする）
    if (!isDetailActive) {
      return null
    }
    return (
      <div className="modern-wrapper">
        {/* ヘッダーとコントロールバーをまとめて上部固定するコンテナ（全幅） */}
        <div className="sticky-header-container">
          {/* ヘッダー領域 */}
          <div className="modern-header-bg">
            <header className="modern-header">
              <div className="header-left">
                <h1>北海道大学シラバス検索システム</h1>
                <div className="lang-toggle">
                  <button
                    className={`lang-btn ${lang === "ja" ? "active" : ""}`}
                    onClick={() => setLang("ja")}>
                    日本語
                  </button>
                  <button
                    className={`lang-btn ${lang === "en" ? "active" : ""}`}
                    onClick={() => setLang("en")}>
                    English
                  </button>
                </div>
              </div>
              <nav className="header-sub-nav">
                <a href="/Portal/Public/Syllabus/SearchMain.aspx">
                  シラバス検索
                </a>
                <a href="/Portal/Public/Num/NumSearch.aspx">ナンバリング検索</a>
                <a href="/Portal/Public/Cur/CurSearch.aspx">実行教育課程検索</a>
              </nav>
            </header>
          </div>

          {/* パンくずリストとボタン群 */}
          <div className="control-bar-bg">
            <div className="control-bar">
              <div className="breadcrumb">
                <a href="/Portal/Public/Syllabus/SearchMain.aspx">
                  シラバス検索
                </a>
                <span>&gt;</span>
                <span>
                  {lang === "ja" ? "シラバス詳細" : "Syllabus Details"}
                </span>
              </div>

              {/* ボタン群 */}
              <div className="button-group">
                <a
                  href={`https://inazo.hu-jagajaga.com/search?search=${subjectQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-common btn-inazo">
                  科目名でiNAZO検索
                </a>

                <a
                  href={`https://inazo.hu-jagajaga.com/search?search=${teacherQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-common btn-inazo">
                  教員名でiNAZO検索
                </a>

                <button
                  className="btn-common btn-back"
                  onClick={() => window.history.back()}>
                  {lang === "ja" ? "前のページに戻る" : "Go Back"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* シラバスのメインコンテンツ */}
        <main className="main-content">
          {/* 前半の表（基本情報用）：compactクラスを付与して行間を狭くする */}
          <div className="syllabus-card" style={{ marginBottom: "40px" }}>
            <div className="syllabus-grid compact">
              {table1.map((row, index) => (
                <div
                  key={index}
                  className={`syllabus-item ${row.fullWidth ? "full-width" : ""}`}>
                  <div className="syllabus-item-label">
                    {lang === "ja" ? row.labelJa : row.labelEn}
                  </div>
                  <div className="syllabus-item-value">
                    {lang === "ja"
                      ? linkify(row.valueJa)
                      : linkify(row.valueEn)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 後半の表（詳細情報） */}
          {table2.length > 0 && (
            <div className="syllabus-card" style={{ marginBottom: "60px" }}>
              <div className="syllabus-grid">
                {table2.map((row, index) => (
                  <div
                    key={index}
                    className={`syllabus-item ${row.fullWidth ? "full-width" : ""}`}>
                    <div className="syllabus-item-label">
                      {lang === "ja" ? row.labelJa : row.labelEn}
                    </div>
                    <div className="syllabus-item-value">
                      {lang === "ja"
                        ? linkify(row.valueJa)
                        : linkify(row.valueEn)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }
}

export default SyllabusModernUI
