import boldFont from "url:~assets/fonts/GenInterfaceJPDisplay-Bold.ttf"
import regularFont from "url:~assets/fonts/GenInterfaceJP-Regular.ttf"

// 拡張機能全体で共有する緑基調のカラーパレット。
// コンテンツスクリプトはCSS変数（THEME_VARS_*）を、
// popupなどインラインスタイルの画面は COLORS を参照する。

export const COLORS = {
  main: "#1F8C32",
  mainLight: "#4CAF50",
  mainDark: "#166524",
  text: "#001C0C",
  inazo: "#006085",
  itemHoverBg: "#f0f7f1",
  borderColor: "#d1e6d5",
  headerGradient:
    "linear-gradient(135deg, #4CAF50 0%, #1F8C32 50%, #166524 100%)"
} as const

export const FONT_FACE_CSS = `
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
`

export const THEME_VARS_LIGHT = `
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
`

export const THEME_VARS_DARK = `
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
`
