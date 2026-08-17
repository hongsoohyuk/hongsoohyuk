# TODO

- [ ] **블로그 글: DuckDB-WASM 클라이언트사이드 CSV→Parquet 변환**
  - project 라우트 제거(2026-08) 때 유일하게 블로그/이력서 어디에도 없던 콘텐츠.
  - 소스: `content/archive/billone.md`의 "클라이언트사이드 CSV→Parquet 변환 (DuckDB-WASM)" 섹션.
  - 다룰 내용: API Gateway 10MB 제한을 브라우저 내 변환·분할로 우회, `all_varchar=true`로 금액 컬럼 부동소수 오차 방지, `threads=1` + `preserve_insertion_order`로 결정적 분할, WASM 셀프호스팅과 coi 번들 제외 결정.
