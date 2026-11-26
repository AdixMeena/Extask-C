// Entry point. Vercel imports the exported app; locally and on Render/Railway we listen on a port.
import app from './app.js';
import { env } from './config/env.js';

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`ExTask API running on http://localhost:${env.PORT}`);
  });
}

export default app;
