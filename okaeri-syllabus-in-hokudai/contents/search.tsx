import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import React, { useEffect, useMemo, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

/**
 * 💡 開発者向けの修正メモ:
 * 1. セキュリティ (CSP) 対策:
 * javascript: プロトコル経由の実行を完全に排除しました。
 * ASP.NET の隠しフィールド (__EVENTTARGET 等) を直接書き換え、form.submit() を実行する
 * ネイティブな方式に統一することで、Chrome の CSP 制限を安全に回避します。
 * 2. レイアウト最適化:
 * - 科目名の幅を 180px に縮小。
 * - iNAZO列を広げることで右側の余白を吸収し、全体 1100px に固定。
 * 3. ページネーション:
 * 元画面のリンクから引数を解析し、直接ポストバックをエミュレートします。
 */

// 💡 プレビュー環境用モック（実際の Plasmo 環境では import { useStorage } from "@plasmohq/storage/hook" を使用）

export const config: PlasmoCSConfig = {
  matches: [
    "https://gakumu.academic.hokudai.ac.jp/Portal/Public/Syllabus/SearchMain.aspx*"
  ]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    @import url('https://cdn.jsdelivr.net/npm/gen-interface-jp@latest/cdn/400.css');
    @import url('https://cdn.jsdelivr.net/npm/gen-interface-jp@latest/cdn/display-800.css');

    :host {
      --text-color: #001C0C;
      --main-color: #1F8C32;
      --accent-color: #89bf80;
      --bg-color: #f0f4f1;
      --table-th-bg: #f5faf6;
      --border-color: #d1e6d5;
      --header-text: #ffffff;
      --inazo-color: #006085;
      display: block;
      width: 100%;
    }

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
      align-items: center; 
    }

    .sticky-header-container {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      min-width: 1100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4px 12px rgba(31, 140, 50, 0.2);
    }

    .modern-header-bg {
      width: 100%;
      background: linear-gradient(135deg, #4CAF50 0%, #1F8C32 50%, #166524 100%);
      display: flex;
      justify-content: center;
    }

    .modern-header {
      width: 1100px;
      padding: 12px 32px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
    }

    .header-left { display: flex; align-items: center; gap: 24px; }
    .modern-header h1 { font-family: "Gen Interface JP Display", sans-serif; font-weight: 800; margin: 0; font-size: 1.35rem; letter-spacing: 0.05em; color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }

    .lang-toggle { display: inline-flex; background-color: rgba(255, 255, 255, 0.2); border-radius: 6px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.4); }
    .lang-btn { background: transparent; border: none; color: white; padding: 6px 14px; font-family: inherit; font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: all 0.2s ease; }
    .lang-btn.active { background-color: white; color: var(--main-color); }

    .container { width: 1100px; padding: 40px 32px; box-sizing: border-box; display: flex; flex-direction: column; }

    .form-card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 8px 24px rgba(0,28,12,0.06); border: 1px solid var(--border-color); }
    .section-title { font-size: 1.25rem; font-weight: 800; color: var(--main-color); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
    .section-title::before { content: ""; width: 4px; height: 1.2em; background: var(--main-color); border-radius: 2px; }

    .input-group { margin-bottom: 24px; }
    .input-label { font-weight: 800; font-size: 1rem; margin-bottom: 12px; display: block; color: #444; }

    .chip-group { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip {
      padding: 10px 20px;
      border-radius: 10px;
      background: #f8faf9;
      border: 1.5px solid #e0e8e1;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;
      transition: all 0.2s ease;
      user-select: none;
      display: flex;
      align-items: center
    }
    .chip:hover { border-color: var(--main-color); background: #f0f7f1; }
    .chip.active { background: var(--main-color); color: white; border-color: var(--main-color); box-shadow: 0 4px 10px rgba(31,140,50,0.2); }

    .faculty-container { display: flex; flex-direction: column; gap: 16px; background: #f9fcf9; padding: 24px; border-radius: 12px; border: 1px solid #e8f0e8; }
    .faculty-group { display: flex; flex-direction: column; gap: 8px; }
    .faculty-group-label { font-size: 0.85rem; font-weight: 800; color: #666; border-left: 4px solid var(--accent-color); padding-left: 8px; }

/* テキスト入力とセレクトボックスの共通スタイル */
    select, input[type="text"] { 
      width: 100%; 
      padding: 14px; 
      border: 1.5px solid var(--border-color); 
      border-radius: 10px; 
      font-family: inherit; 
      font-size: 1.05rem; 
      outline: none; 
      box-sizing: border-box; 
      transition: all 0.2s ease;
      background-color: #fff;
    }
    
    select:focus, input[type="text"]:focus { 
      border-color: var(--main-color); 
      box-shadow: 0 0 0 3px rgba(31, 140, 50, 0.15);
    }

/* セレクトボックス*/
    select::-ms-expand {
      display: none !important;
    }

    select {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      cursor: pointer;
      /* backgroundのショートハンドを使わず、1つずつ!importantで指定する */
      background-color: #fff !important;
      background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjMUY4QzMyJyBzdHJva2Utd2lkdGg9JzIuNScgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cG9seWxpbmUgcG9pbnRzPSc2IDkgMTIgMTUgMTggOScvPjwvc3ZnPg==") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 16px !important;
      padding-right: 40px !important;
    }
    
    /* マウスホバー時に背景と枠線を少し優しく変化させる */
    select:hover {
      background-color: #f9fdfa;
      border-color: var(--accent-color);
    }
    .btn-submit { background: var(--main-color); color: white; border: none; padding: 20px 100px; font-size: 1.25rem; font-weight: 800; border-radius: 50px; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 20px rgba(31, 140, 50, 0.25); display: block; margin: 40px auto 0; }
    .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(31, 140, 50, 0.35); filter: brightness(1.1); }

    .accordion-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #f8faf9; border: 1.5px solid var(--border-color); border-radius: 10px; cursor: pointer; font-weight: 800; transition: all 0.2s; margin-bottom: 4px; }
    .accordion-header:hover { border-color: var(--main-color); background: #f0f7f1; }
    .accordion-content { padding: 20px; background: #fff; border: 1.5px solid var(--border-color); border-top: none; border-radius: 0 0 12px 12px; margin-top: -4px; margin-bottom: 24px; }

    .sdgs-list { display: flex; flex-direction: column; gap: 6px; }
    .sdgs-item { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; cursor: pointer; padding: 8px; border-radius: 8px; transition: background 0.2s; user-select: none; }
    .sdgs-item:hover { background: #f0f7f1; }
    .sdgs-item input { width: 18px; height: 18px; accent-color: var(--main-color); cursor: pointer; }

    .conditions-summary { 
      background: white; 
      border: 1px solid var(--border-color); 
      border-radius: 12px; 
      padding: 0;
      margin-bottom: 24px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      overflow: hidden;
    }
    .conditions-header {
      padding: 16px 24px;
      background: #f9faf9;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    .conditions-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 16px; 
      padding: 24px;
    }
    .condition-item { display: flex; flex-direction: column; border-bottom: 1px dashed #eee; padding-bottom: 6px; }
    .condition-label { font-weight: bold; color: #888; margin-bottom: 2px; font-size: 0.85rem; }
    .condition-val { font-weight: 800; color: var(--main-color); line-height: 1.2; font-size: 1rem; }

    .result-table { width: 100%; border-collapse: separate; border-spacing: 0; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,28,12,0.04); border: 1px solid var(--border-color); table-layout: fixed; }
    .result-table th { background: var(--table-th-bg); color: var(--main-color); padding: 18px 12px; text-align: left; font-weight: 800; font-size: 0.9rem; border-bottom: 2px solid var(--border-color); }
    .result-table td { padding: 16px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; font-size: 1rem; overflow-wrap: break-word; }
    .result-table tr:hover td { background-color: #f9fdfa; }

    .col-term { width: 75px; }
    .col-title { width: 180px; }
    .col-staff { width: 220px; }
    .col-time { width: 85px; }  
    .col-syl { width: 140px; }
    .col-inazo { width: 200px; }

    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 40px; margin-bottom: 60px; }
    .page-btn { min-width: 44px; height: 44px; border-radius: 12px; background: white; border: 2px solid var(--border-color); color: var(--main-color); font-weight: 800; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 1rem; }
    .page-btn:hover { border-color: var(--main-color); background: #f0f7f1; }
    .page-btn.active { background: var(--main-color); color: white; border-color: var(--main-color); }
    .page-btn.next-btn { padding: 0 24px; background: var(--main-color); color: white; }

    .btn-action { text-decoration: none; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid transparent; white-space: nowrap; transition: all 0.2s; }
    .btn-jp { background: var(--main-color); color: white; }
    .btn-en { background: #666; color: white; }
    .btn-inazo-small { background: white; color: var(--inazo-color); border-color: var(--inazo-color); padding: 6px 14px; font-size: 0.85rem; }
    .btn-inazo-small:hover { background: var(--inazo-color); color: white; }
    .inazo-group { display: flex; flex-direction: row; gap: 10px; }
    
    .btn-back-link { background: white; border: 1.5px solid #ccc; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: bold; color: #666; font-size: 1rem; transition: background 0.2s; }
    .btn-back-link:hover { background: #f9f9f9; }


/* 🌟 エラーと必須バッジ用のCSS */
    .required-badge {
      background-color: #e53935;
      color: white;
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 4px;
      margin-left: 8px;
      vertical-align: middle;
      font-weight: bold;
    }
    .error-text {
      color: #e53935;
      font-size: 0.9rem;
      font-weight: bold;
      margin-top: 8px;
    }
    .has-error .chip {
      border-color: #ffcdd2;
      background-color: #fff8f8;
      color: #d32f2f;
    }
    .has-error select {
      border-color: #e53935;
      background-color: #fff8f8;
    }
    .has-error .faculty-container {
      border-color: #e53935;
      background-color: #fff8f8;
    }

  `
  return style
}

const SDGS_LABELS = [
  "1. 貧困をなくそう",
  "2. 飢餓をゼロに",
  "3. すべての人に健康と福祉を",
  "4. 質の高い教育をみんなに",
  "5. ジェンダー平等を実現しよう",
  "6. 安全な水とトイレを世界中に",
  "7. エネルギーをみんなにそしてクリーンに",
  "8. 働きがいも経済成長も",
  "9. 産業と技術革新の基盤をつくろう",
  "10. 人や国の不平等をなくそう",
  "11. 住み続けられるまちづくりを",
  "12. つくる責任つかう責任",
  "13. 気候変動に具体的な対策を",
  "14. 海の豊かさを守ろう",
  "15. 陸の豊かさも守ろう",
  "16. 平和と公正をすべての人に",
  "17. パートナーシップで目標を達成しよう"
]

const App = () => {
  const [isSearchActive] = useStorage("isSearchActive", true)
  const [isSearchListActive] = useStorage("isSearchListActive", true)

  const [view, setView] = useState<"loading" | "search" | "list" | "original">(
    "loading"
  )
  const [lang, setLang] = useState<"ja" | "en">("ja")
  const [showConditions, setShowConditions] = useState(false)
  const [showSdgs, setShowSdgs] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [options, setOptions] = useState({
    years: [],
    orgs: [],
    faculties: [],
    grads: [],
    terms: [],
    days: [],
    times: [],
    sorts: [],
    langs: [],
    methods: []
  })

  const [inputState, setInputState] = useState({
    year: "",
    org: "NULL",
    faculty: "NULL",
    grad: "NULL",
    term: "NULL",
    day: "-1",
    time: "NULL",
    sort: "NULL",
    sbj: "",
    staff: "",
    keyword: "",
    all: "",
    experience: "NULL",
    langCode: "NULL",
    method: "NULL",
    sdgs: []
  })

  // 🌟 エラー状態の管理を追加
  const [errors, setErrors] = useState({
    year: false,
    org: false,
    faculty: false
  })

  const [results, setResults] = useState([])
  const [pages, setPages] = useState([])
  const [currentConditions, setCurrentConditions] = useState([])

  useEffect(() => {
    const pnlSearch = document.getElementById("ctl00_phContents_pnlSearch")
    const pnlList = document.getElementById("ctl00_phContents_pnlList")
    const form = document.getElementById("aspnetForm")

    const handleDisplay = () => {
      if (isSearchActive === undefined || isSearchListActive === undefined)
        return

      const isCurrentSearch = pnlSearch && isSearchActive
      const isCurrentList = pnlList && isSearchListActive

      if (isCurrentSearch || isCurrentList) {
        setView(isCurrentSearch ? "search" : "list")
        if (form) form.style.display = "none"

        const rootHtml = document.documentElement
        const rootBody = document.body
        rootHtml.style.minWidth = "100vw"
        rootHtml.style.overflowX = "auto"
        rootBody.style.minWidth = "100vw"
        rootBody.style.overflowX = "auto"
        rootBody.style.backgroundColor = "#ffffff"

        if (isCurrentSearch) {
          scrapeAllOptions()
        } else {
          scrapeResults()
          scrapeExhaustiveConditions()
        }
      } else {
        setView("original")
        if (form) form.style.display = "block"
        document.documentElement.style.minWidth = "0"
        document.body.style.minWidth = "0"
      }
    }

    handleDisplay()
  }, [isSearchActive, isSearchListActive])

  const scrapeAllOptions = () => {
    const getOpts = (id: string) => {
      const el = document.getElementById(id) as HTMLSelectElement
      return el
        ? Array.from(el.options).map((o) => ({ text: o.text, value: o.value }))
        : []
    }

    setOptions({
      years: getOpts("ctl00_phContents_ddl_year"),
      orgs: getOpts("ctl00_phContents_ddl_org").filter(
        (o) => o.value !== "NULL"
      ),
      faculties: getOpts("ctl00_phContents_ddl_fac"),
      grads: getOpts("ctl00_phContents_ddl_grad"),
      terms: getOpts("ctl00_phContents_ddl_lctterm"),
      days: getOpts("ctl00_phContents_ddl_day"),
      times: getOpts("ctl00_phContents_ddl_time"),
      sorts: getOpts("ctl00_phContents_ddl_sbj_sort"),
      langs: getOpts("ctl00_phContents_ddl_lang"),
      methods: getOpts("ctl00_phContents_ddl_lct_do_type")
    })

    setInputState((prev) => ({
      ...prev,
      year:
        (
          document.getElementById(
            "ctl00_phContents_ddl_year"
          ) as HTMLSelectElement
        )?.value || "",
      org:
        (
          document.getElementById(
            "ctl00_phContents_ddl_org"
          ) as HTMLSelectElement
        )?.value || "NULL",
      faculty:
        (
          document.getElementById(
            "ctl00_phContents_ddl_fac"
          ) as HTMLSelectElement
        )?.value || "NULL",
      grad:
        (
          document.getElementById(
            "ctl00_phContents_ddl_grad"
          ) as HTMLSelectElement
        )?.value || "NULL",
      time:
        (
          document.getElementById(
            "ctl00_phContents_ddl_time"
          ) as HTMLSelectElement
        )?.value || "NULL"
    }))
  }

  const groupedFaculties = useMemo(() => {
    const items = options.faculties.filter((f) => f.value !== "NULL")
    return [{ label: "学部・研究科を選択", items }]
  }, [options.faculties])

  const handleOrgChange = (val: string) => {
    const isLawSchool = val === "05"
    setInputState((prev) => ({
      ...prev,
      org: val,
      faculty: isLawSchool ? "15" : "NULL"
    }))
    if (errors.org) setErrors((prev) => ({ ...prev, org: false }))

    const form = document.getElementById("aspnetForm") as HTMLFormElement
    const eventTarget = document.getElementById(
      "__EVENTTARGET"
    ) as HTMLInputElement
    const ddlOrg = document.getElementById(
      "ctl00_phContents_ddl_org"
    ) as HTMLSelectElement

    if (form && eventTarget && ddlOrg) {
      ddlOrg.value = val
      eventTarget.value = "ctl00$phContents$ddl_org"
      form.submit() // CSPエラーにならないネイティブ送信
    }
  }
  //ここに handleYearChange を追加する
  const handleYearChange = (val: string) => {
    setInputState((prev) => ({ ...prev, year: val }))
    if (errors.year) setErrors((prev) => ({ ...prev, year: false }))

    const form = document.getElementById("aspnetForm") as HTMLFormElement
    const eventTarget = document.getElementById(
      "__EVENTTARGET"
    ) as HTMLInputElement
    const ddlYear = document.getElementById(
      "ctl00_phContents_ddl_year"
    ) as HTMLSelectElement

    if (form && eventTarget && ddlYear) {
      ddlYear.value = val
      eventTarget.value = "ctl00$phContents$ddl_year"
      form.submit() // CSPエラーにならないネイティブ送信
    }
  }

  const scrapeExhaustiveConditions = () => {
    const mapping = [
      { id: "ctl00_phContents_lbl_year", label: "年度" },
      { id: "ctl00_phContents_lbl_org", label: "課程" },
      { id: "ctl00_phContents_lbl_fac", label: "学部" },
      { id: "ctl00_phContents_lbl_grad", label: "年次" },
      { id: "ctl00_phContents_lbl_lctterm", label: "学期" },
      { id: "ctl00_phContents_lbl_day", label: "曜日" },
      { id: "ctl00_phContents_lbl_time", label: "時限" },
      { id: "ctl00_phContents_lbl_sbj_sort", label: "科目種別" },
      { id: "ctl00_phContents_lbl_sbj", label: "科目名" },
      { id: "ctl00_phContents_lbl_staff", label: "教員名" },
      { id: "ctl00_phContents_lbl_keyword", label: "キーワード" },
      { id: "ctl00_phContents_lbl_all", label: "全文検索" },
      { id: "ctl00_phContents_lbl_experience", label: "実務経験" },
      { id: "ctl00_phContents_lbl_lang", label: "言語" },
      { id: "ctl00_phContents_lbl_lct_do_type", label: "方式" },
      { id: "ctl00_phContents_lbl_sdgs", label: "SDGs" }
    ]
    const conditions = mapping
      .map((m) => {
        const el = document.getElementById(m.id) as HTMLElement | null
        const val = el?.textContent?.trim().replace(/\u00a0/g, "") || ""
        return { label: m.label, value: val || "指定なし" }
      })
      .filter((c) => c.value !== "指定なし" && c.value !== "")
    setCurrentConditions(conditions)
  }

  const scrapeResults = () => {
    const table = document.getElementById(
      "ctl00_phContents_ucGrid_grv"
    ) as HTMLTableElement
    if (!table) return
    const allRows = Array.from(table.querySelectorAll("tr"))

    const resultRows = allRows.filter(
      (row) =>
        row.querySelectorAll("td").length >= 5 &&
        (row.textContent || "").trim() !== "" &&
        !row.querySelector("table")
    )
    const data = resultRows.map((row) => {
      const cells = row.querySelectorAll("td")
      const splitLang = (cell: HTMLTableCellElement) => {
        const text = cell.innerHTML.replace(/<br\s*\/?>/gi, "\n")
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = text
        const parts = (tempDiv.textContent || "")
          .split("\n")
          .map((p) => p.trim())
          .filter((p) => p !== "")
        return { ja: parts[0] || "", en: parts[1] || parts[0] || "" }
      }
      const jpLink = cells[3].querySelector(".jp")?.getAttribute("href")
      let enLink = cells[3].querySelector(".en")?.getAttribute("href")
      if (!enLink && jpLink) enLink = jpLink.replace("je_cd=1", "je_cd=2")
      return {
        semester: splitLang(cells[1]),
        title: splitLang(cells[2]),
        teacher: splitLang(cells[4]),
        time: splitLang(cells[5]),
        links: { jp: jpLink, en: enLink }
      }
    })
    setResults(data)

    const pagerRow = allRows.find((row) =>
      row.querySelector("td[colspan] table")
    )
    const pagerTable = pagerRow?.querySelector("table")
    if (pagerTable) {
      const pageItems = Array.from(pagerTable.querySelectorAll("td")).map(
        (td) => {
          const span = td.querySelector("span")
          const anchor = td.querySelector("a")
          return {
            text: (span || anchor)?.textContent?.trim() || "",
            isCurrent: !!span
          }
        }
      )
      setPages(pageItems)
    } else {
      setPages([])
    }
  }

  const handleFinalSearch = () => {
    const newErrors = {
      year: !inputState.year,
      org: inputState.org === "NULL",
      faculty: inputState.faculty === "NULL"
    }

    if (newErrors.year || newErrors.org || newErrors.faculty) {
      setErrors(newErrors)
      // 一番上（エラーがある場所）に少しスクロールしてあげる
      window.scrollTo({ top: 0, behavior: "smooth" })
      return // ここで送信をストップ
    }

    // エラーがなければクリアして進む
    setErrors({ year: false, org: false, faculty: false })

    // ▼ これ以降は元のコード（値の同期処理）
    const sync = (id: string, val: string) => {
      const el = document.getElementById(id) as
        | HTMLSelectElement
        | HTMLInputElement
      if (el) el.value = val
    }

    sync("ctl00_phContents_ddl_year", inputState.year)
    sync("ctl00_phContents_ddl_org", inputState.org)
    sync("ctl00_phContents_ddl_fac", inputState.faculty)
    sync("ctl00_phContents_ddl_grad", inputState.grad)
    sync("ctl00_phContents_ddl_lctterm", inputState.term)
    sync("ctl00_phContents_ddl_day", inputState.day)
    sync("ctl00_phContents_ddl_time", inputState.time)
    sync("ctl00_phContents_ddl_sbj_sort", inputState.sort)
    sync("ctl00_phContents_txt_sbj_Search", inputState.sbj)
    sync("ctl00_phContents_txt_staff_Search", inputState.staff)
    sync("ctl00_phContents_txt_keyword_Search", inputState.keyword)
    sync("ctl00_phContents_txt_all_Search", inputState.all)
    sync("ctl00_phContents_ddl_experience", inputState.experience)
    sync("ctl00_phContents_ddl_lang", inputState.langCode)
    sync("ctl00_phContents_ddl_lct_do_type", inputState.method)

    const allSdgsCbs = document.querySelectorAll(
      'input[type="checkbox"][name*="cblSDGs"]'
    )
    allSdgsCbs.forEach((cb: HTMLInputElement) => (cb.checked = false))
    inputState.sdgs.forEach((val) => {
      const target = document.querySelector(
        `input[id$="cblSDGs_${parseInt(val) - 1}"]`
      ) as HTMLInputElement
      if (target) target.checked = true
    })

    // 💡 本物のボタンを叩く
    const btn = document.getElementById(
      "ctl00_phContents_ctl16_btnSearch"
    ) as HTMLElement
    if (btn) btn.click()
  }

  // 💡 【修正】戻るボタンのCSPエラー対策（ネイティブForm送信方式）
  const handleBackToSearch = () => {
    const form = document.getElementById("aspnetForm") as HTMLFormElement
    const eventTarget = document.getElementById(
      "__EVENTTARGET"
    ) as HTMLInputElement

    if (form && eventTarget) {
      eventTarget.value = "ctl00$phContents$lnkReturn_Up$lnk"
      form.submit()
    } else {
      window.history.back()
    }
  }

  // 💡 【修正】ページネーションのCSPエラー対策（ネイティブForm送信方式）
  const handlePageClick = (pageText: string) => {
    const pagerTable = document.querySelector(
      "#ctl00_phContents_ucGrid_grv tr td[colspan] table"
    )
    if (!pagerTable) return

    const links = Array.from(pagerTable.querySelectorAll("a"))
    const targetLink = links.find((a) => a.textContent?.trim() === pageText)

    const form = document.getElementById("aspnetForm") as HTMLFormElement
    const eventTarget = document.getElementById(
      "__EVENTTARGET"
    ) as HTMLInputElement
    const eventArgument = document.getElementById(
      "__EVENTARGUMENT"
    ) as HTMLInputElement

    if (form && eventTarget && eventArgument) {
      if (targetLink) {
        const href = targetLink.getAttribute("href") || ""
        const match = href.match(/__doPostBack\('(.*?)','(.*?)'\)/)
        if (match) {
          eventTarget.value = match[1]
          eventArgument.value = match[2]
          form.submit()
          return
        }
      }
      // フォールバック
      eventTarget.value = "ctl00$phContents$ucGrid$grv"
      eventArgument.value = `Page$${pageText}`
      form.submit()
    }
  }

  const nextPageText = useMemo(() => {
    const currentIndex = pages.findIndex((p) => p.isCurrent)
    if (currentIndex !== -1 && currentIndex < pages.length - 1) {
      return pages[currentIndex + 1].text
    }
    return null
  }, [pages])

  if (view === "loading" || view === "original") return null

  return (
    <div className="modern-wrapper">
      <div className="sticky-header-container">
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
            <nav style={{ display: "flex", gap: "15px" }}>
              <a
                href="/Portal/Public/Syllabus/SearchMain.aspx"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem"
                }}>
                検索トップ
              </a>
            </nav>
          </header>
        </div>
      </div>

      <main className="container">
        {view === "search" && (
          <div className="form-card">
            <div className="section-title">基本条件</div>
            <div className={`input-group ${errors.year ? "has-error" : ""}`}>
              <label className="input-label">
                開講年度 <span className="required-badge">必須</span>
              </label>
              <div className="chip-group">
                {options.years.slice(0, 3).map((y) => (
                  <div
                    key={y.value}
                    className={`chip ${inputState.year === y.value ? "active" : ""}`}
                    onClick={() => handleYearChange(y.value)}>
                    {y.text}
                  </div>
                ))}
                <select
                  style={{ width: "auto" }}
                  value={
                    options.years
                      .slice(3)
                      .some((y) => y.value === inputState.year)
                      ? inputState.year
                      : ""
                  }
                  onChange={(e) => handleYearChange(e.target.value)}>
                  <option value="" disabled hidden>
                    過去の年度を選択...
                  </option>
                  {options.years.slice(3).map((y) => (
                    <option key={y.value} value={y.value}>
                      {y.text}
                    </option>
                  ))}
                </select>
              </div>
              {errors.year && (
                <div className="error-text">開講年度を選択してください。</div>
              )}
            </div>
            <div className={`input-group ${errors.org ? "has-error" : ""}`}>
              <label className="input-label">
                課程区分 <span className="required-badge">必須</span>
              </label>
              <div className="chip-group">
                {options.orgs.map((o) => (
                  <div
                    key={o.value}
                    className={`chip ${inputState.org === o.value ? "active" : ""}`}
                    onClick={() => handleOrgChange(o.value)}>
                    {o.text}
                  </div>
                ))}
              </div>
              {errors.org && (
                <div className="error-text">課程区分を選択してください。</div>
              )}
            </div>
            <div className={`input-group ${errors.faculty ? "has-error" : ""}`}>
              <label className="input-label">
                開講学部・研究科 <span className="required-badge">必須</span>
              </label>
              <div className="faculty-container">
                {groupedFaculties.map((group) => (
                  <div key={group.label} className="faculty-group">
                    <div className="faculty-group-label">{group.label}</div>
                    <div className="chip-group">
                      {group.items.map((f) => (
                        <div
                          key={f.value}
                          className={`chip ${inputState.faculty === f.value ? "active" : ""}`}
                          onClick={() => {
                            setInputState({ ...inputState, faculty: f.value })
                            if (errors.faculty)
                              setErrors((prev) => ({ ...prev, faculty: false })) // 🌟 エラー解除
                          }}>
                          {f.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {errors.faculty && (
                <div className="error-text">
                  開講学部・研究科を選択してください。
                </div>
              )}
            </div>
            <div className="section-title" style={{ marginTop: "40px" }}>
              時間割条件
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px"
              }}>
              <div className="input-group">
                <label className="input-label">対象年次</label>
                <div className="chip-group">
                  {options.grads.map((g) => (
                    <div
                      key={g.value}
                      className={`chip ${inputState.grad === g.value ? "active" : ""}`}
                      onClick={() =>
                        setInputState({ ...inputState, grad: g.value })
                      }>
                      {g.text === "選択してください"
                        ? "指定なし"
                        : g.text.replace("次", "")}
                    </div>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">開講学期</label>
                <div className="chip-group">
                  {options.terms.map((t) => (
                    <div
                      key={t.value}
                      className={`chip ${inputState.term === t.value ? "active" : ""}`}
                      onClick={() =>
                        setInputState({ ...inputState, term: t.value })
                      }>
                      {t.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">開講曜日</label>
                <div className="chip-group">
                  {options.days.map((d) => (
                    <div
                      key={d.value}
                      className={`chip ${inputState.day === d.value ? "active" : ""}`}
                      onClick={() =>
                        setInputState({ ...inputState, day: d.value })
                      }>
                      {d.text === "選択してください" ? "指定なし" : d.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">開講時限</label>
                <div className="chip-group">
                  {options.times.map((t) => (
                    <div
                      key={t.value}
                      className={`chip ${inputState.time === t.value ? "active" : ""}`}
                      onClick={() =>
                        setInputState({ ...inputState, time: t.value })
                      }>
                      {t.text === "選択してください"
                        ? "指定なし"
                        : t.text.replace("限", "")}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="section-title" style={{ marginTop: "40px" }}>
              キーワード
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px"
              }}>
              <div className="input-group">
                <label className="input-label">科目名・講義題目</label>
                <input
                  type="text"
                  placeholder="例：憲法"
                  value={inputState.sbj}
                  onChange={(e) =>
                    setInputState({ ...inputState, sbj: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <label className="input-label">教員名</label>
                <input
                  type="text"
                  placeholder="氏名を入力"
                  value={inputState.staff}
                  onChange={(e) =>
                    setInputState({ ...inputState, staff: e.target.value })
                  }
                />
              </div>
              <div className="input-group" style={{ gridColumn: "span 2" }}>
                <label className="input-label">全文検索</label>
                <input
                  type="text"
                  placeholder="シラバス内の内容を一括検索"
                  value={inputState.all}
                  onChange={(e) =>
                    setInputState({ ...inputState, all: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="section-title" style={{ marginTop: "40px" }}>
              SDGs 条件
            </div>
            <div className="input-group">
              <div
                className="accordion-header"
                onClick={() => setShowSdgs(!showSdgs)}>
                <span>SDGsの項目を選択（クリックで開閉）</span>
                <span>{showSdgs ? "▲" : "▼"}</span>
              </div>
              {showSdgs && (
                <div className="accordion-content">
                  <div className="sdgs-list">
                    {SDGS_LABELS.map((label, i) => (
                      <label key={i + 1} className="sdgs-item">
                        <input
                          type="checkbox"
                          checked={inputState.sdgs.includes((i + 1).toString())}
                          onChange={(e) => {
                            const val = (i + 1).toString()
                            setInputState((prev) => ({
                              ...prev,
                              sdgs: e.target.checked
                                ? [...prev.sdgs, val]
                                : prev.sdgs.filter((s) => s !== val)
                            }))
                          }}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="section-title" style={{ marginTop: "40px" }}>
              詳しく検索
            </div>
            <div className="input-group">
              <div
                className="accordion-header"
                onClick={() => setShowAdvanced(!showAdvanced)}>
                <span>実務経験・方式・その他条件</span>
                <span>{showAdvanced ? "▲" : "▼"}</span>
              </div>
              {showAdvanced && (
                <div className="accordion-content">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "20px"
                    }}>
                    <div className="input-group">
                      <label className="input-label">
                        キーワード検索 (txt_keyword_Search)
                      </label>
                      <input
                        type="text"
                        placeholder="補助的なキーワードを入力"
                        value={inputState.keyword}
                        onChange={(e) =>
                          setInputState({
                            ...inputState,
                            keyword: e.target.value
                          })
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">
                        実務経験のある教員等による授業科目
                      </label>
                      <div className="chip-group">
                        <div
                          className={`chip ${inputState.experience === "1" ? "active" : ""}`}
                          onClick={() =>
                            setInputState({ ...inputState, experience: "1" })
                          }>
                          該当する
                        </div>
                        <div
                          className={`chip ${inputState.experience === "0" ? "active" : ""}`}
                          onClick={() =>
                            setInputState({ ...inputState, experience: "0" })
                          }>
                          該当しない
                        </div>
                        <div
                          className={`chip ${inputState.experience === "NULL" ? "active" : ""}`}
                          onClick={() =>
                            setInputState({ ...inputState, experience: "NULL" })
                          }>
                          指定なし
                        </div>
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">科目種別</label>
                      <select
                        value={inputState.sort}
                        onChange={(e) =>
                          setInputState({ ...inputState, sort: e.target.value })
                        }>
                        {options.sorts.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.text}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">言語コード</label>
                      <select
                        value={inputState.langCode}
                        onChange={(e) =>
                          setInputState({
                            ...inputState,
                            langCode: e.target.value
                          })
                        }>
                        {options.langs.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.text}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">授業実施方式</label>
                      <select
                        value={inputState.method}
                        onChange={(e) =>
                          setInputState({
                            ...inputState,
                            method: e.target.value
                          })
                        }>
                        {options.methods.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="btn-submit" onClick={handleFinalSearch}>
              シラバスを検索する
            </button>
          </div>
        )}

        {view === "list" && (
          <div>
            <div
              style={{
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end"
              }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.85rem", fontWeight: 800 }}>
                  検索結果
                </h2>
              </div>
              <button className="btn-back-link" onClick={handleBackToSearch}>
                ← 検索画面に戻る
              </button>
            </div>

            <div className="conditions-summary">
              <div
                className="conditions-header"
                onClick={() => setShowConditions(!showConditions)}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    color: "var(--main-color)"
                  }}>
                  🔍 現在の検索条件を表示・変更
                </span>
                <span style={{ fontSize: "1rem" }}>
                  {showConditions ? "▲" : "▼"}
                </span>
              </div>
              {showConditions && (
                <div className="conditions-grid">
                  {currentConditions.map((c, i) => (
                    <div key={i} className="condition-item">
                      <span className="condition-label">{c.label}</span>
                      <span className="condition-val">{c.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <table className="result-table">
              <thead>
                <tr>
                  <th className="col-term">学期</th>
                  <th className="col-title">科目名</th>
                  <th className="col-staff">担当教員</th>
                  <th className="col-time">曜日時限</th>
                  <th className="col-syl">シラバス</th>
                  <th className="col-inazo">iNAZO</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                        {item.semester.ja}
                      </span>
                    </td>
                    <td style={{ fontWeight: "800", lineHeight: "1.4" }}>
                      {item.title.ja}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.9rem" }}>
                        {item.teacher.ja}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem" }}>
                        {item.time.ja}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {item.links.jp && (
                          <a
                            href={item.links.jp}
                            target="_blank"
                            className="btn-action btn-jp">
                            日本語
                          </a>
                        )}
                        {item.links.en && (
                          <a
                            href={item.links.en}
                            target="_blank"
                            className="btn-action btn-en">
                            EN
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="inazo-group">
                        <a
                          href={`https://inazo.hu-jagajaga.com/search?search=${encodeURIComponent(item.title.ja)}`}
                          target="_blank"
                          className="btn-action btn-inazo-small">
                          科目名
                        </a>
                        <a
                          href={`https://inazo.hu-jagajaga.com/search?search=${encodeURIComponent(item.teacher.ja.split(/[（(]/)[0].trim())}`}
                          target="_blank"
                          className="btn-action btn-inazo-small">
                          教員名
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ページネーション */}
            {pages.length > 0 && (
              <div className="pagination-container">
                {pages.map((p, i) => (
                  <div
                    key={i}
                    className={`page-btn ${p.isCurrent ? "active" : ""}`}
                    onClick={() => handlePageClick(p.text)}>
                    {p.text}
                  </div>
                ))}
                {nextPageText && (
                  <div
                    className="page-btn next-btn"
                    onClick={() => handlePageClick(nextPageText)}>
                    次のページへ &gt;
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
