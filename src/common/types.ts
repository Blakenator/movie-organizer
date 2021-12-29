export interface PlexFile<METADATA> {
  metadata: METADATA;
  library: string;
  libraryPath: string;
  filepaths: string[];
  id: string;
}

export interface PlexMovieMetadata {
  title: string;
  coverPhotoUrl?: string;
  airDate: string;
  resolution: string;
}

export interface TransformedPaths {
  id: string;
  oldPaths: string[];
  newPaths: string[];
  changed: boolean;
}
export interface RenameReportItem {
  value: string;
  message: string;
}

export interface RenameReport {
  renamedIds: RenameReportItem[];
  skippedIds: RenameReportItem[];
  skippedPaths: RenameReportItem[];
  skippedCleanupPaths: RenameReportItem[];
}
