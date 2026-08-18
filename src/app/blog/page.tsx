import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "@/components/SiteLink";
import { BLOG_POSTS, getBlogPostPath } from "@/data/blog-posts";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/business";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";

export const metadataContract = createRouteMetadataContract(
  "/blog/",
  "혼혈마사지 블로그 | 출장 문의 시간·주소 준비표",
  "외출 시간을 줄여야 할 때와 자택·숙소에서 출장마사지를 문의할 때 준비할 주소, 시간 범위, 인원, 코스 항목을 나눠 설명합니다.",
  ["혼혈마사지 준비 메모", "출장마사지 통화 항목", "집에서 받는 마사지", "숙소 방문 마사지"],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

function formatPublishedDate(value: string): string {
  return value.slice(0, 10).replaceAll("-", ".");
}

export default function BlogIndexPage() {
  return (
    <main className={"t4-fixed-page"}>
      <div className={"t4-fixed-frame"}>
        <header className={"t4-fixed-hero"}>
          <div className={"t4-fixed-heroCopy"}>
            <p className={"t4-fixed-eyebrow"}>HONHYEOL MASSAGE · USEFUL NOTES</p>
            <h1>상황별 출장 문의 <br />준비 메모</h1>
            <p className={"t4-fixed-heroLead"}>
              외출이 어려운 날과 자택·숙소에서 받을 때 준비할 내용을 두 편으로 나눴습니다.
            </p>
          </div>
          <div className={"t4-fixed-statRow"} aria-label="두 게시물 구성">
            <div><span>게시물</span><strong>2편</strong></div>
            <div><span>주제</span><strong>시간 · 장소</strong></div>
            <div><span>문의 시간</span><strong>24시간</strong></div>
          </div>
        </header>

        <section className={"t4-fixed-section"} aria-labelledby="blog-list-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>HONHYEOL BLOG</p>
              <h2 id="blog-list-title">확인 글 두 편</h2>
              <p>현재 장소에 맞는 글에서 통화 전에 적어둘 항목을 확인할 수 있습니다.</p>
            </div>
            <Link className={"t4-fixed-textLink"} href="/guide/">이용 방법 →</Link>
          </div>
          <div className={"t4-fixed-blogGrid"}>
            {BLOG_POSTS.map((post, index) => (
              <article className={"t4-fixed-postCard"} key={post.slug}>
                <div
                  className={"t4-fixed-postTop"}
                  aria-hidden="true"
                  data-honhyeol-note-image={post.image.assetId}
                  style={{ "--honhyeol-note-image": `url(${post.image.src})` } as CSSProperties}
                >
                  <span>HONHYEOL NOTE</span>
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                </div>
                <div className={"t4-fixed-postBody"}>
                  <span className={"t4-fixed-postCategory"}>{post.category}</span>
                  <h2><Link href={getBlogPostPath(post)}>{post.title}</Link></h2>
                  <p>{post.description}</p>
                  <div className={"t4-fixed-postFooter"}>
                    <time dateTime={post.modifiedAt}>{formatPublishedDate(post.modifiedAt)}</time>
                    <Link href={getBlogPostPath(post)}>글 읽기 →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`${"t4-fixed-section"} ${"t4-fixed-contactPanel"}`} aria-label="상담 바로가기">
          <p className={"t4-fixed-sectionKicker"}>24H CONSULTATION</p>
          <h2>받을 곳과 가능한 시각부터 정리해 주세요.</h2>
          <p>인원과 코스명·이용 시간을 더해 전화로 전달하면 일정 여부를 확인합니다.</p>
          <div className={"t4-fixed-buttonRow"}>
            <a className={"t4-fixed-button"} href={PHONE_HREF}>{PHONE_DISPLAY} 문의</a>
            <Link className={"t4-fixed-buttonAlt"} href="/pricing/">코스 가격</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
