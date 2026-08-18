import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "@/components/SiteLink";
import { RegionSearch } from "@/components/RegionSearch";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";
import { ACTIVE_ROOT_KEYS, getRootNode, ROOT_LABELS } from "@/lib/regions";

export const metadataContract = createRouteMetadataContract(
  "/areas/",
  "혼혈마사지 지역 찾기 | 전국 출장마사지 1,291개 안내",
  "혼혈마사지 지역 검색에서 11개 시작 권역과 시·군·구, 동·읍·면으로 이어지는 1,291개 출장마사지 안내 페이지를 찾을 수 있습니다.",
  ["혼혈마사지 지역 찾기", "전국 출장마사지 지역", "출장마사지 주소 검색", "출장홈타이 동 검색"],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

export default function AreasPage() {
  const roots = ACTIVE_ROOT_KEYS.map((key, index) => {
    const node = getRootNode(key);
    return {
      key,
      name: ROOT_LABELS[key].full,
      scope: ROOT_LABELS[key].scope,
      path: `${node.path}/`,
      count: node.records.length,
      image: `/images/honhyeol-template4/home/feature-${String((index % 8) + 1).padStart(2, "0")}.webp`,
    };
  });

  return (
    <main className="t4-areas-page">
      <header
        className="t4-directory-hero"
        style={{ "--directory-image": "url(/images/honhyeol-template4/home/region-search.webp)" } as CSSProperties}
      >
        <div className="page-width t4-directory-hero-inner">
          <p>HONHYEOL MASSAGE · ADDRESS SEARCH</p>
          <h1>받을 주소의 지역 페이지 찾기</h1>
          <span>시·군·구나 동·읍·면, 지역 별칭을 입력하거나 아래 11개 권역에서 시작하세요.</span>
          <RegionSearch className="search-form search-form--directory" />
          <div className="t4-directory-stats" aria-label="지역 페이지 요약">
            <div><span>시작 권역</span><strong>11개</strong></div>
            <div><span>전체 경로</span><strong>1,291개</strong></div>
            <div><span>세부 단위</span><strong>동·읍·면</strong></div>
          </div>
        </div>
      </header>

      <section className="page-width t4-directory-section" aria-labelledby="root-directory-title">
        <header className="section-head">
          <div><span className="section-kicker">STARTING POINTS</span><h2 id="root-directory-title">11개 지역 시작점</h2></div>
        </header>
        <div className="t4-directory-grid">
          {roots.map((root, index) => (
            <Link
              className="t4-directory-card"
              href={root.path}
              key={root.path}
              style={{ "--card-image": `url(${root.image})` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h2>{root.name}</h2><p>{root.scope} · 연결 지역 {root.count}개</p></div>
              <b>지역 열기 →</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
