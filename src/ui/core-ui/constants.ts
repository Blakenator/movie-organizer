import {
  createUseBackendMutationSyncHook,
  createUseBackendSyncHook,
} from '@superflag/super-ipc-react';
import { BackendPromiseApi, Channel } from '../../common/channel';

export const useBackend = createUseBackendSyncHook<
  Channel,
  BackendPromiseApi
>();

export const useBackendMutation = createUseBackendMutationSyncHook<
  Channel,
  BackendPromiseApi
>();
