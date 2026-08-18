import Link from "@/components/SiteLink";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/business";

const FOOTER_LINKS = [
  ["/areas/", "지역 안내"],
  ["/pricing/", "가격 안내"],
  ["/guide/", "이용 안내"],
  ["/notice/", "공지사항"],
  ["/blog/", "블로그"],
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top page-width">
        <nav aria-label="하단 메뉴">
          {FOOTER_LINKS.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
          <a href={PHONE_HREF}>전화 문의</a>
        </nav>
      </div>
      <div className="footer-main page-width">
        <div className="footer-brand-block">
          <Link className="footer-brand" href="/" aria-label="혼혈마사지 홈">
            <span className="footer-brand-mark" aria-hidden="true" />
            <h2>혼혈마사지</h2>
          </Link>
          <p>주소 단계별 운영 범위와 5개 코스의 공개 금액을 제공합니다.</p>
          <p>{PHONE_DISPLAY} · 365일 24시간 접수 · 현장 후불</p>
        </div>
        <div className="footer-facts" aria-label="운영 기준">
          <span>선입금 없음</span>
          <span>현장 카드 결제</span>
        </div>
      </div>
    </footer>
  );
}
