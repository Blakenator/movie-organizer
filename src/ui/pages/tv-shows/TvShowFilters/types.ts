export enum PerfectMatchFilterState {
  OnlyRenames = 'ONLY_RENAMES',
  NoPerfectMatches = 'NO_PERFECT_MATCHES',
}
export interface TvShowFilterState {
  text?: string;
  maxDiffPercent?: number;
  minDiffPercent?: number;
  excludePerfectMatches?: PerfectMatchFilterState;
  onlyChangedTags?: boolean;
}
