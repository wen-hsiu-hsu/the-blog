---
title: '什麼是 Full Stack 工程師：現代運算的三大支柱'
description: '從講師 Jem Young 的自我介紹出發，拆解現代運算的 UI、伺服器、資料庫三大支柱，並釐清「Full Stack 工程師」與常見技術棧（LAMP、MEAN、MERN）的真正意義。'
date: 2026-08-05
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 1
chapter: 'Introduction'
tags:
    - frontendMasters
    - fullStackFundamentals
    - FullStackEngineer
    - TechStack
---

# 什麼是 Full Stack 工程師：現代運算的三大支柱

這門課是 Frontend Masters 上《Full Stack for Frontend Engineers》系列的第三版，講師 Jem Young 是 Netflix 的軟體工程經理，過去長年擔任 netflix.com 的 UI 工程師，後來轉往平台團隊，現在管理負責 netflix.com 平台的團隊，日常使用的是 Node 加 React 的標準技術棧。

## 課程前提

這門課定位為初學者課程，但假設你已經具備一定的程式基礎：

- 有基本的程式撰寫經驗，否則課程中的部分內容會像天書一樣難懂
- 需要一台可以使用終端機的機器（最好是 OS X）
- 需要網路連線
- 如果想跟著買一個網域，需要一張信用卡（非必要，但買網域、把整套系統串接起來是這門課的樂趣之一）
- 最重要的是要有冒險精神，因為這門課會從終端機一路講到架設自己的伺服器、串接出一個完整的網頁，而且大多會親手完成，不會只靠現成工具

## 現代運算的三個部分

講師把現代運算拆成三個核心部分：

- **UI（使用者介面）**：使用者實際互動的部分，沒有 UI 或終端機介面，就無法使用電腦
- **伺服器**：負責把資料送出去的角色，但這個定義在 serverless 興起後其實也變得模糊
- **資料庫**：最常被忽略、但絕對必要的一環，沒有資料庫，UI 和伺服器彼此之間其實做不了太多事

這三者合起來就是所謂的「現代運算堆疊」。業界習慣把 UI 稱為前端（frontend），把其他所有部分（伺服器、資料庫等）統稱為後端（backend）。

UI 其實無所不在，除了瀏覽器和手機，車用觸控螢幕、桌上型電腦、電視，甚至智慧冰箱這類家電上都有 UI。伺服器的工作也不只是回應 API 請求，同時也負責 logging（幾乎所有網站和應用都需要）、身份驗證（只能在伺服器端完成），而且伺服器本身也是一個開發平台，不論是本機的開發伺服器，還是像 AWS、DigitalOcean 上的遠端伺服器，都是在這個角色上運作。資料庫則是結構化的資料儲存，雖然可以做得比較鬆散、非結構化，但終究不是隨便把東西丟進去的容器，資料分析、商業智慧乃至現代 AI 應用，背後都仰賴某種資料庫。

## 為什麼前端工程師特別在意頭銜，後端工程師卻不會

講師觀察到一個有趣的現象：後端工程師很少爭論自己的頭銜，你說「我是後端工程師」，對方通常直接認同。但前端工程師往往會強調自己更精確的定位，比如專精效能、無障礙（accessibility）或是使用者體驗（UX）。這種對頭銜的敏感，某種程度上也呼應了整堂課想討論的重點：前端只是現代運算裡的一部分，但因為它是最貼近使用者、最容易被看見的部分，才讓大家覺得「軟體工程」約等於「前端」，而其餘的部分反而被忽略。

## Full Stack 工程師是不是一個被過度使用的頭銜？

有學員提到，根據某次 State of JavaScript 之類的調查，有大約一半原本自稱前端工程師的人，現在改稱自己是 full stack 工程師。講師的看法是：他不認為大多數人真的是 full stack 工程師，因為多數人是靠別人做好的工具拼湊出前後端（例如用 Firebase、Vercel、Netlify），這些工具本身沒有問題，但講師不認為單靠使用這些現成服務就足以稱為 full stack。他認為如果不能調整 IP config table、不能設定防火牆、不能自己選擇適合公司需求的作業系統，可能還稱不上 full stack 工程師，這不是在貶低任何人，只是反映現今運算環境的現實。

這也是這門課刻意選擇「盡量用最原始的軟體」而非依賴現成工具的原因：目的是理解各個系統彼此如何串接起來，等到真正理解之後，你依然可以自由選擇使用 Firebase 或 Vercel 這類工具讓生活更輕鬆。

一個具體的例子是：請前端工程師寫一個 React 元件或頁面，多數人不會太困惑，因為網路上教學很多；但如果請同一個人快速寫一個 Node 伺服器，很多人可能無從下手，因為這些細節早就被工具和函式庫層層包裝隱藏了。如果再進一步請人寫一段 SQL 查詢，很多人可能完全不知道從何開始，因為這些知識通常被視為「後端的事」，前端工程師平常很少接觸。

## 什麼是「Full Stack 工程師」

在講師拋出這個問題後，學員給出了各種答案：對資料輸入、處理、呈現負全責的人；什麼都會一點的人；通才（generalist）；精通現代運算所有面向的人。講師特別認同「通才」這個說法，因為現代運算裡幾乎每個主題都極其複雜，真正能在所有領域都達到專家等級的人少之又少。目標不是成為每個系統的專家，而是理解這些系統如何彼此串接，並且知道在真正需要專業協助時該去找誰。

因此，講師對 Full Stack 工程師的定義是：**能夠同時掌管一個應用程式前端與後端的工程師，是能把整個系統串接起來、理解各系統如何運作的人**。

## 什麼是「技術棧」（stack）

講師認為一個典型的技術棧（stack）通常包含：使用者介面、網頁伺服器、資料庫、作業系統，以及視情況而定的應用程式伺服器（application server）。作業系統是很多人容易忽略、視為理所當然的一層，但每個 UI 底層都有某種作業系統在運作。

業界有幾個知名的技術棧縮寫，但這些名稱本質上都是行銷或社群自行拼湊出來的，並沒有標準答案：

- **LAMP**（Linux、Apache、MySQL、PHP）：世界上最普及的技術棧，也是 WordPress 背後採用的架構。儘管許多前端工程師平常寫 React、對 Apache、PHP、MySQL 相對陌生，WordPress 至今仍是全世界最主流的網頁建置方式
- **MEAN**（Mongo、Express、Angular、Node.js）
- **MERN**（Mongo、Express、React、Node.js），是比 MEAN 更新一些的組合

此外還有一些較少人談論但同樣存在的組合，例如 React、Node.js 加 Redis；Angular、Tomcat（一個廣泛用於 Java 的應用伺服器 / 網頁伺服器，但因為被視為後端技術，很多前端工程師沒聽過）加 MySQL；以及 Vue、Apache 加 Postgres。

這些縮寫本身並不重要，關鍵是你和團隊實際使用、熟悉的組合是什麼，能夠拼湊出一個「足夠好」的應用程式。所以「full stack」並不是指某一組特定的技術，而是泛指「能夠同時管理應用程式前端與後端」的工程師，能把系統串起來，理解這些系統如何運作的人。

## 小測驗

<details>
<summary>技術棧（technology stack）通常包含哪些關鍵組成？</summary>
典型的技術棧包含使用者介面、網頁伺服器、資料庫、作業系統，以及可能需要的應用程式伺服器
</details>

<details>
<summary>有哪三個知名的技術棧縮寫？</summary>
LAMP（Linux、Apache、MySQL、PHP）、MEAN（Mongo、Express、Angular、Node.js）、MERN（Mongo、Express、React、Node.js）
</details>

<details>
<summary>Full Stack 工程師一般如何被定義？</summary>
能夠同時掌管應用程式前端與後端、理解不同系統如何協同運作的工程師
</details>

<details>
<summary>Full Stack 工程師的核心特質是什麼？</summary>
是一個理解不同技術系統如何互相串接的通才，不必是每個細節的專家
</details>

<details>
<summary>對 Full Stack 工程師來說，最重要的技能是什麼？</summary>
理解不同系統如何串接在一起，並知道如何整合各種技術，即使不是每一項的專家
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
