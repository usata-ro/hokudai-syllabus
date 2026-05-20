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

    .col-term { width: 70px; }
    .col-title { width: 180px; }
    .col-staff { width: 210px; }
    .col-time { width: 80px; }  
    .col-syl { width: 125px; }
    .col-inazo { width: 180px; }
    .col-grad { width: 50px; }

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
/* 🌟 リセットボタンのスタイル */
    .btn-reset { 
      background: transparent; 
      color: #666; 
      border: 1.5px solid #ccc; 
      padding: 16px 40px; 
      font-size: 1rem; 
      font-weight: bold; 
      border-radius: 50px; 
      cursor: pointer; 
      transition: all 0.2s; 
    }
    .btn-reset:hover { 
      background: #f0f0f0; 
      color: #333; 
      border-color: #aaa;
    }
    .action-buttons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 40px;
    }
      /* 🌟 新しいリセットボタンのスタイル */
    .btn-reset-text {
      background: #fff;
      color: #666;
      border: 1.5px solid #d1e6d5;
      padding: 6px 14px;
      font-size: 0.85rem;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-reset-text:hover {
      background: #fff8f8;
      color: #e53935;
      border-color: #ffcdd2;
    }
  `
  return style
}

const SDGS_LABELS = {
  ja: [
    "1. 貧混をなくそう",
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
  ],
  en: [
    "1. No Poverty",
    "2. Zero Hunger",
    "3. Good Health and Well-being",
    "4. Quality Education",
    "5. Gender Equality",
    "6. Clean Water and Sanitation",
    "7. Affordable and Clean Energy",
    "8. Decent Work and Economic Growth",
    "9. Industry, Innovation, and Infrastructure",
    "10. Reducing Inequality",
    "11. Sustainable Cities and Communities",
    "12. Responsible Consumption and Production",
    "13. Climate Action",
    "14. Life Below Water",
    "15. Life On Land",
    "16. Peace, Justice, and Strong Institutions",
    "17. Partnerships for the Goals"
  ]
}

const UI_LANG = {
  ja: {
    basicConditions: "基本条件",
    resetAll: "すべての条件をリセット",
    year: "開講年度",
    required: "必須",
    pastYear: "過去の年度を選択...",
    org: "課程区分",
    faculty: "開講学部・研究科",
    timetableConditions: "時間割条件",
    grad: "対象年次",
    term: "開講学期",
    day: "開講曜日",
    time: "開講時限",
    any: "指定なし",
    keywordsTitle: "キーワード",
    resetLower: "以下の項目をリセット",
    sbj: "科目名・講義題目",
    sbjPlaceholder: "例：憲法",
    staff: "教員名",
    staffPlaceholder: "氏名を入力",
    all: "全文検索",
    allPlaceholder: "シラバス内の内容を一括検索",
    advancedTitle: "詳しく検索",
    advancedHeader: "実務経験・方式・その他条件",
    keywordParam: "キーワード検索",
    keywordPlaceholder: "補助的なキーワードを入力",
    experience: "実務経験のある教員等による授業科目",
    expYes: "該当する",
    expNo: "該当しない",
    sort: "科目種別",
    langCode: "言語コード",
    method: "授業実施方式",
    sdgsTitle: "SDGs 条件",
    sdgsHeader: "SDGsの項目を選択（クリックで開閉）",
    submitBtn: "シラバスを検索する",
    errYear: "開講年度を選択してください。",
    errOrg: "課程区分を選択してください。",
    errFaculty: "開講学部・研究科を選択してください。",
    facultyLabel: "学部・研究科を選択",

    /* 🌟 追加：検索結果画面（一覧）用の日本語辞書 */
    resultTitle: "検索結果",
    backToSearch: "← 検索画面に戻る",
    currentConditionsTitle: "🔍 現在の検索条件を表示・変更",
    thSemester: "学期",
    thTitle: "科目名",
    thTeacher: "担当教員",
    thTime: "曜日時限",
    thSyllabus: "シラバス",
    thInazo: "iNAZO",
    thGrad: "対象年次",
    btnJp: "日本語",
    btnEn: "EN",
    btnSbj: "科目名",
    btnStaff: "教員名",
    nextPage: "次のページへ >"
  },
  en: {
    basicConditions: "Basic Conditions",
    resetAll: "Reset All Conditions",
    year: "Academic Year",
    required: "Required",
    pastYear: "Select past year...",
    org: "Course Classification",
    faculty: "Faculty / Graduate School",
    timetableConditions: "Timetable Conditions",
    grad: "Target Year",
    term: "Semester",
    day: "Day of Week",
    time: "Period",
    any: "Any",
    keywordsTitle: "Keywords",
    resetLower: "Reset Below Items",
    sbj: "Subject / Course Title",
    sbjPlaceholder: "e.g. Constitution",
    staff: "Instructor's Name",
    staffPlaceholder: "Enter name",
    all: "Full-text Search",
    allPlaceholder: "Search all syllabus contents",
    advancedTitle: "Advanced Search",
    advancedHeader: "Practical Experience / Instruction Method / Others",
    keywordParam: "Keyword Search",
    keywordPlaceholder: "Enter supplementary keywords",
    experience: "Courses taught by instructors with practical experience",
    expYes: "Applicable",
    expNo: "Not applicable",
    sort: "Subject Type",
    langCode: "Language Code",
    method: "Instruction Method",
    sdgsTitle: "SDGs Conditions",
    sdgsHeader: "Select SDGs items (Click to expand/collapse)",
    submitBtn: "Search Syllabus",
    errYear: "Please select an academic year.",
    errOrg: "Please select a course classification.",
    errFaculty: "Please select a faculty or graduate school.",
    facultyLabel: "Select Faculty / Graduate School",

    /* 🌟 追加：検索結果画面（一覧）用の英語辞書 */
    resultTitle: "Search Results",
    backToSearch: "← Back to Search Page",
    currentConditionsTitle: "🔍 Show / Modify Current Search Conditions",
    thSemester: "Semester",
    thTitle: "Subject Title",
    thTeacher: "Instructor",
    thTime: "Day / Period",
    thSyllabus: "Syllabus",
    thInazo: "iNAZO",
    thGrad: "Target Year",
    btnJp: "Japanese",
    btnEn: "EN",
    btnSbj: "Subject",
    btnStaff: "Instructor",
    nextPage: "Next Page >"
  }
}

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

        // 👇 🌟 ここに追加：学務システムのボタン状態から現在の言語を自動判定
        const engBtn = document.getElementById(
          "ctl00_imgBtnEngBtm"
        ) as HTMLAnchorElement | null
        if (engBtn && engBtn.getAttribute("disabled") === "disabled") {
          setLang("en")
        } else {
          setLang("ja")
        }

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

    // 値を取得するための便利なヘルパー関数を用意
    const getVal = (id: string) =>
      (document.getElementById(id) as HTMLInputElement | HTMLSelectElement)
        ?.value || ""
    const getSelectVal = (id: string) =>
      (document.getElementById(id) as HTMLSelectElement)?.value || "NULL"
    const getDayVal = (id: string) =>
      (document.getElementById(id) as HTMLSelectElement)?.value || "-1"

    // チェックされているSDGsの値を配列として
    const checkedSdgs = Array.from(
      document.querySelectorAll(
        'input[type="checkbox"][name*="cblSDGs"]:checked'
      )
    ).map((cb) => (cb as HTMLInputElement).value)

    //状態を更新
    setInputState((prev) => ({
      ...prev,
      year: getVal("ctl00_phContents_ddl_year"),
      org: getSelectVal("ctl00_phContents_ddl_org"),
      faculty: getSelectVal("ctl00_phContents_ddl_fac"),
      grad: getSelectVal("ctl00_phContents_ddl_grad"),
      term: getSelectVal("ctl00_phContents_ddl_lctterm"), // 追加: 学期
      day: getDayVal("ctl00_phContents_ddl_day"), // 追加: 曜日
      time: getSelectVal("ctl00_phContents_ddl_time"),
      sort: getSelectVal("ctl00_phContents_ddl_sbj_sort"), // 追加: 科目種別
      sbj: getVal("ctl00_phContents_txt_sbj_Search"), // 追加: 科目名
      staff: getVal("ctl00_phContents_txt_staff_Search"), // 追加: 教員名
      keyword: getVal("ctl00_phContents_txt_keyword_Search"), // 追加: キーワード
      all: getVal("ctl00_phContents_txt_all_Search"), // 追加: 全文検索
      experience: getSelectVal("ctl00_phContents_ddl_experience"), // 追加: 実務経験
      langCode: getSelectVal("ctl00_phContents_ddl_lang"), // 追加: 言語コード
      method: getSelectVal("ctl00_phContents_ddl_lct_do_type"), // 追加: 授業実施方式
      sdgs: checkedSdgs // 追加: SDGs
    }))
  }

  const groupedFaculties = useMemo(() => {
    const items = options.faculties.filter((f) => f.value !== "NULL")
    // 🌟 見出しテキストを言語に応じて切り替え、依存配列に lang を追加
    return [{ label: UI_LANG[lang].facultyLabel, items }]
  }, [options.faculties, lang])

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

  const scrapeExhaustiveConditions = () => {
    // 🌟 修正：ハードコードされた日本語を翻訳辞書連動へ変更
    const mapping = [
      { id: "ctl00_phContents_lbl_year", label: UI_LANG[lang].year },
      { id: "ctl00_phContents_lbl_org", label: UI_LANG[lang].org },
      { id: "ctl00_phContents_lbl_fac", label: UI_LANG[lang].faculty },
      { id: "ctl00_phContents_lbl_grad", label: UI_LANG[lang].grad },
      { id: "ctl00_phContents_lbl_lctterm", label: UI_LANG[lang].term },
      { id: "ctl00_phContents_lbl_day", label: UI_LANG[lang].day },
      { id: "ctl00_phContents_lbl_time", label: UI_LANG[lang].time },
      { id: "ctl00_phContents_lbl_sbj_sort", label: UI_LANG[lang].sort },
      { id: "ctl00_phContents_lbl_sbj", label: UI_LANG[lang].sbj },
      { id: "ctl00_phContents_lbl_staff", label: UI_LANG[lang].staff },
      { id: "ctl00_phContents_lbl_keyword", label: UI_LANG[lang].keywordParam },
      { id: "ctl00_phContents_lbl_all", label: UI_LANG[lang].all },
      {
        id: "ctl00_phContents_lbl_experience",
        label: UI_LANG[lang].experience
      },
      { id: "ctl00_phContents_lbl_lang", label: UI_LANG[lang].langCode },
      { id: "ctl00_phContents_lbl_lct_do_type", label: UI_LANG[lang].method },
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
      // 🌟 修正：漢字・ひらがな・カタカナを判別して複数教員を正しくカンマ区切りで抽出する
      const splitLang = (cell: HTMLTableCellElement) => {
        const text = cell.innerHTML.replace(/<br\s*\/?>/gi, "\n")
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = text
        const lines = (tempDiv.textContent || "")
          .split("\n")
          .map((p) => p.trim())
          .filter((p) => p !== "")

        const jaLines: string[] = []
        const enLines: string[] = []

        lines.forEach((line) => {
          // 漢字・ひらがな・カタカナが含まれている場合は日本語の行と判定
          if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(line)) {
            jaLines.push(line)
          } else {
            enLines.push(line)
          }
        })

        return {
          // 🌟 変更: ", " ではなく "\n" で繋ぐ
          ja: jaLines.join("\n") || "",
          en: enLines.length > 0 ? enLines.join("\n") : jaLines.join("\n") || ""
        }
      }
      const jpLink = cells[3].querySelector(".jp")?.getAttribute("href")
      let enLink = cells[3].querySelector(".en")?.getAttribute("href")
      if (!enLink && jpLink) enLink = jpLink.replace("je_cd=1", "je_cd=2")
      return {
        semester: splitLang(cells[1]),
        title: splitLang(cells[2]),
        teacher: splitLang(cells[4]),
        time: splitLang(cells[5]),
        grad: cells[6]?.textContent?.trim() || "",
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

  const handleLangChange = (targetLang: "ja" | "en") => {
    setLang(targetLang)

    const form = document.getElementById("aspnetForm") as HTMLFormElement
    const eventTarget = document.getElementById(
      "__EVENTTARGET"
    ) as HTMLInputElement

    if (form && eventTarget) {
      // 学務システム裏側の言語切り替えボタンのポストバックを安全に実行
      eventTarget.value =
        targetLang === "ja" ? "ctl00$imgBtnJpnBtm" : "ctl00$imgBtnEngBtm"
      form.submit()
    }
  }

  // =================================================================
  // 🌟 1. すべての条件をリセットする関数（開講年度は最新、それ以外は初期化）
  // =================================================================
  const handleResetAll = () => {
    const defaultYear = options.years[0]?.value || "2026"
    setInputState({
      year: defaultYear,
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
    // エラー表示もまとめて綺麗に消す
    setErrors({ year: false, org: false, faculty: false })
  }

  // =================================================================
  // 🌟 2. 後半の条件のみをリセットする関数（キーワード、詳しく検索、SDGsを初期化）
  // =================================================================
  const handleResetLower = () => {
    setInputState((prev) => ({
      ...prev, // 基本条件と時間割条件（年度、課程、学部、年次、学期、曜日、時限）はそのまま残す
      sort: "NULL",
      sbj: "",
      staff: "",
      keyword: "",
      all: "",
      experience: "NULL",
      langCode: "NULL",
      method: "NULL",
      sdgs: []
    }))
  }

  // =================================================================
  // 🌟 3. 開講年度がチップまたはセレクトボックスで変更されたときの処理
  // =================================================================
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
      form.submit() // ASP.NETのポストバックを安全にエミュレート
    }
  }

  // =================================================================
  // 🌟 4. 【手順3の完成形】シラバス検索ボタンが押されたときのバリデーション＆同期送信
  // =================================================================
  const handleFinalSearch = () => {
    // ① 未入力がないか必須項目をチェック
    const newErrors = {
      year: !inputState.year,
      org: inputState.org === "NULL",
      faculty: inputState.faculty === "NULL"
    }

    // ② どこか1つでもエラーがあれば処理を止めて上部にスクロール
    if (newErrors.year || newErrors.org || newErrors.faculty) {
      setErrors(newErrors)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    // ③ エラーがなければ状態をクリアして同期処理へ進む
    setErrors({ year: false, org: false, faculty: false })

    // 元画面の要素へ値を同期するヘルパー
    const sync = (id: string, val: string) => {
      const el = document.getElementById(id) as
        | HTMLSelectElement
        | HTMLInputElement
      if (el) el.value = val
    }

    // 各入力値を学務システム本来のフォーム要素へ同期
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

    // SDGsのチェックボックス要素を同期
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

    // 💡 学務システム本来の「検索」ボタンをプログラムでクリック
    const btn = document.getElementById(
      "ctl00_phContents_ctl16_btnSearch"
    ) as HTMLElement
    if (btn) btn.click()
  }

  // 💡 【修正】戻るボタンのCSPエラー対策
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

  // 💡 【修正】ページネーションのCSPエラー対策
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
                {/* 🌟 onClick を handleLangChange に変更 */}
                <button
                  className={`lang-btn ${lang === "ja" ? "active" : ""}`}
                  onClick={() => handleLangChange("ja")}>
                  日本語
                </button>
                <button
                  className={`lang-btn ${lang === "en" ? "active" : ""}`}
                  onClick={() => handleLangChange("en")}>
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
            {/* 🌟 基本条件ヘッダー */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
              }}>
              <div className="section-title" style={{ marginBottom: 0 }}>
                {UI_LANG[lang].basicConditions}
              </div>
              <button className="btn-reset-text" onClick={handleResetAll}>
                {UI_LANG[lang].resetAll}
              </button>
            </div>

            {/* 🌟 開講年度 */}
            <div className={`input-group ${errors.year ? "has-error" : ""}`}>
              <label className="input-label">
                {UI_LANG[lang].year}{" "}
                <span className="required-badge">{UI_LANG[lang].required}</span>
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
                    {UI_LANG[lang].pastYear}
                  </option>
                  {options.years.slice(3).map((y) => (
                    <option key={y.value} value={y.value}>
                      {y.text}
                    </option>
                  ))}
                </select>
              </div>
              {errors.year && (
                <div className="error-text">{UI_LANG[lang].errYear}</div>
              )}
            </div>

            {/* 🌟 課程区分 */}
            <div className={`input-group ${errors.org ? "has-error" : ""}`}>
              <label className="input-label">
                {UI_LANG[lang].org}{" "}
                <span className="required-badge">{UI_LANG[lang].required}</span>
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
                <div className="error-text">{UI_LANG[lang].errOrg}</div>
              )}
            </div>

            {/* 🌟 開講学部 */}
            <div className={`input-group ${errors.faculty ? "has-error" : ""}`}>
              <label className="input-label">
                {UI_LANG[lang].faculty}{" "}
                <span className="required-badge">{UI_LANG[lang].required}</span>
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
                              setErrors((prev) => ({ ...prev, faculty: false }))
                          }}>
                          {f.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {errors.faculty && (
                <div className="error-text">{UI_LANG[lang].errFaculty}</div>
              )}
            </div>

            {/* 🌟 時間割条件 */}
            <div className="section-title" style={{ marginTop: "40px" }}>
              {UI_LANG[lang].timetableConditions}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px"
              }}>
              {/* 対象年次 */}
              <div className="input-group">
                <label className="input-label">{UI_LANG[lang].grad}</label>
                <div className="chip-group">
                  {options.grads.map((g) => (
                    <div
                      key={g.value}
                      className={`chip ${inputState.grad === g.value ? "active" : ""}`}
                      onClick={() =>
                        setInputState({ ...inputState, grad: g.value })
                      }>
                      {g.text.includes("選択してください") ||
                      g.text.includes("Select")
                        ? UI_LANG[lang].any
                        : g.text.replace("次", "")}
                    </div>
                  ))}
                </div>
              </div>

              {/* 開講学期 */}
              <div className="input-group">
                <label className="input-label">{UI_LANG[lang].term}</label>
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

              {/* 開講曜日 */}
              <div className="input-group">
                <label className="input-label">{UI_LANG[lang].day}</label>
                <div className="chip-group">
                  {options.days.map((d) => (
                    <div
                      key={d.value}
                      className={`chip ${inputState.day === d.value ? "active" : ""}`}
                      onClick={() =>
                        setInputState({ ...inputState, day: d.value })
                      }>
                      {d.text.includes("選択してください") ||
                      d.text.includes("Select")
                        ? UI_LANG[lang].any
                        : d.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* 開講時限 */}
              <div className="input-group">
                <label className="input-label">{UI_LANG[lang].time}</label>
                <div className="chip-group">
                  {options.times.map((t) => (
                    <div
                      key={t.value}
                      className={`chip ${inputState.time === t.value ? "active" : ""}`}
                      onClick={() =>
                        setInputState({ ...inputState, time: t.value })
                      }>
                      {t.text.includes("選択してください") ||
                      t.text.includes("Select")
                        ? UI_LANG[lang].any
                        : t.text.replace("限", "")}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 🌟 キーワード条件ヘッダー */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "40px",
                marginBottom: "24px"
              }}>
              <div className="section-title" style={{ marginBottom: 0 }}>
                {UI_LANG[lang].keywordsTitle}
              </div>
              <button className="btn-reset-text" onClick={handleResetLower}>
                {UI_LANG[lang].resetLower}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px"
              }}>
              <div className="input-group">
                <label className="input-label">{UI_LANG[lang].sbj}</label>
                <input
                  type="text"
                  placeholder={UI_LANG[lang].sbjPlaceholder}
                  value={inputState.sbj}
                  onChange={(e) =>
                    setInputState({ ...inputState, sbj: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <label className="input-label">{UI_LANG[lang].staff}</label>
                <input
                  type="text"
                  placeholder={UI_LANG[lang].staffPlaceholder}
                  value={inputState.staff}
                  onChange={(e) =>
                    setInputState({ ...inputState, staff: e.target.value })
                  }
                />
              </div>
              <div className="input-group" style={{ gridColumn: "span 2" }}>
                <label className="input-label">{UI_LANG[lang].all}</label>
                <input
                  type="text"
                  placeholder={UI_LANG[lang].allPlaceholder}
                  value={inputState.all}
                  onChange={(e) =>
                    setInputState({ ...inputState, all: e.target.value })
                  }
                />
              </div>
            </div>

            {/* 🌟 詳しく検索（アコーディオン） */}
            <div className="section-title" style={{ marginTop: "40px" }}>
              {UI_LANG[lang].advancedTitle}
            </div>
            <div className="input-group">
              <div
                className="accordion-header"
                onClick={() => setShowAdvanced(!showAdvanced)}>
                <span>{UI_LANG[lang].advancedHeader}</span>
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
                        {UI_LANG[lang].keywordParam}
                      </label>
                      <input
                        type="text"
                        placeholder={UI_LANG[lang].keywordPlaceholder}
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
                        {UI_LANG[lang].experience}
                      </label>
                      <div className="chip-group">
                        <div
                          className={`chip ${inputState.experience === "1" ? "active" : ""}`}
                          onClick={() =>
                            setInputState({ ...inputState, experience: "1" })
                          }>
                          {UI_LANG[lang].expYes}
                        </div>
                        <div
                          className={`chip ${inputState.experience === "0" ? "active" : ""}`}
                          onClick={() =>
                            setInputState({ ...inputState, experience: "0" })
                          }>
                          {UI_LANG[lang].expNo}
                        </div>
                        <div
                          className={`chip ${inputState.experience === "NULL" ? "active" : ""}`}
                          onClick={() =>
                            setInputState({ ...inputState, experience: "NULL" })
                          }>
                          {UI_LANG[lang].any}
                        </div>
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">
                        {UI_LANG[lang].sort}
                      </label>
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
                      <label className="input-label">
                        {UI_LANG[lang].langCode}
                      </label>
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
                      <label className="input-label">
                        {UI_LANG[lang].method}
                      </label>
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

            {/* 🌟 SDGs 条件（アコーディオン） */}
            <div className="section-title" style={{ marginTop: "40px" }}>
              {UI_LANG[lang].sdgsTitle}
            </div>
            <div className="input-group">
              <div
                className="accordion-header"
                onClick={() => setShowSdgs(!showSdgs)}>
                <span>{UI_LANG[lang].sdgsHeader}</span>
                <span>{showSdgs ? "▲" : "▼"}</span>
              </div>
              {showSdgs && (
                <div className="accordion-content">
                  <div className="sdgs-list">
                    {/* 🌟 1. SDGsのラベル表示を言語に応じて切り替え */}
                    {SDGS_LABELS[lang].map((label, i) => (
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

            <button className="btn-submit" onClick={handleFinalSearch}>
              シラバスを検索する
            </button>
          </div>
        )}

        {/* 🌟 2. 検索結果一覧画面の多言語化 ＆ テーブル列ズレ大修正 */}
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
                  {UI_LANG[lang].resultTitle}
                </h2>
              </div>
              <button className="btn-back-link" onClick={handleBackToSearch}>
                {UI_LANG[lang].backToSearch}
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
                  {UI_LANG[lang].currentConditionsTitle}
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
                  <th className="col-term">{UI_LANG[lang].thSemester}</th>
                  <th className="col-grad">{UI_LANG[lang].thGrad}</th>
                  <th className="col-title">{UI_LANG[lang].thTitle}</th>
                  <th className="col-staff">{UI_LANG[lang].thTeacher}</th>
                  <th className="col-time">{UI_LANG[lang].thTime}</th>
                  <th className="col-syl">{UI_LANG[lang].thSyllabus}</th>
                  <th className="col-inazo">{UI_LANG[lang].thInazo}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                        {item.semester[lang]}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                        {item.grad}
                      </span>
                    </td>

                    <td style={{ fontWeight: "800", lineHeight: "1.4" }}>
                      {item.title[lang]}
                    </td>

                    <td>
                      <span
                        style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                        {item.teacher[lang]}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                        {item.time[lang]}
                      </span>
                    </td>
                    {/* 💡 ズレの原因だった重複 td を削除し、ヘッダーと綺麗に整列させました */}
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {item.links.jp && (
                          <a
                            href={item.links.jp}
                            target="_blank"
                            className="btn-action btn-jp">
                            {UI_LANG[lang].btnJp}
                          </a>
                        )}
                        {item.links.en && (
                          <a
                            href={item.links.en}
                            target="_blank"
                            className="btn-action btn-en">
                            {UI_LANG[lang].btnEn}
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
                          {UI_LANG[lang].btnSbj}
                        </a>
                        <a
                          href={`https://inazo.hu-jagajaga.com/search?search=${encodeURIComponent(item.teacher.ja.split("\n")[0].split(/[（(]/)[0].trim())}`}
                          target="_blank"
                          className="btn-action btn-inazo-small">
                          {UI_LANG[lang].btnStaff}
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
                    {UI_LANG[lang].nextPage}
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
