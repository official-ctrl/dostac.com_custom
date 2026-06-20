# Phase 0 — 카테고리 데이터 소스 위치 조사 (Issue #1)

**조사 방법**: `official-ctrl/dostac.com_custom` 저장소를 직접 clone하여 코드 추적 (정적 분석, 라이브 네트워크 측정 아님)
**결론**: API는 서버(Edge Runtime)에서도 호출 가능. 페이지 레벨에서 단지 활용하지 않고 있을 뿐.

## 1. 데이터 흐름
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

# 추가 발견 — P0 버그: 상품 데이터 부재 시 무한 재렌더링 루프 (Phase 0 측정 중 발견)

**중요도**: 기존 계획에 없던 새로운 핵심 발견. 우선순위 재검토 필요 — 문제 A/B보다 체감 영향이 클 수 있음.
**발견 경위**: Chrome DevTools Performance 트레이스에서 `/products` 페이지가 상품 0개 상태일 때, 19~23초 녹화 내내 Scripting이 전체의 93~98%, Minor GC가 self time의 51.6%를 차지하는 비정상 패턴이 확인됨. Bottom-Up 분석 결과 `useState` 호출이 깊은 체인으로 반복 등장.

## 원인 (코드 근거)

`src/app/products/page.tsx`:

```ts
// 99번 줄
const products = productsQuery.data ?? [];
```

`productsQuery.data`가 `undefined`(API 미응답/에러)일 때마다 **매 렌더링마다 새 빈 배열**이 생성됨. 이 불안정한 참조가 `useMemo` 체인을 타고 전파됨:

- `categories` (221줄) — `[products]`에 의존
- `categoryFilteredProducts` (244줄) — `[products, selectedCategory]`에 의존
- `subCategories` (251줄) — `[categoryFilteredProducts]`에 의존
- `filteredProducts` (288줄) — `[categoryFilteredProducts, selectedSubCategory]`에 의존

그리고 결정적으로:

```ts
// 312~318번 줄
useEffect(() => {
  if (productsQuery.isPlaceholderData) return;
  latestFilteredRef.current = filteredProducts;
  if (!isFadedOutRef.current) {
    setDisplayedFiltered(filteredProducts);
  }
}, [filteredProducts, productsQuery.isPlaceholderData]);
```

`filteredProducts`가 매 렌더링마다 새 참조이므로 이 effect가 매번 재실행되고, `setDisplayedFiltered` 호출이 다시 렌더링을 유발 → 다시 새 배열 생성 → 다시 effect 실행 → **무한 재렌더링 루프**.

## 발생 조건

- `productsQuery.data`가 `undefined`/`null`인 상태 (API 호출 실패, 네트워크 오류, 응답 지연 등)
- `productsQuery.isPlaceholderData`가 `false`인 상태
- 데이터가 정상적으로(빈 배열이라도 실제 응답으로) 와 있으면 react-query가 참조를 안정적으로 캐싱하므로 이 버그는 발동하지 않음 — **정확히 "상품 0개로 보일 때"만 재현되는 것과 일치**

## 측정값과의 일치

| 관찰된 현상 | 버그로 설명 가능 |
|---|---|
| `useState` → `ap` → `t.useState` 깊은 호출 체인, self time 35.8% | `setDisplayedFiltered` 반복 호출 |
| Minor GC self time 51.6% | 매 렌더링마다 새 배열 객체 생성 |
| 전체 트레이스의 93~98%가 Scripting | 무한 루프는 자체적으로 멈추지 않음 |
| 정확히 "상품 0개"일 때만 재현 | `data ?? []`는 `data`가 nullish일 때만 새 참조 생성 |

## 권장 조치

1. **즉시 수정 (가장 빠름)**: `const products = productsQuery.data ?? [];`를 모듈 최상단에 선언한 안정적인 상수로 교체
```ts
   const EMPTY_PRODUCTS: Product[] = [];
   // ...
   const products = productsQuery.data ?? EMPTY_PRODUCTS;
```
2. **근본 원인 확인**: `productsQuery.data`가 왜 `undefined`로 남아있었는지 — Network 탭에서 해당 API 호출의 실제 응답 상태 확인 필요
3. **전체 점검**: 같은 패턴(`?? []`, `?? {}` 등 인라인 fallback)이 다른 페이지에도 있는지 코드베이스 전체 검색 권장 (`grep -rn "?? \[\]" src/app`)

## 우선순위 영향

이 버그는 단순 "체감 랙"을 넘어 **브라우저 탭이 사실상 멈추는(CPU가 100%에 가깝게 고정되는) 수준**입니다. PRODUCTION↔PRODUCT 전환(문제 A)이나 카테고리 필터(문제 B)보다 비즈니스 영향이 클 수 있어, **P0 중에서도 최우선으로 재분류**할 것을 제안합니다.
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

