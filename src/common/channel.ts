import {
  PlexFile,
  PlexMovieMetadata,
  RenameReport,
  TransformedPaths,
} from './types';
import { BackendSyncApiType } from '@superflag/super-ipc/common';

export enum Channel {
  OpenDb = 'OPEN_DB',
  LoadMovies = 'LOAD_MOVIES',
  RenameMovies = 'RENAME_MOVIES',
  RestoreAddedAt = 'RESTORE_ADDED_AT',
  ShowFolder = 'SHOW_FOLDER',
}

export interface ChannelTypes {
  [Channel.OpenDb]: [[string], void];
  [Channel.LoadMovies]: [[], PlexFile<PlexMovieMetadata>[]];
  [Channel.RenameMovies]: [[TransformedPaths[]], RenameReport];
  [Channel.RestoreAddedAt]: [[string[]], boolean];
  [Channel.ShowFolder]: [[string], void];
}

export interface BackendPromiseApi extends BackendSyncApiType<Channel> {
  [Channel.OpenDb]: { props: { path: string }; result: boolean };
  [Channel.LoadMovies]: { props: never; result: PlexFile<PlexMovieMetadata>[] };
  [Channel.RenameMovies]: {
    props: { transformedPaths: TransformedPaths[] };
    result: RenameReport;
  };
  [Channel.RestoreAddedAt]: { props: { ids: string[] }; result: boolean };
  [Channel.ShowFolder]: { props: { path: string }; result: void };
}
