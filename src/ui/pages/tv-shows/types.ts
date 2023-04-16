export interface FileObject {
  relativePath: string;
  path: string;
  filename: string;
}

export interface ParsedTvMetadata {
  tag: string;
  name: string;
  episodeNumber?: number;
  seasonNumber?: number;
}

export type ProcessedMatch = {
  episode: ParsedTvMetadata;
  file: FileObject;
  distance: number;
  rawDistance: number;
  prevNormFilename: string;
  newFilename: string;
  newFolderName: string;
  tagChanged: boolean;
};

export interface RenameSettings {
  replaceInEpisodes?: string;
  fileTemplate?: string;
  folderTemplate?: string;
}
