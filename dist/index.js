"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const contestants_1 = require("./api/contestants");
const previewData_1 = require("./api/previewData");
const importantData_1 = require("./api/importantData");
const currentPlace_1 = require("./api/currentPlace");
const app = (0, express_1.default)();
// Правильная настройка CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://f4x1pn2ft.localto.net',
    'http://d91098wj.beget.tech' // Добавьте ваш production домен
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Разрешаем запросы без origin (например, из Postman)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
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
app.options('*', (0, cors_1.default)());
// Middleware
app.use(express_1.default.json());
// Роуты
app.get('/contestants', (req, res) => (0, contestants_1.getContestants)(req, res));
app.get('/previewData', async (req, res) => {
    await (0, previewData_1.getPreviewData)(req, res);
});
app.patch('/previewData', async (req, res) => {
    await (0, previewData_1.updatePreviewData)(req, res);
});
app.get('/importantData', async (req, res) => {
    await (0, importantData_1.getImportantData)(req, res);
});
app.patch('/importantData', async (req, res) => {
    await (0, importantData_1.updateImportantData)(req, res);
});
app.get('/currentPlace', async (req, res) => {
    await (0, currentPlace_1.getCurrentPlace)(req, res);
});
app.patch('/currentPlace', async (req, res) => {
    await (0, currentPlace_1.updateCurrentPlace)(req, res);
});
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
