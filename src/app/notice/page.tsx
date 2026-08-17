import type { Metadata } from "next";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/business";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";
import { NOTICE_ITEMS, SERVICE_STEPS } from "@/lib/site-content";

export const metadataContract = createRouteMetadataContract(
  "/notice/",
  "혼혈마사지 공지사항 | 24시간 접수·현장 후불 기준",
  "혼혈마사지 공지에서 24시간 전화 창구, 상담 전 준비 내용, 이용 후 현장 정산과 카드 사용 기준을 확인할 수 있습니다.",
  ["혼혈마사지 상시 공지", "출장마사지 24시간 접수", "출장마사지 후불 정산", "출장마사지 현장 카드"],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

export default function NoticePage() {
  return (
    <main className={"t4-fixed-page"}>
      <div className={"t4-fixed-frame"}>
        <header className={"t4-fixed-hero"}>
          <div className={"t4-fixed-heroCopy"}>
            <p className={"t4-fixed-eyebrow"}>HONHYEOL MASSAGE · NOTICE</p>
            <h1>전화 접수와 정산 <br />상시 기준표</h1>
            <p className={"t4-fixed-heroLead"}>
              접수 시간, 통화에서 맞출 내용, 비용을 처리하는 시점과 카드 사용 방법을 한곳에 적었습니다.
            </p>
          </div>
          <div className={"t4-fixed-statRow"} aria-label="상시 공지 세 항목">
            <div><span>상담</span><strong>연중무휴 · 24시간</strong></div>
            <div><span>결제</span><strong>현장 후불</strong></div>
            <div><span>카드</span><strong>무선 단말기 사용</strong></div>
          </div>
        </header>

        <section className={"t4-fixed-section"} aria-labelledby="notice-list-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>HONHYEOL NOTICE</p>
              <h2 id="notice-list-title">상시 공지 네 항목</h2>
              <p>모든 지역 문의에 같은 방식으로 적용되는 전화·결제 안내입니다.</p>
            </div>
            <Link className={"t4-fixed-textLink"} href="/guide/">이용 방법 →</Link>
          </div>
          <div className={"t4-fixed-noticeList"}>
            {NOTICE_ITEMS.map((notice, index) => (
              <article className={"t4-fixed-noticeCard"} id={notice.slug} key={notice.slug}>
                <span className={"t4-fixed-noticeNumber"}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{notice.title}</h3>
                  <p>{notice.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={"t4-fixed-calloutGrid"} aria-label="확인 순서와 전화 연결">
          <aside className={"t4-fixed-noticeSide"}>
            <p className={"t4-fixed-sectionKicker"}>CONSULTATION NOTE</p>
            <h2>확인 진행 순서</h2>
            <ol>
              {SERVICE_STEPS.map(([number, title]) => (
                <li key={number}><b>{number}</b><span>{title}</span></li>
              ))}
            </ol>
          </aside>
          <div className={"t4-fixed-contactPanel"}>
            <p className={"t4-fixed-sectionKicker"}>24H CONSULTATION</p>
            <h2>주소를 기준으로 일정을 확인합니다.</h2>
            <p>받을 곳의 도로명 주소, 가능한 시각, 인원, 코스명과 이용 시간을 전화로 알려 주세요.</p>
            <div className={"t4-fixed-buttonRow"}>
              <a className={"t4-fixed-button"} href={PHONE_HREF}>{PHONE_DISPLAY} 문의</a>
              <Link className={"t4-fixed-buttonAlt"} href="/pricing/">코스 가격</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
