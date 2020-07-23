import { Getters } from 'typed-vuex';

import { PlayerState } from './state';
import { REPEAT_STATE_LIST } from '~/variables';
import { getImageSrc } from '~/scripts/converter/getImageSrc';
import { convertTrackForQueue } from '~/scripts/converter/convertTrackForQueue';
import { convertUriToId } from '~/scripts/converter/convertUriToId';
import { SpotifyAPI, App, ZeroToHundred } from '~~/types';

export type PlayerGetters = {
  isPlayerConnected: boolean
  activeDevice: SpotifyAPI.Device | undefined
  isThisAppPlaying: boolean
  trackQueue: App.TrackQueueInfo[]
  releaseId: string | undefined
  artworkSrc: (minSize?: number) => string | undefined
  hasTrack: boolean
  isTrackSet: (trackId: string) => boolean
  contextUri: string | undefined
  isContextSet: (uri: string | undefined) => boolean
  remainingTimeMs: number
  repeatState: SpotifyAPI.RepeatState | undefined
  isDisallowed: (disallow: keyof SpotifyAPI.Disallows) => boolean
  volumePercent: ZeroToHundred
}

export type RootGetters = {
  ['player/isPlayerConnected']: PlayerGetters['isPlayerConnected']
  ['player/activeDevice']: PlayerGetters['activeDevice']
  ['player/isThisAppPlaying']: PlayerGetters['isThisAppPlaying']
  ['player/trackQueue']: PlayerGetters['trackQueue']
  ['player/releaseId']: PlayerGetters['releaseId']
  ['player/artworkSrc']: PlayerGetters['artworkSrc']
  ['player/hasTrack']: PlayerGetters['hasTrack']
  ['player/isTrackSet']: PlayerGetters['isTrackSet']
  ['player/contextUri']: PlayerGetters['contextUri']
  ['player/isContextSet']: PlayerGetters['isContextSet']
  ['player/remainingTimeMs']: PlayerGetters['remainingTimeMs']
  ['player/repeatState']: PlayerGetters['repeatState']
  ['player/isDisallowed']: PlayerGetters['isDisallowed']
  ['player/volumePercent']: PlayerGetters['volumePercent']
}

const playerGetters: Getters<PlayerState, PlayerGetters> = {
  isPlayerConnected(state) {
    return state.playbackPlayer != null;
  },

  activeDevice(state) {
    const activeDevice = state.deviceList?.find((device) => device.is_active);
    return activeDevice != null
      ? activeDevice
      : undefined;
  },

  isThisAppPlaying(state, getters) {
    return getters.activeDevice?.id === state.deviceId;
  },

  trackQueue(state, getters) {
    if (!getters.hasTrack) return [];

    // hasTrack が true の場合 trackId, trackName, trackUri, releaseName, releaseUri, artistList は存在
    const currentTrack = {
      isSet: true,
      isPlaying: state.isPlaying,
      index: 0,
      id: state.trackId,
      name: state.trackName!,
      uri: state.trackUri!,
      releaseId: getters.releaseId!,
      releaseName: state.releaseName!,
      artistList: state.artistList!,
      artworkList: state.artworkList ?? [],
      durationMs: state.durationMs,
    };

    const prevLength = Math.min(state.previousTrackList.length, 2);
    // 前後2曲まで含める
    const previousTrackList = state.previousTrackList
      .slice(0, 2)
      .map(convertTrackForQueue({
        isSet: false,
        isPlaying: false,
        offset: -1 * prevLength,
      }));

    const nextTrackList = state.nextTrackList
      .slice(0, 2)
      .map(convertTrackForQueue({
        isSet: false,
        isPlaying: false,
        offset: 1,
      }));

    return [
      ...previousTrackList,
      currentTrack,
      ...nextTrackList,
    ];
  },

  releaseId(state) {
    // 最後の ":" 以降を取り出す
    return state.releaseUri != null
      ? convertUriToId(state.releaseUri)
      : undefined;
  },

  artworkSrc(state) {
    return (minSize?: number) => getImageSrc(state.artworkList, minSize);
  },

  hasTrack(state) {
    return state.trackId != null
      && state.trackName != null
      && state.trackUri != null
      && state.releaseName != null
      && state.releaseUri != null
      && state.artistList != null;
  },

  isTrackSet(state) {
    // id を指定
    return (trackId) => state.trackId === trackId;
  },

  contextUri(state) {
    return state.contextUri ?? state.customContextUri;
  },

  /**
   * uri を指定
   * アーティストページのトラックリストやコレクションから再生すると customContextUri に uri が保持される
   */
  isContextSet(_, getters) {
    return (uri) => uri != null && (getters.contextUri === uri);
  },

  isDisallowed(state) {
    return (disallow) => !!state.disallows[disallow];
  },

  remainingTimeMs(state) {
    return Math.max(state.durationMs - state.positionMs, 0);
  },

  repeatState(state) {
    return state.repeatMode != null
      ? REPEAT_STATE_LIST[state.repeatMode]
      : undefined;
  },

  volumePercent(state) {
    return state.isMuted ? 0 : state.volumePercent;
  },
};

export default playerGetters;
