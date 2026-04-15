---
title: 圖片格式完整比較：JPEG、PNG、WebP、AVIF 的壓縮、透明與色域差異
description: 比較 JPEG、PNG、WebP、AVIF 四種圖片格式的壓縮方式、透明支援與色域能力，涵蓋有損／無損壓縮、Progressive Rendering、HDR、WCG 等特性，釐清各格式的適用場景與限制。
date: 2026-04-16
category: 程式筆記
tags:
    - frontendMasters
    - advancedWebDevelopmentQuiz
    - WebP
    - AVIF
    - Performance
---

# 圖片格式完整比較：JPEG、PNG、WebP、AVIF 的壓縮、透明與色域差異

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Advanced Web Development Quiz](https://frontendmasters.com/courses/web-dev-quiz/) 課程筆記

## 問題

Match the image formats to the correct descriptions

Match the answers to the correct options.

```
[1] JPEG
[2] PNG
[3] WebP
[4] AVIF

[a] Both lossy and lossless compression, supports HDR and WCG, supports transparency
[b] Both lossy and lossless compression, supports transparency, supports progressive rendering
[c] Lossless compression, high quality, supports transparency, larger file size
[d] Lossy compression, supports progressive rendering
```

## JPEG

### 1. Lossy Compression 有損壓縮

壓縮的本質是丟棄人眼較不敏感的資訊。JPEG 使用 DCT（離散餘弦轉換）將圖片分成 8×8 像素的小方塊，再依照壓縮品質設定捨棄高頻細節（例如細小紋理）。

- 壓縮比例愈高 → 品質愈差，出現「馬賽克方塊感」（artifact）
- 可自行調整品質係數（通常 0–100），在檔案大小與畫質之間取得平衡
- 不適合反覆存檔：每次重新儲存都會再次壓縮，畫質會累積劣化

### 2. Progressive Rendering 漸進式渲染

JPEG 有兩種儲存方式：

- Baseline: 從上到下逐行載入，未載入的部分是空白
- Progressive: 先顯示低解析度全圖，再逐步提升清晰度

Progressive 模式讓使用者在網路較慢時仍能先看到完整構圖，提升使用體驗，這也是逐字稿中說的「先模糊後清晰」的效果。

### 3. 快速解碼

JPEG 的解碼運算相對簡單，硬體加速支援廣泛，適合需要大量圖片快速顯示的場景（如相簿、新聞網站）。

### 4. 限制

- 不支援透明（Alpha channel）
- 不適合銳利邊緣（logo、文字、線條圖）——壓縮後邊緣會有鋸齒與暈染

## PNG

### 1. Lossless Compression 無損壓縮

PNG 使用 DEFLATE 演算法壓縮，壓縮時不丟棄任何像素資料，解壓後與原始圖片完全相同。

- 適合需要反覆編輯的原始素材
- 即使重複儲存，畫質也不會劣化
- 缺點：保留所有資料導致檔案較大

### 2. 透明支援（Alpha Channel）

PNG 支援完整的 Alpha 通道（8-bit 或 16-bit），意味著：

- 全透明：背景完全不顯示
- 半透明：可做出陰影、漸層消失等效果（JPEG 完全無法做到）

這使 PNG 成為 logo、icon、UI 元素的標準格式。

### 3. 適合場景

- 需要銳利邊緣的圖形（文字、線條、幾何圖形）
- 需要透明背景的素材
- 截圖、示意圖等需要精確還原的內容

### 4. 限制

- 對照片類圖片不划算：照片細節豐富，無損壓縮效果有限，檔案會非常大
- 不支援 Progressive rendering
- 不支援動畫（APNG 是擴充格式，支援有限）

## WebP

### 1. 同時支援 Lossy 與 Lossless

WebP 的核心優勢是靈活性——開發者可依需求選擇：

- Lossy WebP：以 VP8 視訊編碼技術為基礎，同品質下比 JPEG 小約 25–34%
- Lossless WebP：以類似 PNG 的方式運作，但比 PNG 小約 26%

### 2. 透明 + 漸進式渲染並存

這是 WebP 最大的賣點——它同時具備：

- JPEG 的 Progressive rendering
- PNG 的 Alpha 透明通道

代表它可以同時替代這兩種格式，減少格式管理的複雜度。

### 3. 電商場景的優勢

電商頁面往往需要同時載入大量商品圖片，WebP 的小檔案優勢可顯著降低頁面載入時間，直接影響轉換率。

### 4. 瀏覽器支援

目前主流瀏覽器（Chrome、Firefox、Safari 14+、Edge）均已支援，可放心使用。

### 5. 限制

- 舊版 Safari（< 14）及 IE 不支援（若需支援舊環境需提供 fallback）
- 色彩表現不如 AVIF 豐富

## AVIF

### 1. 基於 AV1 視訊編解碼器

AVIF 源自 AV1 影片格式，壓縮演算法更現代，在相同畫質下檔案更小，甚至優於 WebP。

### 2. HDR（High Dynamic Range）高動態範圍

一般圖片（SDR）的亮度範圍有限，HDR 能表現：

- 更亮的高光（不過曝）
- 更暗的暗部（不死黑）
- 整體對比更自然、層次更豐富

### 3. WCG（Wide Color Gamut）廣色域

傳統螢幕使用 sRGB 色域，WCG 支援更廣的色彩空間（如 Display P3、Rec. 2020），使圖片：

- 顏色更飽和、更鮮豔
- 不失真地呈現攝影設備捕捉到的完整色彩

這也是為什麼「色彩豐富且需高清呈現的圖片，AVIF 是完美選擇」。

### 4. 透明支援

同樣支援 Alpha 通道，可用於去背圖、網頁背景等。

### 5. 限制

- 編解碼速度慢: 演算法複雜 encode/decode 耗時比 JPEG、WebP 長得多
- 瀏覽器支援尚不完整: Chrome、Firefox 支援，Safari 16+ 才支援，IE 不支援
- 工具鏈尚不成熟: 部分圖片編輯軟體與 CDN 支援有限

## 答案

```
[1] JPEG [d] Lossy compression, supports progressive rendering
[2] PNG [c] Lossless compression, high quality, supports transparency, larger file size
[3] WebP [b] Both lossy and lossless compression, supports transparency, supports progressive rendering
[4] AVIF [a] Both lossy and lossless compression, supports HDR and WCG, supports transparency
```

## 參考

- [Image file type and format guide "MDN"](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)
