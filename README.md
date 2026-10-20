# Simple Web IDE For Webpage

日本語の説明は[目次](#目次)から読めます。

## Table of Contents

1. [Summary](#summary)
2. [Background of Development](#background-of-development)
3. [Features](#features)
4. [Requirements, Dependencies](#requirements-dependencies)
5. [Installation](#installation)
6. [LICENSE](#license)
7. [CREDIT](#credit)

## Summary

This is a simple, easy-to-use development environment for creating web pages that run in a browser.  
All the code you write is stored on the client side.  

[Playground Is Here!](https://tools.oz-coden.com/webpage-ide/)

## Background of Development

The primary goal is to create a development environment that functions as a website where anyone can experience building simple web pages without having to configure any settings or the like.  

## Features

- Everyone can use this  
This runs in a web browser and can be used on its own without requiring any special setup.  
- Syntax Highlighting Support  
This editor uses the Monaco Editor, which is based on Visual Studio Code and includes syntax highlighting.  
- Hot Reload Support  
When you make changes to the code, they are reflected immediately without having to switch to another application.  
This allows you to actually see where and how the elements you've added are displayed.  
- Simple Editing  
In addition to HTML, you can edit three minimal files that support CSS and JavaScript.  
By supporting these three flies for minimal editing and learning purposes, you can learn how to edit front-end web pages.  
And also you can also create simple web pages.  
- Auto Save the Code  
Your work in progress is automatically saved in "LocalStorage", so even if you close your browser, you can resume editing from where you left off the next time you open it.  
You can also download the code.  

## Requirements, Dependencies

- Only need latest browser  

## Installation

1. Clone or download this repository, keeping the directory structure intact.
2. Run `python -m http.server 8000` from the repository root (Python 3 is required for this command).
3. Open `http://localhost:8000/webpage-ide/` in your browser.

The application files are in `webpage-ide/`. Monaco Editor 0.45.0 is loaded from cdnjs, so an internet connection is required. For GitHub Pages, select **GitHub Actions** as the publishing source. After the browser checks pass on `main`, the workflow publishes the static application files. The root page redirects to `webpage-ide/`.

HTML references to `style.css` / `./style.css` and `script.js` / `./script.js` use the corresponding editor contents, including optional query strings or fragments. Download all three files into the same directory to run the exported page. Other relative assets and relative JavaScript module imports are not provided by the editor.

The preview runs in a sandbox with scripts, forms and dialogs enabled. It cannot access the editor DOM or browser storage, navigate the top-level page, or open popups. External resources can still make network requests. Infinite loops can still make the page unresponsive.

Drafts are stored only in this browser and origin; they do not move automatically between domains. If browser storage is unavailable or full, editing and previews remain available and the status asks you to download your code.

To run browser regression checks, install Node.js 22 or later, then run `npm ci`, `npx playwright install chromium`, and `npm test` from the repository root. The tests use the same Monaco release from npm to avoid depending on CDN availability.

## LICENSE

This project is released under the MIT License.  

## CREDIT

This project uses Monaco Editor, which is licensed under the MIT License.  
Copyright (c) Microsoft Corporation.

---

# Simple Web IDE For Webpage

## 目次

1. [概要](#概要)
2. [開発背景](#開発背景)
3. [機能](#機能)
4. [前提・依存](#前提依存)
5. [導入方法](#導入方法)
6. [ライセンス](#ライセンス)
7. [クレジット](#クレジット)

## 概要

これは、ブラウザ上で動作する、ウェブページを作成するためのシンプルで使いやすい開発環境です。  
作成したコードはすべてクライアント側に保存されます。 

[Playgroundはこちら！](https://tools.oz-coden.com/webpage-ide/)

## 開発背景

主な目的は、設定などの手間をかけずに、誰でも簡単なウェブページの作成を体験できる、ウェブサイトとして機能する開発環境を構築することです。 

## 機能

- 誰でも利用可能  
Webブラウザ上で動作し、特別な設定を必要とせずにそのまま利用できます。  
- シンタックスハイライト対応  
このエディタは、Visual Studio Codeをベースとした「Monaco Editor」を採用しており、シンタックスハイライト機能を備えています。  
- ホットリロード対応  
コードを変更すると、別のアプリケーションに切り替えることなく、その変更が即座に反映されます。 
これにより、追加した要素がどこに、どのように表示されるかを実際に確認できます。  
- シンプルな編集  
HTMLに加え、CSSとJavaScriptに対応した3つの基本ファイルも編集できます。  
学習や簡単な編集を目的としてこれら3つのファイルに対応しているため、フロントエンドのWebページの編集方法を学ぶことができます。  
また、シンプルなWebページを作成することも可能です。  
- コードの自動保存  
編集中の作業内容は"LocalStorage"に自動的に保存されるため、ブラウザを閉じてしまっても、次回開いた際に中断した箇所から編集を再開できます。  
コードをダウンロードすることも可能です。 

## 前提・依存

- 最新のブラウザがあれば十分

## 導入方法

1. このリポジトリをクローンまたはダウンロードし、フォルダ構成を保ちます。
2. リポジトリのルートで `python -m http.server 8000` を実行します（このコマンドにはPython 3が必要です）。
3. ブラウザで `http://localhost:8000/webpage-ide/` を開きます。

アプリ本体は `webpage-ide/` にあります。Monaco Editor 0.45.0をcdnjsから読み込むため、インターネット接続が必要です。GitHub Pagesでは公開元に **GitHub Actions** を指定します。ワークフローは `main` のブラウザ検査が成功した後にアプリの静的ファイルを公開します。ルートページから `webpage-ide/` へ移動します。

HTML内の `style.css` / `./style.css` と `script.js` / `./script.js` は、それぞれの編集内容を参照します。クエリ文字列やフラグメントも付けられます。書き出したページを動かす場合は、3ファイルを同じフォルダに保存してください。その他の相対パスの素材や、JavaScriptモジュールの相対インポートには対応していません。

プレビューはスクリプト・フォーム・ダイアログを許可したサンドボックス内で実行されます。エディタのDOMやブラウザの保存領域へのアクセス、親画面の遷移、ポップアップは制限されます。外部リソースへの通信は発生し得ます。また、無限ループによってページが応答しなくなる場合があります。

下書きは利用中のブラウザ・オリジンに保存され、別のドメインには自動で移りません。保存領域が利用できない場合や容量不足の場合も編集・プレビューは使えます。保存状態に従ってコードをダウンロードしてください。

ブラウザの回帰チェックを実行する場合は、Node.js 22以降を導入し、リポジトリのルートで `npm ci`、`npx playwright install chromium`、`npm test` を順に実行します。テストではCDNの稼働状況に依存しないように、同じバージョンのMonacoをnpmから読み込みます。

## ライセンス

This project is released under the MIT License.  

## クレジット

This project uses Monaco Editor, which is licensed under the MIT License.  
Copyright (c) Microsoft Corporation.
