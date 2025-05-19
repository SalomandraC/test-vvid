
import 'dotenv/config'
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { getContestants } from './api/contestants';
import { getPreviewData, updatePreviewData } from './api/previewData';
import { getImportantData, updateImportantData } from './api/importantData';
import { getCurrentPlace, updateCurrentPlace } from './api/currentPlace';

const app: Application = express();

// Правильная настройка CORS
app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем любой origin при разработке
    if (!origin || origin === 'http://localhost:3000' || origin === 'https://f4x1pn2ft.localto.net ') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'localtonet-skip-warning'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Обработка preflight-запросов
app.options('*', cors());

// Middleware
app.use(express.json());
// Роуты
app.get('/contestants', (req: Request, res: Response) => getContestants(req, res));
app.get('/previewData', async (req, res) => {
  await getPreviewData(req, res);
});
app.patch('/previewData', async (req, res) => {
  await updatePreviewData(req, res);
});
app.get('/importantData', async (req, res) => {
  await getImportantData(req, res);
});
app.patch('/importantData', async (req, res) => {
  await updateImportantData(req, res);
});
app.get('/currentPlace', async (req, res) => {
  await getCurrentPlace(req, res);
});
app.patch('/currentPlace', async (req, res) => {
  await updateCurrentPlace(req, res);
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
