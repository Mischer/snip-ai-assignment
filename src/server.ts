import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

// health-check
app.get('/healthz', (_req, res) => {
  res.json({status: 'ok'});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
