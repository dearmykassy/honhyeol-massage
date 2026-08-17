# 혼혈마사지 활동 일지

> 새 활동과 검증 결과를 최신순으로 기록한다. 비밀값·로그인 정보는 기록하지 않는다.

## 2026-08-17 KST — 독립 궤도형 브랜드 마크·홈 권역 도시 사진 적용

- 혼혈마사지 마크를 건마에반하다의 하트와 구분되는 원형 궤도형 구조로 만들었다. 두 개의 굵은 곡선과 중앙 음각을 사용하고 하트 실루엣은 사용하지 않았다. 1,254×1,254 투명 PNG 원본에서 32·192·512 PNG 아이콘을 파생해 헤더·푸터·metadata icons에 연결했다.
- 홈 첫 8개 권역 카드에는 사용자 명시 승인에 따라 마사지러브의 서울·인천·경기·천안·아산·대전·대구·구미 도시·랜드마크 WebP를 바이트 그대로 복사했다. 공개 provenance에 원 출처·저자·라이선스와 해시를 보존했고, 카드 아래에 출처 링크를 표시했다.
- 지역 상세페이지의 배너 이미지, 1,291개 route 배정, 메인 hero와 블로그 이미지는 변경하지 않았다. 이 재사용 허용은 이번 홈 카드 8장에만 적용한다.

## 2026-08-17 KST — 남성전용 코스 카드 마사지사 여성 고정

- 토닥이 계열을 제외한 모든 플랫폼의 마사지 서비스 이미지에서 마사지사는 성인 여성으로 표현한다는 영구 규칙을 `AGENTS.md`에 추가했다. 남성전용 코스는 고객만 성인 남성으로 두고 마사지사는 성인 여성으로 고정한다.
- 기존 남성 마사지사 사진 대신, 완전 착의한 성인 한국 남성 고객이 일반 수평 마사지 베드에 엎드리고 성인 한국 여성 마사지사가 등·어깨를 손으로 관리하는 전용 사진을 built-in `image_gen`으로 새로 만들었다. 기계·마사지 의자·의료 장비·얼굴 구멍·문자·로고·워터마크는 없다.
- 원본 PNG와 960×1200 WebP를 `public/images/honhyeol-template5/courses/v2/`에 보존하고 홈의 남성전용 카드만 v2 WebP로 전환했다. 나머지 네 코스, 지역 배너, 메인 배너, 블로그 이미지는 변경하지 않았다.

## 2026-08-17 KST — honhyul.kr 공개 SEO 전환·RSS 2.0 추가

- 운영 origin을 `https://honhyul.kr`로 확정해 전체 공개 페이지의 canonical·Open Graph·sitemap·robots host를 한 도메인으로 통일했다. root·블로그·지역 메타는 `index,follow`, robots는 전체 허용으로 전환했고, 배포 허용 계약과 차단 사유 0건을 테스트로 고정했다.
- 네이버 검색어드바이저의 피드 기준에 맞춰 실제 블로그 글 2편만 `rss.xml`에 포함했다. 각 item은 같은 운영 host의 canonical URL을 영구 GUID로 사용하고, 실제 발행일을 RFC 822 `pubDate`로 기록하며, 요약이 아닌 글 도입·모든 섹션·체크리스트 전체를 XML 이스케이프해 제공한다. 1,299개 전체 공개 URL은 `sitemap.xml`이 담당한다.
- 정적 export의 `/rss.xml` 응답은 `application/rss+xml; charset=utf-8`, 1시간 캐시, `nosniff` 헤더를 갖는다. 빌드 감사에서 RSS item 2개, canonical link/GUID 일치, 충분한 본문 길이, 날짜 형식, 10MB 미만 크기를 확인한다.
- 전 페이지 `<head>`에는 같은 운영 origin의 `/rss.xml`을 가리키는 `rel="alternate"` RSS 자동발견 링크를 1개 둔다.
- 영구 작업 규칙에 모든 신규 플랫폼의 sitemap+RSS 동시 제공과 네이버 온보딩 시 `설정 → 수집 주기 설정 → 빠르게` 선택을 추가했다. 네이버 UI에서 소유확인·sitemap/RSS 제출·수집 주기 선택은 배포 후 별도 온보딩 단계로 남긴다.
- 최종 검증은 Vitest 34/34, `pnpm audit:copy`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm audit:build`를 모두 통과했다. 카피 감사 충돌은 0건이고, 정적 산출물은 공개 페이지·sitemap URL 각 1,299개, 지역 페이지 1,291개, RSS item 2개이며 `out/rss.xml`은 5,416바이트다.

## 2026-08-17 KST — 비공개 GitHub 최초 게시

- GitHub 계정 `dearmykassy`에 비공개 저장소 `honhyeol-massage`를 만들고 `main` 브랜치에 최초 게시한다.
- 런타임 코드·설정·테스트·파생 이미지와 검증에 필요한 authority/receipt JSON만 게시 대상으로 삼았다. `node_modules`, `.next`, `out`, 환경 파일, QA 접촉시트, 지역 원본 PNG와 기타 대용량 생성 이력은 `.gitignore`에 따라 제외했다.
- 게시 대상은 624개 파일, 약 34.5MiB다. 강제 포함한 검증 JSON은 v2 캠페인·inventory·parent QA·root review·reuse provenance·지역/편집 release receipt·Template5 코스 receipt의 정확히 8개다. 민감정보·개인키·외부 symlink는 없음을 확인했다.
- 운영 도메인이 정해지지 않아 preview `.invalid`, noindex/nofollow/nocache, robots 전체 차단 상태로 게시한다. GitHub 소스 게시와 검색 노출용 운영 배포를 구분한다.
- 반복해서 적용할 플랫폼·이미지·콘텐츠 규칙은 `AGENTS.md`, 실행 일시·검증 수치·예외와 결과는 이 `DIARY.md`에 기록한다.

## 2026-08-17 KST — 지역 배너 한국 패션 에디토리얼 v2 교체·재릴리스

- 실제 국적이나 혈통을 외모로 판정하지 않고, 사용자 피드백을 성인 한국 여성 패션 에디토리얼 아트 디렉션으로 구체화했다. 얼굴은 휴대전화 옆으로 확인 가능해야 하며, 단정한 fitted-fashion 착의, 실제 거울과 일관된 반사, 모바일 크롭 안전성, 비노골적 구도를 필수 기준으로 기록했다.
- 기존 지역 원본 130장을 전수 재검토해 `044`, `066–130`의 정확히 66장을 새로 만들고 `001–043`, `045–065`의 64장은 바이트 그대로 유지했다. `083`, `085`의 첫 교체본은 중복 반사 때문에 반려하고 보존했으며, 단일 인물·단일 반사 조건을 강화한 다음 버전만 승인했다.
- 13개 지역 접촉시트와 원본을 전수 확인해 최종 130/130장을 승인했다. 메인 홈 배너는 요청대로 수정하지 않았고 SHA-256 `a9b0f185a3d91925cb3ab8740e27c7f14f9a0dcac86e8638f98613c325915573`을 유지했다. 홈·블로그 편집 이미지 18장도 바이트 그대로 유지했다.
- v2 authority SHA-256은 campaign `faebb1fafc00e21f7fa68631d5aa0ff8a78beb70810d3a15d9c850a533442e1d`, inventory `6c47178bd2115a268394f4b6f2aa7545d4a1cbed4b4d71892420f26664d501ce`, parent QA `3d5f8e8c91afbe1e9b786606954650de7e328148dae5a59ef19208e08eb34ab4`, root review `92ed8e09051bac486ecd2b5cbe6648606aea74b6dd8ad73f826ce12afbb08b00`이다.
- 지역 파생 WebP 390개와 provenance 130개를 다시 릴리스했다. 1,291개 route 배정은 121장×10회와 9장×9회이며 부모-자식·형제 충돌은 0건이다. assignment manifest SHA-256은 `23cd2e8fc9b1f50a21bc6bfe95cd2306d78649cd7d73a71171f6c763e13be88e`, 지역 release receipt SHA-256은 `e35285a1af75c595a334dafcf310500a2aff1e1c899e2fed83552833cc9a9973`이다.
- 독립 감사에서 교체 66장·유지 64장, authority chain, 파생 파일, route 배정, 홈 hero 보존을 모두 재계산해 blocker 0으로 확인했다. 최종 검증은 Vitest 29/29, `pnpm typecheck`, `pnpm lint`, `pnpm audit:copy`, `pnpm build`, `pnpm audit:build`를 통과했고 정적 1,303페이지·공개 1,299페이지·지역 1,291페이지·지역 WebP 390개가 일치했다.

## 2026-08-17 KST — Template5 시각 이식·보존 감사·최종 QA

- 사용자가 Template4 지정이 실수였음을 정정해 시각·레이아웃 정본을 `/Users/ssm/Documents/Services/Templetes/Template5`로 바꿨다. 데스크톱은 28px 유틸리티 바, 104px 흰색 브랜드·검색 헤더, 56px 검은색 고정 내비게이션과 1200px 본문 프레임·900/300 본문/보조 패널을 적용했다. 모바일은 78px 헤더, 76px 5칸 빠른 메뉴, 검색 오버레이와 전체 메뉴 드로어를 적용했다.
- 이번 전환은 화면 골격과 CSS만 바꿨다. 1,291개 지역 그래프, 광역 41개·세부 1,250개 콘텐츠, 고정·블로그 문구, title·keywords·description·JSON-LD, 기존 `honhyeol-template4` 이미지 148장과 지역 WebP 390개, 1,291개 이미지 배정은 재생성하거나 이름을 바꾸지 않았다. 보존 테스트 2개와 기존 지역·이미지 계약 테스트가 모두 통과했다.
- 헤더 이미지 파일이 없는 경우에도 빈칸이 보이지 않도록 CSS 기반 하트형 마크 fallback을 넣었다. 검색 입력이 `Escape`를 먼저 소비하던 문제는 오버레이·드로어의 capture 단계에서 닫기를 처리하도록 수정해 body scroll lock 해제와 열기 버튼 focus 복귀를 확인했다.
- 홈과 지역 페이지의 디렉터리는 계속 DOM의 마지막 콘텐츠 섹션이며, 장문 지역 본문은 데스크톱 2열·모바일 1열, 지역 카드와 홈 카드는 Template5의 5/4/2열 규칙을 따른다.
- 최종 검증은 Vitest 29/29, 보존·코스 이미지 focused 6/6, `pnpm audit:copy`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm audit:build`를 통과했다. 정적 페이지 1,303개, 공개 메타·sitemap URL 1,299개, 지역 페이지 1,291개, 지역 자산 130개와 WebP 390개가 일치했다. 카피 감사도 title·description·H1 각 1,291개 고유, 문단 28,238/28,238 고유, 비교 플랫폼 6개와 충돌 0건을 확인했다.
- 로컬 `http://127.0.0.1:4221/`에서 1440px 데스크톱, 390px·320px 모바일을 확인했다. 가로 overflow 0, 모바일 코스 2열, 검색 오버레이와 전체 메뉴 `Escape` 닫기·scroll lock 해제·focus 복귀를 확인했다. 운영 도메인은 미정이므로 preview `.invalid`, noindex/nofollow와 robots 전체 차단은 유지한다.

## 2026-08-17 KST — 홈 코스 카드 전용 이미지 5장 교체

- 거울 셀피는 지역·메인·블로그 배너 용도로 남기고, 홈의 코스 소개 카드는 코스를 직접 설명하는 신규 사진으로 분리했다. 순서는 `타이마사지` 전신 스트레칭, `아로마마사지` 오일·타월 관리, `힐링마사지` 온열 허브 컴프레스, `스페셜마사지` 스톤·타월·컴프레스 복합 관리, `남성전용` 완전 착의 스포츠 리커버리다.
- built-in `image_gen`을 자산마다 1회씩 사용해 정확히 5장을 만들었다. 전부 성인·전문 웰니스·비성적 장면이며 거울, 셀피, 문자, 로고, 워터마크, 가상 업체 연출이 없다. 원본 PNG 5장과 960×1200 4:5 WebP 5장을 `public/images/honhyeol-template5/courses/v1/`에 신규 버전 파일로 저장했고 기존 Template4 사진은 수정하거나 삭제하지 않았다.
- 5장 접촉시트를 전수 확인해 코스별 구분, 인물·손·도구, 안전한 착의와 타월 가림, 카드 크롭을 승인했다. 파일 inventory SHA-256은 `4432e0c0d8d5b91d87190fdb5e558ba0fc73a7d3ebb9e65bf9b6b12faa29ac1b`, release receipt SHA-256은 `cb3ab290e5efe1b505917ad2f63622bf9d05e9b27b5ba41da0bbd28c751b635b`다.
- 홈 `COURSE_GROUPS` 카드의 이미지 경로 5개만 새 namespace로 바꿨다. 지역·메타·카피·이미지 배정 보존 테스트를 함께 실행해 6개 검사가 통과했고, `pnpm typecheck`와 변경 파일 ESLint도 통과했다. 전체 빌드와 브라우저 QA는 상위 Template5 작업에서 수행한다.

## 2026-08-17 KST — 전체 빌드·출력 감사·브라우저 QA 완료

- `pnpm test`, `pnpm audit:copy`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm audit:build`를 모두 통과했다. Vitest 23개, 정적 페이지 1,303개, 공개 메타·sitemap URL 1,299개, 지역 페이지 1,291개, 지역 이미지 자산 130개와 WebP 390개가 일치한다.
- 중복 감사 결과 지역 title·description·H1은 각각 1,291개 고유, 문단은 28,238/28,238 고유, 정규화 페이지 서명은 1,291/1,291 고유다. 비교한 기존 6개 플랫폼의 긴 고객 문장과 정확한 충돌은 0건이다.
- 로컬 정적 서버 `http://127.0.0.1:4221/`에서 데스크톱 홈, 수원시 광역 상세, 역삼동 세부 상세를 확인했다. 390px·320px 모바일 렌더에서 헤더·히어로·검색·카드가 잘리지 않았고, 홈 검색창의 `역삼동` 자동완성이 정확한 상세 경로로 이동했다.
- 실제 도메인은 아직 정해지지 않았으므로 preview `.invalid`, noindex/nofollow, robots 전체 차단을 그대로 유지한다. 커밋·GitHub 게시·운영 배포는 진행하지 않았다.

## 2026-08-17 KST — Template4 이미지 캠페인 승인·릴리스 완료

- 활성 사진은 정확히 148장이다. 지역 130장과 홈·블로그 등 비지역 편집 18장으로 구성했고, 기존 사용자 소유 승인본 재사용 74장과 신규 생성 74장을 정확히 절반씩 사용했다. 신규 생성본 가운데 18장은 완전 착의의 fitted-fashion 구도로 분리했다.
- 재사용본은 필링홈타이 36장, 건마에반하다 38장이다. 원본은 읽기 전용으로 확인한 뒤 혼혈마사지 전용 namespace에 복사했으며, source hash 재검증으로 원본 변경이 없음을 확인했다.
- 15개 접촉시트에 담긴 148장을 전수 확인해 모두 승인했다. 캠페인 SHA-256은 `d582465b23f46f058981efca730a49b117af31ffe190d8f2323a82d54e3a9f83`, inventory는 `136eb26debcafda9dbae15fa499d84dc771c7887afc90b04bfb04605aff3a0bf`, parent QA는 `f7ce8d631505997e79a3a60d1b4a2a06237b50541b1c03f11cfa20411ccb05b2`, root review는 `655104969210238b88a90e5e097094a4db3f47dc9b6e6c03fb999c624446be92`다.
- 지역 이미지 130장마다 desktop·tablet·mobile WebP를 생성해 총 390개를 릴리스했고, 편집 이미지 WebP 18개도 캠페인 지정 경로에 배치했다. 지역별 provenance 130개를 함께 기록했다.
- 1,291개 지역 route를 130장에 배정했다. 121장은 10회, 9장은 9회 사용하며 최대 재사용은 10회다. 직접 부모-자식 충돌과 같은 부모 아래 형제 충돌은 모두 0건이다.
- focal SHA-256은 `9a51cd75887030a151a7882fe6dfef1f402d0093745beddc045fb22d0ea71cf1`, assignment manifest는 `a7b8e5e64f43af4ec2e3d0362969018d5fe4288dcdda106994882778fb492142`, 지역 release receipt는 `b5b2021d44b7a4157dc75c35d6e35608c3ea56ecf8db43101826906575dcd74c`, 편집 release receipt는 `717d0ab109b3de2d3171b651f03e6195e366daab7311fce331474f55ab260e1f`다.
- 이미지 캠페인 focused test 3개, targeted ESLint, typecheck와 deterministic release 재실행을 통과했다. 커밋·푸시·배포는 수행하지 않았다.

## 2026-08-17 KST — 세부 지역 1,250페이지 정보 밀도 보강

- 읽기 전용 비교 경로는 두 정본 모두 `/areas/seoul/%EA%B0%95%EB%82%A8%EA%B5%AC/%EC%97%AD%EC%82%BC%EB%8F%99`이다. 마사지봄은 `src/app/areas/[...segments]/page.tsx`, `src/components/RegionLandingTemplate.tsx`와 지역 copy builder를 확인했고, 마사지러브는 `src/app/areas/[...segments]/page.tsx`, `src/components/RegionPage.tsx`, `src/data/region-content.generated.json`을 확인했다.
- 두 참조 페이지는 hero·핵심 사실·지역 범위·이용 정보·가격·코스·전화 준비·운영·절차·FAQ 역할을 약 49개 텍스트 항목, 약 3,600자 규모로 나눈다. 문장과 섹션명은 가져오지 않고 역할과 밀도만 참고했다.
- compact 1,250페이지를 6개 섹션·12개 문단에서 11개 섹션·22개 문단으로 보강했다. 새 구성은 실제 parent/child/sibling 및 주소 명칭, 확인된 24시간 전화·코스·2인 프로그램·후불·카드·일회용 비품·관리 전후 소독 사실만 사용한다. 지도·매장·인기·후기·평점·지역별 이용량·도착 또는 이동시간 주장은 넣지 않았다.
- compact 본문 길이는 최소 1,254자, 중앙값 1,427자, 평균 1,423자, 최대 1,554자다. 역삼동 표본은 1,434자다. 1,250개 페이지의 11개 섹션 모두 한 섹션 안의 두 문단이 서로 다른지도 검사한다. 지역 디렉터리는 콘텐츠 배열의 첫 계약을 마지막 화면 섹션으로 옮겨 렌더하는 기존 구조를 유지했다.
- focused Vitest 20개, `pnpm audit:copy`, `pnpm typecheck`, `pnpm lint`를 통과했다. 전체 지역 문단은 28,238/28,238 고유, 전체 정규화 페이지 서명은 1,291/1,291 고유, compact 정규화 문단 슬롯 최대 재사용은 113회다. 마사지러브 생성 snapshot을 포함한 지역 런타임 브랜드·지역 정규화 충돌과 마사지봄 copy builder를 포함한 source literal 충돌은 모두 0건이다.

## 2026-08-17 KST — 코어 콘텐츠·메타·중복 감사 완료

- 홈, 지역 찾기, 가격, 이용 안내, 공지, 블로그 목록과 글 2편의 고객 문구를 `혼혈마사지` 기준으로 다시 작성했다. 고객 화면에서 기존 플랫폼 브랜드와 제작 과정 용어를 제거했다.
- 1,291개 지역마다 title, description, H1을 고유하게 만들고 8개 keyword 계열, canonical, Open Graph, Twitter, noindex/nofollow 계약을 연결했다.
- 광역 상세 분류는 root 11개와 이름이 `시`로 끝나는 hub 30개, 총 41개로 확인했다. 정렬된 41개 route set SHA-256은 `bc78efbc93abacd5dca4aea0e06897343d9858ea8d5efb85c1fd9733fe436771`이다. 나머지 1,250개는 compact 형식이다.
- 광역 상세는 하위 지역·주소 확인 범위·운영 순서·시간과 코스·프로그램·첫 이용·전화 전 준비·결제·변경 확인 9개 섹션으로 고정했다. 위치 지도, 매장 권역, 인기 장소, 후기·평점·지역별 이용량은 넣지 않았다.
- 지역 디렉터리는 홈과 지역 페이지의 마지막 콘텐츠 섹션으로 유지했다.
- `pnpm exec vitest run tests/regions-content.test.ts tests/metadata-sitemap.test.ts` 18개 통과, `pnpm typecheck` 통과, `pnpm lint` 통과를 확인했다.
- `pnpm audit:copy` 결과 title/description/H1은 각각 1,291개 모두 고유하고, 지역 문단 15,738개도 모두 고유했다. 브랜드·지역 정규화 전체 페이지 서명은 1,291개 모두 고유하며 compact 문단 슬롯 최대 재사용은 119회다.
- 건마에반하다·필링홈타이·랑테라피 정본의 1,291개 런타임 지역 문장을 브랜드와 지역명 기준으로 정규화해 비교한 결과 충돌 0건이다. 로컬 6개 기존 플랫폼의 긴 고객 source literal 비교도 충돌 0건이다.
- 이미지 작업은 별도 lane에서 진행 중이므로 전체 테스트·정적 빌드·출력 감사는 이미지 manifest와 파생본 완료 후 다시 실행한다.

## 2026-08-17 KST — Template4 신규 플랫폼 착수

- 브랜드 `혼혈마사지`, 플랫폼 ID `honhyeol-massage`, 시각 정본 Template4를 확정했다.
- 마사지봄과 동일한 활성 1,291개 지역 그래프를 신규 Next.js 16 정적 프로젝트의 기준으로 복제했다.
- 광역 상세 페이지 분류식을 `node.kind === "root" || /시$/u.test(node.displayName)`로 고정했다. 확인 범위는 root 11개와 시 단위 hub 30개, 총 41개다.
- 광역 상세에서 위치 지도·세부 매장 권역·이용이 많은 장소는 근거가 없어 제외하고, 주소 범위·하위 지역·전화 준비·코스 시간·첫 이용 순서·결제·변경 확인·관련 지역으로 바꾼다.
- 실제 도메인은 미정이므로 preview `.invalid`, noindex/nofollow, robots 전체 차단을 유지한다.
- 지역·홈·고정·블로그 문구와 메타는 확인된 운영 사실만 사용해 독립적으로 다시 작성한다.
- 이미지는 별도 작업에서 기존 승인본 약 절반과 신규 승인본 약 절반으로 구성한다. 코어 작업에서는 이미지 생성·릴리스 파일을 변경하지 않는다.
