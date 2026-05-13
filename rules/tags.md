# 部落格 Tag 規則

## 一、Tag 分層結構

每篇文章的 tag 依以下四個層級組成，L1–L3 由作者自行指定，
**L4 是 Claude 在審閱文章時需要主動提供建議的層級**。

| 層級      | 說明                       | 範例                       |
| --------- | -------------------------- | -------------------------- |
| L1 平台   | 內容來自哪個平台（無則略） | `frontendMasters`          |
| L2 課程   | 來自哪門課（無則略）       | `javaScriptTheHardPartsV3` |
| L3 主技術 | 文章的核心技術             | `JavaScript`               |
| L4 概念   | 文章實際涵蓋的具體概念     | `OOP`、`PrivateFields`     |

## 二、命名規則

### 技術主題 tag（L3、L4）

- 使用該技術的官方大小寫（參考官方網站或 MDN）
- 不使用 kebab-case（不用 `-` 串接）
- 多字組成的概念用 PascalCase
- 範例：JavaScript、CSS、HTML、TypeScript、EventLoop、DNS

### 系列/課程 tag（L1、L2）

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

- L1–L3 由作者自行指定，不需提供建議
- L4 概念 tag 需主動建議，數量由文章內容決定，無硬性上限
- JS 子概念（如 Promise、Generator）需同時加上 JavaScript tag
- 不使用語意過廣、無篩選價值的 tag（例如：程式筆記、前端學習）
- 不使用 kebab-case（任何類型都不用）
