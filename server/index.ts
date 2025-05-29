import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { addContestant, deleteAllContestants, getContestants } from './api/contestants';
import { getPreviewData, updatePreviewData } from './api/previewData';
import { getImportantData, updateImportantData } from './api/importantData';
import { getCurrentPlace, updateCurrentPlace } from './api/currentPlace';
import {
  getDirection,
  addDirection,
  updateDirection,
  deleteDirection
} from './api/direction';

import {
  getImportantDates,
  addImportantDate,
  updateImportantDate,
  deleteImportantDate,
  reorderImportantDates
} from './api/importantDates';
import { checkAuth, login, logout, register } from './api/registration';
import session from 'express-session';

const app: Application = express();

// Правильная настройка CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://f4x1pn2ft.localto.net',
  'http://d91098wj.beget.tech'
];

app.use(session({
  secret: '111', 
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
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

//___ImportantDates___
app.get('/importantDates', async (req, res) => {
  await getImportantDates(req, res);
});
app.post('/importantDates', async (req: Request, res: Response) => {
  await addImportantDate(req, res);
});
app.patch('/importantDates/:id', async (req: Request, res: Response) => {
  await updateImportantDate(req, res);
});
app.delete('/importantDates/:id', async (req: Request, res: Response) => {
  await deleteImportantDate(req, res);
});
app.patch('/importantDates/reorder', async (req: Request, res: Response) => {
  await reorderImportantDates(req, res);
});

//___Contestants___
app.get('/contestants', (req: Request, res: Response) => getContestants(req, res));
app.delete('/contestants', deleteAllContestants); 
app.post('/contestants', async (req: Request, res: Response) => {
  await addContestant(req, res);
}); 

//___previewData___
app.get('/previewData', async (req, res) => {
  await getPreviewData(req, res);
});
app.patch('/previewData', async (req, res) => {
  await updatePreviewData(req, res);
});

//___importantData___
app.get('/importantData', async (req, res) => {
  await getImportantData(req, res);
});
app.patch('/importantData', async (req, res) => {
  await updateImportantData(req, res);
});

//___currentPlace___
app.get('/currentPlace', async (req, res) => {
  await getCurrentPlace(req, res);
});
app.patch('/currentPlace', async (req, res) => {
  await updateCurrentPlace(req, res);
});

//___Directions___
app.get('/directions', async (req, res) => {
  await getDirection(req, res);
});
app.post('/directions', async (req, res) => {
  await addDirection(req, res);
});
app.patch('/directions/:id', async (req, res) => {
  await updateDirection(req, res);
});
app.delete('/directions/:id', async (req, res) => {
  await deleteDirection(req, res);
});

// Регистрация
app.post('/register', async (req, res) => {
  await register(req, res);
});
app.post('/login', async (req, res) => {
  await login(req, res);
});
app.post('/logout', async (req, res) => {
  await logout(req, res);
});
app.get('/checkAuth', async (req, res) => {
  await checkAuth(req, res);
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
