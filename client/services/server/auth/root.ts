import type { Context } from '@nuxt/types';
import type { AxiosError } from 'axios';
import type { paths, ValueOf } from 'shared/types';

type Path = paths['/auth']['get']
type Response = ValueOf<Path['responses']>['content']['application/json'];

export const root = (context: Context) => {
  const { app } = context;

  return (): Promise<Response> => {
    return app.$serverApi.$get<Response>('/auth')
      .catch((err: AxiosError<Response>) => {
        console.error({ err });
        return err.response?.data ?? {
          code: app.$constant.UNEXPECTED_ERROR_CODE,
          message: err.message,
          authState: null,
          accessToken: null,
          authenticated: false,
          expireIn: 0,
        };
      });
  };
};
