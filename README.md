# 持續！修鍊之路 🚀

> 前端工程師的技術筆記與生活紀錄

![VitePress](https://img.shields.io/badge/VitePress-1.6.3-646cff?style=flat-square&logo=vite)
![Vue](https://img.shields.io/badge/Vue-3.5.13-4FC08D?style=flat-square&logo=vue.js)
![Node](https://img.shields.io/badge/Node.js-21.5.0-339933?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

## 📖 關於本站

這是一個基於 VitePress 構建的個人技術部落格，主要記錄前端開發學習筆記、技術文章，以及偶爾的生活雜談、電影分享。

**線上網站**：[hsiu.soy](https://hsiu.soy)

## ✨ 特色功能

- 🎨 **自定義主題設計** - 基於 VitePress 的完全客製化主題
- 📄 **自動分頁系統** - 智能分頁，每頁展示 10 篇文章
- 🏷️ **標籤與分類** - 完整的文章分類和標籤系統
- 📅 **時間線歸檔** - 按年份組織的文章歸檔
- 📊 **閱讀進度** - 實時閱讀進度指示器
- 💬 **留言系統** - 整合 Giscus 評論功能
- 🔍 **本地搜索** - 快速的站內搜索引擎
- 📡 **RSS 訂閱** - 支援 RSS feed 訂閱
- 🌙 **深色模式** - 完整支援深色主題切換
- 📈 **數據分析** - Google Analytics + Cloudflare Analytics
- 🎯 **SEO 優化** - Open Graph + JSON-LD 結構化數據
- ⚡ **響應式設計** - 完美適配各種螢幕尺寸

## 🛠️ 技術棧

### 核心框架

- **[VitePress](https://vitepress.dev/)** `1.6.3` - 靜態站點生成器
- **[Vue 3](https://vuejs.org/)** `3.5.13` - 漸進式 JavaScript 框架
- **[Vite](https://vitejs.dev/)** - 下一代前端構建工具

### 樣式與 UI

- **[UnoCSS](https://unocss.dev/)** `66.1.0-beta.8` - 原子化 CSS 引擎（Tailwind v4 預設）
- **Noto Serif TC** - 中文字型

### 工具庫

- **[@vueuse/core](https://vueuse.org/)** `13.0.0` - Vue 組合式 API 工具集
- **[date-fns](https://date-fns.org/)** `4.1.0` - 現代化日期處理函式庫
- **[gray-matter](https://github.com/jonschlinkert/gray-matter)** `4.0.3` - Markdown Frontmatter 解析器
- **[globby](https://github.com/sindresorhus/globby)** `14.1.0` - 檔案路徑匹配工具

### 插件與增強

- **vitepress-plugin-rss** `0.3.1` - RSS feed 生成
- **Giscus** - GitHub Issues 驅動的留言系統

## 📁 專案結構

```
the-blog/
├── .vitepress/              # VitePress 配置
│   ├── config.mts           # 主配置檔案
│   ├── global-config.ts     # 全域設定
│   └── theme/               # 自定義主題
│       ├── components/      # Vue 組件（20+ 個）
│       ├── composable/      # 組合式函數
│       ├── utils/           # 工具函數
│       └── custom.css       # 自定義樣式
│
├── articles/                # 內容目錄
│   ├── posts/               # 部落格文章
│   ├── pages/               # 特殊頁面（關於、標籤、分類、歸檔）
│   ├── public/              # 靜態資源
│   └── index.md             # 首頁
│
├── template/                # 文章模板
├── package.json             # 專案依賴
├── tsconfig.json            # TypeScript 配置
├── uno.config.ts            # UnoCSS 配置
└── README.md                # 專案說明
```

## 🚀 快速開始

### 環境需求

- Node.js 21.5.0 或更高版本
- npm 或 yarn 或 pnpm

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

啟動本地開發伺服器，預設在 `http://localhost:5173` 開啟

### 生產構建

```bash
npm run build
```

構建產物會輸出到 `.vitepress/dist` 目錄

### 預覽構建結果

```bash
npm run preview
```

在本地預覽生產構建的結果

## ✍️ 文章撰寫指南

### 建立新文章

在 `articles/posts/` 目錄下建立 Markdown 檔案，建議使用日期命名：

```
articles/posts/YYYY-MM-DD-article-title.md
```

### Frontmatter 格式

每篇文章需要包含 YAML Frontmatter：

```yaml
---
title: 文章標題 # 必填
date: 2024-11-05 # 必填，格式 YYYY-MM-DD
description: 文章簡短描述 # 建議填寫，用於 SEO
category: JavaScript # 分類（只能有一個）
tags: # 標籤（可多個）
    - Vue
    - TypeScript
    - 前端開發
pin: 1 # 可選，置頂文章（數字越大越前面）
publish: true # 可選，是否發布（影響 RSS）
---
文章內容從這裡開始...
```

### Frontmatter 欄位說明

| 欄位          | 必填 | 說明                           |
| ------------- | ---- | ------------------------------ |
| `title`       | ✅   | 文章標題                       |
| `date`        | ✅   | 發布日期，格式 YYYY-MM-DD      |
| `description` | 建議 | 文章摘要，用於 SEO 和社群分享  |
| `category`    | 選填 | 分類，只能指定一個             |
| `tags`        | 選填 | 標籤陣列，可以多個             |
| `pin`         | 選填 | 置頂優先級，數字越大越靠前     |
| `publish`     | 選填 | 是否在 RSS 中顯示，預設為 true |

### 文章內使用 Vue 組件

本部落格支援在 Markdown 中直接使用 Vue 組件：

```markdown
## 這是標題

<BaseTag>標籤範例</BaseTag>

<BaseGithubGistIframe gist-id="your-gist-id" />
```

## ⚙️ 配置說明

### 站點基本資訊

修改 `.vitepress/config.mts`：

```typescript
export default defineConfig({
    title: '持續！修鍊之路', // 站點標題
    description: '...', // 站點描述
    lang: 'zh-TW', // 語言
    // ... 其他配置
});
```

### 調整每頁文章數

在 `.vitepress/config.mts` 中修改 `postsPerPage`：

```typescript
themeConfig: {
    postsPerPage: 10,  // 每頁顯示的文章數量
}
```

### 社群連結設定

在 `.vitepress/config.mts` 的 `themeConfig.socialLinks` 中設定：

```typescript
socialLinks: [
    { icon: 'github', link: 'https://github.com/yourusername' },
    // 新增更多社群連結...
];
```

## 🎨 主題客製化

### 修改顏色主題

編輯 `.vitepress/theme/custom.css`：

```css
:root {
    --vp-c-brand-1: #2563eb; /* 主要品牌色 */
    --vp-c-brand-2: #3b82f6; /* 次要品牌色 */
    /* ... 更多自定義變數 */
}
```

### 新增自定義組件

1. 在 `.vitepress/theme/components/` 建立組件
2. 在 `.vitepress/theme/index.ts` 中註冊：

```typescript
import MyComponent from './components/MyComponent.vue';

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('MyComponent', MyComponent);
    },
};
```

### UnoCSS 配置

修改 `uno.config.ts` 以自定義工具類別：

```typescript
export default defineConfig({
    presets: [
        presetWind4(),
        // 新增更多 presets...
    ],
});
```

## 🌐 部署

### 建議部署平台

- **[Vercel](https://vercel.com/)** - 零配置部署（推薦）
- **[Netlify](https://www.netlify.com/)** - 自動化部署
- **[GitHub Pages](https://pages.github.com/)** - 免費靜態託管
- **[Cloudflare Pages](https://pages.cloudflare.com/)** - 全球 CDN

### Vercel 部署設定

```json
{
    "buildCommand": "npm run build",
    "outputDirectory": ".vitepress/dist",
    "installCommand": "npm install"
}
```

### 環境變數

如需使用分析工具，設定以下環境變數：

- `VITE_GA_ID` - Google Analytics 追蹤 ID
- 其他自定義環境變數...

## 📊 主要組件說明

本主題包含 20+ 個自定義 Vue 組件：

### 佈局組件

- `NewLayout.vue` - 自定義頁面佈局

### 基礎組件

- `BaseTag` - 標籤按鈕
- `BaseIcon` - 圖標組件
- `BaseButton` - 按鈕組件
- `BaseFlipCard` - 翻轉卡片（作者頭像）
- `BaseSidebar` - 側邊欄容器
- `BaseTreeview` - 樹形結構展示

### 文章相關組件

- `PostMeta` - 文章元資料（日期、標籤、閱讀時間）
- `PostSupports` - 點讚/收藏按鈕
- `PostComment` - Giscus 留言系統
- `PostNextPrevLinks` - 上下篇文章導航
- `PostSuggestions` - 相關文章推薦
- `PostReadingProgressIndicator` - 閱讀進度條

### 頁面組件

- `Page` - 主文章列表頁
- `Tags` - 標籤頁面
- `Category` - 分類頁面
- `Archives` - 歸檔頁面
- `NotFoundPage` - 404 頁面

## 🤝 作者資訊

**許文修 (Wen-Hsiu Hsu)**

- 🎯 職位：前端工程師 / 攝影 / 生活紀錄
- 💡 座右銘：「程式碼之外，還有生活的藝術」
- 🔗 個人網站：[resume.hsiu.soy](https://resume.hsiu.soy)

### 社群連結

- [GitHub](https://github.com/kevinshu1995)
- [LinkedIn](https://www.linkedin.com/in/kevin-hws/)
- [Threads](https://www.threads.net/@kevinshu1995)
- [Photography Gallery](https://photography.hsiu.soy/)
- [Email](mailto:kevin.hsu.hws@gmail.com)

## 📄 授權

本專案採用 MIT License 授權 - 詳見 [LICENSE](LICENSE) 文件

---

## 🙏 致謝

- [VitePress](https://vitepress.dev/) - 強大的靜態站點生成器
- [Vue.js](https://vuejs.org/) - 漸進式 JavaScript 框架
- [UnoCSS](https://unocss.dev/) - 即時原子化 CSS 引擎

---

**如果這個專案對你有幫助，歡迎給個 ⭐ Star！**

_最後更新：2024-11-05_
