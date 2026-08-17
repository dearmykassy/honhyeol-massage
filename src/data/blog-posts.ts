import type { Metadata } from "next";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/metadata";

export type BlogPost = {
  slug: "masaji-shop-gagi-himdeul-ttae" | "jibeseo-masaji-badeul-su-issnayo";
  category: string;
  title: string;
  description: string;
  keywords: readonly string[];
  publishedAt: string;
  modifiedAt: string;
  intro: string;
  sections: readonly { heading: string; paragraphs: readonly string[] }[];
  checklist: readonly string[];
  relatedSlug: BlogPost["slug"];
  image: {
    assetId: "honhyeol-note-01" | "honhyeol-note-02";
    src: string;
    alt: string;
  };
};

export const BLOG_POSTS = [
  {
    slug: "masaji-shop-gagi-himdeul-ttae",
    category: "이동 없이 문의하기",
    title: "외출 시간을 줄이고 출장마사지를 문의하는 순서",
    description:
      "밖으로 이동하기 어려운 날, 현재 주소와 가능한 시간 범위·인원·코스를 정리해 출장마사지 일정을 확인하는 순서입니다.",
    keywords: [
      "혼혈마사지 블로그",
      "출장마사지 문의 순서",
      "출장안마 시간 선택",
      "출장마사지 현장 후불",
    ],
    publishedAt: "2026-08-17T00:00:00+09:00",
    modifiedAt: "2026-08-17T00:00:00+09:00",
    intro:
      "이동에 쓸 시간이 부족하다면 먼저 현재 장소에서 비워 둘 수 있는 구간을 계산해야 합니다. 주소와 시간 범위를 정한 뒤 인원, 코스, 이용 시간을 차례로 전화에 전달하면 현재 일정을 확인할 수 있습니다.",
    sections: [
      {
        heading: "끝내야 하는 시각부터 거꾸로 계산하기",
        paragraphs: [
          "이용을 마쳐야 하는 시각이 정해져 있다면 그 시각에서 원하는 코스 시간을 빼고 준비 여유를 둡니다. 60분·90분·120분 가운데 실제로 확보할 수 있는 구간을 고릅니다.",
          "시작 시간을 하나로 못 박기 어렵다면 가능한 범위를 말할 수 있습니다. 다만 확정 시각은 상세 주소를 알린 전화에서 다시 확인해야 합니다.",
        ],
      },
      {
        heading: "지역명보다 실제 받을 주소를 먼저 확인하기",
        paragraphs: [
          "지역 검색은 맞는 안내 페이지를 찾는 용도입니다. 상담할 때는 도로명과 건물명처럼 방문 장소를 구분할 수 있는 주소가 필요합니다.",
          "공동 출입구나 안내 데스크를 거쳐야 한다면 그 내용은 주소와 나눠서 전화로 알립니다. 상세 출입 정보는 검색창에 입력하지 않습니다.",
        ],
      },
      {
        heading: "코스 후보는 이름과 시간을 한 묶음으로 적기",
        paragraphs: [
          "가격은 코스 이름과 이용 시간 조합에 따라 다릅니다. 예를 들어 타이 60분과 타이 90분을 서로 다른 항목으로 보고 금액을 대조합니다.",
          "두 코스를 놓고 고민한다면 각각의 코스명과 이용 시간을 적어 둡니다. 현재 선택 가능한 항목은 전화에서 확인합니다.",
        ],
      },
      {
        heading: "주소·시간·인원·코스 순서로 말하기",
        paragraphs: [
          "통화에서는 받을 주소, 희망 날짜와 시간 범위, 인원, 코스명과 이용 시간을 순서대로 전달합니다. 빠진 항목이 있으면 일정 확인이 늦어질 수 있습니다.",
          "예약금이나 선입금은 보내지 않습니다. 비용은 이용을 마친 뒤 현장에서 현금 또는 무선 카드 단말기로 처리합니다.",
        ],
      },
    ],
    checklist: ["이용을 마쳐야 하는 시각", "도로명과 건물명", "이용 인원", "코스명·이용 시간"],
    relatedSlug: "jibeseo-masaji-badeul-su-issnayo",
    image: {
      assetId: "honhyeol-note-01",
      src: "/images/honhyeol-template4/blog/note-01.webp",
      alt: "실내 거울 앞에서 휴대전화를 확인하는 성인 여성",
    },
  },
  {
    slug: "jibeseo-masaji-badeul-su-issnayo",
    category: "장소별 주소 준비",
    title: "자택과 숙소에서 출장마사지를 문의할 때 다른 점",
    description:
      "자택과 호텔·숙소에서 출장마사지를 문의할 때 각각 준비할 주소 표기, 출입 내용, 일정·인원·코스와 결제 확인 항목입니다.",
    keywords: [
      "혼혈마사지 이용 정보",
      "자택 출장마사지",
      "호텔 출장마사지 문의",
      "출장마사지 주소 준비",
    ],
    publishedAt: "2026-08-17T00:00:00+09:00",
    modifiedAt: "2026-08-17T00:00:00+09:00",
    intro:
      "자택과 숙소는 주소를 확인하는 방식이 조금 다릅니다. 자택은 건물명이, 숙소는 예약 내역에 적힌 상호와 지점이 중요합니다. 장소를 구분한 다음 일정과 이용 항목을 붙여 전달합니다.",
    sections: [
      {
        heading: "자택은 도로명과 건물명을 함께 보기",
        paragraphs: [
          "아파트·오피스텔·단독주택은 도로명만으로 건물을 구분하기 어려울 수 있습니다. 도로명, 건물 번호, 건물명을 서로 맞춰 봅니다.",
          "동과 호수처럼 공개할 필요가 없는 정보는 전화에서만 전달합니다. 지역 페이지에는 상세 주소를 남기지 않습니다.",
        ],
      },
      {
        heading: "숙소는 같은 상호의 다른 지점을 구분하기",
        paragraphs: [
          "호텔이나 숙소 이름이 같아도 지점과 주소가 다를 수 있습니다. 예약 확인서의 상호, 지점명, 도로명 주소를 대조합니다.",
          "방문객 출입 확인이 필요한 곳이라면 해당 숙소의 안내를 먼저 확인합니다. 일정 가능 여부는 숙소 주소를 알린 뒤 전화로 묻습니다.",
        ],
      },
      {
        heading: "두 명이면 인원과 동시 이용 여부를 같이 묻기",
        paragraphs: [
          "한 장소에서 두 명이 이용하려면 처음부터 인원을 두 명으로 알립니다. 커플·부부 2인 동시 프로그램은 주소와 시간에 따라 전화 확인이 필요합니다.",
          "각자 다른 코스나 시간을 원한다면 사람별 코스명과 이용 시간을 구분해 준비합니다.",
        ],
      },
      {
        heading: "장소가 바뀌면 이전 상담 내용을 그대로 쓰지 않기",
        paragraphs: [
          "상담 뒤 자택에서 숙소로, 또는 숙소에서 다른 지점으로 장소가 바뀌면 새 주소와 원하는 시각을 다시 알려야 합니다.",
          "결제는 사전 송금이 아니라 이용 후 현장에서 진행합니다. 카드 사용 예정이라면 무선 단말기 결제를 통화에서 함께 확인합니다.",
        ],
      },
    ],
    checklist: ["자택 또는 숙소 구분", "건물명·숙소 상호와 지점", "날짜·시간·인원", "코스·시간·결제 수단"],
    relatedSlug: "masaji-shop-gagi-himdeul-ttae",
    image: {
      assetId: "honhyeol-note-02",
      src: "/images/honhyeol-template4/blog/note-02.webp",
      alt: "밝은 방의 전신거울 앞에서 휴대전화를 든 성인 여성",
    },
  },
] as const satisfies readonly BlogPost[];

export function findBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((candidate) => candidate.slug === slug);
}

export function getBlogPost(slug: BlogPost["slug"]): BlogPost {
  const post = findBlogPost(slug);
  if (!post) throw new Error(`HONHYEOL_BLOG_POST_NOT_FOUND:${slug}`);
  return post;
}

export function getBlogPostPath(post: Pick<BlogPost, "slug">): string {
  return `/blog/${post.slug}/`;
}

export function createBlogMetadata(post: BlogPost): Metadata {
  const path = getBlogPostPath(post);
  const url = new URL(path, SITE_ORIGIN).href;
  const title = `${post.title} | ${SITE_NAME}`;
  return {
    title: { absolute: title },
    description: post.description,
    keywords: [...post.keywords],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "ko_KR",
      siteName: SITE_NAME,
      title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
    },
    twitter: {
      card: "summary",
      title,
      description: post.description,
    },
    robots: { index: true, follow: true },
  };
}
