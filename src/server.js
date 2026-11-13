import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3000;
createApp().listen(PORT, () => {
  console.log(`LinkSnip listening on http://localhost:${PORT}`);
});