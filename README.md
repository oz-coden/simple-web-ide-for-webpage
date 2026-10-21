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
- Manual preview and optional automatic updates  
The preview starts paused on every visit. Run it explicitly, or enable automatic updates for the current visit. Stop it before continuing to edit when needed.  
- Simple Editing  
In addition to HTML, you can edit three minimal files that support CSS and JavaScript.  
By supporting these three flies for minimal editing and learning purposes, you can learn how to edit front-end web pages.  
And also you can also create simple web pages.  
- Auto Save the Code  
Your work in progress is automatically saved in "LocalStorage", so even if you close your browser, you can resume editing from where you left off the next time you open it.  
Download individual files or save `index.html`, `style.css` and `script.js` together as a ZIP. A reset button restores the initial examples after confirmation.  

## Requirements, Dependencies

- The latest stable version of a web browser with JavaScript enabled.

## Installation

1. Clone or download this repository, keeping the directory structure intact.
2. Run `python -m http.server 8000` from the repository root (Python 3 is required for this command).
3. Open `http://localhost:8000/webpage-ide/` in your browser.

The application files are in `webpage-ide/`. Monaco Editor 0.45.0 is loaded from cdnjs, so an internet connection is required. The application is published through [tools.oz-coden.com](https://github.com/oz-coden/tools.oz-coden.com). This repository checks the browser behavior on each update. The root page redirects to `webpage-ide/`. Shared styles, navigation and themes are included in `webpage-ide/vendor/ui/`, with their source revision recorded in `webpage-ide/shared-ui.json`.

HTML references to `style.css` / `./style.css` and `script.js` / `./script.js` use the corresponding editor contents, including optional query strings or fragments. Extract the ZIP, or download all three files into the same directory, to run the exported page. Other relative assets and relative JavaScript module imports are not provided by the editor.

The preview runs in a sandbox with scripts, forms and dialogs enabled. It cannot access the editor DOM or browser storage, navigate the top-level page, or open popups. External resources can still make network requests. Explicitly running an infinite loop can still make the page unresponsive. Close that tab and reopen the editor: restored drafts do not run automatically. The standalone [recovery page](https://tools.oz-coden.com/webpage-ide/recovery.html) can display, download or clear saved drafts without Monaco, a CDN connection or a preview. Clearing drafts removes only this IDE's three source keys.

Drafts are stored only in this browser and origin; they do not move automatically between domains. If browser storage is unavailable or full, editing and previews remain available and the status asks you to download your code.

To run browser regression checks, install Node.js 22 or later, then run `npm ci`, `npx playwright install chromium`, and `npm test` from the repository root. The checks cover ZIP contents, preview isolation, paused restoration, downloads, reset confirmation, recovery, storage failures and mobile layout. Browser checks run in Chromium and use the same Monaco release from npm to avoid depending on CDN availability.

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
- 手動プレビューと任意の自動更新  
ページを開くたびにプレビューは停止状態で始まります。手動で実行するか、その回の利用中だけ自動更新を有効にできます。必要に応じて停止してから編集を続けられます。  
- シンプルな編集  
HTMLに加え、CSSとJavaScriptに対応した3つの基本ファイルも編集できます。  
学習や簡単な編集を目的としてこれら3つのファイルに対応しているため、フロントエンドのWebページの編集方法を学ぶことができます。  
また、シンプルなWebページを作成することも可能です。  
- コードの自動保存  
編集中の作業内容は"LocalStorage"に自動的に保存されるため、ブラウザを閉じてしまっても、次回開いた際に中断した箇所から編集を再開できます。  
ファイルごとの保存に加え、`index.html`・`style.css`・`script.js`をZIPにまとめて保存できます。リセットボタンでは確認後に初期サンプルへ戻せます。 

## 前提・依存

- JavaScriptが有効な最新版（安定版）のWebブラウザ。

## 導入方法

1. このリポジトリをクローンまたはダウンロードし、フォルダ構成を保ちます。
2. リポジトリのルートで `python -m http.server 8000` を実行します（このコマンドにはPython 3が必要です）。
3. ブラウザで `http://localhost:8000/webpage-ide/` を開きます。

アプリ本体は `webpage-ide/` にあります。Monaco Editor 0.45.0をcdnjsから読み込むため、インターネット接続が必要です。アプリの公開は [tools.oz-coden.com](https://github.com/oz-coden/tools.oz-coden.com) で行います。このリポジトリでは更新ごとにブラウザの動作を検査します。ルートページから `webpage-ide/` へ移動します。共通のスタイル・ナビゲーション・テーマ切替は `webpage-ide/vendor/ui/` に同梱し、取得元のコミットを `webpage-ide/shared-ui.json` に記録しています。

HTML内の `style.css` / `./style.css` と `script.js` / `./script.js` は、それぞれの編集内容を参照します。クエリ文字列やフラグメントも付けられます。書き出したページを動かす場合は、ZIPを展開するか、3ファイルを同じフォルダに保存してください。その他の相対パスの素材や、JavaScriptモジュールの相対インポートには対応していません。

プレビューはスクリプト・フォーム・ダイアログを許可したサンドボックス内で実行されます。エディタのDOMやブラウザの保存領域へのアクセス、親画面の遷移、ポップアップは制限されます。外部リソースへの通信は発生し得ます。無限ループを明示的に実行すると、ページが応答しなくなる場合があります。そのタブを閉じて開き直すと、下書きを自動実行せずに編集できます。独立した[復旧ページ](https://tools.oz-coden.com/webpage-ide/recovery.html)では、Monaco・CDNへの接続・プレビューを使わずに、保存済みコードの表示・ダウンロード・消去ができます。消去する保存キーは、このIDEの3ファイル分だけです。

下書きは利用中のブラウザ・オリジンに保存され、別のドメインには自動で移りません。保存領域が利用できない場合や容量不足の場合も編集・プレビューは使えます。保存状態に従ってコードをダウンロードしてください。

ブラウザの回帰チェックを実行する場合は、Node.js 22以降を導入し、リポジトリのルートで `npm ci`、`npx playwright install chromium`、`npm test` を順に実行します。ZIPの内容、プレビューの制限、停止状態での復元、保存、リセット確認、復旧、保存領域のエラー、モバイル表示を検査します。ブラウザ検査はChromiumで実行し、CDNの稼働状況に依存しないように、同じバージョンのMonacoをnpmから読み込みます。

## ライセンス

This project is released under the MIT License.  

## クレジット

This project uses Monaco Editor, which is licensed under the MIT License.  
Copyright (c) Microsoft Corporation.
