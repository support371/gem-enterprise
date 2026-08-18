export function governedCampaignTitle(
  planDate: Date | string,
  campaignKey?: string,
) {
  const date =
    planDate instanceof Date
      ? planDate.toISOString().slice(0, 10)
      : planDate.slice(0, 10);
  const normalizedKey = campaignKey?.trim();

  return normalizedKey
    ? `GEM Governed Campaign ${normalizedKey} ${date}`
    : `GEM Adaptive Content Plan ${date}`;
}
