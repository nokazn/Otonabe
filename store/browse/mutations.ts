/* eslint-disable no-param-reassign */
import { Mutations } from 'vuex';
import { BrowseState } from './state';
import { Spotify } from '@/types';

export type BrowseMutations = {
  setNewReleases: Spotify.NewReleases | null
}

export type RootMutations = {
  'browse/setNewReleases': BrowseMutations['setNewReleases']
}

const mutations: Mutations<BrowseState, BrowseMutations> = {
  setNewReleases(state, newReleases) {
    state.newReleases = newReleases;
  },
};

export default mutations;
