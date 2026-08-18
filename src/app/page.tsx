import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "@/components/SiteLink";
import { RegionSearch } from "@/components/RegionSearch";
import { Template4Carousel } from "@/components/Template4Carousel";
import { BLOG_POSTS, getBlogPostPath } from "@/data/blog-posts";
import { OPERATING_NOTES, PHONE_DISPLAY, PHONE_HREF } from "@/lib/business";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";
import { ACTIVE_ROOT_KEYS, getRootNode, ROOT_LABELS } from "@/lib/regions";
import { COURSE_GROUPS, NOTICE_ITEMS, SERVICE_STEPS } from "@/lib/site-content";

export const metadataContract = createRouteMetadataContract(
  "/",
  "혼혈마사지 | 전국 출장마사지 지역·코스·현장결제 안내",
  "혼혈마사지의 1,291개 지역 안내 경로와 5개 코스 14개 금액, 24시간 전화 접수, 예약금 없는 현장 후불·카드 결제 기준을 확인합니다.",
  [
    "혼혈마사지",
    "출장마사지",
    "출장안마",
    "출장타이마사지",
    "출장스웨디시",
    "출장홈타이",
    "남성전용마사지",
    "여성전용마사지",
  ],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

function imageStyle(path: string): CSSProperties {
  return { "--card-image": `url(${path})` } as CSSProperties;
}

const COURSE_CARD_IMAGES = [
  "/images/honhyeol-template5/courses/v1/course-thai-v1.webp",
  "/images/honhyeol-template5/courses/v1/course-aroma-v1.webp",
  "/images/honhyeol-template5/courses/v1/course-healing-v1.webp",
  "/images/honhyeol-template5/courses/v1/course-special-v1.webp",
  "/images/honhyeol-template5/courses/v2/course-men-v2.webp",
] as const;

const HOME_REGION_CARD_IMAGES = [
  "/images/honhyeol-template5/home-regions/v1/seoul.webp",
  "/images/honhyeol-template5/home-regions/v1/incheon.webp",
  "/images/honhyeol-template5/home-regions/v1/gyeonggi.webp",
  "/images/honhyeol-template5/home-regions/v1/cheonan.webp",
  "/images/honhyeol-template5/home-regions/v1/asan.webp",
  "/images/honhyeol-template5/home-regions/v1/daejeon.webp",
  "/images/honhyeol-template5/home-regions/v1/daegu.webp",
  "/images/honhyeol-template5/home-regions/v1/gumi.webp",
] as const;

export default function Home() {
  const roots = ACTIVE_ROOT_KEYS.map((key) => {
    const node = getRootNode(key);
    return {
      key,
      name: ROOT_LABELS[key].short,
      fullName: ROOT_LABELS[key].full,
      path: `${node.path}/`,
      count: node.records.length,
    };
  });

  return (
    <main className="t4-home">
      <section
        aria-labelledby="home-hero-title"
        className="hero"
        style={{ "--hero-image": "url(/images/honhyeol-template4/home/hero-mirror.webp)" } as CSSProperties}
      >
        <div className="hero-copy page-width">
          <p>REGION · COURSE · PHONE</p>
          <h1 id="home-hero-title">혼혈마사지</h1>
          <h2>주소부터 확인하는 출장마사지 안내</h2>
          <span>받을 장소, 날짜와 시각, 인원, 코스를 준비한 뒤 전화로 현재 일정을 확인합니다.</span>
        </div>
        <div className="region-search-dock page-width">
          <div className="region-brand"><strong>상세 지역 찾기</strong><span>동·읍·면과 지역 별칭 검색</span></div>
          <RegionSearch className="search-form search-form--dock" />
        </div>
      </section>

      <section className="location-strip" aria-label="지역 안내 구성">
        <span>상세 주소 단계 검색</span>
        <strong><i aria-hidden="true">●</i> 시작 권역 11개 · 지역 페이지 1,291개</strong>
      </section>

      <div className="page-width content-wrap t5-content-layout">
        <div className="t5-main-column">
        <section className="section-space" aria-labelledby="featured-regions-title">
          <header className="section-head">
            <div><span className="section-kicker">REGION START</span><h2 id="featured-regions-title">주요 권역에서 시작하기</h2></div>
            <Link href="/areas/">지역 검색 +</Link>
          </header>
          <Template4Carousel ariaLabel="주요 지역 안내">
            {roots.slice(0, 8).map((root, index) => (
              <article className="new-card" key={root.path}>
                <Link
                  aria-label={`${root.fullName} 지역 페이지 열기`}
                  className="shop-photo"
                  href={root.path}
                  style={imageStyle(HOME_REGION_CARD_IMAGES[index])}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>지역 보기</b>
                </Link>
                <div className="new-copy">
                  <div><em>{root.name}</em><h3>{root.fullName} 안내</h3></div>
                  <p>시·군·구에서 동·읍·면까지 찾기</p>
                  <footer><span>연결 지역 {root.count}개</span><Link href={root.path}>열기 →</Link></footer>
                </div>
              </article>
            ))}
          </Template4Carousel>
          <p className="asset-attribution">
            <a href="/images/honhyeol-template5/home-regions/v1/provenance.json">지역 사진 출처·라이선스</a>
          </p>
        </section>

        <section className="section-space" aria-labelledby="course-title">
          <header className="section-head">
            <div><span className="section-kicker">COURSE TABLE</span><h2 id="course-title">코스별 첫 번째 금액</h2></div>
            <Link href="/pricing/">14개 금액표 +</Link>
          </header>
          <div className="category-grid">
            {COURSE_GROUPS.map((group, index) => (
              <Link
                className="category-card"
                href="/pricing/"
                key={group.course}
                style={imageStyle(COURSE_CARD_IMAGES[index])}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{group.course}</h3><p>{group.options[0]?.price}부터</p></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-space" aria-labelledby="process-title">
          <header className="section-head">
            <div><span className="section-kicker">FOUR STEPS</span><h2 id="process-title">검색·전화·이용·정산 순서</h2></div>
            <Link href="/guide/">이용 안내 +</Link>
          </header>
          <ol className="home-process-list">
            {SERVICE_STEPS.map(([number, title, copy]) => (
              <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>
            ))}
          </ol>
        </section>

        <section className="section-space" aria-labelledby="blog-preview-title">
          <header className="section-head">
            <div><span className="section-kicker">HONHYEOL NOTES</span><h2 id="blog-preview-title">전화 전 읽을 글</h2></div>
            <Link href="/blog/">블로그 +</Link>
          </header>
          <div className="home-blog-grid">
            {BLOG_POSTS.map((post, index) => (
              <article className="home-blog-card" key={post.slug}>
                <Link
                  aria-label={`${post.title} 읽기`}
                  className="home-blog-visual"
                  href={getBlogPostPath(post)}
                  style={imageStyle(post.image.src)}
                >
                  <span>NOTE {String(index + 1).padStart(2, "0")}</span>
                </Link>
                <div><span>{post.category}</span><h3><Link href={getBlogPostPath(post)}>{post.title}</Link></h3><p>{post.description}</p><Link href={getBlogPostPath(post)}>내용 보기 →</Link></div>
              </article>
            ))}
          </div>
        </section>
        </div>

        <aside className="t5-sidebar" aria-labelledby="operation-title">
          <section className="section-space" aria-labelledby="operation-title">
            <header className="section-head">
              <div><span className="section-kicker">COMMON RULES</span><h2 id="operation-title">전화와 결제 공통 기준</h2></div>
              <Link href="/notice/">공지 전체 +</Link>
            </header>
            <div className="operation-list">
              {NOTICE_ITEMS.map((notice, index) => (
                <article className="operation-card" id={`home-${notice.slug}`} key={notice.slug}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{notice.title}</h3><p>{notice.summary}</p></div>
                  <Link href={`/notice/#${notice.slug}`}>확인 →</Link>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section
        className="partner-section"
        style={{ "--contact-image": "url(/images/honhyeol-template4/home/contact.webp)" } as CSSProperties}
      >
        <div>
          <span>365 DAYS · 24 HOURS</span>
          <h2>받을 주소와 원하는 시간을 전화로 알려 주세요.</h2>
          <p>{OPERATING_NOTES.join(" · ")} · 코스와 이용 시간 확인</p>
          <a href={PHONE_HREF}>{PHONE_DISPLAY} 전화 연결</a>
        </div>
      </section>

      <section className="page-width section-space all-regions" aria-labelledby="all-regions-title">
        <header className="section-head">
          <div><span className="section-kicker">FULL DIRECTORY</span><h2 id="all-regions-title">11개 시작 권역 전체</h2></div>
          <Link href="/areas/">상세 검색 +</Link>
        </header>
        <div className="root-region-grid">
          {roots.map((root, index) => (
            <Link className="root-region-card" href={root.path} key={root.path}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{root.name}</strong>
              <small>연결 지역 {root.count}개</small>
              <b>→</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
