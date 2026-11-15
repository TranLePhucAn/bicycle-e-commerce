import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const directory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = join(directory, '..');
const api = spawn(process.execPath, [join(directory, 'index.js')], {
    cwd: projectDirectory,
    stdio: 'inherit',
});
let vite;
let stopping = false;

function stop() {
    if (stopping) return;
    stopping = true;
    api.kill();
    vite?.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

api.on('exit', (code) => {
    if (!stopping && code !== 0) {
        console.error('API đã dừng bất thường.');
        stop();
        process.exitCode = code || 1;
    }
});

async function startViteWhenApiIsReady() {
    let isReady = false;
    for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
            const response = await fetch('http://127.0.0.1:3001/api/health');
            if (response.ok) {
                isReady = true;
                break;
            }
        } catch {
            // The API may still be creating its first data file.
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!isReady) throw new Error('API did not start on port 3001.');
    if (stopping) return;
    vite = spawn(process.execPath, [join(projectDirectory, 'node_modules', 'vite', 'bin', 'vite.js')], {
        cwd: projectDirectory,
        stdio: 'inherit',
    });
    vite.on('exit', (code) => {
        if (!stopping) {
            stop();
            process.exitCode = code || 0;
        }
    });
}

startViteWhenApiIsReady().catch((error) => {
    console.error('Không thể khởi động ứng dụng:', error);
    stop();
    process.exitCode = 1;
});
