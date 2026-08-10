---
title: '寫第一個 Dockerfile：Alpine 基礎映像、node 使用者權限、COPY 快取順序、多實例部署'
description: '逐行拆解一個 Node.js 應用程式的 Dockerfile：為什麼用 Alpine 版基礎映像、建立 node 使用者並改變檔案擁有權、先複製 package.json 再裝套件，並用 docker build、docker run 把應用程式跑起來，同時開出多個埠號的容器實例，為下一節流量分配鋪路。'
date: 2026-08-27
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 45
chapter: 'Containers'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Docker
    - Dockerfile
    - AlpineLinux
    - DockerBuild
    - NonRootUser
    - LayerCaching
    - PortMapping
---

# 寫第一個 Dockerfile：Alpine 基礎映像、node 使用者權限、COPY 快取順序、多實例部署

> [[44-containers|前面]]講完容器化的觀念，這一節要動手把[[07-create-a-simple-nodejs-server|前面寫的]]簡易 Node.js 伺服器包成一個 Docker 容器，並且同時跑出好幾個實例，為之後的流量分配（load balancing）鋪路。這一節不會要求能獨立寫出完整的 Dockerfile，重點是理解每一行在做什麼。

## 在伺服器上安裝 Docker

Docker 是相對吃資源的應用程式，這裡選擇直接裝在伺服器上，而不是裝在自己的電腦，因為伺服器才是真正需要跑容器的地方。用 `apt` 安裝即可：

```bash
sudo apt install docker.io
```

## 撰寫 Dockerfile

先切到專案目錄，建立一個 `Dockerfile`：

```bash
cd /var/www/app
vi Dockerfile
```

完整內容如下：

```dockerfile
FROM node:19-alpine3.16

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "app.js"]
```

以下逐行拆解每一段在做什麼。

### 選擇基礎映像

```dockerfile
FROM node:19-alpine3.16
```

`FROM` 指定這個容器要以什麼作為基礎環境。這裡選用 Node.js 官方維護的映像檔，並指定使用 Alpine 版本。Alpine Linux 是一個相當精簡的 Linux 發行版，只保留跑這一個應用程式所需要的最小環境，沒有多餘的東西，啟動速度也因此特別快。這個映像檔本身是官方維護的，不需要自己額外設定 Node.js 的安裝流程。

### 建立資料夾並設定擁有權

```dockerfile
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
```

這個 Node.js 官方映像檔預設會用一個叫做 `node` 的使用者執行程式，而不是用 `root` 或 `sudo`，這麼做能限制容器內程式的權限範圍，降低安全風險。因為預設是這個非特權使用者在跑程式，這裡要先手動建立好應用程式要用的資料夾（包含 `node_modules`），並把整個 `/home/node/app` 目錄的擁有權（`chown`）指派給 `node` 這個使用者，之後這個使用者才有權限在裡面寫入檔案。

### 設定工作目錄

```dockerfile
WORKDIR /home/node/app
```

`WORKDIR` 指定之後所有指令實際執行的目錄，這裡設成剛剛建立好的應用程式目錄。

### 複製 package.json 並先安裝套件

```dockerfile
COPY --chown=node:node package*.json ./

USER node

RUN npm install
```

這裡是整份 Dockerfile 裡最容易讓人搞混的一步：因為是在把本機已經寫好的應用程式打包成容器映像檔，需要用 `COPY` 明確地把檔案從建置環境複製進容器裡。這裡故意只先複製 `package.json` 跟 `package-lock.json`，並沒有複製 `node_modules` 或其他程式碼。

先複製這兩個檔案、跑一次 `npm install`，再複製其餘的程式碼，是為了善用 Docker 的分層快取機制：依賴套件變動的頻率通常比應用程式程式碼低很多，只要 `package.json` 沒變，之後重新建置映像檔時就能直接複用已經裝好套件的那一層，不用每次都重新跑一次 `npm install`，大幅縮短之後建置的時間。

複製檔案時同樣要加上 `--chown=node:node`，因為複製進來的檔案預設擁有者會是建置當下的使用者，而不是容器裡實際要執行程式的 `node` 使用者；接著用 `USER node` 把後續指令切換成用這個使用者身分執行，再跑 `npm install` 安裝套件。

### 複製剩餘的程式碼

```dockerfile
COPY --chown=node:node . .
```

套件裝完後，再把目錄裡剩下的所有檔案複製進容器，同樣加上 `--chown=node:node` 確保擁有權正確。Dockerfile 裡的相對路徑都是以 Dockerfile 本身所在的目錄為基準，這也是為什麼 Dockerfile 通常會直接放在要打包的應用程式目錄裡，不需要處理複雜的相對路徑問題。

### 開放埠號與啟動指令

```dockerfile
EXPOSE 3000

CMD ["node", "app.js"]
```

`EXPOSE` 宣告這個容器對外要用哪個埠溝通，這裡沿用[[07-create-a-simple-nodejs-server|前面]]伺服器慣用的 3000 埠。`CMD` 則是容器啟動時實際執行的指令，這裡執行的是最早寫的那支陽春伺服器 `app.js`，而不是後面接了 WebSocket 跟 SQLite 的版本，因為那個版本要包進容器需要處理更多細節，這裡只示範最基本的容器化流程。

## 建置與執行容器

Dockerfile 寫好後，用 `docker build` 建置映像檔：

```bash
sudo docker build -t fullstackfrontend .
```

`-t` 用來替映像檔命名，方便之後辨識；結尾的 `.` 代表 Dockerfile 就在目前所在的目錄。建置過程中常見的錯誤包括：映像檔名稱或版本號打錯字（例如 `node:19-alpine3.6` 這種不存在的版本）、`mkdir` 打成 `mdir`，或是忘記在 `COPY` 加上 `--chown`，導致複製進去的檔案擁有者不是 `node`、後續指令因為權限不足而失敗。這些都是很小的錯字，卻常常是建置失敗的主因。

建置成功後可以用以下指令確認映像檔已經建立：

```bash
sudo docker image ls
```

接著用 `docker run` 把容器實際跑起來：

```bash
sudo docker run -d -p 3000:3000 fullstackfrontend
```

- **`-d`**：讓容器在背景執行，否則終端機會被容器的輸出佔住，沒辦法繼續操作
- **`-p 3000:3000`**：對應埠號，格式是「主機埠號:容器埠號」，代表把伺服器本身的 3000 埠對應到容器內部的 3000 埠

執行前要記得先把[[38-creating-a-websocket-connection|前面用 PM2 跑]]的舊伺服器停掉，避免兩邊搶用同一個埠號：

```bash
pm2 stop index-ws
```

## 同時跑多個容器實例

容器化真正的威力在這裡展現：只要用不同的主機埠號，就可以同時跑出同一個應用程式的多個獨立實例：

```bash
sudo docker run -d -p 3001:3000 fullstackfrontend
```

用 `sudo docker ps` 可以看到目前正在運行的所有容器，一個對應到 3000 埠、另一個對應到 3001 埠，兩者互不干擾，其實就是完全相同的應用程式，只是各自跑在自己獨立的容器裡。理論上可以照這個模式建立出任意數量的實例，只要每個實例對應到不同的主機埠號即可。

到這裡已經有好幾個各自獨立運行的應用程式實例了，接下來的問題是：Nginx 原本只知道要把流量轉給 3000 埠，現在要怎麼讓它把流量平均分配到這些不同埠號的容器實例上？這牽涉到協調（orchestration）與流量分配的概念，會在下一節繼續討論。

## 複習

### 在 Docker 容器裡使用 Alpine Linux 的目的是什麼？

Alpine Linux 是一個非常精簡的 Linux 發行版，執行速度快、沒有多餘的東西，主要就是用來高效率地跑單一應用程式。

### 為什麼 Dockerfile 裡要先複製 package.json 再執行 npm install？

先複製 package.json 並執行 npm install，再複製其餘的應用程式程式碼，可以善用 Docker 的分層快取機制。因為依賴套件的變動頻率通常比程式碼低，只要 package.json 沒有改變，之後重新建置時就能直接複用已經裝好套件的快取層，讓後續的建置速度快上許多。

### 用來指定基礎作業系統與執行環境的 Docker 指令是什麼？

`FROM` 指令，用來指定基礎映像檔，例如 `FROM node:19-alpine`。

### 為什麼 Docker 容器通常會用一個特定的使用者執行，而不是用 root 或 sudo？

基於安全性考量，用一個專屬的使用者（例如 `node`）執行程式，可以限制容器內程式對系統的存取範圍，降低潛在的安全風險。

### Dockerfile 裡 EXPOSE 指令的用途是什麼？

`EXPOSE` 用來宣告容器要監聽哪個網路埠，讓外部可以跟容器化的應用程式溝通。

## 小測驗

<details>
<summary>Node.js 官方 Docker 映像檔使用的是哪一個 Linux 發行版？</summary>
Alpine Linux
</details>

<details>
<summary>Dockerfile 裡 EXPOSE 指令的用途是什麼？</summary>
指定容器執行時要監聽的網路埠
</details>

<details>
<summary>執行 Docker 容器時，-d 這個參數的作用是什麼？</summary>
讓容器在背景執行
</details>

<details>
<summary>Dockerfile 裡 WORKDIR 指令的用途是什麼？</summary>
設定後續指令執行時所在的工作目錄
</details>

<details>
<summary>在 Docker 容器裡使用 Alpine Linux 作為基礎映像的目的是什麼？</summary>
它是專為執行單一應用程式最佳化過的精簡版 Linux
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
