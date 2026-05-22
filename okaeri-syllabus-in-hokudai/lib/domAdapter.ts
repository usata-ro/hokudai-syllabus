export const DOM = {
  // フォーム関連
  form: () => document.getElementById("aspnetForm") as HTMLFormElement,

  // イベント関連（共通で使えるように整理）
  getEventTarget: () =>
    document.getElementById("__EVENTTARGET") as HTMLInputElement,
  getEventArgument: () =>
    document.getElementById("__EVENTARGUMENT") as HTMLInputElement,

  // 検索画面の各要素取得
  search: {
    pnlSearch: () => document.getElementById("ctl00_phContents_pnlSearch"),
    pnlList: () => document.getElementById("ctl00_phContents_pnlList"),

    getYearSelect: () =>
      document.querySelector<HTMLSelectElement>('select[name$="ddl_year"]'),
    getOrgSelect: () =>
      document.querySelector<HTMLSelectElement>('select[name$="ddl_org"]'),
    getFacultySelect: () =>
      document.querySelector<HTMLSelectElement>('select[name$="ddl_fac"]'),
    getGradSelect: () =>
      document.querySelector<HTMLSelectElement>('select[name$="ddl_grad"]'),
    getTermSelect: () =>
      document.querySelector<HTMLSelectElement>('select[name$="ddl_lctterm"]'),
    getDaySelect: () =>
      document.querySelector<HTMLSelectElement>('select[name$="ddl_day"]'),
    getTimeSelect: () =>
      document.querySelector<HTMLSelectElement>('select[name$="ddl_time"]'),
    getSortSelect: () =>
      document.querySelector<HTMLSelectElement>('select[name$="ddl_sbj_sort"]'),

    getSbjInput: () =>
      document.querySelector<HTMLInputElement>('input[name$="txt_sbj_Search"]'),
    getStaffInput: () =>
      document.querySelector<HTMLInputElement>(
        'input[name$="txt_staff_Search"]'
      ),
    getKeywordInput: () =>
      document.querySelector<HTMLInputElement>(
        'input[name$="txt_keyword_Search"]'
      ),
    getAllInput: () =>
      document.querySelector<HTMLInputElement>('input[name$="txt_all_Search"]'),

    getExpSelect: () =>
      document.querySelector<HTMLSelectElement>(
        'select[name$="ddl_experience"]'
      ),
    getLangSelect: () =>
      document.querySelector<HTMLSelectElement>('select[name$="ddl_lang"]'),
    getMethodSelect: () =>
      document.querySelector<HTMLSelectElement>(
        'select[name$="ddl_lct_do_type"]'
      ),

    getSearchBtn: () =>
      document.querySelector<HTMLInputElement>('input[id$="btnSearch"]'),
    getResultTable: () =>
      document.querySelector<HTMLTableElement>('table[id$="ucGrid_grv"]'),
    getEngBtn: () =>
      document.querySelector<HTMLAnchorElement>('a[id$="imgBtnEngBtm"]')
  },

  // 検索画面外（共通領域）
  getPagerTable: () =>
    document.querySelector<HTMLTableElement>("tr td[colspan] table"),

  // 詳細画面用
  detail: {
    getLctCd: () => document.querySelector('[id$="ucSummary_txtlct_cd_lbl"]'),
    getElement: (idSuffix: string) =>
      document.getElementById(`ctl00_phContents_${idSuffix}`) ||
      document.querySelector(`[id$="${idSuffix}"]`)
  }
} as const
