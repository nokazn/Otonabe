import { Actions } from 'vuex';
import { AuthState } from './state';
import { AuthGetters } from './getters';
import { AuthMutations } from './mutations';
import { SpotifyAPI } from '~~/types';

export type AuthActions = {
  login: () => Promise<void>
  exchangeCodeToAccessToken: (code: string) => Promise<void>
  getUserData: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  logout: () => void
}

export type RootActions = {
  'auth/login': AuthActions['login']
  'auth/exchangeCodeToAccessToken': AuthActions['exchangeCodeToAccessToken']
  'auth/getUserData': AuthActions['getUserData']
  'auth/refreshAccessToken': AuthActions['refreshAccessToken']
  'auth/logout': AuthActions['logout']
}

const actions: Actions<AuthState, AuthActions, AuthGetters, AuthMutations> = {
  async login({ commit, dispatch }) {
    const data: SpotifyAPI.Auth.AuthorizationResponse<'accessToken' | 'url'> | null = await this.$serverApi.$get(
      '/api/auth',
    ).catch((err: Error) => {
      console.error({ err });
      return null;
    });
    if (data == null) {
      throw new Error('ログイン時にエラーが発生しました。');
    }

    if (data.accessToken != null) {
      commit('SET_TOKEN', data.accessToken);
      await dispatch('getUserData');
      // @todo
      this.$router.push('/');
      return;
    } if (data.url != null) {
      window.location.href = data.url;
      return;
    }

    console.error('トークン取得時にエラーが発生しました。');
  },

  async exchangeCodeToAccessToken({ commit }, code): Promise<void> {
    const accessToken: SpotifyAPI.Auth.TokenResponseData['access_token'] = await this.$serverApi.$post(
      '/api/auth/login/callback',
      { code },
    ).catch((err: Error) => {
      console.error({ err });
      return null;
    });

    commit('SET_TOKEN', accessToken);
  },

  async getUserData({ state, commit }): Promise<void> {
    if (state.accessToken == null) return;

    const userData = await this.$spotify.user.getCurrentUserProfile();

    commit('SET_USER_DATA', userData);
  },

  async refreshAccessToken({ commit }) {
    const accessToken: SpotifyAPI.Auth.TokenResponseData['access_token'] | null = await this.$serverApi.$get(
      '/api/auth/refresh',
    ).catch((err: Error) => {
      console.error(err);
      return null;
    });

    commit('SET_TOKEN', accessToken);
  },

  logout({ commit, dispatch }) {
    dispatch('player/disconnectPlayer', undefined, { root: true });
    commit('SET_TOKEN', null);
    commit('SET_USER_DATA', null);
  },
};

export default actions;
