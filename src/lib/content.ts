import {
  getDirectChildren,
  getKeywordRegionLabel,
  getParentNode,
  getRegionOrdinal,
  type RegionNode,
} from "@/lib/regions";

export const REGION_KEYWORD_SUFFIXES = [
  "출장마사지",
  "출장안마",
  "출장타이마사지",
  "출장스웨디시",
  "출장홈타이",
  "혼혈마사지",
  "남성전용마사지",
  "여성전용마사지",
] as const;

export const BROAD_DETAIL_SECTION_IDS = [
  "child-region-directory",
  "service-address",
  "operating-outline",
  "time-course-table",
  "program-options",
  "first-use-guide",
  "pre-call-checklist",
  "payment-reference",
  "change-confirmation",
] as const;

export const COMPACT_DETAIL_SECTION_IDS = [
  "local-boundary",
  "address-hierarchy",
  "same-parent-regions",
  "call-preparation",
  "schedule-check",
  "course-selection",
  "two-person-program",
  "payment-method",
  "hygiene-reference",
  "first-contact-flow",
  "change-recheck",
] as const;

export type ContentSection = {
  id: string;
  heading: string;
  paragraphs: [string, string];
};

export type RegionContent = {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  eyebrow: string;
  hooks: [string, string];
  sections: ContentSection[];
  ctaLabels: [string, string, string];
  detailMode: "broad" | "compact";
};

/**
 * Owner-approved broad-page boundary.
 *
 * The exact active graph resolves this to 41 routes: all 11 service roots and
 * 30 city-name hubs. Gu, gun, dong, eup and myeon pages remain compact.
 */
export function isBroadDetailRegion(node: RegionNode): boolean {
  return node.kind === "root" || /시$/u.test(node.displayName);
}

type TitlePattern = (fullName: string, keywordLabel: string) => string;
type MetaPattern = (fullName: string, graphScope: string) => string;
type RegionSentence = (fullName: string) => string;

const TITLE_PATTERNS: readonly TitlePattern[] = [
  (name, key) => `${name} 출장마사지 안내 | 혼혈마사지 ${key}`,
  (name, key) => `혼혈마사지 ${name} 코스·금액 | ${key}출장안마`,
  (name, key) => `${key}출장마사지 이용 순서 | 혼혈마사지 ${name}`,
  (name, key) => `${name} 출장홈타이 지역·가격 | ${key} 혼혈마사지`,
  (name, key) => `혼혈마사지 ${name} 전화상담 | ${key}출장마사지`,
  (name, key) => `${key}출장안마 코스표 | 혼혈마사지 ${name}`,
  (name, key) => `${name} 현장 후불 안내 | ${key} 혼혈마사지`,
  (name, key) => `혼혈마사지 ${name} 지역 조회 | ${key}출장마사지`,
  (name, key) => `${key}출장홈타이 문의 항목 | 혼혈마사지 ${name}`,
  (name, key) => `${name} 코스 시간·결제 | ${key} 혼혈마사지`,
  (name, key) => `혼혈마사지 ${name} 이용 전 확인 | ${key}출장안마`,
  (name, key) => `${key}출장마사지 가격 확인 | 혼혈마사지 ${name}`,
  (name, key) => `${name} 24시간 상담 안내 | ${key} 혼혈마사지`,
] as const;

const H1_PATTERNS = [
  (name: string) => `${name} 출장마사지 이용 안내`,
  (name: string) => `${name} 혼혈마사지 코스와 금액`,
  (name: string) => `${name} 출장홈타이 전화 준비`,
  (name: string) => `${name} 지역·일정 확인 순서`,
  (name: string) => `${name} 출장마사지 현장 결제`,
  (name: string) => `${name} 코스 시간표 확인`,
  (name: string) => `${name} 출장안마 상담 항목`,
  (name: string) => `${name} 받을 장소와 이용 시간`,
  (name: string) => `${name} 혼혈마사지 지역 안내`,
  (name: string) => `${name} 출장마사지 문의 순서`,
  (name: string) => `${name} 현장 후불 이용 기준`,
  (name: string) => `${name} 코스 선택과 전화상담`,
  (name: string) => `${name} 출장홈타이 가격 안내`,
] as const;

const INTRO_PATTERNS = [
  (name: string) => `${name} 문의 전 받을 장소의 정확한 주소와 원하는 날짜·시각을 준비해 주세요.`,
  (name: string) => `${name} 지역 페이지에서 주소 단계와 공개 코스표를 확인한 다음 전화로 일정을 묻습니다.`,
  (name: string) => `${name} 상담에는 도로명 주소, 건물명, 이용 인원, 코스와 희망 시간이 필요합니다.`,
  (name: string) => `${name}에서 받을 수 있는지는 상세 주소와 시간을 알린 뒤 통화로 확인합니다.`,
  (name: string) => `${name} 안내는 지역 경로, 코스별 시간·금액, 현장 결제 순서로 구성했습니다.`,
  (name: string) => `${name} 문의를 준비할 때 주소와 일정, 인원, 코스를 한 항목씩 적으면 됩니다.`,
  (name: string) => `${name} 출장마사지의 공개 가격과 전화상담에 전달할 내용을 확인할 수 있습니다.`,
  (name: string) => `${name} 지역명만으로 가능 여부를 정하지 않으며 실제 받을 주소를 통화에서 확인합니다.`,
  (name: string) => `${name} 하위 주소 단계와 코스표를 살펴본 뒤 원하는 이용 시간을 전화로 알려 주세요.`,
  (name: string) => `${name} 일정 확인에 앞서 받을 곳과 시작 시각, 인원, 코스 후보를 정리합니다.`,
  (name: string) => `${name} 페이지는 출장 문의에 필요한 주소 확인과 가격·결제 정보를 담고 있습니다.`,
  (name: string) => `${name} 코스별 금액을 먼저 대조하고 정확한 장소와 시간은 전화로 확인해 주세요.`,
  (name: string) => `${name} 출장안마 문의는 받을 주소를 확인하는 단계부터 시작합니다.`,
] as const;

const DESCRIPTION_PATTERNS: readonly MetaPattern[] = [
  (name, scope) => `${name} 출장마사지 주소 조회, 코스별 이용 시간과 금액, 현장 후불·카드 결제, 전화상담 준비 항목을 안내합니다. ${scope}`,
  (name, scope) => `혼혈마사지 ${name} 페이지에서 지역 단계와 공개 가격표, 24시간 전화 접수, 이용 후 현장 정산 기준을 확인하세요. ${scope}`,
  (name, scope) => `${name} 출장안마 문의에 필요한 도로명 주소·희망 시각·인원·코스와 결제 방법을 정리했습니다. ${scope}`,
  (name, scope) => `${name} 출장홈타이의 지역 경로, 5개 코스 시간표, 사전 송금 없는 현장 후불 기준을 확인할 수 있습니다. ${scope}`,
  (name, scope) => `혼혈마사지 ${name} 이용 전 주소와 일정 전달 순서, 코스 금액, 무선 카드 단말기 결제 정보를 살펴보세요. ${scope}`,
  (name, scope) => `${name} 출장마사지 지역 안내입니다. 받을 장소와 원하는 시간을 준비하고 전화로 가능 여부를 확인합니다. ${scope}`,
  (name, scope) => `${name} 혼혈마사지 코스·가격표와 전화 문의 항목, 이용 완료 뒤 현장 결제 절차를 안내합니다. ${scope}`,
  (name, scope) => `${name} 출장안마를 문의할 때 확인할 실제 주소, 날짜·시각, 이용 인원, 코스와 현장 정산 기준입니다. ${scope}`,
  (name, scope) => `혼혈마사지 ${name} 지역 페이지입니다. 하위 주소 경로와 코스 시간·금액, 상담 및 결제 순서를 확인하세요. ${scope}`,
  (name, scope) => `${name} 출장홈타이 문의 전에 지역 경로와 코스표를 보고 주소·시각·인원을 전화로 전달하는 방법입니다. ${scope}`,
  (name, scope) => `${name} 출장마사지의 공개 금액, 24시간 전화상담, 선입금 없는 현장 후불과 카드 사용 기준을 정리했습니다. ${scope}`,
  (name, scope) => `혼혈마사지 ${name} 안내에서 주소 확인, 코스 선택, 일정 문의, 이용 뒤 현장 결제까지 순서대로 살펴보세요. ${scope}`,
  (name, scope) => `${name} 출장안마 지역 검색과 코스별 시간표, 전화상담 전달 항목, 현장 결제 정보를 제공합니다. ${scope}`,
] as const;

const SECOND_HOOK_PATTERNS: readonly MetaPattern[] = [
  (name, scope) => `${scope} ${name} 일정은 받을 주소와 희망 시각을 전화로 알린 뒤 확인합니다.`,
  (name, scope) => `${name} 지역 경로를 골라도 상세 장소는 통화에서 다시 맞춥니다. ${scope}`,
  (name, scope) => `${scope} ${name} 코스 이용 여부와 시작 시각은 전화 안내를 기준으로 합니다.`,
  (name, scope) => `${name} 문의에는 도로명과 건물명, 날짜·시각, 인원, 코스가 필요합니다. ${scope}`,
  (name, scope) => `${scope} ${name} 주소나 일정이 달라지면 바뀐 내용을 전화로 다시 알려 주세요.`,
  (name, scope) => `${name} 하위 지역과 공개 가격을 확인하고 최종 가능 여부는 통화에서 묻습니다. ${scope}`,
  (name, scope) => `${scope} ${name} 페이지의 코스 시간과 금액은 전화 전 확인용입니다.`,
  (name, scope) => `${name} 상담 전 실제 받을 곳과 원하는 이용 시간을 준비해 주세요. ${scope}`,
  (name, scope) => `${scope} ${name} 이용 문의는 주소, 시간, 인원, 코스 순서로 전달합니다.`,
  (name, scope) => `${name}에서의 일정과 선택 코스는 24시간 전화 창구에서 확인합니다. ${scope}`,
  (name, scope) => `${scope} ${name} 지역명만으로 서비스 가능 여부를 확정하지 않습니다.`,
  (name, scope) => `${name} 코스표를 본 뒤 주소와 시각을 알려 현재 가능한 항목을 확인하세요. ${scope}`,
  (name, scope) => `${scope} ${name} 현장 결제 전까지 별도 예약금이나 선입금은 없습니다.`,
] as const;

const ADDRESS_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 문의는 받을 곳의 도로명과 건물명을 확인하는 것부터 시작합니다.`,
  (name) => `${name} 주소를 준비할 때 시·군·구, 동·읍·면, 도로명, 건물명을 함께 봅니다.`,
  (name) => `${name} 지역명이 같아도 다른 행정구역일 수 있어 상위 지역과 도로명을 함께 알려야 합니다.`,
  (name) => `${name} 페이지 선택과 별개로 실제 받을 상세 주소는 통화에서 확인합니다.`,
  (name) => `${name}에서 서비스를 받을 수 있는지는 화면의 지역명만으로 정하지 않습니다.`,
  (name) => `${name} 안의 공동주택이나 숙소라면 건물명과 출입 관련 내용을 주소와 나눠 전달합니다.`,
  (name) => `${name} 주소에 변경이 생기면 새 도로명과 건물명을 기준으로 다시 확인합니다.`,
  (name) => `${name}에서 같은 건물명이 반복될 수 있으므로 도로명과 건물 번호를 함께 봅니다.`,
  (name) => `${name} 안의 아파트·오피스텔은 단지명만 적지 말고 도로명 주소도 대조합니다.`,
  (name) => `${name} 안의 숙소라면 예약 내역의 상호와 지점, 도로명 주소를 맞춰 봅니다.`,
  (name) => `${name} 안의 상권명이나 역명은 검색에 쓰고 방문 확인에는 실제 주소를 사용합니다.`,
  (name) => `${name}에서 받을 곳이 두 후보라면 먼저 확정한 주소 한 곳을 기준으로 상담합니다.`,
  (name) => `${name} 건물 출입 안내가 있다면 주소를 확인한 다음 별도 항목으로 전달합니다.`,
] as const;

const REQUEST_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 전화에는 받을 주소, 가능한 날짜·시각, 인원, 코스 후보를 차례로 전달합니다.`,
  (name) => `${name} 일정 문의 전 도로명 주소와 건물명, 원하는 시작 시간을 적어 두세요.`,
  (name) => `${name} 상담에서 주소를 먼저 확인하고 이용 인원과 코스·시간을 이어서 말합니다.`,
  (name) => `${name} 통화 준비 항목은 장소, 날짜와 시각, 인원, 코스명입니다.`,
  (name) => `${name} 문의 시 가능한 시간 범위가 둘 이상이면 각 범위를 구분해 알려 주세요.`,
  (name) => `${name} 동·호수와 출입 정보처럼 상세한 내용은 공개 검색창이 아닌 전화로 전달합니다.`,
  (name) => `${name}에서 받을 장소와 희망 시각이 정해져야 현재 일정 여부를 확인할 수 있습니다.`,
  (name) => `${name} 전화 전 날짜와 시작 가능 시각을 따로 적어 두면 전달 순서를 놓치지 않습니다.`,
  (name) => `${name} 문의에는 한 명인지 두 명인지 인원도 주소와 함께 알려야 합니다.`,
  (name) => `${name} 코스 후보가 둘이면 각 이름과 이용 시간을 구분해 말합니다.`,
  (name) => `${name}에서 받을 곳이 자택인지 숙소인지 먼저 밝히고 건물명을 이어서 전달합니다.`,
  (name) => `${name} 통화 중에는 준비한 주소와 일정이 맞는지 한 항목씩 대조합니다.`,
  (name) => `${name} 시간 범위를 바꾸려면 기존 시간과 새 시간을 구분해 다시 알립니다.`,
] as const;

const COURSE_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 가격표는 타이·아로마·힐링·스페셜·남성전용 다섯 코스로 나뉩니다.`,
  (name) => `${name} 코스를 고를 때 이름과 60분·90분·120분 이용 시간을 함께 확인합니다.`,
  (name) => `${name} 공개 금액은 코스명과 이용 시간 조합마다 따로 표시합니다.`,
  (name) => `${name} 남성전용은 60분·90분, 나머지 네 코스는 60분·90분·120분 항목이 있습니다.`,
  (name) => `${name} 전화 전에 가격표에서 코스 후보와 이용 시간을 한 줄로 적어 두세요.`,
  (name) => `${name} 시간표에 없는 조합은 임의로 계산하지 말고 통화에서 확인합니다.`,
  (name) => `${name} 코스가 둘 이상 후보라면 각 코스의 이용 시간을 따로 전달합니다.`,
  (name) => `${name} 타이·아로마·힐링·스페셜은 세 가지 시간 항목에서 선택합니다.`,
  (name) => `${name} 남성전용 코스를 볼 때는 공개된 60분과 90분 금액을 대조합니다.`,
  (name) => `${name} 이용 시간이 달라지면 같은 코스라도 별도 가격 항목으로 봅니다.`,
  (name) => `${name} 가격을 확인할 때 분 단위와 원 단위를 한 행에서 같이 읽습니다.`,
  (name) => `${name} 코스명만 전달하지 말고 원하는 분 단위까지 함께 말합니다.`,
  (name) => `${name} 통화에서 고른 코스와 가격표의 시간 항목이 맞는지 다시 확인합니다.`,
] as const;

const PAYMENT_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 비용은 코스와 이용 시간이 같은 가격표 항목을 기준으로 확인합니다.`,
  (name) => `${name} 이용 금액은 코스 이름만 보지 말고 선택한 시간까지 대조해야 합니다.`,
  (name) => `${name} 공개되지 않은 시간은 기존 금액을 나누거나 더해 계산하지 않습니다.`,
  (name) => `${name} 이용 전 코스명·시간·금액을 통화에서 한 번 더 확인합니다.`,
  (name) => `${name} 예약 단계에서 별도 예약금이나 선입금을 보내지 않습니다.`,
  (name) => `${name} 정산은 이용이 끝난 장소에서 현금 또는 무선 카드 단말기로 진행합니다.`,
  (name) => `${name} 현장 카드 사용 여부와 선택 금액은 통화를 마치기 전에 맞춰 봅니다.`,
  (name) => `${name} 결제 예정 수단이 카드라면 상담에서 무선 단말기 사용을 함께 확인합니다.`,
  (name) => `${name} 상담 과정에서 계좌로 예약금이나 선결제를 보내는 항목은 없습니다.`,
  (name) => `${name} 현금 결제도 이용이 끝난 다음 같은 장소에서 진행합니다.`,
  (name) => `${name} 두 명이 이용하면 사람별 코스·시간과 전체 금액을 구분해 확인합니다.`,
  (name) => `${name} 코스나 이용 시간을 바꾸면 변경된 가격 항목을 다시 대조합니다.`,
  (name) => `${name} 결제 전에 상담에서 정한 코스명과 이용 시간을 한 번 더 봅니다.`,
] as const;

const PROCESS_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 이용 순서는 지역 조회, 전화 문의, 코스·일정 확인, 이용, 현장 정산입니다.`,
  (name) => `${name} 페이지에서 지역과 가격을 본 뒤 실제 주소와 원하는 시각을 전화로 전달합니다.`,
  (name) => `${name} 주소를 확인한 다음 인원과 코스·시간을 맞추고 가능한 일정을 묻습니다.`,
  (name) => `${name} 통화에서 정한 코스와 시간으로 이용하고 비용은 마지막에 처리합니다.`,
  (name) => `${name} 이용 전 단계에는 주소와 일정 확인 외에 별도 선결제가 없습니다.`,
  (name) => `${name}에서 받을 장소가 정해지면 가격표를 대조하고 전화로 현재 가능한 시간을 확인합니다.`,
  (name) => `${name} 상담 내용과 실제 이용 항목이 다르면 시작 전에 다시 확인해야 합니다.`,
  (name) => `${name} 지역 안내를 연 뒤 가격표에서 후보를 고르고 전화로 주소와 일정을 맞춥니다.`,
  (name) => `${name} 전화에서는 장소 확인을 마친 다음 시간과 코스 순서로 넘어갑니다.`,
  (name) => `${name} 첫 문의라면 주소·일정·인원·코스를 메모하고 순서대로 읽으면 됩니다.`,
  (name) => `${name} 이용 가능 여부가 확인되기 전에는 방문 시각을 임의로 확정하지 않습니다.`,
  (name) => `${name}에서 두 명이 함께 이용할 때는 2인 동시 프로그램 여부를 통화에서 묻습니다.`,
  (name) => `${name} 이용이 끝나면 선택한 결제 수단으로 현장에서 비용을 처리합니다.`,
] as const;

const CONFIRM_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 주소·시각·인원·코스 중 바뀐 항목이 있으면 통화로 다시 알려 주세요.`,
  (name) => `${name}에서 받을 장소가 달라지면 이전 주소가 아닌 새 주소로 일정 여부를 확인합니다.`,
  (name) => `${name} 이용 시간을 변경하면 같은 코스라도 금액이 달라지는지 다시 봅니다.`,
  (name) => `${name} 통화를 끝내기 전 장소와 시작 시각, 코스·시간, 결제 방법을 대조합니다.`,
  (name) => `${name} 출입 안내가 추가되면 도로명과 건물명을 확인한 뒤 따로 전달합니다.`,
  (name) => `${name} 인원 변경 시 선택 코스와 이용 시간도 함께 다시 확인해 주세요.`,
  (name) => `${name} 최종 확인은 받은 안내가 아니라 현재 전달한 주소와 일정 기준으로 합니다.`,
  (name) => `${name} 안에서 건물명이 바뀌지 않았어도 도로명 주소가 달라지면 새 장소로 다시 확인합니다.`,
  (name) => `${name} 희망 시작 시각이 늦춰지거나 앞당겨지면 가능한 일정도 다시 묻습니다.`,
  (name) => `${name} 문의 인원이 두 명에서 한 명으로 달라질 때도 코스와 시간을 함께 고칩니다.`,
  (name) => `${name} 현금에서 카드로 결제 수단을 바꾸면 무선 단말기 사용을 재확인합니다.`,
  (name) => `${name} 안에서 숙소 지점이 달라지면 상호가 같더라도 새 주소를 전달합니다.`,
  (name) => `${name} 상담의 마지막 통화 내용과 메모가 다르면 주소부터 다시 대조해 주세요.`,
] as const;

const SCHEDULE_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 가능 일정은 고정표로 정하지 않고 받을 주소와 원하는 날짜·시각을 전화로 확인합니다.`,
  (name) => `${name} 문의에서는 한 시각만 말하기보다 가능한 시작 범위를 함께 전달할 수 있습니다.`,
  (name) => `${name} 날짜가 정해졌다면 시작 가능한 시각과 이용 시간을 서로 다른 항목으로 적습니다.`,
  (name) => `${name} 희망 시각은 주소와 코스를 확인한 다음 현재 가능한지 전화로 묻습니다.`,
  (name) => `${name} 일정 후보가 둘이라면 날짜와 시각을 각각 묶어 상담에서 전달합니다.`,
  (name) => `${name} 코스의 60분·90분·120분은 이용 시간이며 시작 시각과 구분해 확인합니다.`,
  (name) => `${name} 문의 날짜가 바뀌면 기존 답변을 그대로 쓰지 않고 새 일정으로 다시 확인합니다.`,
  (name) => `${name} 시작 가능 범위를 준비하면 상세 주소와 함께 현재 일정을 확인할 수 있습니다.`,
  (name) => `${name} 전화 전에는 원하는 날짜, 가능한 시작 범위, 선택한 이용 시간을 따로 적어 둡니다.`,
  (name) => `${name} 받을 장소와 날짜가 확정되지 않았다면 임의의 시작 시각을 먼저 정하지 않습니다.`,
  (name) => `${name} 당일 문의도 상세 주소와 가능한 시각을 전달한 뒤 상담 답변을 기준으로 판단합니다.`,
  (name) => `${name} 일정 확인 뒤 시작 시각을 바꾸려면 변경된 범위로 다시 문의합니다.`,
  (name) => `${name} 이용 시간과 희망 시작 시각을 함께 말하면 코스 항목을 구분해 확인할 수 있습니다.`,
] as const;

const PAIR_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 2인 동시 프로그램은 두 사람의 코스와 이용 시간, 받을 주소를 전화로 확인합니다.`,
  (name) => `${name} 두 명이 함께 이용하려면 사람별 코스 후보와 분 단위를 나눠 전달합니다.`,
  (name) => `${name} 커플·부부 2인 문의에는 같은 장소인지와 각자 원하는 코스를 함께 알립니다.`,
  (name) => `${name} 2인 프로그램의 가능 여부는 주소, 날짜·시각, 두 사람의 이용 항목을 확인한 뒤 안내합니다.`,
  (name) => `${name} 두 사람의 이용 시간이 다르면 코스명과 분 단위를 각각 적어 전화로 확인합니다.`,
  (name) => `${name} 2인 이용 금액은 사람별 코스와 시간에 해당하는 공개 가격을 합쳐 대조합니다.`,
  (name) => `${name} 한 장소에서 두 명이 이용할 경우 인원과 코스를 통화 첫 단계에서 밝혀 주세요.`,
  (name) => `${name} 2인 문의는 한 사람의 코스만 정하지 말고 두 사람의 선택 항목을 모두 준비합니다.`,
  (name) => `${name} 두 명의 일정이 같아도 선택 코스와 이용 시간은 사람별로 확인해야 합니다.`,
  (name) => `${name} 2인 동시 이용을 원하면 주소와 가능한 시각을 한 번에 전달해 현재 조건을 묻습니다.`,
  (name) => `${name} 이용 인원이 한 명에서 두 명으로 바뀌면 코스·시간·금액도 다시 확인합니다.`,
  (name) => `${name} 커플·부부 프로그램은 전화상담에서 두 명의 이용 조건을 확인한 뒤 선택합니다.`,
  (name) => `${name} 두 명이 다른 코스를 고를 때는 각 가격 행을 따로 보고 전체 금액을 확인합니다.`,
] as const;

const HYGIENE_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 이용에는 일회용 비품을 사용하며 관리 전후 소독 기준을 적용합니다.`,
  (name) => `${name} 전화상담에서 코스와 함께 일회용 비품 사용 및 소독 운영 기준을 확인할 수 있습니다.`,
  (name) => `${name} 안내의 위생 기준은 일회용 비품과 관리 전·후 소독 두 항목으로 확인합니다.`,
  (name) => `${name} 이용 전에는 준비되는 일회용 비품과 소독 운영 내용을 전화로 물을 수 있습니다.`,
  (name) => `${name} 코스를 고를 때 가격과 별도로 일회용 비품 및 소독 기준도 함께 확인합니다.`,
  (name) => `${name} 관리 전과 마친 뒤에는 소독 절차를 적용하고 비품은 일회용으로 운영합니다.`,
  (name) => `${name} 첫 문의라면 주소·일정과 함께 일회용 비품, 관리 전후 소독 기준을 확인하세요.`,
  (name) => `${name} 이용 준비 항목에는 코스뿐 아니라 일회용 비품 사용과 소독 기준도 포함됩니다.`,
  (name) => `${name} 위생 관련 문의는 일회용 비품 사용 여부와 관리 전후 소독 순서로 나눠 확인합니다.`,
  (name) => `${name} 전화 전에 위생 운영을 확인하려면 일회용 비품과 소독 두 항목을 메모해 두세요.`,
  (name) => `${name} 현장 이용 기준에는 일회용 비품 제공과 관리 전·후 소독 운영이 포함됩니다.`,
  (name) => `${name} 코스 진행 전 위생 기준이 궁금하면 비품 사용과 소독 내용을 상담에서 확인합니다.`,
  (name) => `${name} 이용 안내는 일회용 비품을 사용하고 관리 전후에 소독하는 운영 기준을 따릅니다.`,
] as const;

const LEAF_SCOPE: readonly RegionSentence[] = [
  (name) => `${name} 다음에는 별도 지역 카드가 없으며 도로명과 건물명은 전화에서 확인합니다.`,
  (name) => `${name} 안내 다음에는 실제 받을 도로명 주소를 준비해 상담합니다.`,
  (name) => `${name} 지역 선택을 마쳤다면 건물 번호와 건물명을 별도로 대조합니다.`,
  (name) => `${name} 페이지에서는 더 세분된 지역 대신 실제 주소를 전화로 전달합니다.`,
  (name) => `${name}까지 찾은 뒤 공동주택·숙소 등 장소 종류와 건물명을 확인합니다.`,
  (name) => `${name} 아래 별도 목록은 없으며 일정 확인에는 도로명 주소가 필요합니다.`,
  (name) => `${name} 지역을 선택한 다음 상세 위치는 공개 입력창이 아닌 전화에서 알립니다.`,
  (name) => `${name} 화면은 지역 단계 확인용이며 특정 건물의 가능 여부를 확정하지 않습니다.`,
  (name) => `${name}에서 받을 장소의 도로명과 건물 번호를 확인한 뒤 문의합니다.`,
  (name) => `${name} 지역명만 말하지 않고 방문할 건물의 실제 주소를 함께 준비합니다.`,
  (name) => `${name} 안내를 열었다면 날짜·시각보다 먼저 받을 주소를 대조합니다.`,
  (name) => `${name}에는 하위 선택 카드가 없어 건물명과 출입 내용을 전화로 확인합니다.`,
  (name) => `${name} 주소 단계 이후 필요한 정보는 도로명, 건물명, 희망 일정입니다.`,
] as const;

function pick<T>(values: readonly T[], ordinal: number, offset = 0): T {
  return values[(ordinal * 7 + offset * 5) % values.length];
}

function stableNodeIndex(node: RegionNode, salt: number, length: number): number {
  let hash = 2166136261;
  const input = `${node.path}\u001f${salt}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

function regionSentence(values: readonly RegionSentence[], node: RegionNode, salt: number): string {
  return values[stableNodeIndex(node, salt, values.length)](node.qualifiedName);
}

function regionSentenceOffset(
  values: readonly RegionSentence[],
  node: RegionNode,
  salt: number,
  offset: number,
): string {
  const index = (stableNodeIndex(node, salt, values.length) + offset) % values.length;
  return values[index](node.qualifiedName);
}

function metadataScope(node: RegionNode): string {
  const children = getDirectChildren(node);
  if (children.length > 0) {
    const examples = children.slice(0, 2).map((child) => child.name).join("·");
    return children.length > 2
      ? `하위 안내 ${children.length}개가 연결되며 ${examples} 등을 찾을 수 있습니다.`
      : `하위 안내 ${children.length}개가 연결되며 ${examples} 경로로 이어집니다.`;
  }
  const sourceNames = node.representative?.sourceNames ?? [];
  if (sourceNames.length > 1) {
    return `${sourceNames.slice(0, 3).join("·")} 명칭도 같은 지역 안내에서 찾을 수 있습니다.`;
  }
  const parent = getParentNode(node);
  return parent
    ? `${parent.qualifiedName}에서 이어지는 세부 지역입니다.`
    : "가능 여부는 실제 주소와 희망 시각을 전화로 전달한 뒤 확인합니다.";
}

function hookScope(node: RegionNode): string {
  const children = getDirectChildren(node);
  if (children.length > 0) {
    const names = children.slice(0, 3).map((child) => child.name).join("·");
    return `${names}${children.length > 3 ? " 등" : ""} ${children.length}개 다음 주소 단계가 연결되어 있습니다.`;
  }
  const sources = node.representative?.sourceNames ?? [];
  if (sources.length > 1) return `${sources.slice(0, 3).join("·")} 명칭을 같은 안내에서 함께 찾을 수 있습니다.`;
  const parent = getParentNode(node);
  return parent
    ? `${parent.qualifiedName} 아래에서 ${node.displayName} 페이지로 연결됩니다.`
    : "상세 장소와 가능한 시간은 전화상담에서 확인합니다.";
}

function localScope(node: RegionNode): string {
  const children = getDirectChildren(node);
  if (children.length > 0) {
    const examples = children.slice(0, 4).map((child) => child.name).join("·");
    return `${node.qualifiedName}에서 이어지는 하위 지역은 ${children.length}개입니다${examples ? `: ${examples}${children.length > 4 ? " 외" : ""}` : ""}.`;
  }
  const sources = node.representative?.sourceNames ?? [];
  if (sources.length > 1) {
    return `${node.qualifiedName} 안내에서는 ${sources.slice(0, 4).join("·")} 명칭도 같은 지역으로 검색됩니다.`;
  }
  return regionSentence(LEAF_SCOPE, node, 390);
}

function addressHierarchyScope(node: RegionNode): string {
  const parent = getParentNode(node);
  if (!parent) {
    return `주소 확인 순서: ${node.qualifiedName}. 이후 도로명과 건물명을 전화로 전달합니다.`;
  }
  return `주소 확인 순서: ${parent.qualifiedName} → ${node.qualifiedName}. 선택한 단계와 실제 도로명 주소가 맞는지 대조합니다.`;
}

function localNameScope(node: RegionNode): string {
  const children = getDirectChildren(node);
  if (children.length > 0) {
    const names = children.slice(0, 4).map((child) => child.name).join("·");
    return `다음 주소 항목 ${children.length}개: ${names}${children.length > 4 ? " 외" : ""}. ${regionSentenceOffset(ADDRESS_FIRST, node, 390, 0)}`;
  }
  const sourceNames = node.representative?.sourceNames ?? [];
  if (sourceNames.length > 1) {
    return `주소에 표시될 수 있는 명칭: ${sourceNames.slice(0, 5).join("·")}. ${regionSentenceOffset(ADDRESS_FIRST, node, 390, 0)}`;
  }
  return `현재 주소 단계: ${node.qualifiedName}. ${regionSentence(LEAF_SCOPE, node, 393)}`;
}

function sameParentScope(node: RegionNode): string {
  const parent = getParentNode(node);
  if (!parent) return `현재 선택한 주소 단계는 ${node.qualifiedName}입니다.`;
  const siblings = getDirectChildren(parent).filter((child) => child.path !== node.path);
  if (siblings.length === 0) {
    return `현재 선택: ${node.qualifiedName}. 상위 주소 ${parent.qualifiedName} 아래에서 확인했습니다. ${regionSentenceOffset(ADDRESS_FIRST, node, 390, 1)}`;
  }
  const names = siblings.slice(0, 4).map((child) => child.name).join("·");
  return `현재 선택: ${node.qualifiedName}. 상위 주소 ${parent.qualifiedName}의 다른 항목: ${names}${siblings.length > 4 ? " 외" : ""}. ${regionSentenceOffset(ADDRESS_FIRST, node, 390, 1)}`;
}

function section(id: string, heading: string, first: string, second: string): ContentSection {
  return { id, heading, paragraphs: [first, second] };
}

function compactSections(node: RegionNode): ContentSection[] {
  const name = node.qualifiedName;
  return [
    section("local-boundary", `${name} 주소 명칭과 다음 단계`, localScope(node), localNameScope(node)),
    section("address-hierarchy", `${name} 상위 주소와 상세 주소`, addressHierarchyScope(node), `상세 주소 메모: ${regionSentenceOffset(ADDRESS_FIRST, node, 390, 2)}`),
    section("same-parent-regions", `${name} 같은 상위 주소의 다른 항목`, sameParentScope(node), `주소가 다를 때: ${regionSentenceOffset(ADDRESS_FIRST, node, 390, 3)}`),
    section("call-preparation", `${name} 전화에 전달할 내용`, `통화 첫 항목: ${regionSentenceOffset(REQUEST_FIRST, node, 403, 0)}`, `통화 확인 항목: ${regionSentenceOffset(REQUEST_FIRST, node, 403, 1)}`),
    section("schedule-check", `${name} 날짜와 시작 시각 확인`, `희망 일정 메모: ${regionSentenceOffset(SCHEDULE_FIRST, node, 405, 0)}`, `일정 재확인: ${regionSentenceOffset(SCHEDULE_FIRST, node, 405, 1)}`),
    section("course-selection", `${name} 코스와 이용 시간 선택`, `코스 후보: ${regionSentenceOffset(COURSE_FIRST, node, 407, 0)}`, `시간 항목: ${regionSentenceOffset(COURSE_FIRST, node, 407, 1)}`),
    section("two-person-program", `${name} 2인 프로그램 문의`, `두 사람 이용 항목: ${regionSentenceOffset(PAIR_FIRST, node, 409, 0)}`, `2인 금액 확인: ${regionSentenceOffset(PAIR_FIRST, node, 409, 1)}`),
    section("payment-method", `${name} 후불과 카드 결제`, `후불 기준: ${regionSentenceOffset(PAYMENT_FIRST, node, 411, 0)}`, `카드 확인: ${regionSentenceOffset(PAYMENT_FIRST, node, 411, 1)}`),
    section("hygiene-reference", `${name} 비품과 소독 기준`, `비품 기준: ${regionSentenceOffset(HYGIENE_FIRST, node, 413, 0)}`, `소독 기준: ${regionSentenceOffset(HYGIENE_FIRST, node, 413, 1)}`),
    section("first-contact-flow", `${name} 첫 문의 진행 순서`, `첫 문의: ${regionSentenceOffset(PROCESS_FIRST, node, 415, 0)}`, `이용 순서: ${regionSentenceOffset(PROCESS_FIRST, node, 415, 1)}`),
    section("change-recheck", `${name} 주소·일정 변경 확인`, `변경 전달: ${regionSentenceOffset(CONFIRM_FIRST, node, 417, 0)}`, `통화 마무리: ${regionSentenceOffset(CONFIRM_FIRST, node, 417, 1)}`),
  ];
}

function broadSections(node: RegionNode): ContentSection[] {
  const name = node.qualifiedName;
  const children = getDirectChildren(node);
  const childNames = children.slice(0, 5).map((child) => child.name).join("·");
  const parent = getParentNode(node);
  const relation = parent ? `${parent.qualifiedName} 안의 ${node.displayName}` : `${node.displayName} 시작 권역`;
  const childScope = children.length > 0
    ? `${name} 아래 ${children.length}개 지역 중 실제 주소와 맞는 다음 단계를 고릅니다.`
    : `${name}에는 별도 하위 카드가 없어 도로명과 건물명을 통화에서 바로 확인합니다.`;
  const firstStep = children.length > 0
    ? `${name} 아래 ${children.length}개 지역에서 실제 주소와 맞는 단계를 먼저 고릅니다.`
    : `${name} 페이지에서 도로명과 건물명을 먼저 확인합니다.`;
  return [
    section(
      "child-region-directory",
      `${name} 하위 지역 안내`,
      localScope(node),
      children.length > 0
        ? `${childNames}${children.length > 5 ? " 외" : ""} 가운데 실제 받을 주소와 맞는 다음 지역을 선택합니다.`
        : `${name} 상세 주소는 도로명과 건물명까지 통화에서 확인합니다.`,
    ),
    section(
      "service-address",
      `${name} 서비스 주소 범위`,
      `${name} 페이지는 받을 주소를 좁히는 안내이며 이 화면만으로 특정 장소의 이용 가능을 확정하지 않습니다.`,
      `${relation}인지 확인한 뒤 도로명·건물명과 희망 날짜·시각을 전화로 전달합니다.`,
    ),
    section(
      "operating-outline",
      `${name} 출장마사지 이용 개요`,
      `${name} 문의는 365일 24시간 전화 창구에서 주소, 일정, 인원, 코스 순서로 확인합니다.`,
      `${childScope} 일정이 확인되면 이용하고 비용은 마친 장소에서 후불로 처리합니다.`,
    ),
    section(
      "time-course-table",
      `${name} 시간대와 코스 확인`,
      `${name}의 시작 가능 시각은 고정표가 없으므로 상세 주소와 희망 시간 범위를 알린 뒤 묻습니다.`,
      `${name} 가격표에서 일반 네 코스는 60분·90분·120분, 남성전용은 60분·90분 항목을 확인합니다.`,
    ),
    section(
      "program-options",
      `${name} 이용 가능 프로그램 확인`,
      `${name} 문의 전에 타이·아로마·힐링·스페셜·남성전용 중 후보 코스의 시간과 금액을 대조합니다.`,
      `${name}에서 커플·부부 2인 동시 프로그램을 원하면 주소와 일정, 두 명의 이용 항목을 전화로 확인합니다.`,
    ),
    section(
      "first-use-guide",
      `${name} 처음 이용 순서`,
      `처음 문의한다면 ${firstStep} 이어서 날짜·시각·인원·코스를 적습니다.`,
      `${name} 주소로 가능한 일정과 선택 금액을 전화에서 맞춘 뒤 이용하며 별도 선입금은 없습니다.`,
    ),
    section(
      "pre-call-checklist",
      `${name} 예약 전 확인사항`,
      `${name} 상담 메모에는 받을 주소, 가능한 시간 범위, 이용 인원, 코스명과 이용 시간을 나눠 적습니다.`,
      `${name} 안의 공동주택이나 숙소라면 건물명과 필요한 출입 안내를 도로명 주소 다음에 전달합니다.`,
    ),
    section(
      "payment-reference",
      `${name} 이용 시 결제 참고`,
      `${name} 이용에는 예약금과 선결제가 없으며 마친 뒤 현금 또는 현장용 무선 카드 단말기로 정산합니다.`,
      `${name} 가격표에 없는 시간이나 코스 조합은 따로 계산하지 말고 상담에서 금액을 확인합니다.`,
    ),
    section(
      "change-confirmation",
      `${name} 일정 변경과 재확인`,
      `${name} 문의 뒤 주소·시각·인원·코스가 바뀌면 변경 항목을 전화로 알리고 일정을 다시 확인합니다.`,
      parent
        ? `상위 권역 ${parent.qualifiedName}, 지역명 ${node.displayName} 표기를 함께 대조하면 같은 이름의 다른 지역과 혼동을 줄일 수 있습니다.`
        : `${name} 안에서도 같은 건물명이 있을 수 있으므로 도로명과 건물 번호를 함께 확인합니다.`,
    ),
  ];
}

export function createRegionContent(node: RegionNode): RegionContent {
  const ordinal = getRegionOrdinal(node);
  const keywordLabel = getKeywordRegionLabel(node);
  const fullName = node.qualifiedName;
  const broad = isBroadDetailRegion(node);
  const description = DESCRIPTION_PATTERNS[stableNodeIndex(node, 101, DESCRIPTION_PATTERNS.length)](
    fullName,
    metadataScope(node),
  );
  const secondHook = SECOND_HOOK_PATTERNS[stableNodeIndex(node, 211, SECOND_HOOK_PATTERNS.length)](
    fullName,
    hookScope(node),
  );

  return {
    title: pick(TITLE_PATTERNS, ordinal)(fullName, keywordLabel),
    description,
    keywords: REGION_KEYWORD_SUFFIXES.map((suffix) => `${keywordLabel}${suffix}`),
    h1: pick(H1_PATTERNS, ordinal, 1)(fullName),
    eyebrow: "HONHYEOL · LOCAL ADDRESS",
    hooks: [pick(INTRO_PATTERNS, ordinal, 2)(fullName), secondHook],
    sections: broad ? broadSections(node) : compactSections(node),
    ctaLabels: [
      "전화로 일정 확인",
      "코스·금액표",
      node.kind === "representative" ? "이전 지역으로" : "다음 주소 선택",
    ],
    detailMode: broad ? "broad" : "compact",
  };
}
