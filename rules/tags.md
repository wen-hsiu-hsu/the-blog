# 部落格 Tag 規則

## 一、Tag 類型

Tag 分為三種類型，每篇文章從中挑選 2～5 個（但是不強制設定上限）：

1. 技術主題 tag：依技術篩選文章，對 SEO 有幫助
2. 系列/課程 tag：讓讀者追同一系列的筆記
3. 非技術 tag：生活、電影等非技術類文章

## 二、命名規則

### 技術主題 tag

- 使用該技術的官方大小寫（參考官方網站或 MDN）
- 不使用 kebab-case（不用 `-` 串接）
- 多字組成的概念用 PascalCase
- 範例：JavaScript、CSS、HTML、TypeScript、EventLoop、DNS

### 系列/課程 tag

- 保留課程/系列的原始名稱
- 多個英文字組成時使用 camelCase
- 中文系列名稱保留中文，不硬翻英文
- 不使用 kebab-case
- 範例：frontendMasters、advancedWebDevelopmentQuiz、JS地下城、六角學院

### 非技術 tag

- 英文首字母大寫
- 中文保留中文
- 範例：Movie、Life、關於

## 三、新增 tag 的判斷流程

遇到不確定的新 tag，依序問自己：

1. 這是某個課程或系列的筆記嗎？
   → 是：使用系列/課程 tag 規則
   → 否：往下判斷

2. 這是技術概念嗎？
   → 是：查官方名稱，用官方大小寫；
   多字組成且無官方寫法 → PascalCase
   → 否：往下判斷

3. 這是非技術內容嗎？
   → 是：英文首字母大寫 / 中文保留中文

## 四、其他規定

- 每篇文章 2～5 個 tag（但是不強制設定上限）
- JS 子概念（如 Promise、Generator）需同時加上 JavaScript tag
- 不使用語意過廣、無篩選價值的 tag（例如：程式筆記、前端學習）
- 不使用 kebab-case（任何類型都不用）
