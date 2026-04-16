---
title: Teachable 的 Sidebar 你的時辰到了 | Tampermonkey Userscript
description: 那個 Sidebar 甚麼的給我立刻消失 !!!
category: 程式筆記
section: dev
tags:
    - Tampermonkey
    - JavaScript
date: 2021-04-14
---

# Teachable 的 Sidebar 你的時辰到了 | Tampermonkey Userscript

近日又回到 Teachable 上面繼續上之前買的課程，這個平台上的 Sidebar 真的很惱人，因為我習慣把瀏覽器縮小來邊看 code 邊抄啊!

但是每次只要縮小瀏覽器大小，此時的 Sidebar 跟影片就同時並排...影片變超級小，平台上也沒有提供按鈕可以收合，我只是想要在一個螢幕多工作業啊!

![Teachable 原畫面展示](https://cf.jare.io/?u=https://wen-hsiu-hsu.github.io/blog/codingnotes/Tampermonkey-SideBarToggleButtonOnTeachable/teachableDemo.jpg)

> 直接氣爆 XD，還是...其實只有我覺得很煩??

![喔!氣氣氣氣氣!](https://media.giphy.com/media/LrXRnC08IEzZ8LfE7w/giphy.gif)

可以參考一下 [Twitch](https://www.twitch.tv/) 的畫面，他提供了把側邊的畫面收合的按鈕，讓使用者也可以自行選擇，這個才是我想要的體驗，畢竟影片才是主體，旁邊的東西都給我閃邊去。

![Twitch 畫面展示](https://cf.jare.io/?u=https://wen-hsiu-hsu.github.io/blog/codingnotes/Tampermonkey-SideBarToggleButtonOnTeachable/twitchDemo.jpg)

## Tampermonkey

剛好這幾天看到 [保哥](https://www.facebook.com/will.fans) 的粉專貼出了關於 Tampermonkey 的 [貼文](https://www.facebook.com/will.fans/posts/4492143630814746)，用來協助翻譯 Microsoft Doc 的小工具，於是我查了一下發現，好像可以拿來使用在 Teachable 上面。

Tampermonkey Userscript，是要用 Javascript 下去寫的，其實應該是可以理解成把腳本丟到開發人員工具的 console 裡面執行，有在寫前端的朋友應該都沒有問題。
官方的文件也有提供一些額外的 API，可以拿來做有趣的事，但我沒研讀，可以直接過去看 XD。

[文件傳送門 Tampermonkey documentation](https://www.tampermonkey.net/)

不過這東西出很久了，我太菜了今天才知道，哈哈。

> TaDA !!!

![Teachable 新增按紐展示](https://cf.jare.io/?u=https://wen-hsiu-hsu.github.io/blog/codingnotes/Tampermonkey-SideBarToggleButtonOnTeachable/teachableDemo_2.jpg)

安裝好套件並打開設定的 domain 下的課程影片後，Tampermonkey 會開始跑腳本，這個腳本會在 Teachable 右上角的 Navigation 最右側新增一個按鈕，只要按下按鈕或是快捷鍵 `Ctrl-shift-Z` 就可以把 Sidebar 隱藏起來，再按一次按鈕或快捷鍵就可以復原，是不是超棒的 XDD

_對了，我完全沒有在管相容性甚麼的，反正在我的 chrome 上面看起來沒問題，那就是沒問題 XDD_

## 直接使用在 Teachable 吧!

1. 首先先安裝 [ Tampermonkey Chrome 擴充插建 ](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

2. 點 [腳本連結](https://github.com/wen-hsiu-hsu/SideBarToggleButtonOnTeachable/raw/main/SideBarToggleButtonOnTeachable.user.js) 來安裝腳本

3. 直接享受沒有 Sidebar 干擾的課程吧~

_PS. 我發現有個寬度畫面會跑版，有空再來調吧~_

### 調整腳本啟用的網站

1. 目前只有在 courses.hexschool.com 上面才會跑這個腳本，如果有使用 Teachable 其他的課程，要調整 domain，可以打開 Tampermonkey 的主控台之後，會看到目前安裝的腳本，按下要調整的腳本最右側的編輯按鈕(如下圖)

![調整腳本 domain 步驟一](https://cf.jare.io/?u=https://wen-hsiu-hsu.github.io/blog/codingnotes/Tampermonkey-SideBarToggleButtonOnTeachable/step_1.jpg)

2. 再按下設定，接著新增 domain 就可以啦! (看是要 include 或是 match )

![調整腳本 domain 步驟一](https://cf.jare.io/?u=https://wen-hsiu-hsu.github.io/blog/codingnotes/Tampermonkey-SideBarToggleButtonOnTeachable/step_2.jpg)

附上程式碼

<BaseGithubGistIframe src="https://gist.github.com/wen-hsiu-hsu/9691a0206bc9222b73334b4f3c17b759.pibb" />

### 最後

如果你也想寫自己的腳本，發布的時候記得要把檔案名稱取名為 `{你想取的名稱}.user.js`，這樣發佈到 gist (或其他地方)，當打開 Raw 檔時，插件會自己判斷並打開安裝畫面，這樣子別人使用會比較簡單~

當然網路上有蠻多人有寫腳本，要多注意安全性的問題，安裝前要看一下 source code ~ 確保安全

> 參考資源
> [Tampermonkey 載入 jQuery 的簡便方法](https://blog.darkthread.net/blog/greasemonkey-load-jquery) > [Tampermonkey](https://www.tampermonkey.net/) > [Tampermonkey documentation](https://www.tampermonkey.net/documentation.php) > [IT 鐵人賽小工具 : Ctrl + V 自動上傳圖片功能](https://ithelp.ithome.com.tw/articles/10211943) > [保哥的 MSDocsLanguageToggleSwitcher](https://github.com/doggy8088/MSDocsLanguageToggleSwitcher)

## 最後附上連結，如下

- 腳本連結
    - [Github Repository](https://github.com/wen-hsiu-hsu/SideBarToggleButtonOnTeachable)
- 個人連結
    - [Github @kevinHWS](https://github.com/wen-hsiu-hsu)
    - [JS 地下城網站首頁](https://wen-hsiu-hsu.github.io/hex_jsDungeon/)
        - 歡迎來看看 JS 作品

<br>

_本文章若有任何資訊誤植或侵權，煩請告知，我會立刻處理。_
