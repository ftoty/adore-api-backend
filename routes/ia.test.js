import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import express from 'express';
import iaRouter from './ia.js';

const fetchOriginal = globalThis.fetch;
const providerRequests = [];
let server;
let apiUrl;
let previousEnvironment;

before(async () => {
    previousEnvironment = {
        ADORE_3D_PROVIDER_URL: process.env.ADORE_3D_PROVIDER_URL,
        ADORE_3D_PROVIDER_TOKEN: process.env.ADORE_3D_PROVIDER_TOKEN,
        ADORE_3D_PROVIDER_TIMEOUT_MS: process.env.ADORE_3D_PROVIDER_TIMEOUT_MS,
        ADORE_3D_RATE_LIMIT_PER_HOUR: process.env.ADORE_3D_RATE_LIMIT_PER_HOUR
    };
    process.env.ADORE_3D_PROVIDER_URL = 'http://local-provider.test';
    process.env.ADORE_3D_PROVIDER_TOKEN = 'test-local-token';
    process.env.ADORE_3D_PROVIDER_TIMEOUT_MS = '15000';
    process.env.ADORE_3D_RATE_LIMIT_PER_HOUR = '20';
    const app = express();
    app.use(express.json({ limit: '12mb' }));
    app.use('/api/ia', iaRouter);
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    apiUrl = `http://127.0.0.1:${server.address().port}`;

    globalThis.fetch = async (input, options = {}) => {
        const url = new URL(input);
        if (url.origin === apiUrl) return fetchOriginal(input, options);
        providerRequests.push({ url: url.toString(), options });
        if (url.origin !== 'http://local-provider.test') {
            throw new Error(`Unexpected provider host: ${url.origin}`);
        }
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({
                provider: 'adore-local-3d',
                status: 'ready',
                modes: ['text', 'image']
            }), { status: 200 });
        }
        if (options.method === 'POST') {
            return new Response(JSON.stringify({ taskId: 'task_123', status: 'PENDING' }), { status: 202 });
        }
        if (url.pathname.endsWith('/artifacts/glb')) {
            return new Response(new Uint8Array([0x67, 0x6c, 0x54, 0x46]), {
                status: 200,
                headers: {
                    'Content-Type': 'model/gltf-binary',
                    'Content-Disposition': 'attachment; filename="modelo.glb"'
                }
            });
        }
        return new Response(JSON.stringify({
            taskId: 'task_123',
            mode: 'text',
            status: 'SUCCEEDED',
            progress: 100,
            artifacts: ['glb', 'stl', 'step'],
            message: null
        }), { status: 200 });
    };
});

after(async () => {
    globalThis.fetch = fetchOriginal;
    for (const [key, value] of Object.entries(previousEnvironment)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('reports health from the locally hosted AI provider', async () => {
    const response = await fetchOriginal(`${apiUrl}/api/ia/3d/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.provider, 'adore-local');
    assert.equal(body.status, 'ready');
    assert.equal(providerRequests.at(-1).url, 'http://local-provider.test/health');
});

test('creates text CAD tasks on the self-hosted provider', async () => {
    const response = await fetchOriginal(`${apiUrl}/api/ia/3d/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'text', prompt: 'Uma placa de 100 por 50 mm com quatro furos' })
    });
    const body = await response.json();
    const providerRequest = providerRequests.at(-1);

    assert.equal(response.status, 202);
    assert.equal(body.success, true);
    assert.equal(body.taskId, 'task_123');
    assert.equal(body.provider, 'adore-local');
    assert.equal(providerRequest.url, 'http://local-provider.test/v1/tasks');
    assert.equal(providerRequest.options.headers.get('Authorization'), 'Bearer test-local-token');
    assert.deepEqual(JSON.parse(providerRequest.options.body), {
        mode: 'text',
        prompt: 'Uma placa de 100 por 50 mm com quatro furos'
    });
    assert.equal(JSON.stringify(body).includes('test-local-token'), false);
});

test('returns task status and links only to artifacts reported by the local provider', async () => {
    const response = await fetchOriginal(`${apiUrl}/api/ia/3d/tasks/task_123`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'SUCCEEDED');
    assert.equal(body.progress, 100);
    assert.deepEqual(body.modelUrls, {
        glb: '/api/ia/3d/tasks/task_123/artifacts/glb',
        stl: '/api/ia/3d/tasks/task_123/artifacts/stl',
        step: '/api/ia/3d/tasks/task_123/artifacts/step'
    });
    assert.equal(providerRequests.at(-1).url, 'http://local-provider.test/v1/tasks/task_123');
});

test('creates image-to-3D tasks without sending data outside the configured local provider', async () => {
    const imageDataUrl = 'data:image/png;base64,AA==';
    const response = await fetchOriginal(`${apiUrl}/api/ia/3d/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'image', imageDataUrl })
    });
    const providerRequest = providerRequests.at(-1);

    assert.equal(response.status, 202);
    assert.equal(providerRequest.url, 'http://local-provider.test/v1/tasks');
    assert.deepEqual(JSON.parse(providerRequest.options.body), { mode: 'image', imageDataUrl });
});

test('streams model artifacts from the local provider', async () => {
    const response = await fetchOriginal(`${apiUrl}/api/ia/3d/tasks/task_123/artifacts/glb`);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'model/gltf-binary');
    assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [0x67, 0x6c, 0x54, 0x46]);
    assert.equal(providerRequests.at(-1).url, 'http://local-provider.test/v1/tasks/task_123/artifacts/glb');
});

test('rejects unsupported image formats and artifact names before contacting the provider', async () => {
    const previousCount = providerRequests.length;
    const imageResponse = await fetchOriginal(`${apiUrl}/api/ia/3d/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'image', imageDataUrl: 'data:image/svg+xml;base64,AA==' })
    });
    const artifactResponse = await fetchOriginal(`${apiUrl}/api/ia/3d/tasks/task_123/artifacts/exe`);

    assert.equal(imageResponse.status, 400);
    assert.equal(artifactResponse.status, 400);
    assert.equal(providerRequests.length, previousCount);
});
