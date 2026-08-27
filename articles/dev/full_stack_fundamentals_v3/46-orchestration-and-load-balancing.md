---
title: '容器協調與負載平衡概觀：Kubernetes 是做什麼的，Nginx upstream 怎麼分配流量'
description: '解釋容器協調（orchestration）在大規模部署下要解決的問題，帶出 Kubernetes 這類工具的角色，整理 round robin、least connections 等常見排程演算法的取捨，示範用 htop 觀察伺服器負載，並用 Nginx 的 upstream 設定把流量分配到多個容器實例。'
date: 2026-08-27
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 46
chapter: 'Containers'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Orchestration
    - Kubernetes
    - LoadBalancing
    - Nginx
    - RoundRobin
    - Htop
    - LeastConnections
    - SchedulingAlgorithm
---

# 容器協調與負載平衡概觀：Kubernetes 是做什麼的，Nginx upstream 怎麼分配流量

> [[45-creating-a-docker-container|前面]]手動建立了兩個各自跑在不同埠號的容器實例，這一節要接著談兩個問題：實際場景裡動輒成千上萬個容器該怎麼管理，以及現在已經有的兩個容器實例，該怎麼讓 Nginx 把流量平均分配過去。

## 容器協調（Orchestration）在解決什麼問題

[[45-creating-a-docker-container|前面]]建立第二個容器時，做法是手動下一次 `docker run` 指令，換一個埠號再跑一次。這種方式在只有兩三個容器時還算可以接受，但實際的正式環境動輒有成千上萬個容器實例，要一個個手動啟動、升級、下線，是不可能持續下去的做法。

容器協調（orchestration）指的就是自動化管理這些容器上下線、升級的整套流程。這個領域最常被提到的工具是 Kubernetes，其他常見的選擇還有 Docker Swarm、Apache Mesos。有了這類工具，可以一次建立數百個容器實例，每個都跑著完全相同的應用程式，不需要像前面那樣一個個手動下指令。Kubernetes 本身牽涉的內容相當龐大，值得另外花時間專門學習，這裡不會深入。

## 為什麼需要負載平衡

有了多個容器實例後，馬上會遇到下一個問題：Nginx 該怎麼知道要把請求送到哪一個容器？如果所有流量都固定送到同一個容器，即使背後其實跑著好幾個一模一樣的實例，也等於白白浪費了其他實例的運算資源，這樣建立多個實例就失去意義了。

負載平衡（load balancing）要解決的正是這個問題：把進來的流量依照某種規則分散到多個伺服器實例上，避免某一台伺服器負擔過重，其他伺服器卻閒置。

## 常見的排程演算法

決定「這個請求該送去哪一台伺服器」的規則，稱為排程演算法（scheduling algorithm）。常見的幾種包括：

- **Round robin（輪詢）**：這是預設演算法，依序把請求分配給伺服器 1、2、3，分配完一輪後再從 1 開始重複
- **IP hashing**：依照請求來源的 IP 位址分組，讓特定範圍的 IP 固定連到同一台伺服器
- **Random（隨機）**：單純隨機挑一台伺服器
- **Least connections（最少連線數）**：把請求送給目前連線數最少的伺服器，但代價是系統得持續追蹤每一台伺服器目前的連線數
- **Least load（最低負載）**：把請求送給目前負載最低的伺服器，同樣需要持續量測每一台伺服器的負載狀況

單純的隨機分配聽起來沒什麼道理，但其實有個延伸做法相當巧妙：與其每次都要檢查所有伺服器的連線數才能挑出最少連線的那一台，可以先隨機抽出兩台伺服器，再從這兩台裡選連線數較少的一台。這樣只需要比較兩台伺服器，就能得到出乎意料平均的分配效果，不需要每次都掃過全部的伺服器清單，在伺服器數量龐大時能省下可觀的檢查成本。

## 用 htop 觀察伺服器負載

要實作「最少負載」這類演算法，得先知道怎麼量測一台伺服器目前的負載狀況。在終端機執行 `htop` 就能看到目前伺服器的即時負載狀況：

```bash
htop
```

`htop` 會列出 CPU 使用率、記憶體用量，以及目前所有正在執行的程序，概念上類似 macOS 上的「活動監視器」，只是活動監視器是圖形化介面。當懷疑伺服器變慢時，可以用 `htop` 直接觀察是哪個程序占用了過多資源，例如可以看到某個 Node.js 程序異常吃資源，直接在裡面把該程序砍掉，就能立刻看到伺服器負載下降。

## 用 Nginx 的 upstream 實作負載平衡

有了兩個容器實例，接下來要讓 Nginx 知道怎麼在它們之間分配流量。做法是在 Nginx 設定裡建立一個 `upstream` 區塊，把要負責分流的那一群伺服器集中定義起來：

```nginx
upstream nodebackend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}
```

`upstream` 後面接的名稱（這裡取名 `nodebackend`）是自訂的識別名稱，裡面列出的每一行 `server` 就是屬於這個伺服器叢集的成員，對應到前面用不同埠號啟動的那些容器實例。

定義好 `upstream` 之後，在原本的 `server` 區塊裡把 `proxy_pass` 指向這個叢集名稱即可，Nginx 會自動處理剩下的流量分配：

```nginx
location / {
    proxy_pass http://nodebackend;
}
```

預設情況下，Nginx 會用 round robin 依序分配請求；如果想改用最少連線數的策略，只要在 `upstream` 區塊裡加上 `least_conn` 即可：

```nginx
upstream nodebackend {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}
```

這樣一來，原本各自獨立、互不相干的多個容器實例，就能透過 Nginx 的 `upstream` 設定串成一個真正能分攤流量的伺服器叢集。

## 複習

### 什麼是容器協調（orchestration），有哪個代表性的工具？

容器協調是管理、部署、擴展並維護大量容器的過程。Kubernetes 是這個領域最具代表性的工具之一，可以同時建立並管理數百個容器實例。

### 這一節提到了哪些負載平衡的排程演算法？

包括 round robin（預設，依序輪流分配）、IP hashing（依來源 IP 分組）、random（隨機）、least connections（最少連線數）與 least load（最低負載），每種演算法分配流量的方式各不相同。

### 有哪個指令可以用來觀察伺服器的資源使用狀況與效能？

`htop` 指令可以顯示伺服器資源使用狀況的詳細分解，包含 CPU 負載、記憶體用量與正在執行的程序；在 macOS 上對應的工具是「活動監視器」。

### Nginx 的 upstream 設定是用來做什麼的？

`upstream` 設定用來定義一群伺服器叢集，並讓流量可以在這些伺服器實例之間做負載平衡，可以指定一組伺服器，並選擇要用哪種演算法來分配進來的請求。

### 為什麼負載平衡在多容器部署中很重要？

負載平衡能確保流量平均分散到多台伺服器上，避免單一伺服器負擔過重、其他伺服器卻閒置。這有助於更有效率地運用資源、提升效能，並透過把請求導向負載較低的伺服器來維持系統的穩定性。

## 小測驗

<details>
<summary>常見的預設負載平衡演算法是什麼？</summary>
Round robin
</details>

<details>
<summary>在 Nginx 中，upstream 設定是用來做什麼的？</summary>
定義伺服器叢集的連線
</details>

<details>
<summary>最常被提到的容器協調平台是哪一個？</summary>
Kubernetes
</details>

<details>
<summary>Kubernetes 在容器化環境中的主要用途是什麼？</summary>
在大規模環境下管理與協調容器
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
