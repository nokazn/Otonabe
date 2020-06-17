/* eslint-disable no-param-reassign */
import { Mutations } from 'vuex';
import { AuthState } from './state';
import { SpotifyAPI } from '~~/types';

export type AuthMutations = {
  SET_TOKEN: SpotifyAPI.Auth.TokenResponseData['access_token'] | undefined,
  SET_EXPIRE_MILLIS: number | undefined
  SET_USER_DATA: SpotifyAPI.UserData |undefined
  SET_REFRESH_TOKEN_TIMER_ID: ReturnType<typeof setTimeout> | undefined
}

export type RootMutations = {
  ['auth/SET_TOKEN']: AuthMutations['SET_TOKEN']
  ['auth/SET_EXPIRE_MILLIS']: AuthMutations['SET_EXPIRE_MILLIS']
  ['auth/SET_USER_DATA']: AuthMutations['SET_USER_DATA']
  ['auth/SET_REFRESH_TOKEN_TIMER_ID']: AuthMutations['SET_REFRESH_TOKEN_TIMER_ID']
}

const mutations: Mutations<AuthState, AuthMutations> = {
  SET_TOKEN(state, token): void {
    state.accessToken = token;
  },

  SET_EXPIRE_MILLIS(state, expireMillis) {
    state.expireMillis = expireMillis != null
      ? Date.now() + expireMillis
      : undefined;
  },

  SET_USER_DATA(state, userData): void {
    state.userData = userData;
  },

  SET_REFRESH_TOKEN_TIMER_ID(state, timerId) {
    state.refreshTokenTimerId = timerId;
  },
};

export default mutations;
