---
title: gulp-gh-pages deploy 失敗QQ | 程式筆記 - 001
description: 前陣子修改了一下 JS 地下城的網頁時，發現 gulp-gh-pages deploy 時會出現錯誤，紀錄一下
category: 程式筆記
section: dev
tags:
    - gulp
    - JavaScript
    - Git
date: 2020-12-08
---

# gulp-gh-pages deploy 失敗 QQ | 程式筆記 - 001

錯誤如下

```bash
Error in plugin 'gulp-gh-pages'
Message:
    Command failed: git pull
Your configuration specifies to merge with the ref 'refs/heads/gh-pages'
from the remote, but no such ref was fetched.

Details:
    killed: false
    code: 1
    signal: null
    cmd: git pull
```

上網查了一下，找到原因是，gulp-gh-pages 主動將 .publish 資料夾裡的檔案存為暫存，只要把 .publish 資料夾裡的檔案清空就可以重新 deploy 囉。

> 參考來源: https://github.com/GovLab/ogrx-2

簡單寫一下作為紀錄，不然下次又找不到了。
頗短的文章，哈哈。
