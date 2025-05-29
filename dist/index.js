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
const direction_1 = require("./api/direction");
const importantDates_1 = require("./api/importantDates");
const registration_1 = require("./api/registration");
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
// Правильная настройка CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://f4x1pn2ft.localto.net',
    'http://d91098wj.beget.tech'
];
app.use((0, express_session_1.default)({
    secret: '111',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
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
//___ImportantDates___
app.get('/importantDates', async (req, res) => {
    await (0, importantDates_1.getImportantDates)(req, res);
});
app.post('/importantDates', async (req, res) => {
    await (0, importantDates_1.addImportantDate)(req, res);
});
app.patch('/importantDates/:id', async (req, res) => {
    await (0, importantDates_1.updateImportantDate)(req, res);
});
app.delete('/importantDates/:id', async (req, res) => {
    await (0, importantDates_1.deleteImportantDate)(req, res);
});
app.patch('/importantDates/reorder', async (req, res) => {
    await (0, importantDates_1.reorderImportantDates)(req, res);
});
//___Contestants___
app.get('/contestants', (req, res) => (0, contestants_1.getContestants)(req, res));
app.delete('/contestants', contestants_1.deleteAllContestants);
app.post('/contestants', async (req, res) => {
    await (0, contestants_1.addContestant)(req, res);
});
//___previewData___
app.get('/previewData', async (req, res) => {
    await (0, previewData_1.getPreviewData)(req, res);
});
app.patch('/previewData', async (req, res) => {
    await (0, previewData_1.updatePreviewData)(req, res);
});
//___importantData___
app.get('/importantData', async (req, res) => {
    await (0, importantData_1.getImportantData)(req, res);
});
app.patch('/importantData', async (req, res) => {
    await (0, importantData_1.updateImportantData)(req, res);
});
//___currentPlace___
app.get('/currentPlace', async (req, res) => {
    await (0, currentPlace_1.getCurrentPlace)(req, res);
});
app.patch('/currentPlace', async (req, res) => {
    await (0, currentPlace_1.updateCurrentPlace)(req, res);
});
//___Directions___
app.get('/directions', async (req, res) => {
    await (0, direction_1.getDirection)(req, res);
});
app.post('/directions', async (req, res) => {
    await (0, direction_1.addDirection)(req, res);
});
app.patch('/directions/:id', async (req, res) => {
    await (0, direction_1.updateDirection)(req, res);
});
app.delete('/directions/:id', async (req, res) => {
    await (0, direction_1.deleteDirection)(req, res);
});
// Регистрация
app.post('/register', async (req, res) => {
    await (0, registration_1.register)(req, res);
});
app.post('/login', async (req, res) => {
    await (0, registration_1.login)(req, res);
});
app.post('/logout', async (req, res) => {
    await (0, registration_1.logout)(req, res);
});
app.get('/checkAuth', async (req, res) => {
    await (0, registration_1.checkAuth)(req, res);
});
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
