import { COURSE_SCORES, formatWon } from "@/lib/business";

export const SERVICE_STEPS = [
  ["01", "지역 경로 찾기", "받을 주소의 시·군·구 또는 동·읍·면을 검색해 해당 지역 안내를 엽니다."],
  ["02", "주소와 일정 알리기", "도로명·건물명과 원하는 날짜·시각, 이용 인원을 전화로 전달합니다."],
  ["03", "코스 항목 확인", "가격표에서 고른 코스명과 이용 시간을 말하고 현재 가능한 일정을 확인합니다."],
  ["04", "이용 뒤 현장 정산", "이용이 끝난 장소에서 현금 또는 무선 카드 단말기로 비용을 처리합니다."],
] as const;

export const SERVICE_FAQS = [
  ["예약 전에 돈을 보내는 절차가 있나요?", "아닙니다. 예약금이나 선입금 없이 이용을 마친 뒤 현장에서 결제합니다."],
  ["어느 지역 페이지를 선택하나요?", "실제 받을 주소와 같은 시·군·구, 동·읍·면 경로를 고릅니다. 상세 주소는 통화에서 확인합니다."],
  ["전화 전에 무엇을 적어 두나요?", "도로명과 건물명, 날짜·시각, 인원, 코스명과 이용 시간을 준비합니다."],
  ["현장에서 카드를 사용할 수 있나요?", "현장에서 사용하는 무선 단말기로 카드 결제가 가능합니다."],
  ["두 명이 함께 이용할 수 있나요?", "커플·부부 2인 동시 프로그램은 주소와 일정, 인원을 알린 뒤 가능 여부를 확인합니다."],
  ["전화 접수 시간은 언제인가요?", "전화 창구는 365일 24시간 운영합니다."],
  ["비품은 어떻게 관리하나요?", "일회용 비품을 사용하며 관리 전과 후에 소독합니다."],
] as const;

export const NOTICE_ITEMS = [
  {
    slug: "phone-consultation",
    title: "365일 24시간 전화 접수",
    summary: "0508-202-3906에서 시간대 구분 없이 주소와 일정 문의를 받습니다.",
  },
  {
    slug: "consultation-details",
    title: "전화 전에 준비할 다섯 항목",
    summary: "받을 주소, 날짜·시각, 인원, 코스명, 이용 시간을 순서대로 확인합니다.",
  },
  {
    slug: "onsite-payment",
    title: "예약금 없는 현장 후불",
    summary: "사전에 송금하지 않고 이용을 마친 장소에서 비용을 정산합니다.",
  },
  {
    slug: "card-payment",
    title: "현장 카드 결제 안내",
    summary: "현금 외에는 현장에서 사용하는 무선 카드 단말기로 결제할 수 있습니다.",
  },
] as const;

export const COURSE_GROUPS = [...new Set(COURSE_SCORES.map((item) => item.course))].map(
  (course) => ({
    course,
    options: COURSE_SCORES.filter((item) => item.course === course).map((item) => ({
      minutes: item.minutes,
      price: formatWon(item.price),
    })),
  }),
);
