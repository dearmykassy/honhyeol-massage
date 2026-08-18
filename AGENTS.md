# 혼혈마사지 작업 규칙

- 새 활동을 시작하기 전에 이 파일과 `DIARY.md`를 끝까지 읽고, 확인된 변경과 검증 결과를 `DIARY.md` 맨 위에 최신순으로 기록한다.
- 시각·레이아웃 정본은 `/Users/ssm/Documents/Services/Templetes/Template5`다. 28px 유틸리티 바, 흰색 브랜드·검색 헤더, 검은색 고정 내비게이션, 1200px 본문 프레임, 카드 그리드·보조 패널, 모바일 빠른 메뉴·검색 오버레이·드로어 구조를 Next.js 정적 사이트로 옮긴다.
- 지역 정본은 `/Users/ssm/Documents/Codex/massagebom`과 byte-identical인 활성 1,291개 지역 경로·계층이다. 마사지봄에 없는 지역을 추가하지 않고 sitemap과 지역 페이지는 같은 데이터 집합을 사용한다.
- 마사지봄의 공개 전화번호, 확정 가격표, 24시간 전화상담, 선입금 없는 현장 후불, 현장 카드 결제, 2인 프로그램, 일회용 비품·관리 전후 소독 운영 사실만 공유한다. 다른 플랫폼의 고객 문장·메타 문장·브랜드 표현은 복사하지 않는다.
- 브랜드는 `혼혈마사지`, 플랫폼 ID는 `honhyeol-massage`로 고정한다. 고객 화면과 메타에 다른 플랫폼 브랜드를 남기지 않는다.
- 브랜드 마크는 투명 배경의 원형 궤도형 마크로 고정한다. 건마에반하다의 하트형 마크와 겹치는 하트 실루엣은 사용하지 않는다. 큰 형태와 내부 선 구조가 다른 독립 마크를 사용하며 favicon·앱 아이콘도 같은 원본에서 파생한다.
- 모든 공개 페이지는 meta title, meta keywords, meta description과 self canonical, Open Graph, Twitter 계약을 가진다. 지역 페이지는 8개 키워드 계열을 유지한다.
- 지역 meta title·meta keywords·meta description에는 고객 검색형 지역명을 쓴다. 각 행정 토큰 끝의 `특별자치도`, `특별자치시`, `특별시`, `광역시`, `도`, `시`만 제거해 서울특별시→서울, 인천광역시→인천, 경기도→경기, 제주특별자치도→제주, 수원시→수원처럼 표기한다. `구·군·읍·면·동·리`는 임의로 제거하지 않으며, 중복 지명은 같은 방식으로 줄인 상위 지역을 붙여 구분한다. 공식 행정명은 H1·본문·breadcrumb·schema에 유지하고 URL·canonical은 변경하지 않는다.
- 상단 검색은 1,291개 지역명·상위 지역·별칭을 검색해 상세 페이지로 직접 이동한다.
- 광역 상세 페이지는 `node.kind === "root" || /시$/u.test(node.displayName)`인 정확히 41개 경로다. 광역 상세에는 실제 지역 그래프와 확인된 운영 사실만 사용한다. 지도, 매장, 인기 장소, 이동 시간, 지역별 이용량을 만들지 않는다.
- 운영 도메인은 `https://honhyul.kr`이다. 모든 공개 페이지의 canonical·Open Graph·sitemap·RSS는 이 origin을 사용하고 `index,follow`, robots 전체 허용 상태를 유지한다.
- 모든 신규 플랫폼은 전체 canonical 공개 URL을 담은 `sitemap.xml`과 최신 게시글의 실제 발행일·canonical GUID·본문 전체를 담은 `rss.xml`을 함께 제공한다. 네이버 서치어드바이저 온보딩에서는 `설정 → 수집 주기 설정 → 빠르게`를 선택한다.
- 내부 이동 링크는 `SiteLink` 한 경계로만 `next/link`를 사용한다. 운영 빌드에서는 모든 내부 링크의 `prefetch`를 `false`로 강제해 대량 `?_rsc=` 자동 요청을 막되 실제 `<a href>`·클라이언트 이동·이벤트·ARIA 속성은 유지한다. wrapper 밖의 `next/link` 직접 import와 `_rsc` robots 차단·강제 redirect는 허용하지 않는다.
- sitemap `lastmod`는 빌드 시각이 아니라 공개 페이지 그룹을 마지막으로 실제 변경한 Git author 시각을 사용한다. 홈·고정·지역·블로그 글을 구분하고 블로그 글은 실제 `modifiedAt`을 쓰며, `changefreq`·`priority`는 출력하지 않는다.
- 지역 디렉터리는 홈과 모든 지역 페이지에서 가장 마지막 콘텐츠 섹션으로 둔다.
- 홈 첫 8개 권역 카드(서울·인천·경기·천안·아산·대전·대구·구미)는 사용자의 이번 명시적 예외에 따라 마사지러브의 도시·랜드마크 사진을 바이트 그대로 재사용한다. 이 예외는 홈 카드에만 적용하고 지역 상세 배너에는 적용하지 않으며, 출처·저자·라이선스 기록과 공개 링크를 유지한다.
- 성인 여성 거울 셀피는 지역별 페이지 배너, 메인 홈 배너, 블로그 배너 같은 배너·에디토리얼 영역에만 사용한다. 코스 소개 카드에는 거울 셀피를 사용하지 않고 타이·아로마·힐링·스페셜·남성전용의 관리 방식을 구분할 수 있는 코스 전용 이미지를 사용한다. 모든 인물 이미지는 선정적 의상, 노골적 성적 연출, 미성년자로 보이는 인물, 참고 인물 복제, 문자·로고·워터마크를 허용하지 않는다.
- 토닥이 계열을 제외한 플랫폼의 마사지 서비스 이미지에서 마사지사는 항상 성인 여성으로 표현한다. 남성전용 코스도 고객만 성인 남성으로 두고 마사지사는 성인 여성으로 고정한다. 일반 수평 마사지 베드에서 진행하는 장면을 사용하며 얼굴을 기계·의자·의료 장비에 넣는 구도는 사용하지 않는다.
- 지역 배너의 인물은 실제 국적·혈통을 외모로 판정하거나 주장하지 않고, 생성 프롬프트와 검수 기준에서 `성인 한국 여성의 현대 한국 패션 화보`로 명확히 연출한다. 단정한 fitted-fashion과 매력적인 인상은 허용하되 완전 불투명 착의·비노골적 포즈를 유지하고, 휴대폰 옆으로 눈·코·입이 충분히 보이며 실제 거울과 반사·모바일 중앙 크롭이 모두 확인되어야 한다. 모호한 결과는 공개 릴리스하지 않는다. 메인 홈 배너는 사용자가 별도로 변경을 요청하지 않는 한 고정한다.
- Template5 전환은 화면 골격과 스타일만 바꾼다. 승인된 `honhyeol-template4` 이미지 namespace, 1,291개 route 배정, 지역·고정·블로그 문구, 메타데이터와 JSON-LD는 이름을 바꾸지 않는다. 2026-08-17 사용자 피드백에 따른 지역 배너 v2 교체는 기존 원본과 승인 이력을 보존한 별도 권한 체인에서만 허용한다.
- 쓸데없는 수식, 과장, 후기·평점·인기·최고 표현, 배정·출발·도착 시간 약속, 의료 효능 표현을 고객 문구에 넣지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
