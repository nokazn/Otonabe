import httpStatusCodes from 'http-status-codes';
import type { FastifyRequest, FastifyReply, FastifySchema } from 'fastify';

import type { paths, JSONResponseOf } from 'shared/types';
import { upsertToken, exchangeAccessToken } from '@/helper';
import { TOKEN_EXPIRE_IN } from '@/config/constants';

type Path = paths['/auth/login/callback']['get'];
type Request = FastifyRequest<{ Querystring: Path['parameters']['query'] }>;
type ResponseBody = JSONResponseOf<Path>;

const { BAD_REQUEST, UNAUTHORIZED } = httpStatusCodes;

export const handler = async (req: Request, rep: FastifyReply): Promise<ResponseBody> => {
  const { code: codeInQuery, state } = req.query;
  if (codeInQuery == null) {
    const code = 'BAD_REQUEST';
    const message = 'Code in query parameters is invalid.';
    req.log.error(message, {
      query: req.query,
      codeInQuery,
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

  const stateInSession = req.session.state;
  req.session.state = undefined;
  // 送られてきた state と、認可時に送信し cookie に埋め込んだ state を比較
  // TODO:
  if (state == null || state !== stateInSession) {
    const code = 'UNAUTHORIZED';
    const message = "CSRF state token doesn't match.";
    req.log.error(code, message, {
      query: req.query,
      session: req.session,
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

  // code と token を交換する
  const token = await exchangeAccessToken(codeInQuery);
  if (token == null) {
    const code = 'INTERNAL_SERVER_ERROR';
    const message = 'An error occurred when exchanging an access token with code.';
    req.log.error(code, message, {
      session: req.session,
      code,
      token,
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

  const authState = upsertToken(req, token, { refreshToken: token.refresh_token });
  return {
    code: 'OK',
    message: 'Logged in successfully.',
    authState,
    accessToken: token.access_token,
    expireIn: TOKEN_EXPIRE_IN,
  };
};

const schema: FastifySchema = {
  querystring: {
    type: 'object',
    required: ['code', 'state'],
    properties: {
      code: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
    },
  },
};

export const callback = {
  handler,
  schema,
};
