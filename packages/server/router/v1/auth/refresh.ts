import { FastifyRequest, FastifyReply, FastifySchema } from 'fastify';
import httpStatusCodes from 'http-status-codes';

import type { paths, JSONResponseOf } from 'shared/types';
import { TOKEN_EXPIRE_IN } from '@/config/constants';
import { refreshAccessToken, upsertToken } from '@/helper';

type Path = paths['/auth/refresh']['put'];
type Request = FastifyRequest<{ Body: Path['requestBody']['content']['application/json'] }>;
type ResponseBody = JSONResponseOf<Path>;

const {
  BAD_REQUEST,
  UNAUTHORIZED,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
} = httpStatusCodes;

const handler = async (req: Request, rep: FastifyReply): Promise<ResponseBody> => {
  const { accessToken: accessTokenInReq, authState } = req.body;
  const { refreshToken } = req.session;
  // リフレッシュトークンが存在しない場合
  // TODO: 再度トークンリクエストできない？
  if (accessTokenInReq == null || authState == null || refreshToken == null) {
    const code = 'BAD_REQUEST';
    const message = 'Fail to update an token because of an incorrect accessToken or authState.';
    req.log.warn(code, message, {
      session: req.session,
      body: req.body,
    });
    rep.code(BAD_REQUEST);
    return {
      code,
      message,
      authState: null,
      accessToken: null,
      expireIn: 0,
    };
  }

  const tokenInSession = req.session.tokens?.[authState];
  if (tokenInSession == null) {
    const code = 'UNAUTHORIZED';
    const message = 'Fail to update an token because of no corresponding session.';
    req.log.error(code, message, {
      session: req.session,
      body: req.body,
    });
    rep.code(UNAUTHORIZED);
    return {
      code,
      message,
      authState: null,
      accessToken: null,
      expireIn: 0,
    };
  }

  // TODO:
  // 現在のトークンが一致しない場合は更新済のトークンを返す
  if (accessTokenInReq !== tokenInSession?.access_token) {
    const code = 'CONFLICT';
    const message = 'Fail to update an token because of conflicting.';
    req.log.warn(code, message, {
      session: req.session,
      body: req.body,
    });
    rep.code(CONFLICT);
    return {
      code,
      message,
      authState,
      accessToken: tokenInSession?.access_token,
      expireIn: 0,
    };
  }

  const token = await refreshAccessToken(refreshToken);
  if (token == null) {
    const code = 'INTERNAL_SERVER_ERROR';
    const message = 'Fail to update an access token.';
    req.log.error(code, message, {
      session: req.session,
      body: req.body,
      token,
    });
    rep.code(INTERNAL_SERVER_ERROR);
    return {
      code,
      message,
      authState,
      accessToken: null,
      expireIn: 0,
    };
  }

  upsertToken(req, token, { authState });

  return {
    code: 'OK',
    message: 'Update an access token.',
    authState,
    accessToken: token.access_token,
    expireIn: TOKEN_EXPIRE_IN,
  };
};

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['accessToken', 'authState'],
    properties: {
      accessToken: {
        type: 'string',
      },
      authState: {
        type: 'string',
      },
    },
  },
};

export const refresh = {
  handler,
  schema,
};
