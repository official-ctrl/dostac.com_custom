# Phase 0 — 카테고리 데이터 소스 위치 조사 (Issue #1)

**조사 방법**: `official-ctrl/dostac.com_custom` 저장소를 직접 clone하여 코드 추적 (정적 분석, 라이브 네트워크 측정 아님)
**결론**: API는 서버(Edge Runtime)에서도 호출 가능. 페이지 레벨에서 단지 활용하지 않고 있을 뿐.

## 1. 데이터 흐름

```
artifacts/api-server/src/routes/public-products.ts   ← 실제 상품 데이터 엔드포인트
artifacts/api-server/src/routes/public-process.ts     ← PRODUCTION 페이지 공정/인증 데이터 엔드포인트
        ↓ (isomorphic fetch, lib/api-client-react/src/custom-fetch.ts)
        ↓ setBaseUrl()로 베이스 URL 주입 — 브라우저/서버 어디서든 동일하게 동작
@workspace/api-client-react (orval로 자동 생성된 react-query 훅)
        ↓
useGetPublicProcess()              — artifacts/web/src/app/production/page.tsx:51
getListPublicProductsQueryOptions() — artifacts/web/src/app/products/page.tsx:96
```

`customFetch`(`lib/api-client-react/src/custom-fetch.ts`)는 표준 `fetch()` 기반이라 런타임에 의존하지 않습니다. 즉 **이 API는 클라이언트 전용이 아닙니다.**

## 2. 이미 같은 코드베이스 안에 검증된 서버 프리페치 패턴이 존재함

`src/app/layout.tsx` (루트, 111~123줄)에서 카테고리/서브카테고리/배너 데이터를 이미 이렇게 처리하고 있습니다:

```ts
const queryClient = getQueryClient();
await Promise.race([
  Promise.all([
    queryClient.prefetchQuery(getListPublicCategoryTranslationsQueryOptions()),
    queryClient.prefetchQuery(getListPublicSubCategoryTranslationsQueryOptions()),
    queryClient.prefetchQuery(getListPublicBannersQueryOptions()),
  ]),
  new Promise<void>((resolve) => setTimeout(resolve, 3000)), // 3초 타임아웃으로 SSR 블로킹 방지
]);
const dehydratedState = dehydrate(queryClient);
// ... <HydrationBoundary state={dehydratedState}>
```

**그런데 `production/page.tsx`, `products/page.tsx`에는 이 패턴이 전혀 적용되어 있지 않습니다** (`prefetchQuery`/`dehydrate`/`HydrationBoundary` 검색 결과, products/page.tsx의 유일한 `prefetchQuery` 호출은 `useEffect` 안에서 다른 언어 버전을 미리 캐싱하는 클라이언트 전용 로직일 뿐, 서버 프리페치가 아님).

## 3. 결론 및 Phase 2에 대한 함의

- 데이터 소스는 서버에서 접근 가능 → **Phase 2 기간 추정(1~2주) 그대로 유효**
- 같은 저장소 안에 이미 동작하는 참고 구현(루트 layout.tsx)이 있어 별도 설계 없이 동일 패턴을 `production/page.tsx`, `products/page.tsx`에 적용하면 됨
- 다만 두 페이지는 현재 `"use client"`이므로, 서버 프리페치를 적용하려면 페이지를 서버 컴포넌트로 전환하거나(데이터 fetch 부분만 분리), 최소한 루트 layout.tsx와 동일한 prefetch+dehydrate 패턴을 페이지 레벨에 추가해야 함 — Phase 2 작업 범위에 정확히 일치

---

# Phase 0 — 공유 레이아웃 여부 확인 (Issue #3 보강 — 문제 A의 직접 원인 확인됨)

**결론**: 공유되지 않고 있음. 이것이 PRODUCTION ↔ PRODUCT 전환 랙(문제 A)의 가장 직접적인 원인.

## 근거

`src/app/production/page.tsx`, `src/app/products/page.tsx` 각각의 최하단:

```tsx
// production/page.tsx
export default function Production() {
  return (
    <Layout>
      <ProductionContent />
    </Layout>
  );
}

// products/page.tsx
export default function Products() {
  return (
    <Layout>
      <ProductsContent />
    </Layout>
  );
}
```

`Layout`(`src/components/dostac/Layout.tsx:1005`)은 `app/layout.tsx`(Next.js 공식 공유 레이아웃 파일)가 아니라 **각 페이지 컴포넌트가 개별적으로 호출하는 일반 컴포넌트**입니다. Next.js App Router 입장에서는 `/production`에서 `/products`로 이동할 때 두 라우트가 서로 다른 트리이므로, `Layout`(Header+Footer 포함) 전체가 매번 언마운트→리마운트됩니다.

`Header()` 컴포넌트(`Layout.tsx:717~752`)는 그 안에서:
- `window.addEventListener("scroll", ...)` — 스크롤 위치에 따른 배경 스타일 전환
- `window.addEventListener("hashchange", ...)` — 해시 스크롤 처리
- 모바일 메뉴/About 드롭다운/언어 선택기 상태

를 각각 관리하고 있어서, 리마운트될 때마다 이 모든 리스너 등록·해제와 상태 초기화가 반복됩니다. **타이머 누수(cleanup 누락)는 발견되지 않았지만, 그와 별개로 "불필요한 전체 재구축" 자체가 체감 랙의 원인입니다.**

## Phase 1 작업에 대한 함의

`Layout`을 `app/layout.tsx`로 끌어올리는 작업(Phase 1 "공유 레이아웃 적용")이 그대로 유효합니다. 다만 `Layout`이 현재 `children`만 받는 단순 래퍼라서, Next.js App Router의 `app/layout.tsx`로 옮기는 작업 자체는 구조적으로 어렵지 않습니다 (route group 또는 루트 레이아웃에 `<Header />`, `<Footer />`를 직접 배치하고 `{children}`을 그 사이에 두는 형태로 리팩토링).

---

# 추가 발견 — 문제 B(카테고리 필터)의 새로운 원인

`products/page.tsx`에서 발견된, 기존 v1/v2 계획에는 없던 사실입니다.

1. **카테고리를 `window.location.search`에서 직접 읽음** (101~105줄) — Next.js의 `useSearchParams()` 훅이 아니라 `window.location`을 직접 참조하므로, 서버 렌더링 시점에는 항상 빈 값이고 클라이언트 하이드레이션 이후에만 반영됩니다.

2. **`localStorage` 기반 "마지막 필터 복원" 로직** (40~75, 126~137줄) — `/products`에 쿼리 파라미터 없이 진입하면, 컴포넌트가 마운트된 후 `localStorage`에 저장된 마지막 카테고리를 읽어와 `router.replace()`로 URL을 자동 변경합니다. 이는 PRODUCT 페이지 진입 시 "콘텐츠가 한 번 바뀌는" 추가적인 체감 지연 요소이며, 기존 계획에 없던 항목이므로 **Phase 2 작업 항목에 추가 검토가 필요합니다** (이 자동 리다이렉트를 유지할지, 명시적 "최근 본 카테고리" UI로 대체할지 결정 필요).

---
