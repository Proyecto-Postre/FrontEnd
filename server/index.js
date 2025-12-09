import jsonServer from 'json-server';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const app = express();
const port = process.env.PORT || 3000;

// Middleware for JSON Server
app.use('/api', middlewares, router);

// Serve static files from the Vue build (dist)
app.use(express.static(path.join(__dirname, '../dist')));

// Handle SPA routing: redirect any non-API request to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
