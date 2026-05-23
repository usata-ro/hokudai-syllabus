import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import React, { useEffect, useMemo, useRef, useState } from "react"
import regularFont from "url:~assets/fonts/GenInterfaceJP-Regular.ttf"
import boldFont from "url:~assets/fonts/GenInterfaceJPDisplay-Bold.ttf"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { DOM } from "~lib/domAdapter"
import { cleanCache, debounce, observeDOM, splitLang } from "~lib/utils"

// 🌟 7. Postback Allowlist (予期しないRCEを防ぐ)
const ALLOWED_TARGETS = [
  "ctl00$phContents$ucGrid$grv",
  "ctl00$phContents$ddl_year",
  "ctl00$phContents$ddl_org",
  "ctl00$imgBtnJpnBtm",
  "ctl00$imgBtnEngBtm",
  "ctl00$phContents$lnkReturn_Up$lnk"
]

export const config: PlasmoCSConfig = {
  matches: [
    "https://gakumu.academic.hokudai.ac.jp/Portal/Public/Syllabus/SearchMain.aspx*"
  ]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")

  // インポートした変数をそのままCSSに埋め込みます
  style.textContent = `
    @font-face {
      font-family: 'Gen Interface JP';
      src: url('${regularFont}') format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    
    @font-face {
      font-family: 'Gen Interface JP Display';
      src: url('${boldFont}') format('truetype');
      font-weight: 800;
      font-style: normal;
    }

    :host {
      /* 基本カラー */
      --text-color: #001C0C;
      --text-secondary: #444444;
      --text-muted: #888888;
      --text-on-main: #ffffff;
      --main-color: #1F8C32;
      --accent-color: #89bf80;
      --bg-color: #f0f4f1;
      --card-bg: #ffffff;
      --input-bg: #ffffff;
      
      /* ヘッダー関連 */
      --header-text: #ffffff;
      --header-bg-start: #4CAF50;
      --header-bg-mid: #1F8C32;
      --header-bg-end: #166524;
      --lang-bg: rgba(255, 255, 255, 0.2);
      --lang-border: rgba(255, 255, 255, 0.4);
      --lang-active-bg: #ffffff;
      --lang-active-text: #1F8C32;
      
      /* コンポーネント関連 (チップ、アコーディオンなど) */
      --item-bg: #f8faf9;
      --item-hover-bg: #f0f7f1;
      --item-border: #e0e8e1;
      --faculty-bg: #f9fcf9;
      --faculty-border: #e8f0e8;
      
      /* テーブル関連 */
      --table-th-bg: #f5faf6;
      --table-border: #f0f0f0;
      --border-color: #d1e6d5;
      
      /* ボタン・バッジ関連 */
      --inazo-color: #006085;
      --btn-en-bg: #666666;
      --btn-back-border: #cccccc;
      --btn-back-hover: #f9f9f9;
      
      /* エラー状態 */
      --error-color: #e53935;
      --error-bg: #fff8f8;
      --error-border: #ffcdd2;
      --error-text: #d32f2f;
      
      /* シャドウ */
      --shadow-sm: rgba(0, 28, 12, 0.06);
      --shadow-md: rgba(31, 140, 50, 0.2);
      --shadow-lg: rgba(31, 140, 50, 0.25);

      display: block;
      width: 100%;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        /* 基本カラー (ダーク) */
        --text-color: #e6f2ec;
        --text-secondary: #b0beb5;
        --text-muted: #808b94;
        --text-on-main: #ffffff;
        --main-color: #2eb845;
        --accent-color: #4a7543;
        --bg-color: #0d1a12;
        --card-bg: #152419;
        --input-bg: #121f15;
        
        /* ヘッダー関連 (ダーク) */
        --header-text: #e6f2ec;
        --header-bg-start: #1b4d24;
        --header-bg-mid: #103816;
        --header-bg-end: #09210c;
        --lang-bg: rgba(0, 0, 0, 0.3);
        --lang-border: rgba(255, 255, 255, 0.2);
        --lang-active-bg: #2eb845;
        --lang-active-text: #ffffff;
        
        /* コンポーネント関連 (ダーク) */
        --item-bg: #1a2e20;
        --item-hover-bg: #213d2a;
        --item-border: #2c4a35;
        --faculty-bg: #18291c;
        --faculty-border: #233d28;
        
        /* テーブル関連 (ダーク) */
        --table-th-bg: #152b1d;
        --table-border: #2c4a35;
        --border-color: #21402b;
        
        /* ボタン・バッジ関連 (ダーク) */
        --inazo-color: #3bb3e0; /* 見やすいように調整 */
        --btn-en-bg: #555555;
        --btn-back-border: #444444;
        --btn-back-hover: #1f3325;
        
        /* エラー状態 (ダーク) */
        --error-color: #ef5350;
        --error-bg: #3d1c1c;
        --error-border: #7a2b2b;
        --error-text: #ff8a80;
        
        /* シャドウ (ダーク) */
        --shadow-sm: rgba(0, 0, 0, 0.4);
        --shadow-md: rgba(46, 184, 69, 0.15);
        --shadow-lg: rgba(46, 184, 69, 0.2);
      }
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
      box-shadow: 0 4px 12px var(--shadow-md);
    }

    .modern-header-bg {
      width: 100%;
      background: linear-gradient(135deg, var(--header-bg-start) 0%, var(--header-bg-mid) 50%, var(--header-bg-end) 100%);
      display: flex;
      justify-content: center;
    }

    .modern-header {
      width: 1100px;
      padding: 12px 32px;
      color: var(--header-text);
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
    }

    .header-left { display: flex; align-items: center; gap: 24px; }
    .modern-header h1 { font-family: "Gen Interface JP Display", sans-serif; font-weight: 800; margin: 0; font-size: 1.35rem; letter-spacing: 0.05em; color: var(--header-text); text-shadow: 0 1px 2px rgba(0,0,0,0.2); }

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

    .lang-toggle { display: inline-flex; background-color: var(--lang-bg); border-radius: 6px; overflow: hidden; border: 1px solid var(--lang-border); }
    .lang-btn { background: transparent; border: none; color: var(--header-text); padding: 6px 14px; font-family: inherit; font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: all 0.2s ease; }
    .lang-btn.active { background-color: var(--lang-active-bg); color: var(--lang-active-text); }

    .container { width: 1100px; padding: 40px 32px; box-sizing: border-box; display: flex; flex-direction: column; }

    .form-card { background: var(--card-bg); border-radius: 16px; padding: 32px; box-shadow: 0 8px 24px var(--shadow-sm); border: 1px solid var(--border-color); }
    .section-title { font-size: 1.25rem; font-weight: 800; color: var(--main-color); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
    .section-title::before { content: ""; width: 4px; height: 1.2em; background: var(--main-color); border-radius: 2px; }

    .input-group { margin-bottom: 24px; }
    .input-label { font-weight: 800; font-size: 1rem; margin-bottom: 12px; display: block; color: var(--text-secondary); }

    .chip-group { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip {
      padding: 10px 20px;
      border-radius: 10px;
      background: var(--item-bg);
      border: 1.5px solid var(--item-border);
      color: var(--text-color);
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;
      transition: all 0.2s ease;
      user-select: none;
      display: flex;
      align-items: center;
    }
    .chip:hover { border-color: var(--main-color); background: var(--item-hover-bg); }
    .chip.active { background: var(--main-color); color: var(--text-on-main); border-color: var(--main-color); box-shadow: 0 4px 10px var(--shadow-md); }

    .faculty-container { display: flex; flex-direction: column; gap: 16px; background: var(--faculty-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--faculty-border); }
    .faculty-group { display: flex; flex-direction: column; gap: 8px; }
    .faculty-group-label { font-size: 0.85rem; font-weight: 800; color: var(--text-secondary); border-left: 4px solid var(--accent-color); padding-left: 8px; }

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
      background-color: var(--input-bg);
      color: var(--text-color);
    }
    
    select:focus, input[type="text"]:focus { 
      border-color: var(--main-color); 
      box-shadow: 0 0 0 3px var(--shadow-md);
    }

    select::-ms-expand { display: none !important; }

    select {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      cursor: pointer;
      background-color: var(--input-bg) !important;
      background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjMUY4QzMyJyBzdHJva2Utd2lkdGg9JzIuNScgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cG9seWxpbmUgcG9pbnRzPSc2IDkgMTIgMTUgMTggOScvPjwvc3ZnPg==") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      background-size: 16px !important;
      padding-right: 40px !important;
    }
    
    select:hover { background-color: var(--item-hover-bg) !important; border-color: var(--accent-color); }
    
    .btn-submit { background: var(--main-color); color: var(--text-on-main); border: none; padding: 20px 100px; font-size: 1.25rem; font-weight: 800; border-radius: 50px; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 20px var(--shadow-lg); display: block; margin: 40px auto 0; }
    .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 25px var(--shadow-lg); filter: brightness(1.1); }

    .accordion-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--item-bg); border: 1.5px solid var(--border-color); border-radius: 10px; cursor: pointer; font-weight: 800; transition: all 0.2s; margin-bottom: 4px; }
    .accordion-header:hover { border-color: var(--main-color); background: var(--item-hover-bg); }
    .accordion-content { padding: 20px; background: var(--card-bg); border: 1.5px solid var(--border-color); border-top: none; border-radius: 0 0 12px 12px; margin-top: -4px; margin-bottom: 24px; }

    .sdgs-list { display: flex; flex-direction: column; gap: 6px; }
    .sdgs-item { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; cursor: pointer; padding: 8px; border-radius: 8px; transition: background 0.2s; user-select: none; }
    .sdgs-item:hover { background: var(--item-hover-bg); }
    .sdgs-item input { width: 18px; height: 18px; accent-color: var(--main-color); cursor: pointer; }

    .conditions-summary { 
      background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 0; margin-bottom: 24px; box-shadow: 0 4px 12px var(--shadow-sm); overflow: hidden;
    }
    .conditions-header { padding: 16px 24px; background: var(--item-bg); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
    .conditions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 24px; }
    .condition-item { display: flex; flex-direction: column; border-bottom: 1px dashed var(--item-border); padding-bottom: 6px; }
    .condition-label { font-weight: bold; color: var(--text-muted); margin-bottom: 2px; font-size: 0.85rem; }
    .condition-val { font-weight: 800; color: var(--main-color); line-height: 1.2; font-size: 1rem; }

    .result-table { width: 100%; border-collapse: separate; border-spacing: 0; background: var(--card-bg); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px var(--shadow-sm); border: 1px solid var(--border-color); table-layout: fixed; }
    .result-table th { background: var(--table-th-bg); color: var(--main-color); padding: 18px 12px; text-align: left; font-weight: 800; font-size: 0.9rem; border-bottom: 2px solid var(--border-color); }
    .result-table td { padding: 16px 12px; border-bottom: 1px solid var(--table-border); vertical-align: middle; font-size: 1rem; overflow-wrap: break-word; }
    .result-table tr:hover td { background-color: var(--item-hover-bg); }

    .col-term { width: 70px; }
    .col-title { width: 180px; }
    .col-staff { width: 210px; }
    .col-time { width: 80px; }  
    .col-syl { width: 125px; }
    .col-inazo { width: 180px; }
    .col-grad { width: 50px; }

    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 40px; margin-bottom: 60px; }
    .page-btn { min-width: 44px; height: 44px; border-radius: 12px; background: var(--card-bg); border: 2px solid var(--border-color); color: var(--main-color); font-weight: 800; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 1rem; }
    .page-btn:hover { border-color: var(--main-color); background: var(--item-hover-bg); }
    .page-btn.active { background: var(--main-color); color: var(--text-on-main); border-color: var(--main-color); }
    .page-btn.next-btn { padding: 0 24px; background: var(--main-color); color: var(--text-on-main); }

    .btn-action { text-decoration: none; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid transparent; white-space: nowrap; transition: all 0.2s; }
    .btn-jp { background: var(--main-color); color: var(--text-on-main); }
    .btn-en { background: var(--btn-en-bg); color: var(--text-on-main); }
    .btn-inazo-small { background: var(--card-bg); color: var(--inazo-color); border-color: var(--inazo-color); padding: 6px 14px; font-size: 0.85rem; }
    .btn-inazo-small:hover { background: var(--inazo-color); color: var(--text-on-main); }
    .inazo-group { display: flex; flex-direction: row; gap: 10px; }
    
    .btn-back-link { background: var(--card-bg); border: 1.5px solid var(--btn-back-border); padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: bold; color: var(--text-secondary); font-size: 1rem; transition: background 0.2s; }
    .btn-back-link:hover { background: var(--btn-back-hover); }

    .required-badge { background-color: var(--error-color); color: var(--text-on-main); font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; margin-left: 8px; vertical-align: middle; font-weight: bold; }
    .error-text { color: var(--error-color); font-size: 0.9rem; font-weight: bold; margin-top: 8px; }
    .has-error .chip { border-color: var(--error-border); background-color: var(--error-bg); color: var(--error-text); }
    .has-error select { border-color: var(--error-color); background-color: var(--error-bg); }
    .has-error .faculty-container { border-color: var(--error-color); background-color: var(--error-bg); }

    .btn-reset-text { background: var(--card-bg); color: var(--text-secondary); border: 1.5px solid var(--border-color); padding: 6px 14px; font-size: 0.85rem; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
    .btn-reset-text:hover { background: var(--error-bg); color: var(--error-color); border-color: var(--error-border); }
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

  const [options, setOptions] = useState<any>({
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
    sdgs: [] as string[]
  })

  const inputStateRef = useRef(inputState)
  useEffect(() => {
    inputStateRef.current = inputState
  }, [inputState])

  const [errors, setErrors] = useState({
    year: false,
    org: false,
    faculty: false
  })
  const [results, setResults] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [currentConditions, setCurrentConditions] = useState<any[]>([])

  // 🌟 9. debounce 処理をキャッシュ（サーバー負荷軽減策）
  const submitDebounced = useMemo(
    () =>
      debounce((form: HTMLFormElement) => {
        form.submit()
      }, 500),
    []
  )

  useEffect(() => {
    const form = DOM.form()

    const initializeView = () => {
      const pnlSearch = DOM.search.pnlSearch()
      const pnlList = DOM.search.pnlList()

      if (isSearchActive || isSearchListActive) {
        document.body.style.overflow = "auto"
        document.body.style.minWidth = "1100px" // これが横スクロールの鍵
        document.body.style.margin = "0"
        document.body.style.padding = "0"
        document.body.style.backgroundColor = "#f0f4f1"
      }

      if (pnlSearch && isSearchActive) {
        setView("search")
        if (form) {
          // 🌟 修正：高さを0にして元のフォームがページを押し下げるのを防ぐ
          form.style.visibility = "hidden"
          form.style.position = "absolute"
          form.style.left = "-99999px"
          form.style.top = "0"
          form.style.height = "0"
          form.style.overflow = "hidden"
        }
        const engBtn = DOM.search.getEngBtn()
        setLang(engBtn?.getAttribute("disabled") === "disabled" ? "en" : "ja")

        // 🌟 10. MutationObserverを使用して安全にDOMの安定を待つ（不完全DOM対応）
        observeDOM(document.body, scrapeAllOptions)
      } else if (pnlList && isSearchListActive) {
        setView("list")
        if (form) {
          form.style.visibility = "hidden"
          form.style.position = "absolute"
          form.style.left = "-99999px"
          form.style.top = "0"
          form.style.height = "0"
          form.style.overflow = "hidden"
        }
        observeDOM(document.body, () => {
          scrapeResults()
          scrapeExhaustiveConditions()
        })
      } else {
        setView("original")
        if (form) {
          form.style.visibility = "visible"
          form.style.position = ""
          form.style.left = ""
          form.style.top = ""
          form.style.height = ""
          form.style.overflow = ""
        }
        document.body.style.overflow = ""
        document.body.style.minWidth = ""
        document.body.style.margin = ""
        document.body.style.padding = ""
        document.body.style.backgroundColor = ""
      }
    }

    initializeView()

    return () => {
      if (form) {
        form.style.visibility = "visible"
        form.style.position = ""
        form.style.left = ""
      }
    }
  }, [isSearchActive, isSearchListActive])

  if (isSearchActive === undefined || isSearchListActive === undefined) {
    return null
  }

  const scrapeAllOptions = () => {
    const getOpts = (el: HTMLSelectElement | null) =>
      el
        ? Array.from(el.options).map((o) => ({ text: o.text, value: o.value }))
        : []

    setOptions({
      years: getOpts(DOM.search.getYearSelect()),
      orgs: getOpts(DOM.search.getOrgSelect()).filter(
        (o) => o.value !== "NULL"
      ),
      faculties: getOpts(DOM.search.getFacultySelect()),
      grads: getOpts(DOM.search.getGradSelect()),
      terms: getOpts(DOM.search.getTermSelect()),
      days: getOpts(DOM.search.getDaySelect()),
      times: getOpts(DOM.search.getTimeSelect()),
      sorts: getOpts(DOM.search.getSortSelect()),
      langs: getOpts(DOM.search.getLangSelect()),
      methods: getOpts(DOM.search.getMethodSelect())
    })

    setInputState({
      year: DOM.search.getYearSelect()?.value || "",
      org: DOM.search.getOrgSelect()?.value || "NULL",
      faculty: DOM.search.getFacultySelect()?.value || "NULL",
      grad: DOM.search.getGradSelect()?.value || "NULL",
      term: DOM.search.getTermSelect()?.value || "NULL",
      day: DOM.search.getDaySelect()?.value || "-1",
      time: DOM.search.getTimeSelect()?.value || "NULL",
      sort: DOM.search.getSortSelect()?.value || "NULL",
      sbj: DOM.search.getSbjInput()?.value || "",
      staff: DOM.search.getStaffInput()?.value || "",
      keyword: DOM.search.getKeywordInput()?.value || "",
      all: DOM.search.getAllInput()?.value || "",
      experience: DOM.search.getExpSelect()?.value || "NULL",
      langCode: DOM.search.getLangSelect()?.value || "NULL",
      method: DOM.search.getMethodSelect()?.value || "NULL",
      sdgs: []
    })
  }

  const groupedFaculties = useMemo(() => {
    const items = options.faculties.filter((f: any) => f.value !== "NULL")
    return [{ label: UI_LANG[lang].facultyLabel, items }]
  }, [options.faculties, lang])

  const handleOrgChange = (val: string) => {
    const isLawSchool = val === "05"
    const facultyValue = isLawSchool ? "15" : "NULL"
    setInputState((prev) => ({ ...prev, org: val, faculty: facultyValue }))
    if (errors.org) setErrors((prev) => ({ ...prev, org: false }))

    const form = DOM.form()
    const eventTarget = DOM.getEventTarget()
    const ddlOrg = DOM.search.getOrgSelect()
    const ddlFaculty = DOM.search.getFacultySelect()

    if (form && eventTarget && ddlOrg) {
      ddlOrg.value = val
      if (ddlFaculty) ddlFaculty.value = facultyValue
      eventTarget.value = "ctl00$phContents$ddl_org"
      // 連打時の過剰POSTを防ぐ
      submitDebounced(form)
    }
  }

  const handleYearChange = (val: string) => {
    setInputState((prev) => ({ ...prev, year: val }))
    if (errors.year) setErrors((prev) => ({ ...prev, year: false }))

    const form = DOM.form()
    const eventTarget = DOM.getEventTarget()
    const ddlYear = DOM.search.getYearSelect()

    if (form && eventTarget && ddlYear) {
      ddlYear.value = val
      eventTarget.value = "ctl00$phContents$ddl_year"
      submitDebounced(form)
    }
  }

  const scrapeExhaustiveConditions = () => {
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
        const el =
          document.getElementById(m.id) ??
          (document.querySelector(
            `[id$="${m.id.replace("ctl00_phContents_", "")}"]`
          ) as HTMLElement | null)
        const val = el?.textContent?.trim().replace(/\u00a0/g, "") || ""
        return { label: m.label, value: val || "指定なし" }
      })
      .filter((c) => c.value !== "指定なし" && c.value !== "")
    setCurrentConditions(conditions)
  }

  const scrapeResults = async () => {
    const table = DOM.search.getResultTable()
    if (!table) return

    const headers = Array.from(table.querySelectorAll("th")).map(
      (th) => th.textContent?.trim() || ""
    )

    const headerMap = {
      semester: headers.findIndex(
        (h) => h.includes("期間") || h.includes("Semester")
      ),
      title: headers.findIndex((h) => h.includes("科目名")),
      teacher: headers.findIndex((h) => h.includes("担当教員")),
      time: headers.findIndex(
        (h) => h.includes("曜日・時限") || h.includes("曜日時限")
      ),
      grad: headers.findIndex((h) => h.includes("対象年次"))
    }
    const allRows = Array.from(table.querySelectorAll("tr"))
    const resultRows = allRows.filter(
      (row) =>
        row.querySelectorAll("td").length >= 5 && !row.querySelector("table")
    )

    const data = resultRows.map((row) => {
      const cells = row.querySelectorAll("td")

      const jpLink = cells[3]?.querySelector(".jp")?.getAttribute("href")
      let enLink = cells[3]?.querySelector(".en")?.getAttribute("href")
      if (!enLink && jpLink) enLink = jpLink.replace("je_cd=1", "je_cd=2")

      return {
        semester: splitLang(cells[headerMap.semester]),
        title: splitLang(cells[headerMap.title]),
        teacher: splitLang(cells[headerMap.teacher]),
        time: splitLang(cells[headerMap.time]),
        grad: cells[headerMap.grad]?.textContent?.trim() || "",
        links: { jp: jpLink, en: enLink }
      }
    })
    setResults(data)

    const storage = new Storage({ area: "local" })
    const newCacheEntries: Record<string, any> = {}
    data.forEach((item) => {
      const match = item.links.jp?.match(/lct_cd=([^&]+)/)
      if (match && match[1]) {
        newCacheEntries[match[1]] = item.time
      }
    })
    await cleanCache(storage, "timetable_cache", newCacheEntries)

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
    const form = DOM.form()
    const eventTarget = DOM.getEventTarget()
    if (form && eventTarget) {
      eventTarget.value =
        targetLang === "ja" ? "ctl00$imgBtnJpnBtm" : "ctl00$imgBtnEngBtm"
      submitDebounced(form)
    }
  }

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
    setErrors({ year: false, org: false, faculty: false })
    const sync = (
      el: HTMLInputElement | HTMLSelectElement | null,
      val: string
    ) => {
      if (el) el.value = val
    }
    sync(DOM.search.getYearSelect(), defaultYear)
    sync(DOM.search.getOrgSelect(), "NULL")
    sync(DOM.search.getFacultySelect(), "NULL")
    sync(DOM.search.getGradSelect(), "NULL")
    sync(DOM.search.getTermSelect(), "NULL")
    sync(DOM.search.getDaySelect(), "-1")
    sync(DOM.search.getTimeSelect(), "NULL")
    sync(DOM.search.getSortSelect(), "NULL")
    sync(DOM.search.getSbjInput(), "")
    sync(DOM.search.getStaffInput(), "")
    sync(DOM.search.getKeywordInput(), "")
    sync(DOM.search.getAllInput(), "")
    sync(DOM.search.getExpSelect(), "NULL")
    sync(DOM.search.getLangSelect(), "NULL")
    sync(DOM.search.getMethodSelect(), "NULL")
  }

  const handleResetLower = () => {
    setInputState((prev) => ({
      ...prev,
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

  const handleFinalSearch = () => {
    const state = inputStateRef.current
    const newErrors = {
      year: !state.year || state.year === "",
      org: !state.org || state.org === "NULL",
      faculty: !state.faculty || state.faculty === "NULL"
    }
    setErrors(newErrors)
    if (newErrors.year || newErrors.org || newErrors.faculty) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const sync = (
      el: HTMLInputElement | HTMLSelectElement | null,
      val: string
    ) => {
      if (el) el.value = val
    }

    sync(DOM.search.getYearSelect(), state.year)
    sync(DOM.search.getOrgSelect(), state.org)
    sync(DOM.search.getFacultySelect(), state.faculty)
    sync(DOM.search.getGradSelect(), state.grad)
    sync(DOM.search.getTermSelect(), state.term)
    sync(DOM.search.getDaySelect(), state.day)
    sync(DOM.search.getTimeSelect(), state.time)
    sync(DOM.search.getSortSelect(), state.sort)
    sync(DOM.search.getSbjInput(), state.sbj)
    sync(DOM.search.getStaffInput(), state.staff)
    sync(DOM.search.getKeywordInput(), state.keyword)
    sync(DOM.search.getAllInput(), state.all)
    sync(DOM.search.getExpSelect(), state.experience)
    sync(DOM.search.getLangSelect(), state.langCode)
    sync(DOM.search.getMethodSelect(), state.method)

    DOM.search.getSearchBtn()?.click()
  }

  const handleBackToSearch = () => {
    const form = DOM.form()
    const eventTarget = DOM.getEventTarget()
    if (form && eventTarget) {
      eventTarget.value = "ctl00$phContents$lnkReturn_Up$lnk"
      form.submit()
    } else {
      window.history.back()
    }
  }

  const handlePageClick = (pageText: string) => {
    const isValidPage =
      /^\d+$/.test(pageText) ||
      ["次へ", "前へ", "Next", "Prev", "..."].includes(pageText)
    if (!isValidPage) {
      console.warn("Invalid page input blocked:", pageText)
      return
    }

    const pagerTable = DOM.getPagerTable()
    if (!pagerTable) return

    const links = Array.from(pagerTable.querySelectorAll("a"))
    const targetLink = links.find((a) => a.textContent?.trim() === pageText)

    const form = DOM.form()
    const eventTarget = DOM.getEventTarget()
    const eventArgument = DOM.getEventArgument()

    if (form && eventTarget && eventArgument) {
      if (targetLink) {
        const href = targetLink.getAttribute("href") || ""
        const match = href.match(/__doPostBack\('(.*?)','(.*?)'\)/)
        if (match) {
          const target = match[1]
          const arg = match[2]

          if (
            !ALLOWED_TARGETS.includes(target) &&
            target !== "ctl00$phContents$ucGrid$grv"
          ) {
            console.warn("Unauthorized postback target blocked:", target)
            return
          }

          eventTarget.value = target
          eventArgument.value = arg
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
    const nextBtn = pages.find(
      (p) => p.text.includes("次へ") || p.text.includes("Next")
    )
    return nextBtn ? nextBtn.text : null
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
            <nav className="header-sub-nav">
              <a href="/Portal/Public/Syllabus/SearchMain.aspx">シラバス検索</a>
              <a href="/Portal/Public/Num/NumSearch.aspx">ナンバリング検索</a>
              <a href="/Portal/Public/Cur/CurSearch.aspx">実行教育課程検索</a>
            </nav>
          </header>
        </div>
      </div>

      <main className="container">
        {view === "search" && (
          <div className="form-card">
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

            <div className={`input-group ${errors.year ? "has-error" : ""}`}>
              <label className="input-label">
                {UI_LANG[lang].year}{" "}
                <span className="required-badge">{UI_LANG[lang].required}</span>
              </label>
              <div className="chip-group">
                {options.years.slice(0, 3).map((y: any) => (
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
                      .some((y: any) => y.value === inputState.year)
                      ? inputState.year
                      : ""
                  }
                  onChange={(e) => handleYearChange(e.target.value)}>
                  <option value="" disabled hidden>
                    {UI_LANG[lang].pastYear}
                  </option>
                  {options.years.slice(3).map((y: any) => (
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

            <div className={`input-group ${errors.org ? "has-error" : ""}`}>
              <label className="input-label">
                {UI_LANG[lang].org}{" "}
                <span className="required-badge">{UI_LANG[lang].required}</span>
              </label>
              <div className="chip-group">
                {options.orgs.map((o: any) => (
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
                      {group.items.map((f: any) => (
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

            <div className="section-title" style={{ marginTop: "40px" }}>
              {UI_LANG[lang].timetableConditions}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px"
              }}>
              <div className="input-group">
                <label className="input-label">{UI_LANG[lang].grad}</label>
                <div className="chip-group">
                  {options.grads.map((g: any) => (
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

              <div className="input-group">
                <label className="input-label">{UI_LANG[lang].term}</label>
                <div className="chip-group">
                  {options.terms.map((t: any) => (
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
                <label className="input-label">{UI_LANG[lang].day}</label>
                <div className="chip-group">
                  {options.days.map((d: any) => (
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

              <div className="input-group">
                <label className="input-label">{UI_LANG[lang].time}</label>
                <div className="chip-group">
                  {options.times.map((t: any) => (
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
                        {options.sorts.map((s: any) => (
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
                        {options.langs.map((l: any) => (
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
                        {options.methods.map((m: any) => (
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
              {UI_LANG[lang].submitBtn}
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
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {item.links.jp && (
                          <a
                            href={item.links.jp + "&lang=ja"}
                            target="_blank"
                            className="btn-action btn-jp">
                            {UI_LANG[lang].btnJp}
                          </a>
                        )}
                        {item.links.en && (
                          <a
                            href={item.links.en + "&lang=en"}
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
