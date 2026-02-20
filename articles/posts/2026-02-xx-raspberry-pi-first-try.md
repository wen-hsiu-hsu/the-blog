---
title:
description:
date: 2026-02-xxxxxxxxxxxx
category: 程式筆記
tags:
    - self-hosted
keyword:
    - pi
    - raspberry-pi
    - 樹莓派
    - self-hosted
    - tailscale
    - kuma-uptime
    - homepage
    - glance
    - dashboard
    - speedtest-tracker
    - adguard home
    - 自架
---

# 樹莓派自架 homelab！有必要嗎？！

前陣子有朋友出借一台樹莓派 4 代給我，我如火如荼地架了好幾個服務上去，覺得蠻有趣的

最初的目的是要弄一個本地的 [Adguard Home](https://github.com/AdguardTeam/AdGuardHome)，開源的廣告攔截器。現在只要連到家裡網路的裝置（包含手機！），全部都會經過 AdGuard Home，從 DNS 來判斷是不是廣告或追蹤器，雖然平常我的瀏覽器就是使用 [Brave](https://brave.com/)，本來就不太會看到廣告，但看到從後台看到攔截了一大堆的東西還是覺得很爽 🤣

![Adguard Home preview](https://i.meee.com.tw/Nif78s1.jpg)

> Adguard Home 阻擋了不少東西！

來記錄一下放了哪些東西上去

- Glance (Dashboard)
    - 用來當作我的瀏覽器首頁，開新頁籤的時候會開啟 start-page，這一頁我就有更高的自定義空間
    - 各個服務的入口頁，把所有的服務的入口都放在不同的頁籤中，讓我可以直接從這個網站前往各個服務的後檯
- HomePage (Dashboard)
    - 主要是用來放區域網路內部的服務，所以這個服務是只能從內網進入
    - 透過 iframe 嵌入 Glance 的 service 頁籤中，從外網無法看到這一頁的內容

首先是我之前用 Glance 做了一個 Dashboard 部署在 zeabur，現在我把這個專案改成直接放在樹莓派
