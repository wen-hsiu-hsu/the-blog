---
title: '改善 TTFB：HTTP 協議演進'
description: '介紹 HTTP 協議從 1.1 到 HTTP/3 的演進，說明 TCP 與 UDP 的差異、Alt-Svc 協議協商機制，以及透過 Caddy 啟用 HTTP/3 的實際效果。'
date: 2026-07-30
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 29
chapter: 'Improving Time to First Byte'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - HTTP
  - NetworkPanel
---

# 改善 TTFB：HTTP 協議演進

## HTTP/1.1 的問題

HTTP/1.1 是最傳統的 HTTP 協議，運作方式是一問一答：瀏覽器發出一個請求，伺服器回應，然後瀏覽器再發出下一個請求，如此反覆。每次請求都需要建立與拆除連線，產生大量重複的網路開銷，在需要取得大量資源的現代網頁上效率很差。

## HTTP/2：單一連線多工

HTTP/2 的核心改進是把多個請求合併到同一條 TCP 連線上進行串流傳輸，不再反覆建立與拆除連線，大幅降低了請求的額外負擔。

## HTTP/3：改用 UDP

HTTP/3 在 HTTP/2 的基礎上更進一步，將底層傳輸協議從 TCP 換成 QUIC（基於 UDP）。

TCP 與 UDP 的核心差異在於確認機制：

- **TCP**：每送出一筆資料，都要等對方回傳 ACK（確認收到），才繼續下一筆。這保證了可靠性，但帶來等待開銷。
- **UDP**：直接持續送出資料，不等確認。如果對方沒收到某一筆，再補傳即可。速度更快，但理論上稍微不那麼可靠。

此外，HTTP/2 在建立安全連線（TLS）時需要多次握手，HTTP/3 將這個過程壓縮到單一請求完成，進一步減少連線建立的時間。

## 實測數據

講師的團隊在洛杉磯、新加坡、法蘭克福架設伺服器，分別測試三種協議的效能，對象包含簡單的 Hello World HTML、React 應用等。結果顯示：

- HTTP/2 相較於 HTTP/1.1 大約快一倍
- HTTP/3 相較於 HTTP/2 又進一步提升

每升級一個版本，傳輸速度大約有 100% 的改善。這不是在實驗室中刻意製造的差距，而是在真實網路環境中量測的結果。

## 實作上的注意事項

升級協議有幾個實務上的限制：

**需要 HTTPS**：HTTP/2 和 HTTP/3 都必須搭配 TLS 加密，這代表你需要有效的 SSL 憑證，本地端設定相對繁瑣。

**UDP 防火牆規則**：在大型企業環境中，HTTP/3 使用的 UDP 連接埠可能需要額外開放防火牆規則。

**工具支援不完整**：標準的 `curl` 無法發出 HTTP/3 請求，需要使用名為 `curl3` 的 fork 版本。

由於本地端設定複雜，講師建議把這類協議升級的工作推給伺服器端的基礎設施處理，不要在本地開發環境中處理。

## Alt-Svc 標頭：協議協商機制

講師示範時，瀏覽器最初使用 HTTP/2 連線，伺服器在回應中帶上 `Alt-Svc` 標頭：

```
Alt-Svc: h3=":443"
```

這告訴瀏覽器：「我也支援 HTTP/3，可以用這個連接埠。」後續所有請求便自動切換為 HTTP/3，透過 UDP 串流傳輸。

## 課堂示範使用的工具

講師使用 **Caddy** 作為反向代理伺服器，讓範例網站支援 HTTP/3。Caddy 是一個免費開源的 HTTP 前端工具，可以自動取得 SSL 憑證並處理協議協商，設定相對簡單。

啟用壓縮與 HTTP/3 之後，TTFB 從原本的 1.775 秒降至約 1.1 秒。講師也指出，在瀑布圖中可以看到各資源請求的 response body 明顯縮小，且都標示為 HTTP/3 協議傳輸。

## 複習

### 在本地端實作 HTTP/2 與 HTTP/3 的兩大挑戰是什麼？

1. 本地端設定困難，示範複雜
2. 需要 HTTPS 與 TLS 加密，涉及繁瑣的憑證管理

### 當標準 curl 無法發出 HTTP/3 請求時，有什麼替代工具？

curl3，一個支援 HTTP/3 請求的 curl 分支版本

### HTTP/3 中 Alt-Svc 標頭的用途是什麼？

告知客戶端伺服器也支援在特定連接埠上使用 HTTP/3，讓後續連線可以切換至 HTTP/3

### HTTP/3 在資料傳輸方面與舊版 HTTP 協議有何不同？

HTTP/3 透過 UDP 連線同時串流多個請求，而舊版協議通常需要依序處理請求

### 示範中使用了什麼工具來啟用 HTTP/3？

Caddy，一個免費開源的 HTTP 前端工具，可自動管理憑證並支援不同協議

## 小測驗

<details>
<summary>HTTP/2 與 HTTP/3 有什麼共同的需求？</summary>
兩者都需要 TLS 加密
</details>

<details>
<summary>哪個標頭用來表示伺服器支援 HTTP/3？</summary>
Alt-Svc 標頭
</details>

<details>
<summary>課程中提到哪個工具可以輕鬆設定 HTTP 前端服務？</summary>
Caddy
</details>

<details>
<summary>HTTP/3 目前有什麼限制？</summary>
curl 無法發出 HTTP/3 請求
</details>

<details>
<summary>HTTP/3 使用哪種傳輸協議？</summary>
UDP
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記