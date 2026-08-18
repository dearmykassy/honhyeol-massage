import Link from "@/components/SiteLink";
import { PHONE_HREF } from "@/lib/business";

export function BottomNav() {
  return (
    <>
      <a className="scroll-top" href="#top" aria-label="맨 위로">↑</a>
      <nav className="floating-actions" aria-label="빠른 메뉴">
        <Link className="floating-near" href="/areas/"><span aria-hidden="true">●</span> 지역 검색</Link>
        <a className="floating-main" href={PHONE_HREF}>
          <span aria-hidden="true">☎</span>
          <strong>전화 문의</strong>
          <small>365일 24시간</small>
        </a>
      </nav>
    </>
  );
}
