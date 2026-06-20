# Phase 0 — 베이스라인 성능 측정 (Issue #2)

> 코드 정적 분석만으로는 확인할 수 없는 항목입니다. 실제 수치를 임의로 채우지 않았으며, 아래 템플릿에 따라 라이브 브라우저에서 측정 후 채워주세요. 이 수치가 이후 모든 Phase PR의 Before 기준이 됩니다.

## 측정 방법

1. Chrome 개발자 도구 (F12) → **Performance** 탭 → 녹화 시작
2. `/production` → `/products` 클릭 → 녹화 중지
3. 같은 방식으로 `/products` → `/production` 1회, 총 왕복 3세트
4. 각 세트에서 50ms 이상 걸린 Long Task 개수와, 클릭부터 화면이 안정될 때까지 체감 시간을 기록

| 세트 | 전환 방향 | Long Task 횟수 | 체감 전환 시간(ms) | 비고 |
|---|---|---|---|---|
| 1 | PRODUCTION → PRODUCT | (측정 필요) | (측정 필요) | |
| 2 | PRODUCT → PRODUCTION | (측정 필요) | (측정 필요) | |
| 3 | PRODUCTION → PRODUCT | (측정 필요) | (측정 필요) | |

## Lighthouse / PageSpeed Insights

| 페이지 | LCP | INP | CLS |
|---|---|---|---|
| `/production` | (측정 필요) | (측정 필요) | (측정 필요) |
| `/products` | (측정 필요) | (측정 필요) | (측정 필요) |

## 참고 — 정적 분석으로 이미 확인된 구조적 원인

`docs/data-source-audit.md`에 기록된 코드 추적 결과, PRODUCTION ↔ PRODUCT 전환 시 `Layout`(Header+Footer)이 매번 완전히 언마운트·리마운트되는 구조가 확인되었습니다. 위 Long Task 측정에서 전환 시점에 스크립팅 비용이 두드러진다면, 이 구조적 원인과 직접 연결지어 해석할 수 있습니다.
