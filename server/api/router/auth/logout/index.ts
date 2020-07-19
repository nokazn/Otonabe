import { Request, Response } from 'express';

type RequestParams = {}

type ResponseBody = {}

export const logout = (req: Request<RequestParams>, res: Response<ResponseBody>) => {
  if (req.session == null) {
    return res.status(204);
  }

  return req.session.destroy((err: Error) => {
    if (err != null) {
      console.error({ err });
      return res.send(400);
    }

    return res.status(204);
  });
};
