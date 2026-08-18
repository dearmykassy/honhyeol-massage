import type { Metadata } from "next";
import Link from "@/components/SiteLink";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/business";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";
import { SERVICE_FAQS, SERVICE_STEPS } from "@/lib/site-content";

export const metadataContract = createRouteMetadataContract(
  "/guide/",
  "혼혈마사지 이용 방법 | 출장마사지 전화 준비와 현장결제",
  "혼혈마사지 이용 전 도로명 주소, 날짜·시각, 인원, 코스·시간을 준비하고 전화상담부터 현장 후불까지 진행하는 순서를 안내합니다.",
  ["혼혈마사지 이용 방법", "출장마사지 전화 준비", "출장안마 현장 후불", "출장마사지 카드 결제"],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

const OPERATING_STANDARDS = [
  ["PHONE", "365일 24시간 전화 창구", "요일과 시간대 구분 없이 주소와 일정 문의를 받습니다."],
  ["NO DEPOSIT", "예약금 없는 후불", "이용 전에 송금하지 않고 마친 장소에서 비용을 처리합니다."],
  ["CARD", "무선 단말기 사용", "현금 외 결제는 현장에 가져가는 카드 단말기로 진행할 수 있습니다."],
  ["TWO PEOPLE · HYGIENE", "2인 프로그램과 비품", "커플·부부 2인 동시 프로그램, 일회용 비품, 관리 전후 소독 기준을 적용합니다."],
] as const;

export default function GuidePage() {
  return (
    <main className={"t4-fixed-page"}>
      <div className={"t4-fixed-frame"}>
        <header className={"t4-fixed-hero"}>
          <div className={"t4-fixed-heroCopy"}>
            <p className={"t4-fixed-eyebrow"}>HONHYEOL MASSAGE · HOW TO USE</p>
            <h1>주소를 찾고 전화로 <br />일정을 확인하는 방법</h1>
            <p className={"t4-fixed-heroLead"}>
              도로명과 건물명, 원하는 날짜·시각, 인원, 코스명과 이용 시간을 한 번에 전달합니다.
            </p>
          </div>
          <div className={"t4-fixed-statRow"} aria-label="통화 준비 세 항목">
            <div><span>장소</span><strong>도로명 · 건물명</strong></div>
            <div><span>일정</span><strong>날짜 · 시각</strong></div>
            <div><span>선택</span><strong>코스 · 시간</strong></div>
          </div>
        </header>

        <section className={"t4-fixed-section"} aria-labelledby="guide-process-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>USE IN FOUR STEPS</p>
              <h2 id="guide-process-title">이용 절차 네 단계</h2>
              <p>지역 검색부터 전화 확인, 이용, 현장 결제까지 이어집니다.</p>
            </div>
            <Link className={"t4-fixed-textLink"} href="/pricing/">코스 가격 →</Link>
          </div>
          <ol className={"t4-fixed-steps"}>
            {SERVICE_STEPS.map(([number, title, copy]) => (
              <li key={number}>
                <span className={"t4-fixed-stepNumber"}>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={"t4-fixed-section"} aria-labelledby="guide-standard-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>OPERATING FACTS</p>
              <h2 id="guide-standard-title">전화·결제·비품 기준</h2>
              <p>모든 지역 안내에 함께 적용되는 확인된 운영 내용입니다.</p>
            </div>
          </div>
          <div className={"t4-fixed-standardGrid"}>
            {OPERATING_STANDARDS.map(([label, title, copy]) => (
              <article className={"t4-fixed-standardCard"} key={label}>
                <span>{label}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={"t4-fixed-section"} aria-labelledby="guide-faq-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>FAQ</p>
              <h2 id="guide-faq-title">전화 전에 자주 확인하는 내용</h2>
              <p>주소 선택, 준비 항목, 결제, 2인 프로그램, 접수 시간과 비품 기준을 모았습니다.</p>
            </div>
          </div>
          <div className={"t4-fixed-faqList"}>
            {SERVICE_FAQS.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary><span>{question}</span><b aria-hidden="true">+</b></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={`${"t4-fixed-section"} ${"t4-fixed-contactPanel"}`} aria-label="일정 확인 전화 연결">
          <p className={"t4-fixed-sectionKicker"}>24H CONSULTATION</p>
          <h2>장소와 일정부터 전화로 확인하세요.</h2>
          <p>도로명과 건물명, 날짜·시각, 인원, 코스명과 이용 시간을 순서대로 알려 주세요.</p>
          <div className={"t4-fixed-buttonRow"}>
            <a className={"t4-fixed-button"} href={PHONE_HREF}>{PHONE_DISPLAY} 문의</a>
            <Link className={"t4-fixed-buttonAlt"} href="/areas/">지역 목록</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
