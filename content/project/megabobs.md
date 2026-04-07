---
title: "Megabobs"
slug: "megabobs"
description: "과천 메가존산학연센터에는 편리한 구내식당을 이용할 수 있습니다. A4용지에 인쇄되는 메뉴보단 웹으로 편리하게 확인할 수 있다면 더 좋겠죠?"
createdTime: "2026-02-16T11:11:01.199Z"
lastEditedTime: "2026-02-16T11:11:19.806Z"
---

## 개발 동기

## 고민거리

### CSR? SSR? SSG? ISR!

### 데이터 조회
데이터를 어떻게 가져와야할지가 가장 큰 고민이었다.
원본 데이터는 회사의 식당업체 공식 앱과 구내식당의 실물 메뉴를 통해서만 제공되기 때문에 단순한 api 를 통한 데이터 조회에는 불가했다.
매주 메뉴판을 사진찍어 OCR 을 수행하거나 DB에 수기로 작성하는 작업은 개발자로서 수치라고 생각했다.
그래서 결심한 Reverse Engineering(역공학)

## 시행 착오
- Date
- SSR Hydration

### 번외, API Handler 를 통한 Slack 앱 추가 개발
