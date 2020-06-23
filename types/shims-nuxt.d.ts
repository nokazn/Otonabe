import {
  RootState,
  RootGetters,
  SFCCommit,
  SFCDispatch,
  ExtendedSubscribe,
} from 'vuex';
import dayjs from 'dayjs';
import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Toast } from '~/plugins/toast';

import { SpotifyEndpoints } from '~/plugins/spotify/endpoints';

declare module '@nuxt/types/app' {

  interface NuxtAppOptions {
    $state: () => RootState
    $getters: () => RootGetters
    $commit: SFCCommit
    $dispatch: SFCDispatch
    $subscribe: ExtendedSubscribe
    $dayjs: typeof dayjs
    $spotifyApi: NuxtAxiosInstance
    $spotify: SpotifyEndpoints
    $serverApi: NuxtAxiosInstance
    $toast: Toast
  }
}

declare global {
  interface Window {
    onNuxtReady: (callback: () => void) => void;
  }
}
