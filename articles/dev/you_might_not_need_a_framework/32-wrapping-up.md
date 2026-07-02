---
title: 'Vanilla JS 在現代開發中的位置'
description: '回顧課程涵蓋的技術範圍，逐一對照課程開始時列出的開發者疑慮，並說明微型函式庫作為框架與純 Vanilla JS 之間的合理中間地帶。'
date: 2026-07-15
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 32
chapter: 'Wrapping Up'
tags:
    - JavaScript
    - frontendMasters
    - youMightNotNeedAFramework
    - ReactiveProgramming
---

# Vanilla JS 在現代開發中的位置

> 這是「Vanilla JS: You Might Not Need a Framework」課程的最後一篇筆記。從 DOM API 的基礎、ES 模組組織、Fetch API、SPA 路由、Web Components，到 Proxy 與響應式程式設計，課程在這一節做了全面的回顧與收尾。

## 課程涵蓋的技術範圍

這門課實際寫了的內容：

- DOM API 的核心操作（選取元素、修改屬性、事件監聽）
- ES 模組系統與入口點組織
- Fetch API 取得 JSON 資料
- 自訂事件的廣播與監聽作為元件間通訊的機制
- SPA 路由（History API、popstate 事件）
- Web Components 的三個標準：Custom Elements、HTML Templates、Shadow DOM
- 用 Proxy 實現資料驅動的 UI 更新與雙向資料綁定

講師也示範了多種設計模式混用的做法，從 Service 層的物件模式、ES 模組的具名與預設匯出，到不同的 DOM 操作技巧，沒有強迫你遵循一種固定方式。

## 回顧課程開始時列出的恐懼

課程開始時列出了開發者對 Vanilla JS 常見的疑慮，這裡逐一對照：

**SPA 路由**：我們實作了一個功能完整的路由器，不依賴任何函式庫，也沒有那麼複雜。

**太冗長、太耗時**：這個問題是真實的，但可以用抽象層解決。你可以建立自己的基礎類別，把重複的 template 克隆、CSS 載入邏輯封裝進去，你的元件就不需要再重複這些程式碼。

**狀態管理**：我們用 Proxy 和陣列不可變性實現了一個簡單但有效的響應式 Store，也說明了如果你喜歡 Redux，它不需要 React，可以獨立搭配 Vanilla JS 使用。

**模板語法（Templating）**：我們用 HTML Templates 和 template literals 做了基礎模板。如果你需要更多能力，講師提到了 `lit-html`，它用 tagged template literals 讓模板支援事件綁定和智慧更新，卻不需要一個完整的框架。

**複雜度**：複雜度通常來自不熟悉，而不是平台本身的問題。大多數覺得 Vanilla JS 複雜的人，其實只是還沒有真正理解它。

**可重用元件**：Web Components 提供了瀏覽器原生的元件化機制。事實上 Angular、React 和 Vue 都可以把元件匯出為 Web Components，再在 Vanilla JS 應用程式中使用。

**學習曲線**：講師認為 Vanilla JS 的學習曲線並不比學習一個完整框架高，理解了底層，反而讓你更容易理解任何框架在做什麼。

**瀏覽器相容性**：課程中使用的所有 API 在現代瀏覽器（包含 Safari）上都能運作，除了 Customized Builtins 這一個小功能不支援 Safari，其餘都沒有問題。IE 11 的相容性需求和使用 React 是一樣的問題，不是 Vanilla JS 特有的困境。

**重複造輪子**：取決於你是否建立了自己的工具函式庫或抽象層。講師本人建立了超過 100 個 Vanilla JS 應用程式，有自己的一套慣用模式和工具，不需要每次從零開始。

**擴展性**：和使用框架一樣，擴展性取決於架構決策和紀律，而不是技術本身。

## 微型函式庫是一個合理的中間地帶

講師提出一個實用的觀點：你不需要在「完全 Vanilla JS」和「完整框架」之間二選一。

需要更強的模板能力，可以加入 `lit-html`。需要路由，有專注於這個問題的輕量函式庫。喜歡 Redux 的狀態管理模式，直接用就好，不需要 React。把這些微型工具一個個加入，只在確實需要的地方使用，和在一開始就把整個框架拉進來，是完全不同的決策思路。

課程也討論了 Frontend Masters 本身就是用 Vanilla JS 建立的，這個選擇帶來的長期效益是：模組不需要隨著框架的大版本升級而重寫，核心代碼能夠存活超過十年，不需要在每一波框架遷移浪潮（AngularJS → Angular → React → Next.js ...）中跟著重寫整個應用程式。

## 課程的核心主張

這門課不是要說服你在所有場景都用 Vanilla JS，而是讓你具備知識去做出更好的決策。當你了解瀏覽器的原生能力，你才能真正評估一個框架替你解決了什麼問題、引入了什麼成本，然後根據你的實際需求做出判斷，而不是因為「那是我唯一知道的東西」就直接選它。

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記
