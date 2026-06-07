# Dostac-Web Next.js Migration — Handoff

> 뉴 세션에서 이어받을 때 이 파일을 먼저 읽을 것.

---

## 프로젝트 경로

```
~/dostac-web/
  artifacts/web/        ← Next.js 앱 (메인 작업 대상)
  artifacts/api-server/ ← Hono API 서버 (포트 4000)
  lib/                  ← pnpm workspace 공용 라이브러리
  docker-compose.yml
  nginx/nginx.conf
```

---

## 완료된 작업 ✅

### 인프라 / 마이그레이션
- [x] Vite + wouter CSR SPA → **Next.js 15 App Router** 마이그레이션 완료
- [x] `next.config.ts` — standalone output, transpilePackages, /notice→/insights 리다이렉트
- [x] `postcss.config.mjs` — `@tailwindcss/postcss` 설정
- [x] `src/app/globals.css` — Tailwind v4 + dostac.css 단일 엔트리
- [x] `src/lib/get-query-client.ts` — 서버/클라이언트 싱글턴, `setBaseUrl` 모듈 초기화
- [x] `src/app/providers.tsx` — TanStack Query 클라이언트 프로바이더
- [x] `src/middleware.ts` — URL 소문자 리다이렉트
- [x] `Dockerfile.web` — multi-stage Next.js standalone
- [x] `docker-compose.yml` — web(3000) + api(4000) + nginx(80) + admin SPA
- [x] `nginx/nginx.conf` — `/` → web:3000 프록시, `/admin` → 정적 파일

### 페이지 변환 (wouter → next/link)
- [x] `src/app/page.tsx` (Home)
- [x] `src/app/about/page.tsx`
- [x] `src/app/production/page.tsx`
- [x] `src/app/products/page.tsx`
- [x] `src/app/products/[slug]/page.tsx` ← 서버 래퍼 (generateMetadata)
- [x] `src/app/products/[slug]/ProductDetailClient.tsx` ← 실제 클라이언트 컴포넌트
- [x] `src/app/insights/page.tsx`
- [x] `src/app/insights/[slug]/page.tsx` ← 서버 래퍼 (generateMetadata)
- [x] `src/app/insights/[slug]/InsightDetailClient.tsx` ← 실제 클라이언트 컴포넌트
- [x] `src/app/contact/page.tsx`
- [x] `src/app/not-found.tsx`

### Layout 컴포넌트
- [x] `src/components/dostac/Layout.tsx` — wouter → next/link + usePathname + useRouter 변환
- [x] `src/components/ui/sonner.tsx` — next-themes 제거, `theme="light"` 하드코딩

### SEO / 메타데이터
- [x] `src/app/layout.tsx` — Metadata API (OG, Twitter, robots), JSON-LD, Google Fonts
- [x] `src/app/about/layout.tsx` — "About Us" 정적 메타데이터
- [x] `src/app/production/layout.tsx` — "Production Process" 정적 메타데이터
- [x] `src/app/products/layout.tsx` — "Products" 정적 메타데이터
- [x] `src/app/insights/layout.tsx` — "Insights" 정적 메타데이터
- [x] `src/app/contact/layout.tsx` — "Contact Us" 정적 메타데이터
- [x] `src/app/sitemap.ts` — 정적 라우트 + API에서 product/notice 슬러그 동적 추가
- [x] `src/app/robots.ts` — robots.txt 생성

### 버그 수정
- [x] **하이드레이션 미스매치** (`"1 Issue"`) — `i18n.tsx` LanguageProvider를 두 패스 패턴으로 수정
  - 항상 `"en"`으로 초기화 → useEffect에서 localStorage 읽기
- [x] **느린 SSR 응답** — `.env.local` 추가 (`INTERNAL_API_URL=http://localhost:4000`) + layout.tsx에 `Promise.race` 3초 타임아웃
- [x] `src/app/google-analytics.tsx` — useSearchParams를 Suspense로 감싸서 SSG opt-out 방지

### UI / 디자인
- [x] 폰트: Cormorant Garamond + DM Sans (Inter/Space Grotesk 교체)
- [x] `dostac.css` — font-family 업데이트
- [x] Home 페이지 TrustSection — MOQ 바 + 파트너 로고 스트립 추가

---

## 미완료 / 다음 세션에서 할 작업 📋

### 즉시 확인 필요
1. **빌드 검증** — `pnpm build` 성공 여부 확인
   ```bash
   cd ~/dostac-web/artifacts/web && pnpm build
   ```
2. **"1 Issue" 하이드레이션 미스매치 해결 확인** — dev 서버 재시작 후 브라우저에서 확인
   ```bash
   cd ~/dostac-web/artifacts/web && pnpm dev
   # 브라우저에서 http://localhost:3000 열어 좌하단 "1 Issue" 뱃지 없음 확인
   ```

### Git 커밋
현재 스테이지되지 않은 변경사항이 많음:
```bash
git -C ~/dostac-web status
```
커밋할 파일들:
- `artifacts/web/src/app/layout.tsx` (Promise.race 타임아웃)
- `artifacts/web/src/app/insights/[slug]/page.tsx` (서버 래퍼)
- `artifacts/web/src/app/products/[slug]/page.tsx` (서버 래퍼)
- `artifacts/web/src/components/dostac/i18n.tsx` (하이드레이션 수정)
- `artifacts/web/src/app/about/layout.tsx` (신규)
- `artifacts/web/src/app/contact/layout.tsx` (신규)
- `artifacts/web/src/app/insights/layout.tsx` (신규)
- `artifacts/web/src/app/production/layout.tsx` (신규)
- `artifacts/web/src/app/products/layout.tsx` (신규)
- `artifacts/web/src/app/insights/[slug]/InsightDetailClient.tsx` (신규)
- `artifacts/web/src/app/products/[slug]/ProductDetailClient.tsx` (신규)
- `artifacts/web/src/app/sitemap.ts` (신규)
- `artifacts/web/src/app/robots.ts` (신규)

### 향후 개선 (선택)
- [ ] 각 페이지 `generateMetadata`에서 API 호출해 실제 제품명/아티클 제목 가져오기
- [ ] `generateStaticParams` 추가해 동적 페이지 SSG 빌드
- [ ] GA4 이벤트 트래킹 (문의 폼 제출 등)
- [ ] Lighthouse 점수 확인 (목표: Performance 90+, SEO 100)

---

## 환경 변수

**개발** (`artifacts/web/.env.local`):
```
INTERNAL_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**프로덕션** (docker-compose.yml):
```
INTERNAL_API_URL=http://api:4000
NEXT_PUBLIC_SITE_URL=https://dostac.com
```

---

## 로컬 개발 시작

```bash
# Docker (DB + API)
colima start
docker compose -f ~/dostac-web/docker-compose.yml up db api -d

# Next.js dev
cd ~/dostac-web/artifacts/web
pnpm dev

# 접속: http://localhost:3000
```

---

## 핵심 아키텍처 결정

| 항목 | 결정 | 이유 |
|------|------|------|
| 라우터 | Next.js App Router | SSR/SSG + SEO |
| API 통신 | TanStack Query + HydrationBoundary | 서버 prefetch → 클라이언트 재사용 |
| `setBaseUrl` 타이밍 | 모듈 로드 시 1회 (if isServer) | 요청별 호출 시 싱글턴 race condition |
| 언어 초기화 | 항상 "en" → useEffect localStorage | 하이드레이션 미스매치 방지 |
| SSR 타임아웃 | Promise.race 3000ms | 느린 API가 SSR을 블록하지 않도록 |
| 동적 페이지 메타데이터 | 서버 래퍼 page.tsx + *Client.tsx | "use client"에서는 generateMetadata 불가 |
