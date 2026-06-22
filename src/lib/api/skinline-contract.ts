const SKINLINE_DETAIL_CONTRACT_VERSION = 2;

export function skinlineDetailPath(riotSkinlineId: number): string {
  return `/rest/lol/skinlines/${riotSkinlineId}?contractVersion=${SKINLINE_DETAIL_CONTRACT_VERSION}`;
}
