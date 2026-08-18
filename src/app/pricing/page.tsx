import type { Metadata } from "next";
import Link from "@/components/SiteLink";
import { PHONE_HREF } from "@/lib/business";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";
import { COURSE_GROUPS } from "@/lib/site-content";

export const metadataContract = createRouteMetadataContract(
  "/pricing/",
  "혼혈마사지 코스 가격 | 출장마사지 5종 14개 시간표",
  "혼혈마사지 타이·아로마·힐링·스페셜·남성전용 5개 코스의 14개 시간별 금액과 예약금 없는 현장 후불·카드 결제를 안내합니다.",
  ["혼혈마사지 코스 가격", "출장마사지 14개 금액", "출장안마 이용 시간", "출장마사지 현장 카드"],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

const PRICE_STATS = [
  ["코스 구분", "5개"],
  ["가격 항목", "14개"],
  ["결제 시점", "이용 후"],
] as const;

export default function PricingPage() {
  return (
    <main className={"t4-fixed-page"}>
      <div className={"t4-fixed-frame"}>
        <header className={"t4-fixed-hero"}>
          <div className={"t4-fixed-heroCopy"}>
            <p className={"t4-fixed-eyebrow"}>HONHYEOL MASSAGE · PRICE TABLE</p>
            <h1>코스와 시간을 함께 보는 <br />출장마사지 가격표</h1>
            <p className={"t4-fixed-heroLead"}>
              타이·아로마·힐링·스페셜은 60분·90분·120분, 남성전용은 60분·90분입니다.
              현재 가능한 날짜와 시작 시각은 받을 주소를 알린 뒤 전화로 확인합니다.
            </p>
          </div>
          <div className={"t4-fixed-statRow"} aria-label="공개 금액 구성">
            {PRICE_STATS.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </header>

        <section className={"t4-fixed-section"} aria-labelledby="course-price-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>COURSE OPTIONS</p>
              <h2 id="course-price-title">5개 코스의 시간별 금액</h2>
              <p>코스 이름과 이용 시간이 같은 행에서 금액을 확인하세요.</p>
            </div>
            <Link className={"t4-fixed-textLink"} href="/guide/">이용 방법 →</Link>
          </div>
          <div className={"t4-fixed-courseGrid"}>
            {COURSE_GROUPS.map((group, index) => (
              <article className={"t4-fixed-courseCard"} key={group.course}>
                <header>
                  <span className={"t4-fixed-courseIndex"}>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{group.course}</h3>
                </header>
                <ul>
                  {group.options.map((option) => (
                    <li key={option.minutes}>
                      <b>{option.minutes}분</b>
                      <strong>{option.price}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={"t4-fixed-calloutGrid"} aria-label="정산 방식과 통화 준비">
          <div className={"t4-fixed-callout"}>
            <p className={"t4-fixed-sectionKicker"}>ONSITE PAYMENT</p>
            <h2>예약금 없이 이용 뒤 결제합니다.</h2>
            <p>
              현금은 이용 장소에서 정산하며, 카드는 현장에 가져가는 무선 단말기로 처리할 수 있습니다.
            </p>
            <div className={"t4-fixed-buttonRow"}>
              <a className={"t4-fixed-button"} href={PHONE_HREF}>전화 문의</a>
              <Link className={"t4-fixed-buttonAlt"} href="/areas/">운영 지역</Link>
            </div>
          </div>
          <aside className={"t4-fixed-infoCard"}>
            <span>PHONE CHECKLIST</span>
            <strong>장소 · 일정 · 인원 · 코스</strong>
            <p>
              도로명과 건물명, 원하는 날짜와 시간, 인원, 코스명과 이용 시간을 전화로 전달합니다.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
