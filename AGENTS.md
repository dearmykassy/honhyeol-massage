# 혼혈마사지 작업 규칙

- 새 활동을 시작하기 전에 이 파일과 `DIARY.md`를 끝까지 읽고, 확인된 변경과 검증 결과를 `DIARY.md` 맨 위에 최신순으로 기록한다.
- 시각·레이아웃 정본은 `/Users/ssm/Documents/Services/Templetes/Template5`다. 28px 유틸리티 바, 흰색 브랜드·검색 헤더, 검은색 고정 내비게이션, 1200px 본문 프레임, 카드 그리드·보조 패널, 모바일 빠른 메뉴·검색 오버레이·드로어 구조를 Next.js 정적 사이트로 옮긴다.
- 지역 정본은 `/Users/ssm/Documents/Codex/massagebom`과 byte-identical인 활성 1,291개 지역 경로·계층이다. 마사지봄에 없는 지역을 추가하지 않고 sitemap과 지역 페이지는 같은 데이터 집합을 사용한다.
- 마사지봄의 공개 전화번호, 확정 가격표, 24시간 전화상담, 선입금 없는 현장 후불, 현장 카드 결제, 2인 프로그램, 일회용 비품·관리 전후 소독 운영 사실만 공유한다. 다른 플랫폼의 고객 문장·메타 문장·브랜드 표현은 복사하지 않는다.
- 브랜드는 `혼혈마사지`, 플랫폼 ID는 `honhyeol-massage`로 고정한다. 고객 화면과 메타에 다른 플랫폼 브랜드를 남기지 않는다.
- 모든 공개 페이지는 meta title, meta keywords, meta description과 self canonical, Open Graph, Twitter 계약을 가진다. 지역 페이지는 8개 키워드 계열을 유지한다.
- 상단 검색은 1,291개 지역명·상위 지역·별칭을 검색해 상세 페이지로 직접 이동한다.
- 광역 상세 페이지는 `node.kind === "root" || /시$/u.test(node.displayName)`인 정확히 41개 경로다. 광역 상세에는 실제 지역 그래프와 확인된 운영 사실만 사용한다. 지도, 매장, 인기 장소, 이동 시간, 지역별 이용량을 만들지 않는다.
- 실제 도메인과 배포 승인이 정해지기 전까지 `https://preview.honhyeol-massage.invalid`, `noindex,nofollow`, robots 전체 차단을 유지한다.
- 지역 디렉터리는 홈과 모든 지역 페이지에서 가장 마지막 콘텐츠 섹션으로 둔다.
- 성인 여성 거울 셀피는 지역별 페이지 배너, 메인 홈 배너, 블로그 배너 같은 배너·에디토리얼 영역에만 사용한다. 코스 소개 카드에는 거울 셀피를 사용하지 않고 타이·아로마·힐링·스페셜·남성전용의 관리 방식을 구분할 수 있는 코스 전용 이미지를 사용한다. 모든 인물 이미지는 선정적 의상, 노골적 성적 연출, 미성년자로 보이는 인물, 참고 인물 복제, 문자·로고·워터마크를 허용하지 않는다.
- 지역 배너의 인물은 실제 국적·혈통을 외모로 판정하거나 주장하지 않고, 생성 프롬프트와 검수 기준에서 `성인 한국 여성의 현대 한국 패션 화보`로 명확히 연출한다. 단정한 fitted-fashion과 매력적인 인상은 허용하되 완전 불투명 착의·비노골적 포즈를 유지하고, 휴대폰 옆으로 눈·코·입이 충분히 보이며 실제 거울과 반사·모바일 중앙 크롭이 모두 확인되어야 한다. 모호한 결과는 공개 릴리스하지 않는다. 메인 홈 배너는 사용자가 별도로 변경을 요청하지 않는 한 고정한다.
- Template5 전환은 화면 골격과 스타일만 바꾼다. 승인된 `honhyeol-template4` 이미지 namespace, 1,291개 route 배정, 지역·고정·블로그 문구, 메타데이터와 JSON-LD는 이름을 바꾸지 않는다. 2026-08-17 사용자 피드백에 따른 지역 배너 v2 교체는 기존 원본과 승인 이력을 보존한 별도 권한 체인에서만 허용한다.
- 쓸데없는 수식, 과장, 후기·평점·인기·최고 표현, 배정·출발·도착 시간 약속, 의료 효능 표현을 고객 문구에 넣지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
