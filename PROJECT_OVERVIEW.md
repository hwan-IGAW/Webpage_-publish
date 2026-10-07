# 모바일인덱스 MCP 프로젝트 — 인수인계 문서

> 이 문서는 다른 AI 또는 새 세션이 이 프로젝트를 즉시 이어받을 수 있도록 작성된 인수인계 파일입니다.  
> 최종 업데이트: 2026년 10월 7일

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 작업 디렉토리 | `/Users/cheolhwanlee/Documents/모바일인덱스 MCP` |
| Git 원격 | `https://github.com/hwan-IGAW/Webpage_-publish.git` (origin/main) |
| GitHub Pages URL | `https://hwan-igaw.github.io/Webpage_-publish/` |
| 주요 용도 | 모바일인덱스 MCP 서비스의 분석 리포트 HTML 생성 및 GitHub Pages 배포 |

### 프로젝트의 본질
**모바일인덱스 MCP**는 앱 데이터 분석 플랫폼 "모바일인덱스"를 MCP(Model Context Protocol) 방식으로 AI에 연결하는 서비스다.  
이 작업 공간은 그 서비스의 **마케팅/운영 인텔리전스 허브** 역할을 한다 — 매주 사용자 행동, KPI, 채널별 트래픽을 HTML 리포트로 만들어 GitHub Pages에 배포한다.

---

## 2. 디렉토리 구조

```
모바일인덱스 MCP/
├── PROJECT_OVERVIEW.md          ← 이 파일 (인수인계 문서)
├── index.html                   ← GitHub Pages 메인 페이지 (허브 역할)
├── reports/                     ← 모든 리포트 및 분석 파일
│   ├── conversation-log.md      ← 이전 세션 컨텍스트 로그 (상세 히스토리)
│   ├── mcp-usage-analysis-report.md   ← 소프트런칭 종합 분석 (5/21~6/26)
│   │
│   ├── [MCP 주간 리포트 시리즈 — 최신순]
│   ├── mcp-report-sep-w14.html         ← 9월 종합 (W14) ★ 최신
│   ├── mcp-weekly-report-w6-aug.html   ← 8월 3주차 (W11)
│   ├── mcp-weekly-report-w5-aug.html   ← 8월 1주차 (W9)
│   ├── mcp-weekly-report-w4-july.html  ← 7월 4주차 (W8)
│   ├── mcp-weekly-report-w3-july.html  ← 7월 3주차 (W7, 구버전)
│   ├── mcp-weekly-report-w2-july.html  ← 7월 2주차 (W6)
│   ├── mcp-weekly-report-w1-july.html  ← 7월 1주차 (W5)
│   ├── mcp-usage-analysis-report.html  ← 소프트런칭 종합 분석 HTML
│   │
│   ├── [모바일인덱스 제품/서비스 분석]
│   ├── mi-reform-report.html           ← MI 개편 방향 보고 (v1)
│   ├── mi-reform-report2.html          ← MI 개편 방향 보고 (v2)
│   ├── mobileindex-insight-report.html ← INSIGHT 트래픽 분석 + 통합 시나리오
│   ├── mobileindex-native-prompt-prototype.html  ← AI 리포트 네이티브 프로토타입
│   │
│   ├── [외부 클라이언트 / 앱 분석 리포트]
│   ├── yeogi-report.html               ← 여기어때 데일리 마케팅 리포트 (2025.04.14)
│   ├── zigzag-report.html              ← 지그재그 vs 무신사 비교 분석
│   ├── kbeauty-indie-brand-partnership-report.html  ← K-뷰티 인디 브랜드 파트너십 구조
│   └── 뉴스정치성향_리포트_v2.1.html   ← 뉴스 시청 데이터 × 선거 판세 예측
└── mobileindex-mcp-sse-v2-test.mjs     ← MCP SSE 연결 테스트 스크립트
```

---

## 3. 완성된 리포트 전체 목록

### 3-1. MCP 주간 사용 현황 리포트 (핵심 시리즈)

| 파일명 | 제목 | 기간 | 주요 수치 |
|--------|------|------|-----------|
| `mcp-report-sep-w14.html` | 9월 종합 (W14) | ~2026.09 | — |
| `mcp-weekly-report-w6-aug.html` | 8월 3주차 (W11) | ~08.18 | — |
| `mcp-weekly-report-w5-aug.html` | 8월 1주차 (W9) | ~08.03 | 126명, GA 67,765건 |
| `mcp-weekly-report-w4-july.html` | 7월 4주차 (W8) | ~07.27 | 113명, GA 63,717건 |
| `mcp-weekly-report-w3-july.html` | 7월 4주차 (구버전) | ~07.27 | w4로 교체됨 |
| `mcp-weekly-report-w2-july.html` | 7월 2주차 (W6) | ~07.13 | — |
| `mcp-weekly-report-w1-july.html` | 7월 1주차 (W5) | ~07.06 | — |
| `mcp-usage-analysis-report.html` | 소프트런칭 종합 | 05.21~06.26 | 방문자 11,522명, 키 발급 101명 |

> 주간 리포트 번호(W숫자)는 MCP 서비스 런칭 기준 누적 주차다. 5월 말 소프트런칭을 W1로 간주.

### 3-2. 모바일인덱스 내부 전략/제품 분석

| 파일명 | 제목 | 성격 |
|--------|------|------|
| `mi-reform-report.html` | 모바일인덱스 개편 방향 보고 (v1) | 내부 전략 보고서 — 지표 → 의사결정 인텔리전스 전환 방향 |
| `mi-reform-report2.html` | 모바일인덱스 개편 방향 보고 (v2) | v1 개선본 |
| `mobileindex-insight-report.html` | INSIGHT 트래픽 분석 | 광고/마케팅 업종 트래픽 변화, 마케팅클라우드 런칭 전후 비교 |
| `mobileindex-native-prompt-prototype.html` | AI 리포트 네이티브 프로토타입 | MCP 데이터 기반 자동 생성 리포트 UI 프로토타입 |

### 3-3. 외부 클라이언트 / 앱 분석 리포트

| 파일명 | 제목 | 성격 |
|--------|------|------|
| `yeogi-report.html` | 여기어때 데일리 마케팅 리포트 | 여기어때 vs 야놀자 vs NOL 비교, 2025.04.14 기준 |
| `zigzag-report.html` | 지그재그 vs 무신사 분석 | 4/7~13 특이점 — 지그재그 체류시간 급락, 무신사 설치 스파이크 |
| `kbeauty-indie-brand-partnership-report.html` | K-뷰티 인디 브랜드 파트너십 구조 | 뷰티 인텔리전스 SaaS POC, 인디 브랜드의 R&D 생태계 분석 |
| `뉴스정치성향_리포트_v2.1.html` | 뉴스 시청 × 선거 판세 예측 | TV INDEX 기반, 지역별 메인뉴스 시청 점유율 × 지방선거 결과 비교 |

---

## 4. 핵심 맥락 — MCP 서비스 현황 (2026년 기준)

### 서비스 단계 변화

| 단계 | 시기 | 특징 |
|------|------|------|
| 소프트런칭 | 2026.05~ | MCP 직접 연동만 가능. 터미널 필요. 매체비 ~130만원 |
| 그랜드 오픈 (예정→진행) | 2026.07~ | GPT 앱 + 클로드 커넥터 등록. 원클릭 연동 가능 |
| W14 이후 | 2026.09~ | 주간 리포트 지속 발행 중 |

### 크레딧 체계

| 플랜 | 일 크레딧 | 대상 |
|------|----------|------|
| BASIC | 30~100/일 | 무료 회원 |
| ESSENTIAL | 200/일 | 기존 유료 고객 |
| PREMIUM | 500/일 | 유료 고객 상위 등급 |

### 주요 사용자 (누적 최상위)

- **한투(한국투자증권)**: 755cr × 9주 이상 연속, 최고 충성 고객
- **WBMS**: W9 755cr 최고 사용량
- **nm-neo(넷마블네오)**: 우고은(2,356cr+), 강대희, 박진수 — 3명 동일 도메인
- **그린브릭스**: 39일 연속 (역대 최장 연속 사용)
- **비펙스**: W5~W8 4주 급성장 후 W9에 776→4cr 급감 (이탈 주시)
- **K카**: W8 822cr → W9 0cr (이탈 확정 가능성)

### 채널별 트래픽 특성 (소프트런칭 기준)

| 채널 | 비중 | 특성 |
|------|------|------|
| 뉴스레터 | 48.6% | 핵심 전환 채널. 키 발급의 50.5% 기여 |
| 페이스북 광고 | 30.6% | 인지 목적 바닥 트래픽 |
| Organic | 19.8% | 탐색 깊이 최고, 전환 품질 최고 |

---

## 5. 리포트 제작 방법 (다음 세션을 위한 가이드)

### 주간 리포트 생성 절차

1. **데이터 수집**
   - GA4: 기간별 페이지뷰, 채널별 방문자 수출 (CSV)
   - MCP 사용량 Excel: 일별 크레딧 사용 데이터 (시리얼 날짜 포함)
   - 전주 리포트 HTML과 비교해 델타 값 계산

2. **파일 명명 규칙**
   ```
   mcp-weekly-report-w{N}-{월이름}.html
   예: mcp-weekly-report-w7-sep.html (9월 W7)
   ```
   > W 번호는 MCP 런칭 기준 주차 (W1 = 2026년 5월 말 첫 주)

3. **리포트 구조 (w5 이후 표준)**

   | 섹션 | 내용 |
   |------|------|
   | 01 KPI | 4개 핵심 지표 + 성과 박스 |
   | 02 GA 트래픽 | 페이지별 증감 테이블 + 해석 |
   | 03 주 평균 사용량 | TOP 20 바 차트 (주평균순) |
   | 04 히트맵 | 전체 주간 합산 히트맵 (■=비활성, 색상=강도) |
   | 05 신규 유저 | 금주 신규 테이블 |
   | 06 플랜별 분석 | PRM/ESS/BASIC/전환타겟 4개 카드 |
   | 07 인사이트 | GOOD/WATCH/다음주 추적 박스 |
   | 08 업종별 분포 | 업종 테이블 |

   > ⚠️ 리텐션 섹션(04-B)은 용량 이슈로 제거됨 — 추가 금지

4. **배포 (GitHub Pages)**
   ```bash
   # reports/ 폴더로 작업 완료 후
   git add reports/mcp-weekly-report-w{N}-{월}.html
   git commit -m "Add W{N} weekly report"
   git push origin main
   # 원격에 변경이 있으면: git pull --rebase 후 push
   ```
   - 배포 후 URL: `https://hwan-igaw.github.io/Webpage_-publish/reports/파일명.html`

5. **index.html 링크 추가**
   - 새 리포트 생성 시 루트의 `index.html`에 링크 추가
   - `reports/` 경로 기준으로 상대 경로 작성

---

## 6. 사용 가능한 도구

### 모바일인덱스 MCP 서버
현재 세션에 MCP 서버가 연결되어 있으면 아래 도구를 직접 호출 가능:

- `mcp_mobileindex_search_app` — 앱 검색 (pkgName 획득)
- `mcp_mobileindex_app_summary` — MAU, DAU 등 핵심 지표
- `mcp_mobileindex_app_usage` — 기간별 사용량
- `mcp_mobileindex_app_demographic` — 성별/연령별 구성
- `mcp_mobileindex_chart_top_usage` — 통합 사용자 수 순위
- `mcp_mobileindex_chart_top_revenue` — 통합 매출 순위
- `mcp_mobileindex_chart_market_rank` — 마켓별 순위 (구글/애플/원스토어)
- `mcp_mobileindex_usage_overlap_rank` — 동시 사용 앱 분석
- `mcp_mobileindex_app_persona` — 사용자 페르소나
- `mcp_mobileindex_app_region` — 지역 분포
- `mcp_mobileindex_competitor_loyalty` — 경쟁앱 충성도 비교

### 테스트 스크립트
- `mobileindex-mcp-sse-v2-test.mjs` — SSE 연결 테스트용 Node.js 스크립트

---

## 7. 고정 규칙 (반드시 준수)

1. **HTML 파일 배포 시 항상 이 레포로 고정**
   - 로컬: `/Users/cheolhwanlee/Documents/모바일인덱스 MCP`
   - 원격: `https://github.com/hwan-IGAW/Webpage_-publish.git` (origin/main)
   - 다른 레포를 찾거나 묻지 말 것

2. **모든 리포트/분석 파일은 `reports/` 폴더 안에 저장**

3. **리텐션 섹션(04-B)은 리포트에 포함하지 않음** (용량 이슈로 제거됨)

4. **파일 명명 규칙 준수**
   - 주간: `mcp-weekly-report-w{N}-{월이름}.html`
   - 월간/종합: `mcp-report-{월}-w{N}.html`

---

## 8. 이전 세션 히스토리 요약

| 세션 | 주요 작업 |
|------|-----------|
| 초기 세션 | 소프트런칭 분석 보고서 작성 (`mcp-usage-analysis-report`) |
| 2026.07 초 | W5(7월 1주차) 주간 리포트 생성 |
| 2026.07 중 | W6(7월 2주차) 주간 리포트. github.com 자연 유입 확인 |
| 2026.07 말 | W7→W8(7월 3~4주차) 리포트. 히트맵/바차트 구조 완성. 리텐션 섹션 제거 |
| 2026.08 초 | W9(8월 1주차) 리포트. 그린브릭스 39일 연속 기록 |
| 2026.08 중 | W11(8월 3주차) 리포트 |
| 2026.09 | W14(9월 종합) 리포트 |
| 2026.10 | 모든 파일을 `reports/` 폴더로 정리. 이 문서 작성 |
| 별도 진행 | MI 개편 방향 보고(x2), INSIGHT 트래픽 분석, 네이티브 프롬프트 프로토타입 |
| 클라이언트 분석 | 여기어때, 지그재그 vs 무신사, K-뷰티 인디 브랜드, 뉴스 시청 × 선거 판세 |

---

## 9. 다음 작업 예상 목록

- [ ] W15 주간 리포트 생성 (10월 1주차)
- [ ] nm-neo 우고은 유료 전환 제안 후속 추적
- [ ] 비펙스 이탈 최종 확인
- [ ] K카 이탈 확정 여부 확인
- [ ] 히트맵/바차트 JS 자동 렌더링 전환 검토

---

*이 문서는 Kiro (AI 개발 환경)가 자동 생성했습니다. 새 작업을 시작하기 전에 `reports/conversation-log.md`도 함께 참조하세요.*
