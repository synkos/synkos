// Module augmentation for Express. Loaded transitively by `@synkos/server`'s
// public entry, so any consumer that imports from this package picks up the
// extended Request shape automatically.

import 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /**
       * Raw JSON body captured by the framework body parser. Use this to
       * validate webhook HMAC signatures with `crypto.timingSafeEqual`.
       * Available on all routes.
       */
      rawBody?: Buffer;
    }
  }
}

export {};
