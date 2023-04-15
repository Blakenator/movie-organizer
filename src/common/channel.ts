import {
  PlexFile,
  PlexMovieMetadata,
  RenameReport,
  TransformedPaths,
} from './types';

export enum Channel {
  OpenDb = 'OPEN_DB',
  LoadMovies = 'LOAD_MOVIES',
  RenameMovies = 'RENAME_MOVIES',
  RestoreAddedAt = 'RESTORE_ADDED_AT',
  ShowFolder = 'SHOW_FOLDER',
  GetAllFilesInFolder = 'GET_ALL_FILES_IN_FOLDER',
}

export interface ChannelTypes {
  [Channel.OpenDb]: [[string], void];
  [Channel.LoadMovies]: [[], PlexFile<PlexMovieMetadata>[]];
  [Channel.RenameMovies]: [[TransformedPaths[]], RenameReport];
  [Channel.RestoreAddedAt]: [[string[]], boolean];
  [Channel.ShowFolder]: [[string], void];
  [Channel.GetAllFilesInFolder]: [[string], string[]];
}
