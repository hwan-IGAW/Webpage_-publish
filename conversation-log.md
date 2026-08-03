# 세션 컨텍스트 (2026.07.27 기준)

## 프로젝트 개요
- **작업 디렉토리**: `/Users/cheolhwanlee/Documents/모바일인덱스 MCP`
- **Git 원격**: `https://github.com/hwan-IGAW/Webpage_-publish.git` (origin/main)
- **용도**: 모바일인덱스 MCP 서비스의 주간 분석 리포트, HTML 리포트 생성 및 GitHub Pages 배포
- **GitHub Pages URL**: `https://hwan-igaw.github.io/Webpage_-publish/`

## 완료된 작업

### 1. 7월 4주차 MCP 주간 리포트 (최신)
- **파일**: `mcp-weekly-report-w4-july.html`
- **기간**: 누적 06.01~07.27, 금주 7/21~7/27, 전주 비교 7/14~7/20
- **데이터 소스**:
  - GA4 데이터 (6/1~7/27, 63,717 조회수)
  - MCP 사용량 Excel (120명, 6/3~7/27, 일별 크레딧 사용, Excel 시리얼 46176~46230)
- **핵심 수치**:
  - 113명(+22 vs 전주 91명), 유료 35개(+5)
  - GA 63,717건(+27%), 인스타그램 8,305건 유입 #1
  - nm-neo 29일 연속, 그린브릭스 32일 연속 사용
  - K카(822cr W8 폭발), 비펙스(W5~W8 4주 급성장 998cr), WBMS 재활성(521cr)
- **구조**: 리텐션(04-B) 섹션 제거 완료. ~500줄.
- **commit**: cec788b (push 완료)

### 2. 7월 3주차 리포트 (구버전, 레포에 남아있음)
- **파일**: `mcp-weekly-report-w3-july.html` (로컬에 남아있으나 w4가 최신)
- **commit**: 6f39567

### 3. 7월 2주차 리포트
- **파일**: `mcp-weekly-report-w2-july.html`
- **commit**: cda1cc7

## 리포트 구조 (w4 기준)
| 섹션 | 내용 | 비중 |
|------|------|------|
| 01 KPI | 4개 핵심 지표 + 성과 박스 | 작음 |
| 02 GA 트래픽 | 페이지별 증감 테이블 + 해석 | 중간 |
| 03 주 평균 사용량 | TOP 20 바 차트 (주평균순) | **큼** |
| 04 히트맵 | W1~W8 주간 합산 히트맵 (■=비활성, 색상=강도) | **큼** |
| 05 신규 유저 | 금주 신규 테이블 | 작음 |
| 06 플랜별 분석 | 4개 카드 (PRM/ESS/BASIC/전환타겟) | 중간 |
| 07 인사이트 | GOOD/WATCH/다음주 추적 박스 | 중간 |
| 08 업종별 분포 | 업종 테이블 | 작음 |

## 주요 모니터링 포인트 (다음 주 추적)
1. nm-neo 우고은 유료 전환 제안 타이밍 (29일 연속, BASIC 한도 소진 시작)
2. K카(이수경) D+7 재방문 여부 (W8 822cr 1회성인지?)
3. 비펙스 에센셜 데모 → 유료 전환 시점
4. WBMS/버즈빌/밀리/알토스/모지세 재활성 지속 여부
5. 하나금융/허블/야놀자 3주 연속 0cr → 이탈 확정 or 복귀?
6. 신한금융(mail.shinhan.com) GA 유입 → 실제 가입 여부
7. 히트맵 JS 자동 렌더링 전환 (제안 상태, 미실행)

## nm-neo.com 조사 결과
- **넷마블네오(Netmarble Neo)** 이메일 전용 도메인 확인
- nm-neo.com 웹사이트는 존재하지 않음 (DNS 없음)
- 같은 도메인 3명 사용: 우고은(2,356cr), 강대희(91cr), 박진수(15cr)
- 정상 사용자로 판단 (게임 회사 실 직원)

## 참조 파일 구조
- `mcp-weekly-report-w4-july.html` — 7월 4주차 리포트 (최신, push 완료)
- `mcp-weekly-report-w3-july.html` — 7월 3주차 리포트 (구버전)
- `mcp-weekly-report-w2-july.html` — 7월 2주차 리포트
- `mcp-weekly-report-w1-july.html` — 7월 1주차 리포트
- `mcp-usage-analysis-report.md` — 종합 분석 보고서 (5/21~6/26 기준)
- `mcp-usage-analysis-report.html` — 종합 분석 보고서 HTML 버전
- `conversation-log.md` — 이 파일 (세션 컨텍스트)

## MCP 툴 사용 가능
- 모바일인덱스 MCP 서버 연결됨 (앱 검색, 차트, 사용량, 인구통계 등 분석 도구 사용 가능)

## 규칙
- HTML 파일 푸시 시: 항상 이 레포(`/Users/cheolhwanlee/Documents/모바일인덱스 MCP`)로 고정
- 원격: `https://github.com/hwan-IGAW/Webpage_-publish.git` (origin/main)
- 리텐션 섹션은 제거됨 (용량 이슈로 삭제)
- 히트맵/바차트 JS 자동 렌더링 전환은 다음 세션에서 고려

### 2. 핵심 분석 결과 요약
- 외부 사용자 71명(+20), 정착 유저 12명(+50%), D+21 리텐션 58%
- BASIC 100cr 상향 효과 확인 (nm-neo 우고은 10일 연속 사용)
- 버즈빌 재활성(+581), 그린브릭스 13일 연속 사용
- github.com 자연 유입 시작 (tools/connect/main)
- tools 페이지 +61.4%, connect +32.3% 급성장
- 스마일게이트자산운용 뉴스레터→실전환 발생

### 3. 주요 관심 포인트 (다음 주 추적)
- nm-neo 3주 연속 사용 여부
- 카카오엔터·W컨셉·스마일게이트자산운용 D+7 재방문
- GPT 앱 / 클로드 커넥터 심사 결과
- TBWA 팔로업 결과
- github.com 유입 → 발급/사용 전환 여부

## 참조 파일 구조
- `mcp-weekly-report-w1-july.html` — 7월 1주차 리포트 (이전)
- `mcp-weekly-report-w2-july.html` — 7월 2주차 리포트 (최신)
- `mcp-usage-analysis-report.md` — 종합 분석 보고서 (5/21~6/26 기준, 소프트런칭 전체 분석)
- `mcp-usage-analysis-report.html` — 종합 분석 보고서 HTML 버전

## MCP 툴 사용 가능
- 모바일인덱스 MCP 서버 연결됨 (앱 검색, 차트, 사용량, 인구통계 등 분석 도구 사용 가능)

## 규칙
- HTML 파일 푸시 시: 항상 이 레포(`/Users/cheolhwanlee/Documents/모바일인덱스 MCP`)로 고정
- 원격: `https://github.com/hwan-IGAW/Webpage_-publish.git` (origin/main)
