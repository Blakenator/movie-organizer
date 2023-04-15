export interface FileObject {
  relativePath: string;
  path: string;
  filename: string;
}

export interface ParsedTvMetadata {
  tag: string;
  name: string;
  episodeNumber?: string;
  seasonNumber?: string;
}

export type ProcessedMatch = {
  episode: ParsedTvMetadata;
  file: FileObject;
  distance: number;
  rawDistance: number;
  prevNormFilename: string;
  newFilename: string;
  newFolderName: string;
};
