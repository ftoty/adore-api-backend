import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import express from 'express';

const router = express.Router();
const tasksByIp = new Map();
const rateWindowMs = 60 * 60 * 1000;
const maxImageBytes = 8 * 1024 * 1024;
const allowedArtifacts = new Set(['glb', 'stl', 'step']);

function providerBaseUrl() {
    const value = process.env.ADORE_3D_PROVIDER_URL || 'http://127.0.0.1:8080';
    let url;
    try {
        url = new URL(value);
    } catch {
        throw new Error('ADORE_3D_PROVIDER_URL não contém uma URL válida.');
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('ADORE_3D_PROVIDER_URL deve usar HTTP ou HTTPS.');
    }
    return url;
}

function timeoutSignal(timeoutMs) {
    const configured = Number.parseInt(process.env.ADORE_3D_PROVIDER_TIMEOUT_MS || '15000', 10);
    if (!Number.isInteger(configured) || configured < 1000 || configured > 120000) {
        throw new Error('ADORE_3D_PROVIDER_TIMEOUT_MS deve ser um inteiro entre 1000 e 120000.');
    }
    return AbortSignal.timeout(timeoutMs || configured);
}

async function callLocalProvider(path, options = {}, timeoutMs) {
    const baseUrl = providerBaseUrl();
    const endpoint = new URL(path.replace(/^\/+/, ''), `${baseUrl.href.replace(/\/+$/, '')}/`);
    const token = process.env.ADORE_3D_PROVIDER_TOKEN;
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);

    try {
        return await fetch(endpoint, {
            ...options,
            headers,
            signal: timeoutSignal(timeoutMs)
        });
    } catch (error) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            error.statusCode = 504;
            error.message = 'O provedor local de IA 3D excedeu o tempo limite da requisição.';
        } else {
            error.statusCode = 503;
            error.message = 'Não foi possível conectar ao provedor local de IA 3D. Verifique se ele está ativo e acessível.';
        }
        throw error;
    }
}

async function readProviderJson(response) {
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        const detail = typeof body?.detail === 'string'
            ? body.detail
            : typeof body?.message === 'string'
                ? body.message
                : `O provedor local respondeu com HTTP ${response.status}.`;
        const error = new Error(detail);
        error.statusCode = response.status >= 500 ? 503 : response.status;
        throw error;
    }
    return body;
}

function rateLimitExceeded(ip) {
    const now = Date.now();
    for (const [key, entry] of tasksByIp) {
        if (now - entry.startedAt >= rateWindowMs) tasksByIp.delete(key);
    }
    const entry = tasksByIp.get(ip);
    const limit = Number.parseInt(process.env.ADORE_3D_RATE_LIMIT_PER_HOUR || '5', 10);
    if (!Number.isInteger(limit) || limit < 1) {
        throw new Error('ADORE_3D_RATE_LIMIT_PER_HOUR deve ser um inteiro positivo.');
    }
    if (entry && entry.count >= limit) return true;
    tasksByIp.set(ip, entry
        ? { startedAt: entry.startedAt, count: entry.count + 1 }
        : { startedAt: now, count: 1 });
    return false;
}

function invalidRequest(res, message) {
    return res.status(400).json({ success: false, message });
}

function validTaskId(taskId) {
    return /^[A-Za-z0-9_-]{1,128}$/.test(taskId);
}

router.get('/3d/health', async (_req, res) => {
    try {
        const response = await callLocalProvider('/health');
        const body = await readProviderJson(response);
        return res.json({ success: true, provider: 'adore-local', ...body });
    } catch (error) {
        console.error('Falha ao consultar o provedor local de IA 3D:', error.message);
        return res.status(error.statusCode || 503).json({ success: false, message: error.message });
    }
});

router.post('/3d/tasks', async (req, res) => {
    const { mode, prompt, imageDataUrl } = req.body || {};
    if (mode !== 'text' && mode !== 'image') {
        return invalidRequest(res, 'O modo deve ser "text" ou "image".');
    }
    if (mode === 'text' && (typeof prompt !== 'string' || !prompt.trim() || prompt.trim().length > 800)) {
        return invalidRequest(res, 'Informe uma descrição de até 800 caracteres.');
    }
    if (mode === 'image' && typeof imageDataUrl !== 'string') {
        return invalidRequest(res, 'Envie uma imagem PNG, JPEG ou WebP.');
    }
    if (mode === 'image') {
        const image = imageDataUrl.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
        if (!image || Math.floor(image[2].length * 3 / 4) > maxImageBytes) {
            return invalidRequest(res, 'A imagem precisa ser PNG, JPEG ou WebP e ter no máximo 8 MB.');
        }
    }

    try {
        const limit = Number.parseInt(process.env.ADORE_3D_RATE_LIMIT_PER_HOUR || '5', 10);
        if (!Number.isInteger(limit) || limit < 1) {
            throw new Error('ADORE_3D_RATE_LIMIT_PER_HOUR deve ser um inteiro positivo.');
        }
        if (rateLimitExceeded(req.ip || req.socket.remoteAddress || 'unknown')) {
            return res.status(429).json({ success: false, message: 'Limite de gerações atingido. Tente novamente mais tarde.' });
        }

        const response = await callLocalProvider('/v1/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mode === 'text'
                ? { mode, prompt: prompt.trim() }
                : { mode, imageDataUrl })
        });
        const task = await readProviderJson(response);
        if (typeof task?.taskId !== 'string' || !validTaskId(task.taskId)) {
            console.error('Resposta do provedor local sem identificador de tarefa válido.');
            return res.status(502).json({ success: false, message: 'O provedor local não retornou um identificador de tarefa válido.' });
        }
        return res.status(202).json({
            success: true,
            provider: 'adore-local',
            mode,
            taskId: task.taskId,
            status: task.status || 'PENDING'
        });
    } catch (error) {
        console.error('Falha ao criar tarefa no provedor local de IA 3D:', error.message);
        return res.status(error.statusCode || 503).json({ success: false, message: error.message });
    }
});

router.get('/3d/tasks/:taskId/artifacts/:format', async (req, res) => {
    const { taskId, format } = req.params;
    if (!validTaskId(taskId) || !allowedArtifacts.has(format)) {
        return invalidRequest(res, 'A tarefa ou o formato do arquivo é inválido.');
    }

    try {
        const response = await callLocalProvider(
            `/v1/tasks/${encodeURIComponent(taskId)}/artifacts/${format}`,
            {},
            120000
        );
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            const message = typeof body?.detail === 'string'
                ? body.detail
                : `O provedor local respondeu com HTTP ${response.status}.`;
            return res.status(response.status >= 500 ? 503 : response.status)
                .json({ success: false, message });
        }
        res.status(response.status);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        res.setHeader('Content-Disposition', response.headers.get('content-disposition') || `attachment; filename="modelo.${format}"`);
        res.setHeader('Cache-Control', 'private, no-store');
        await pipeline(Readable.fromWeb(response.body), res);
        return undefined;
    } catch (error) {
        console.error('Falha ao transmitir arquivo do provedor local:', error.message);
        if (res.headersSent) {
            res.destroy(error);
            return undefined;
        }
        return res.status(error.statusCode || 503).json({ success: false, message: error.message });
    }
});

router.get('/3d/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    if (!validTaskId(taskId)) return invalidRequest(res, 'O identificador da tarefa é inválido.');

    try {
        const response = await callLocalProvider(`/v1/tasks/${encodeURIComponent(taskId)}`);
        const task = await readProviderJson(response);
        const formats = Array.isArray(task?.artifacts)
            ? task.artifacts.filter((format) => allowedArtifacts.has(format))
            : [];
        const modelUrls = Object.fromEntries(formats.map((format) => [
            format,
            `/api/ia/3d/tasks/${encodeURIComponent(taskId)}/artifacts/${format}`
        ]));
        return res.json({
            success: true,
            provider: 'adore-local',
            mode: task?.mode,
            taskId,
            status: task?.status || 'UNKNOWN',
            progress: Number.isFinite(task?.progress) ? task.progress : 0,
            message: task?.message || null,
            modelUrls
        });
    } catch (error) {
        console.error('Falha ao consultar tarefa no provedor local de IA 3D:', error.message);
        return res.status(error.statusCode || 503).json({ success: false, message: error.message });
    }
});

export default router;
