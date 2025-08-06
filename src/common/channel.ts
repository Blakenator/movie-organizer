import {
  PlexFile,
  PlexMovieMetadata,
  RenameReport,
  TransformedPaths,
  TvDbEntry,
  TvDbShow,
} from './types';
import { BackendSyncApiType } from '@superflag/super-ipc-core';

export enum Channel {
  OpenDb = 'OPEN_DB',
  LoadMovies = 'LOAD_MOVIES',
  RenameMovies = 'RENAME_MOVIES',
  RestoreAddedAt = 'RESTORE_ADDED_AT',
  ShowFolder = 'SHOW_FOLDER',
  LoadTvDbEpisodes = 'LOAD_TV_DB_EPISODES',
  SearchTvDb = 'SEARCH_TV_DB',
}

export interface ChannelTypes {
  [Channel.OpenDb]: [[string], void];
  [Channel.LoadMovies]: [[], PlexFile<PlexMovieMetadata>[]];
  [Channel.RenameMovies]: [[TransformedPaths[]], RenameReport];
  [Channel.RestoreAddedAt]: [[string[]], boolean];
  [Channel.ShowFolder]: [[string], void];
  [Channel.LoadTvDbEpisodes]: [[string], TvDbEntry[]];
  [Channel.SearchTvDb]: [[string], TvDbShow[]];
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
  [Channel.LoadTvDbEpisodes]: { props: { slug: string }; result: TvDbEntry[] };
  [Channel.SearchTvDb]: { props: { searchText: string }; result: TvDbShow[] };
}
