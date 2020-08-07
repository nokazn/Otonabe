import { Getters } from 'typed-vuex';

import { PlaylistsState } from './state';
import { SpotifyAPI } from '~~/types';

export type PlaylistsGetters = {
  ownPlaylists: SpotifyAPI.SimplePlaylist[]
  playlistCounts: number
}

export type RootGetters = {
  'playlists/ownPlaylists': PlaylistsGetters['ownPlaylists']
  'playlists/playlistCounts': PlaylistsGetters['playlistCounts']
}

const getters: Getters<PlaylistsState, PlaylistsGetters> = {
  ownPlaylists(state, _g, _s, RootGetters) {
    const userId = RootGetters['auth/userId'];

    return state.playlists
      ?.filter((playlist) => playlist.owner.id === userId || playlist.collaborative) ?? [];
  },

  playlistCounts(state) {
    return state.playlists?.length ?? 0;
  },
};

export default getters;
