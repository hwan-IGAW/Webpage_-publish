#!/usr/bin/env node
/**
 * 모바일인덱스 MCP 서버 v2 — SSE (원격) 버전
 * 
 * v1 대비 변경 사항:
 *   - 기존 27개 API 도구 description 보강 (competitor 단일 앱, overlap 필수 파라미터, retention 주간 규칙)
 *   - Snowflake DB 도구 3개 추가 (get_db_schema, query_database, get_sample_data)
 *   - 보안: SQL 검증, ADID 원본 노출 차단, 행 수 제한, DB 호출 횟수 제한
 * 
 * 환경변수:
 *   MI_API_TOKEN        — 모바일인덱스 Insight API 토큰 (필수)
 *   PORT                — 서버 포트 (기본 3001)
 *   ALLOWED_API_KEYS    — 허용된 API 키 목록, 쉼표 구분 (베타용)
 *   SF_ACCOUNT          — Snowflake 계정 (예: xy12345.ap-northeast-2.aws)
 *   SF_USERNAME         — Snowflake 사용자명
 *   SF_PASSWORD         — Snowflake 비밀번호
 *   SF_DATABASE         — Snowflake 데이터베이스명
 *   SF_SCHEMA           — Snowflake 스키마명
 *   SF_WAREHOUSE        — Snowflake 웨어하우스명
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── 설정 (테스트용 하드코딩) ───
const API_BASE = "https://data.mobileindex.com/v1/insight";
const API_TOKEN = "nCLuOmTBtkEKdWIJ7Y2oA1KTLgFiDM8f4PWEAdxJY6u7+12hg1HymbaoV2G/KwZ6slUo943K91Zab9lqIPh2Bw==";
const PORT = 3001;
const ALLOWED_KEYS = [];

// ─── Snowflake 설정 (테스트용 하드코딩) ───
const SF_CONFIG = {
  account: "RW79971.ap-northeast-2.aws",
  username: "SUE",
  password: "",
  database: "AICOMPETITION",
  schema: "DMP",
  warehouse: "AICOMPETITION_WH",
  privateKey: "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLdDSB6Ng8STBivdBiD7bCiRXuC/t9gpACrqgZ4a/tvrh4lsu2eDYRECTrWV3gXehRNoWnvETBkErrfDJDcBoBcvg2mCxpdWxYUBrN7ekt9JHwAaPr0WfJH+t8rTuErLbihSkoiY3tHsAfq7IrPpgQAEfR4WGo8F6bV81EYFm/Mo+JOdQFajikiWfB87ILHg0PLIA04Ptp7rOIr+6mHGa23yW+k1mk6i+uJKqA/xgXYDFNtMfLo4uFHDC/z2NViJAgIObHYk972EZnseUwri4nxZV7Zixxo04u95MA2vgacJUjV34/xhCJkV4fsSxHgF6EDkcMUqMvyKQMGfWSqrazAgMBAAECggEAM/I2mdi2pSXWuc9XDkKO2jqgI8hhbNlSJa0sdHdAMQaaGQf/eVZWD6M8me6WXnv7ngi6tWoHcBiEWH28Y6WSrj4Ji/7sj/yQLjg9r8iH2djxDgONM9+ijSKeQJYGdUiX5Vw0dwov95P7X9q5wfrYXnWD4N2XzseYkDcpzMSBBaTRfkGp3rgqPWFm9vjHlK0nNkFsuW/rWln82mm/8dhIrUBPVgawQssR6/IYQBDSa0+L1LCSOucfvpNHj4AcjguJkllPmsAdyMo7Uf8EoS13HtPQRcj1xGY6IhUL8mKNh+xXMoGBRc4u3Anov1uzKultqZCYDpzGh0en+vCu9KTRiQKBgQDveBo6kpr+VosUpsmKsbzm5mIxkAZhIbStBPJiXhjgsU6Z1ERIDmx4E1n1XDzx+oH/YrR6ngPuxwx9V0CyzqA/3p6OuZJoKhwIEWfiMB5lLYunVA4c/MOUMhriKHwRrJySHKDbvdGjYb5YYD8jIBOTTYII3Bwdv56zy50xvZ0J3wKBgQDZf6RNTIfT0qhSs9515zDluoEpl3UUu2iP7NIeq1zY18o3F4RxYi2pTLxK9x67TsJFnp8zAm2+GV21eigIHKtGom5JnFPdkz7xLh+vUCVrzSf3tNtw0IfunKiU4xpgbqAtNU3DRglYbAAsY6jElt6v19O9z3Lb2L7m5SBQZTxVrQKBgDf9UcyeGIUdAPm8IWU/N1aZSR4jeYpeUhseC/n53EE005bd7XUXgj7071SR02IUWy62ClKc/Xhnq8DmlKb57rfgOhxOwS9/oPw17Z8R9xla88sUuRQH+UZ+DJESPCf5vsXe0bFvCUP1B4csQbbZuhn3xk6CAEToV5fcJI3LsprrAoGBAMfSuG34OPZInTLWZDUogckeL5q5tuykPa21Y1qgD759iyBQb/MHw3G+uWOaZNarxlrWH+dqfM7hWTHpGCxTwpwzkWX5xSdWJ8bHnH6iAK9pHiY7OD0OqUR1E4EuoUYlfO3sAhS9HMrq9sHRkfWDsvYVMUk69Yi8Oq/BpI2YZPVFAoGBAO3pulzXjI5Zm0pLWecMZAGU0bFIlGYqNfyv9chuvaeprsdQTFcu11WKN4IDhvbj99Lmh2kwOg8+YDFh8nVAzCPTcg4NCURguiZBH+hNEBu7q/3c55J6XfUVhUqetESXG70+nbwUPDGO37oa5pMOr5n2mSUzgthyeG0GPmr98tKB",
};

// ─── DB 호출 제한 (세션별) ───
const DB_RATE_LIMIT = {
  maxPerMinute: 10,
  maxPerDay: 200,
};
const dbCallLog = new Map(); // sessionId → { minute: count, day: count, lastMinute: timestamp, lastDay: timestamp }

function checkDbRateLimit(sessionId) {
  const now = Date.now();
  if (!dbCallLog.has(sessionId)) {
    dbCallLog.set(sessionId, { minute: 0, day: 0, lastMinute: now, lastDay: now });
  }
  const log = dbCallLog.get(sessionId);
  // 분 단위 리셋
  if (now - log.lastMinute > 60_000) { log.minute = 0; log.lastMinute = now; }
  // 일 단위 리셋
  if (now - log.lastDay > 86_400_000) { log.day = 0; log.lastDay = now; }
  if (log.minute >= DB_RATE_LIMIT.maxPerMinute) return "DB 쿼리 호출이 너무 많습니다. 잠시 후 다시 시도해주세요. (분당 제한 초과)";
  if (log.day >= DB_RATE_LIMIT.maxPerDay) return "일일 DB 쿼리 호출 한도를 초과했습니다.";
  log.minute++;
  log.day++;
  return null;
}

// ─── SQL 검증 ───
const BLOCKED_SQL_PATTERNS = [
  /\bINSERT\b/i, /\bUPDATE\b/i, /\bDELETE\b/i, /\bDROP\b/i,
  /\bCREATE\b/i, /\bALTER\b/i, /\bTRUNCATE\b/i, /\bGRANT\b/i,
  /\bREVOKE\b/i, /\bEXEC\b/i, /\bEXECUTE\b/i, /\bMERGE\b/i,
  /\bINFORMATION_SCHEMA\b/i, /\bSHOW\s+TABLES\b/i, /\bSHOW\s+COLUMNS\b/i,
  /\bDESCRIBE\b/i, /\bSHOW\s+SCHEMAS\b/i, /\bSHOW\s+DATABASES\b/i,
];

function validateSql(sql) {
  const trimmed = sql.trim();
  if (!trimmed.toUpperCase().startsWith("SELECT")) {
    return "SELECT 쿼리만 허용됩니다.";
  }
  for (const pattern of BLOCKED_SQL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return `허용되지 않는 SQL 구문이 포함되어 있습니다: ${pattern.source}`;
    }
  }
  return null;
}

// ─── ADID 원본 노출 차단 ───
function maskAdidInResults(rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row) => {
    const masked = { ...row };
    if (masked.adid) masked.adid = "***masked***";
    if (masked.ADID) masked.ADID = "***masked***";
    return masked;
  });
}

// ─── Snowflake 쿼리 실행 ───
let snowflakeConnection = null;

async function getSnowflakeConnection() {
  if (!SF_CONFIG.account) throw new Error("Snowflake 접속 정보가 설정되지 않았습니다. 환경변수를 확인해주세요.");
  if (snowflakeConnection) return snowflakeConnection;
  
  // snowflake-sdk는 동적 import (설치 안 되어 있으면 에러 메시지)
  let snowflake;
  try {
    snowflake = await import("snowflake-sdk");
  } catch {
    throw new Error("snowflake-sdk가 설치되지 않았습니다. npm install snowflake-sdk 를 실행해주세요.");
  }

  return new Promise((resolve, reject) => {
    const connOptions = {
      account: SF_CONFIG.account,
      username: SF_CONFIG.username,
      database: SF_CONFIG.database,
      schema: SF_CONFIG.schema,
      warehouse: SF_CONFIG.warehouse,
    };

    // RSA 키 인증 우선, 없으면 비밀번호 방식
    if (SF_CONFIG.privateKey) {
      connOptions.authenticator = "SNOWFLAKE_JWT";
      connOptions.privateKey = `-----BEGIN PRIVATE KEY-----\n${SF_CONFIG.privateKey}\n-----END PRIVATE KEY-----`;
    } else if (SF_CONFIG.password) {
      connOptions.password = SF_CONFIG.password;
    }

    const conn = snowflake.default.createConnection(connOptions);
    conn.connect((err, conn) => {
      if (err) reject(new Error(`Snowflake 연결 실패: ${err.message}`));
      else { snowflakeConnection = conn; resolve(conn); }
    });
  });
}

async function executeSnowflakeQuery(sql, limit = 100) {
  const conn = await getSnowflakeConnection();
  const limitedSql = sql.replace(/;?\s*$/, "") + ` LIMIT ${limit}`;
  
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: limitedSql,
      complete: (err, stmt, rows) => {
        if (err) reject(new Error(`쿼리 실행 실패: ${err.message}`));
        else resolve(rows || []);
      },
    });
  });
}

// ─── API 호출 ───
async function callApi(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!res.ok) {
    const status = res.status;
    if (status === 404) return { source: "모바일인덱스 INSIGHT", error: "해당 데이터는 현재 준비 중이거나 제공되지 않습니다." };
    if (status === 401) return { source: "모바일인덱스 INSIGHT", error: "인증에 실패했습니다. API 키를 확인해주세요." };
    if (status === 429) return { source: "모바일인덱스 INSIGHT", error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };
    return { source: "모바일인덱스 INSIGHT", error: `일시적으로 데이터를 조회할 수 없습니다. (${status})` };
  }
  const json = await res.json();
  return { source: "모바일인덱스 INSIGHT", ...json };
}

// ─── API 키 검증 ───
function verifyApiKey(req) {
  if (ALLOWED_KEYS.length === 0) return true;
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return ALLOWED_KEYS.includes(token);
}

// ─── MCP 서버 생성 ───
function createServer() {
  const server = new McpServer({ name: "mobileindex", version: "2.0.0" });

  // ═══════════════════════════════════════════
  // 기존 API 도구 27개 (description 보강 반영)
  // ═══════════════════════════════════════════

  // ─── 공통 ───
  server.registerTool("search_app", { description: "앱 이름이나 패키지명으로 모바일인덱스에서 앱을 검색합니다. 다른 도구에서 pkgName이 필요할 때 먼저 이 도구로 검색하세요.", inputSchema: { keyword: z.string().min(2).describe("검색 키워드 (앱명 또는 패키지명, 2글자 이상)"), viewCnt: z.number().optional().describe("최대 출력 수 (기본 10)") } }, async ({ keyword, viewCnt }) => { const data = await callApi("/common/search", { keyword, viewCnt }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("get_categories_main", { description: "업종 대분류 목록을 조회합니다. appCateMain 코드를 확인할 때 사용하세요.", inputSchema: {} }, async () => { const data = await callApi("/common/cate-main"); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("get_categories_sub", { description: "업종 소분류 목록을 조회합니다.", inputSchema: { appCateMain: z.string().describe("업종 대분류 코드") } }, async ({ appCateMain }) => { const data = await callApi("/common/cate-sub", { appCateMain }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 차트 ───
  server.registerTool("chart_top_usage", { description: "통합 사용자 수 순위를 조회합니다.", inputSchema: { dateType: z.enum(["d","w","m"]).describe("조회 기간"), date: z.string().describe("조회일 (yyyymmdd)"), appType: z.enum(["all","app","game"]).describe("앱 구분"), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/top/usage", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("chart_top_revenue", { description: "통합 매출 순위를 조회합니다.", inputSchema: { dateType: z.enum(["d","w","m"]).describe("조회 기간"), date: z.string().describe("조회일 (yyyymmdd)"), appType: z.enum(["all","app","game"]).describe("앱 구분"), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/top/revenue", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("chart_market_rank", { description: "일간 마켓별 순위를 조회합니다 (대한민국).", inputSchema: { market: z.enum(["google","apple","one"]).describe("마켓"), date: z.string().describe("조회일 (yyyymmdd)"), appType: z.enum(["app","game"]).describe("앱 구분"), rankType: z.enum(["all","free","paid","gross"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/market/rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("chart_market_global_rank", { description: "일간 마켓별 순위를 조회합니다 (글로벌 20개국).", inputSchema: { date: z.string().describe("조회일 (yyyymmdd)"), country: z.enum(["us","cn","jp","tw","sg","de","gb","in","ca","ru","th","id","my","hk","ph","tr","se","fr","au","es"]).describe("국가 코드"), market: z.enum(["google","apple"]).describe("마켓"), appType: z.enum(["app","game"]).describe("앱 구분"), rankType: z.enum(["all","free","paid","gross"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/market/global-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("chart_market_realtime_rank", { description: "실시간 마켓별 순위를 조회합니다.", inputSchema: { country: z.enum(["kr","us","cn","jp","tw"]).describe("국가 코드"), market: z.enum(["google","apple"]).describe("마켓"), appType: z.enum(["app","game"]).describe("앱 구분"), rankType: z.enum(["all","free","paid","gross"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/market/realtime-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 사용량 ───
  server.registerTool("usage_rank", { description: "업종별 사용량 순위를 조회합니다.", inputSchema: { uType: z.enum(["user","device","install","time","avgTime"]).describe("순위 구분"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), date: z.string().describe("조회일 (yyyymmdd)"), appCateMain: z.string().optional(), appCateSub: z.string().optional(), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/usage/usage-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("usage_rise_rank", { description: "급상승 앱 순위를 조회합니다.", inputSchema: { uType: z.enum(["user","time"]).describe("순위 구분"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), date: z.string().describe("조회일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), appCateMain: z.string().optional(), appCateSub: z.string().optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/usage/rise-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("usage_trend_traffic", { description: "업종 트래픽 트렌드를 분석합니다.", inputSchema: { tType: z.enum(["user","time","install"]).describe("트래픽 구분"), appCateSub: z.string().optional(), pkgName: z.string().optional(), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional() } }, async (p) => { const data = await callApi("/usage/trend/traffic", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("usage_overlap_rank", { description: "특정 앱 사용자가 동시에 사용하는 다른 앱 순위를 분석합니다. ⚠️ 주간/월간만 지원 (일간 불가). appCateMain, appCateSub는 필수입니다 (전체 업종 조회 시 0 입력). 기본적으로 이 도구를 먼저 사용하세요.", inputSchema: { dateType: z.enum(["w","m"]).describe("조회 기간 (주간 또는 월간만 지원)"), date: z.string().describe("조회일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), pkgName: z.string().describe("분석할 앱의 패키지명"), appCateMain: z.string().default("0").describe("업종 대분류 코드 (필수, 전체=0)"), appCateSub: z.string().default("0").describe("업종 소분류 코드 (필수, 전체=0)"), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { p.appCateMain = p.appCateMain || "0"; p.appCateSub = p.appCateSub || "0"; const data = await callApi("/usage/overlap-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 앱 상세 ───
  server.registerTool("app_summary", { description: "특정 앱의 요약 데이터를 조회합니다 (MAU, DAU 등 핵심 지표).", inputSchema: { pkgName: z.string().describe("패키지명") } }, async ({ pkgName }) => { const data = await callApi("/apps/summary", { pkgName }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_info", { description: "앱의 기본 정보를 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명") } }, async ({ pkgName }) => { const data = await callApi("/apps/info", { pkgName }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_usage", { description: "특정 앱의 기간별 사용량을 분석합니다.", inputSchema: { uType: z.enum(["user","device","install","time"]).describe("사용량 구분"), pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional() } }, async (p) => { const data = await callApi("/apps/usage", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_demographic", { description: "특정 앱의 성별/연령별 사용자 구성을 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), uType: z.enum(["user","time"]).describe("데이터 구분") } }, async (p) => { const data = await callApi("/apps/demographic", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_ranking_history", { description: "특정 앱의 순위 변동 히스토리를 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional(), rType: z.enum(["user","time"]).describe("사용량 구분") } }, async (p) => { const data = await callApi("/apps/ranking", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_biz_rate", { description: "특정 앱의 업종 내 점유율 히스토리를 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional(), bizCateType: z.enum(["main","sub"]).describe("업종 분류"), rType: z.enum(["user","time"]).describe("점유율 구분") } }, async (p) => { const data = await callApi("/apps/biz-rate", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_rate_total", { description: "앱의 구글 플레이 전체 평점을 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명") } }, async ({ pkgName }) => { const data = await callApi("/apps/rate-total", { pkgName }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_rate", { description: "앱의 기간별 구글 플레이 평점 추이를 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)") } }, async (p) => { const data = await callApi("/apps/rate", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 심화 분석 ───
  server.registerTool("app_concurrent", { description: "특정 앱 사용자의 동시 사용 앱 수별 분포를 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), date: z.string().describe("조회월 (yyyymm)"), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional() } }, async (p) => { const data = await callApi("/usage/app/concurrent", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_break", { description: "특정 앱의 이탈 고객을 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["m","q"]).describe("조회 기간"), date: z.string().describe("조회월 (yyyymm)"), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional() } }, async (p) => { const data = await callApi("/usage/app/break", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_interest", { description: "특정 앱 사용자의 관심 업종을 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), date: z.string().describe("조회월 (yyyymm)"), os: z.enum(["total","android","ios"]).optional() } }, async (p) => { const data = await callApi("/usage/app/interest", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_persona", { description: "특정 앱 사용자의 페르소나를 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), date: z.string().describe("조회월 (yyyymm)") } }, async (p) => { const data = await callApi("/usage/app/persona", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_region", { description: "특정 앱 사용자의 지역 분포를 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), date: z.string().describe("조회월 (yyyymm)"), regionType: z.enum(["location","address"]).describe("지역 구분") } }, async (p) => { const data = await callApi("/usage/app/region", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 경쟁앱 (description 보강: 단일 앱만 지원, 날짜 규칙) ───
  server.registerTool("competitor_install_delete", { description: "경쟁앱의 신규 설치 건 삭제율을 분석합니다. ⚠️ pkgName에 1개 앱만 입력하세요. 복수 앱(쉼표 구분) 입력 시 빈 배열이 반환됩니다. 여러 앱을 비교하려면 도구를 앱별로 각각 호출한 뒤 결과를 비교하세요. 주간 데이터만 지원.", inputSchema: { pkgName: z.string().describe("패키지명 (1개 앱만 입력)"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional() } }, async (p) => { const data = await callApi("/usage/competitor/install-delete", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("competitor_loyalty", { description: "경쟁앱의 성별/연령별 충성도를 분석합니다. ⚠️ pkgName에 1개 앱만 입력하세요. 복수 앱(쉼표 구분) 입력 시 빈 배열이 반환됩니다. 여러 앱을 비교하려면 도구를 앱별로 각각 호출한 뒤 결과를 비교하세요. 월간 데이터만 지원.", inputSchema: { pkgName: z.string().describe("패키지명 (1개 앱만 입력)"), date: z.string().describe("조회월 (yyyymm)"), os: z.enum(["total","android","ios"]).optional() } }, async (p) => { const data = await callApi("/usage/competitor/loyalty", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("competitor_retention", { description: "경쟁앱의 신규 설치 건 재방문율을 분석합니다. ⚠️ 주간 데이터만 지원. startDate는 월요일, endDate는 일요일로 입력하세요. pkgName에 1개 앱만 입력하세요. 복수 앱(쉼표 구분) 입력 시 빈 배열이 반환됩니다.", inputSchema: { pkgName: z.string().describe("패키지명 (1개 앱만 입력)"), startDate: z.string().describe("시작일 (yyyymmdd, 월요일)"), endDate: z.string().describe("종료일 (yyyymmdd, 일요일)"), os: z.enum(["total","android","ios"]).optional() } }, async (p) => { const data = await callApi("/usage/retention", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ═══════════════════════════════════════════
  // DB 도구 3개 (Snowflake — Small DMP)
  // ═══════════════════════════════════════════

  const DB_SCHEMA_DESC = `모바일인덱스 Small DMP DB에 SQL을 실행합니다. SELECT 쿼리만 허용됩니다.
API 도구로 가능한 분석은 API 도구를 먼저 사용하세요. API로 제공되지 않는 조건(3개 이상 앱 교차 분석, 교차 사용자 사용시간 비교, 커스텀 세그먼트 등)이 필요할 때만 이 도구를 사용하세요.

[테이블 구조]
ADID_INFO (사용자 정보):
  - ADID (VARCHAR): 광고 식별자
  - AGE (VARCHAR): 수집 연령
  - GENDER (VARCHAR): 수집 성별
  - P_AGE (VARCHAR): 추정 연령 5세 단위 (01:15~19세, 02:20~24세, ..., 12:70세~)
  - P_GENDER (VARCHAR): 추정 성별 (F:여성, M:남성)
  - P_MARRY (VARCHAR): 추정 결혼 여부 (M:결혼, S:미혼)
  - CARRIER (VARCHAR): 통신사
  - DEVICE_MODEL (VARCHAR): 단말 모델명
  - DEVICE_OS (VARCHAR): OS 버전
  - REGIST_DATE (VARCHAR): 등록일
  - UPDATE_DATE (VARCHAR): 수정일
  - UNTRACKED_DATE (VARCHAR): 추적 해제일
  - AGREE_STAT (VARCHAR): 이용 정보 수집 동의 상태 (Y/N)
  - DISAGREE_DATE (VARCHAR): 동의 철회일

INTE_CATEGORY (앱 카테고리):
  - PACKAGE_NAME (VARCHAR): 앱 패키지명
  - APP_NAME (VARCHAR): 앱 이름
  - CATEGORY (VARCHAR): 카테고리 경로 (대분류>소분류)
  - CATE_CODE (VARCHAR): 카테고리 코드

PACKAGE_DAILY_USAGE (일간 앱 사용):
  - DATE (VARCHAR): 사용 날짜
  - ADID (VARCHAR): 광고 식별자
  - PACKAGE_NAME (VARCHAR): 앱 패키지명
  - INSTALL_MARKET (VARCHAR): 설치 마켓
  - DAILY_USE_SEC (NUMBER): 일일 사용 시간 (초)
  - SEARCH_KEY (NUMBER): 파티션 날짜 (yyyyMMdd)

PACKAGE_USE_HISTORY (앱 사용 이력):
  - PACKAGE_NAME (VARCHAR): 앱 패키지명
  - APP_NAME (VARCHAR): 앱 이름
  - CATEGORY (VARCHAR): DMP 업종 카테고리
  - ADID (VARCHAR): 광고 식별자
  - INSTALL_MARKET (VARCHAR): 설치 마켓 (G:Google, O:OneStore 등)
  - FIRST_INSTALL_DATE (VARCHAR): 최초 설치일
  - LAST_INSTALL_DATE (VARCHAR): 마지막 설치일
  - LAST_DELETE_DATE (VARCHAR): 마지막 삭제일
  - REINSTALL_CNT (NUMBER): 재설치 횟수
  - LAST_UPDATE_DATE (VARCHAR): 마지막 업데이트일
  - LAST_USE_DATE (VARCHAR): 마지막 사용일
  - CUM_USE_SEC (NUMBER): 누적 사용 시간 (초)
  - USE_WEEK (VARCHAR): 주간 사용 여부 (해당 주 3초 이상 사용 시 체크, 월요일 기준)
  - USE_MONTH (VARCHAR): 월간 사용 여부 (해당 월 3초 이상 사용 시 체크)
  - ACTIVE_FLAG (BOOLEAN): 활성 사용자 여부 (True:트래킹 중, False:삭제 판단)
  - AGREE_STAT (VARCHAR): 이용 정보 수집 동의 상태
  - SCORE (FLOAT): cum_use_sec, first_install_date, active_flag, reinstall_cnt 기반 점수

[규칙]
- 사용자 수 = COUNT(DISTINCT ADID)
- 교차 사용자 = 같은 SEARCH_KEY(또는 DATE)에서 ADID JOIN
- ADID_INFO와 PACKAGE_DAILY_USAGE는 ADID로 JOIN
- ADID_INFO와 PACKAGE_USE_HISTORY는 ADID로 JOIN
- INTE_CATEGORY와 PACKAGE_DAILY_USAGE는 PACKAGE_NAME으로 JOIN
- INTE_CATEGORY와 PACKAGE_USE_HISTORY는 PACKAGE_NAME으로 JOIN
- SEARCH_KEY는 NUMBER 타입 (예: 20260301)
- USE_WEEK 컬럼은 '2601w|2602w' 형태. 특정 주 포함 여부는 LIKE '%2603w%'
- USE_MONTH 컬럼은 '2603m|2604m' 형태. 특정 월 포함 여부는 LIKE '%2603m%'
- 주간 사용자 = USE_WEEK 컬럼에 해당 주차 포함 여부로 판단
- 월간 사용자 = USE_MONTH 컬럼에 해당 월 포함 여부로 판단
- SELECT만 허용. INSERT/UPDATE/DELETE/DROP 등 불가
- 결과는 최대 100행으로 제한됨
- ADID 원본 값은 마스킹되어 반환됨
- 테이블은 AICOMPETITION.DMP 스키마에 위치`;

  server.registerTool("query_database", {
    description: DB_SCHEMA_DESC,
    inputSchema: {
      sql: z.string().describe("실행할 SELECT 쿼리"),
      limit: z.number().optional().default(100).describe("최대 반환 행 수 (기본 100, 최대 500)"),
    },
  }, async ({ sql, limit }, { sessionId }) => {
    // 호출 제한 체크
    const rateLimitError = checkDbRateLimit(sessionId || "default");
    if (rateLimitError) return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", error: rateLimitError }) }] };

    // SQL 검증
    const sqlError = validateSql(sql);
    if (sqlError) return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", error: sqlError }) }] };

    // 행 수 제한
    const safeLimit = Math.min(limit || 100, 500);

    try {
      const rows = await executeSnowflakeQuery(sql, safeLimit);
      const maskedRows = maskAdidInResults(rows);
      return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", rowCount: maskedRows.length, data: maskedRows }, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", error: err.message }) }] };
    }
  });

  server.registerTool("get_db_schema", {
    description: "Small DMP DB의 테이블 구조를 조회합니다. SQL을 작성하기 전에 먼저 이 도구로 스키마를 확인하세요.",
    inputSchema: {
      table_name: z.string().optional().describe("특정 테이블만 조회 (미입력 시 전체 목록)"),
    },
  }, async ({ table_name }) => {
    const schema = {
      ADID_INFO: {
        description: "사용자 정보 (ADID, 인구통계, 디바이스)",
        columns: [
          { name: "ADID", type: "VARCHAR", description: "광고 식별자" },
          { name: "AGE", type: "VARCHAR", description: "수집 연령" },
          { name: "GENDER", type: "VARCHAR", description: "수집 성별" },
          { name: "P_AGE", type: "VARCHAR", description: "추정 연령 5세 단위 (01:15~19세, 02:20~24세, ..., 12:70세~)" },
          { name: "P_GENDER", type: "VARCHAR", description: "추정 성별 (F:여성, M:남성)" },
          { name: "P_MARRY", type: "VARCHAR", description: "추정 결혼 여부 (M:결혼, S:미혼)" },
          { name: "CARRIER", type: "VARCHAR", description: "통신사" },
          { name: "DEVICE_MODEL", type: "VARCHAR", description: "단말 모델명" },
          { name: "DEVICE_OS", type: "VARCHAR", description: "OS 버전" },
          { name: "REGIST_DATE", type: "VARCHAR", description: "등록일" },
          { name: "UPDATE_DATE", type: "VARCHAR", description: "수정일" },
          { name: "UNTRACKED_DATE", type: "VARCHAR", description: "추적 해제일" },
          { name: "AGREE_STAT", type: "VARCHAR", description: "이용 정보 수집 동의 상태 (Y/N)" },
          { name: "DISAGREE_DATE", type: "VARCHAR", description: "동의 철회일" },
        ],
      },
      INTE_CATEGORY: {
        description: "앱 카테고리 매핑",
        columns: [
          { name: "PACKAGE_NAME", type: "VARCHAR", description: "앱 패키지명" },
          { name: "APP_NAME", type: "VARCHAR", description: "앱 이름" },
          { name: "CATEGORY", type: "VARCHAR", description: "카테고리 경로 (대분류>소분류)" },
          { name: "CATE_CODE", type: "VARCHAR", description: "카테고리 코드" },
        ],
      },
      PACKAGE_DAILY_USAGE: {
        description: "일간 앱 사용 데이터",
        columns: [
          { name: "DATE", type: "VARCHAR", description: "사용 날짜" },
          { name: "ADID", type: "VARCHAR", description: "광고 식별자" },
          { name: "PACKAGE_NAME", type: "VARCHAR", description: "앱 패키지명" },
          { name: "INSTALL_MARKET", type: "VARCHAR", description: "설치 마켓" },
          { name: "DAILY_USE_SEC", type: "NUMBER", description: "일일 사용 시간 (초)" },
          { name: "SEARCH_KEY", type: "NUMBER", description: "파티션 날짜 (yyyyMMdd)" },
        ],
      },
      PACKAGE_USE_HISTORY: {
        description: "앱 사용 이력 (설치, 삭제, 누적 사용, 주간/월간 사용 여부)",
        columns: [
          { name: "PACKAGE_NAME", type: "VARCHAR", description: "앱 패키지명" },
          { name: "APP_NAME", type: "VARCHAR", description: "앱 이름" },
          { name: "CATEGORY", type: "VARCHAR", description: "DMP 업종 카테고리" },
          { name: "ADID", type: "VARCHAR", description: "광고 식별자" },
          { name: "INSTALL_MARKET", type: "VARCHAR", description: "설치 마켓 (G:Google, O:OneStore 등)" },
          { name: "FIRST_INSTALL_DATE", type: "VARCHAR", description: "최초 설치일" },
          { name: "LAST_INSTALL_DATE", type: "VARCHAR", description: "마지막 설치일" },
          { name: "LAST_DELETE_DATE", type: "VARCHAR", description: "마지막 삭제일" },
          { name: "REINSTALL_CNT", type: "NUMBER", description: "재설치 횟수" },
          { name: "LAST_UPDATE_DATE", type: "VARCHAR", description: "마지막 업데이트일" },
          { name: "LAST_USE_DATE", type: "VARCHAR", description: "마지막 사용일" },
          { name: "CUM_USE_SEC", type: "NUMBER", description: "누적 사용 시간 (초)" },
          { name: "USE_WEEK", type: "VARCHAR", description: "주간 사용 여부 (해당 주 3초 이상 사용 시 체크, 월요일 기준)" },
          { name: "USE_MONTH", type: "VARCHAR", description: "월간 사용 여부 (해당 월 3초 이상 사용 시 체크)" },
          { name: "ACTIVE_FLAG", type: "BOOLEAN", description: "활성 사용자 여부 (True:트래킹 중, False:삭제 판단)" },
          { name: "AGREE_STAT", type: "VARCHAR", description: "이용 정보 수집 동의 상태" },
          { name: "SCORE", type: "FLOAT", description: "cum_use_sec, first_install_date, active_flag, reinstall_cnt 기반 점수" },
        ],
      },
    };

    if (table_name && schema[table_name]) {
      return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", table: table_name, ...schema[table_name] }, null, 2) }] };
    }
    return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", tables: Object.keys(schema).map(k => ({ name: k, description: schema[k].description, columnCount: schema[k].columns.length })) }, null, 2) }] };
  });

  server.registerTool("get_sample_data", {
    description: "특정 테이블의 샘플 데이터 5건을 반환합니다. 테이블 구조를 파악할 때 사용하세요.",
    inputSchema: {
      table_name: z.string().describe("테이블명 (adid_info, package_use_history, category, weight)"),
    },
  }, async ({ table_name }, { sessionId }) => {
    const allowedTables = ["ADID_INFO", "INTE_CATEGORY", "PACKAGE_DAILY_USAGE", "PACKAGE_USE_HISTORY"];
    if (!allowedTables.includes(table_name.toUpperCase())) {
      return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", error: `허용된 테이블: ${allowedTables.join(", ")}` }) }] };
    }

    const rateLimitError = checkDbRateLimit(sessionId || "default");
    if (rateLimitError) return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", error: rateLimitError }) }] };

    try {
      const rows = await executeSnowflakeQuery(`SELECT * FROM ${table_name}`, 5);
      const maskedRows = maskAdidInResults(rows);
      return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", table: table_name, sampleRows: maskedRows }, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: JSON.stringify({ source: "모바일인덱스 DMP", error: err.message }) }] };
    }
  });

  return server;
}


// ─── HTTP + SSE 서버 ───
const transports = new Map();

const httpServer = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", tools: 30, version: "2.0.0", snowflake: SF_CONFIG.account ? "configured" : "not configured" }));
    return;
  }

  if (req.url?.startsWith("/sse") || req.url?.startsWith("/message")) {
    if (!verifyApiKey(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid or missing API key" }));
      return;
    }
  }

  if (req.method === "GET" && req.url === "/sse") {
    const server = createServer();
    const transport = new SSEServerTransport("/message", res);
    transports.set(transport.sessionId, { server, transport });
    res.on("close", () => { transports.delete(transport.sessionId); });
    await server.connect(transport);
    return;
  }

  if (req.method === "POST" && req.url?.startsWith("/message")) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const sessionId = url.searchParams.get("sessionId");
    const entry = sessionId ? transports.get(sessionId) : null;
    if (!entry) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Session not found" }));
      return;
    }
    await entry.transport.handlePostMessage(req, res);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

httpServer.listen(PORT, () => {
  console.log(`✅ MobileIndex MCP SSE Server v2 running on http://localhost:${PORT}`);
  console.log(`   SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API keys: ${ALLOWED_KEYS.length > 0 ? `${ALLOWED_KEYS.length} key(s) configured` : "disabled (dev mode)"}`);
  console.log(`   Snowflake: ${SF_CONFIG.account ? `${SF_CONFIG.account} (${SF_CONFIG.database})` : "not configured — DB tools will return error"}`);
  console.log(`   Tools: 27 API + 3 DB = 30 total`);
});
