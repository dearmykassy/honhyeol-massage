# 혼혈마사지

[혼혈마사지 운영 사이트](https://honhyul.kr/)는 지역별 이용 범위, 공개 코스와 예약 전 확인사항을 안내하는 Next.js 16 정적 웹사이트입니다. 화면은 Template5를 사용하고 운영 URL은 `https://honhyul.kr` 하나로 통일합니다.

## 운영 페이지

- [지역 찾기](https://honhyul.kr/areas/)
- [가격 안내](https://honhyul.kr/pricing/)
- [이용 안내](https://honhyul.kr/guide/)
- [공지사항](https://honhyul.kr/notice/)
- [블로그](https://honhyul.kr/blog/)
- [XML 사이트맵](https://honhyul.kr/sitemap.xml)
- [RSS 2.0 피드](https://honhyul.kr/rss.xml)

위 링크는 2026-08-18 KST 기준 운영 HTTPS에서 모두 HTTP 200 응답을 확인했습니다.

## 페이지와 검색 수집 계약

- 지역 페이지 1,291개, 고정 페이지 6개, 블로그 글 2개를 제공하며 사이트맵에는 canonical 공개 URL 1,299개가 들어갑니다.
- 지역 검색은 시·군·구와 동·읍·면, 등록된 지역 별칭을 실제 상세 경로에 연결합니다.
- 공개 페이지는 self canonical과 `index,follow`를 사용합니다. `robots.txt`는 전체 경로 수집을 허용하고 운영 사이트맵을 명시합니다.
- `rss.xml`은 블로그 글 2편의 canonical GUID, 실제 발행일과 전체 본문을 제공합니다. 전체 URL 발견은 사이트맵이 담당합니다.
- 1,299개 공개 URL에는 페이지별 title, keywords, description, canonical, Open Graph와 Twitter 메타를 적용합니다. 제목과 본문은 실제 페이지 내용을 설명하며 반복 키워드나 확인되지 않은 운영 주장을 넣지 않습니다.

## 지역 안내 구조

광역 상세는 다음 분류식으로 결정하며 정확히 41개입니다.

```ts
node.kind === "root" || /시$/u.test(node.displayName)
```

구성은 시작 권역 11개, 경기 시 단위 28개, 제주 시 단위 2개입니다. 광역 상세에는 실제 지역 그래프와 확인된 운영 정보만 사용해 하위 지역, 주소 확인 범위, 운영 순서, 코스·시간, 첫 이용 순서, 전화 전 준비, 현장 결제와 변경 재확인을 안내합니다.

나머지 1,250개 구·군·동·읍·면 페이지는 주소 명칭, 상위 주소, 같은 상위 주소의 다른 항목, 전화 준비, 일정, 코스, 2인 프로그램, 결제, 위생, 첫 문의와 변경 확인의 11개 섹션·22개 문단으로 구성합니다. 지역 디렉터리는 홈과 모든 지역 페이지의 마지막 콘텐츠 섹션에 둡니다.

실제 근거가 없는 위치 지도, 매장 권역, 인기 장소, 후기·평점, 지역별 이용량, 이동·도착 시간은 만들거나 주장하지 않습니다.

## 확인된 운영 정보

- 전화: 0508-202-3906
- 전화상담: 365일 24시간
- 결제: 선입금 없이 이용 뒤 현장 정산, 현장 카드 결제 가능
- 프로그램: 공개 가격표 5개 코스, 14개 시간·금액 항목, 커플·부부 2인 동시 프로그램
- 비품: 일회용 비품 사용, 관리 전후 소독

특정 지역·주소의 이용 가능 여부와 시작 시각은 페이지에서 확정하지 않고, 상세 주소와 희망 시간을 전달한 전화에서 확인합니다.

## 개발과 검증

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm audit:copy
pnpm typecheck
pnpm lint
pnpm build
pnpm audit:build
```

`pnpm audit:copy`는 1,291개 지역의 제목·설명·H1·문단·정규화된 페이지 서명을 검사하고 기존 플랫폼의 고객 문장과 정확히 겹치는 긴 문자열을 비교합니다. `pnpm audit:build`는 `out/`의 1,299개 HTML, sitemap, robots, 메타 필드, 다른 브랜드 잔여 문자열과 이미지 경로를 확인합니다.

GA4는 배포 환경에 `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 있을 때만 로드합니다. 전화 CTA 클릭 이벤트도 같은 조건에서 전송합니다.

## 이미지 계약

- 지역 배너는 승인된 원본 130개와 반응형 WebP 390개를 1,291개 경로에 최대 10회씩 배정하며 부모·자식 및 형제 충돌을 허용하지 않습니다.
- 지역 배너 자산은 `public/images/honhyeol-template4/`와 `public/assets/honhyeol-massage/template4-regional/`의 승인 이력을 유지합니다. Template5 전환은 UI 골격만 바꿨습니다.
- 홈 첫 8개 권역 카드는 사용자 승인에 따라 마사지러브의 도시·랜드마크 자산을 재사용하며 공개 provenance에 출처·저자·라이선스를 보존합니다.
- 코스 카드는 거울 셀피가 아니라 코스의 동작·도구·대상을 구분할 수 있는 전용 이미지를 사용합니다.
- 투명 배경 원형 궤도형 브랜드 마크와 32·192·512 아이콘은 같은 승인 원본에서 파생합니다.

도메인이나 배포 설정을 바꿀 때는 canonical, Open Graph URL, robots, sitemap과 RSS의 origin을 함께 확인합니다. 네이버 서치어드바이저 온보딩에서는 사이트맵과 RSS를 제출하고 수집 주기를 `빠르게`로 설정합니다.
