"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { RegionSearch } from "@/components/RegionSearch";
import { PHONE_HREF } from "@/lib/business";

const NAV = [
  ["/areas/", "지역 안내"],
  ["/pricing/", "가격 안내"],
  ["/guide/", "이용 안내"],
  ["/notice/", "공지사항"],
  ["/blog/", "블로그"],
] as const;

const QUICK_REGIONS = [
  ["/areas/seoul/", "서울"],
  ["/areas/incheon/", "인천"],
  ["/areas/gyeonggi/", "경기"],
  ["/areas/busan/", "부산"],
  ["/areas/jeju/", "제주"],
] as const;

const QUICK_ICONS = ["▣", "▤", "◇", "⌘", "▦"] as const;
const BRAND_NAME = "혼혈마사지";
const HOME_LABEL = "혼혈마사지 홈";
const PHONE_LABEL = "전화 문의";
const NOTICE_TITLE = "24시간 전화 접수";
const NOTICE_COPY = "받을 주소와 가능한 시각을 기준으로 일정을 확인합니다.";
const SEARCH_OPEN_LABEL = "지역 검색 열기";
const MENU_LABEL = "전체 메뉴";
const PRIMARY_NAV_LABEL = "주요 메뉴";

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const drawerButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    window.requestAnimationFrame(() => searchButtonRef.current?.focus());
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    window.requestAnimationFrame(() => drawerButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    const syncScroll = () => setScrolled(window.scrollY > 480);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (searchOpen) closeSearch();
      if (drawerOpen) closeDrawer();
    };

    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", syncScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeDrawer, closeSearch, drawerOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    window.requestAnimationFrame(() => {
      searchPanelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    });
  }, [searchOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    window.requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus());
  }, [drawerOpen]);

  useEffect(() => {
    document.body.classList.toggle("search-active", searchOpen || drawerOpen);
    document.body.classList.toggle("notice-closed", !noticeOpen);
    return () => {
      document.body.classList.remove("search-active", "notice-closed");
    };
  }, [drawerOpen, noticeOpen, searchOpen]);

  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>, container: HTMLElement | null) => {
    if (event.key !== "Tab") return;
    const focusable = [...(container?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled])',
    ) ?? [])].filter((element) => element.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <>
      {noticeOpen ? (
        <div className="notice-bar">
          <div className="notice-inner page-width">
            <p><b>{NOTICE_TITLE}</b><span>{NOTICE_COPY}</span></p>
            <nav aria-label={PRIMARY_NAV_LABEL}>
              <Link href="/notice/">{NAV[3][1]}</Link><i aria-hidden="true">/</i><Link href="/blog/">{NAV[4][1]}</Link><i aria-hidden="true">/</i><a href={PHONE_HREF}>{PHONE_LABEL}</a>
            </nav>
            <button aria-label="상단 안내 닫기" className="notice-close" onClick={() => setNoticeOpen(false)} type="button">×</button>
          </div>
        </div>
      ) : null}

      <header className="site-header">
        <div className="header-inner page-width">
          <button
            aria-expanded={drawerOpen}
            aria-label={MENU_LABEL}
            className="mobile-menu-open icon-button"
            onClick={(event) => {
              drawerButtonRef.current = event.currentTarget;
              setDrawerOpen(true);
            }}
            type="button"
          >
            <span aria-hidden="true">☰</span>
          </button>
          <Link className="brand" href="/" aria-label={HOME_LABEL}>
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">{BRAND_NAME}</span>
          </Link>
          <RegionSearch className="search-form search-form--header" />
          <button
            aria-expanded={searchOpen}
            aria-label={SEARCH_OPEN_LABEL}
            className="mobile-search-open icon-button"
            onClick={(event) => {
              searchButtonRef.current = event.currentTarget;
              setSearchOpen(true);
            }}
            type="button"
          >
            <svg aria-hidden="true" className="search-glyph" viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6.25" />
              <path d="m15.2 15.2 4.55 4.55" />
            </svg>
          </button>
        </div>
      </header>

      <nav className={`desktop-nav${scrolled ? " scrolled" : ""}`} aria-label={PRIMARY_NAV_LABEL}>
        <div className="nav-inner page-width">
          <Link className="home-link" href="/" aria-label={HOME_LABEL}>⌂</Link>
          {NAV.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
          <div className="nav-tools">
            <button
              aria-label={SEARCH_OPEN_LABEL}
              className="round-search"
              onClick={(event) => {
                searchButtonRef.current = event.currentTarget;
                setSearchOpen(true);
              }}
              type="button"
            >
              <svg aria-hidden="true" className="search-glyph" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.25" /><path d="m15.2 15.2 4.55 4.55" /></svg>
            </button>
            <button
              aria-label={MENU_LABEL}
              className="grid-button"
              onClick={(event) => {
                drawerButtonRef.current = event.currentTarget;
                setDrawerOpen(true);
              }}
              type="button"
            >▦</button>
          </div>
        </div>
      </nav>

      <nav className="mobile-quick-nav" aria-label={MENU_LABEL}>
        <div className="mobile-quick-track">
          {NAV.map(([href, label], index) => (
            <Link href={href} key={href}><i aria-hidden="true">{QUICK_ICONS[index]}</i><span>{label}</span></Link>
          ))}
        </div>
      </nav>

      <div
        aria-hidden={!searchOpen}
        className={`search-panel${searchOpen ? " is-open" : ""}`}
        inert={!searchOpen}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeSearch();
        }}
        onKeyDownCapture={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          closeSearch();
        }}
        onKeyDown={(event) => trapFocus(event, searchPanelRef.current)}
        ref={searchPanelRef}
      >
        <button aria-label="검색 닫기" className="search-close" onClick={closeSearch} type="button">×</button>
        <div className="search-panel-inner">
          <p className="search-panel-label">REGION SEARCH</p>
          <h2>주소에 맞는 상세 페이지 찾기</h2>
          <p>시·군·구, 동·읍·면 또는 지역 별칭을 입력하면 해당 경로를 바로 엽니다.</p>
          <RegionSearch className="search-form search-form--panel" onNavigate={closeSearch} />
          <div className="search-quick-links" aria-label="빠른 지역 링크">
            {QUICK_REGIONS.map(([href, label]) => <Link href={href} key={href} onClick={closeSearch}>{label}</Link>)}
          </div>
          <nav className="search-menu-links" aria-label={MENU_LABEL}>
            {NAV.map(([href, label]) => <Link href={href} key={href} onClick={closeSearch}>{label}</Link>)}
          </nav>
        </div>
      </div>

      <div
        aria-hidden={!drawerOpen}
        className={`drawer-scrim${drawerOpen ? " is-open" : ""}`}
        onMouseDown={closeDrawer}
      />
      <aside
        aria-hidden={!drawerOpen}
        aria-label={MENU_LABEL}
        className={`mobile-drawer${drawerOpen ? " is-open" : ""}`}
        inert={!drawerOpen}
        onKeyDownCapture={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          closeDrawer();
        }}
        onKeyDown={(event) => trapFocus(event, drawerRef.current)}
        ref={drawerRef}
      >
        <header>
          <Link className="brand" href="/" onClick={closeDrawer} aria-label={HOME_LABEL}>
            <span className="brand-mark" aria-hidden="true" /><span className="brand-name">{BRAND_NAME}</span>
          </Link>
          <button aria-label={MENU_LABEL} className="mobile-menu-close" onClick={closeDrawer} type="button">×</button>
        </header>
        <nav>
          {NAV.map(([href, label]) => <Link href={href} key={href} onClick={closeDrawer}>{label}<span aria-hidden="true">›</span></Link>)}
        </nav>
        <div className="drawer-note">
          <h3>{NOTICE_TITLE}</h3>
          <p>{NOTICE_COPY}</p>
          <a href={PHONE_HREF}>{PHONE_LABEL}</a>
        </div>
      </aside>

      <button
        aria-label="맨 위로 이동"
        className={`scroll-top${scrolled ? " is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        type="button"
      >
        ↑
      </button>
    </>
  );
}
