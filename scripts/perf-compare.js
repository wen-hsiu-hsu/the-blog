import { execFileSync } from 'child_process';
import fs from 'fs-extra';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import {
    aggregateRuns,
    formatLogMeta,
    formatReport,
    githubRepoUrl,
    insertLogRow,
    resolveStaticCandidates,
    summarizeChanges,
    summarizeLhr,
} from './perf-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..');
const HEAD_DIST = path.join(REPO_ROOT, '.vitepress/dist');
const CACHE_DIR = path.join(REPO_ROOT, '.vitepress/cache/perf-compare');
const LOG_DIR = path.join(REPO_ROOT, 'docs/perf-log');
const LOG_INDEX = path.join(LOG_DIR, 'README.md');

// 代表性頁面：首頁、section 列表、系列文章、彙整頁
const DEFAULT_PAGES = [
    '/',
    '/dev/',
    '/dev/javaScript_the_hard_part_v3/01-execution-context',
    '/pages/archives',
    '/pages/tags',
];

const CONTENT_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.xml': 'application/xml',
    '.rss': 'application/rss+xml',
    '.txt': 'text/plain; charset=utf-8',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.xml', '.rss', '.txt']);

function parseArgs(argv) {
    const args = {
        base: null,
        runs: 3,
        pages: DEFAULT_PAGES,
        skipBuild: false,
        record: null,
        ref: null,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--base') args.base = argv[++i];
        else if (arg === '--runs') args.runs = Number(argv[++i]);
        else if (arg === '--pages') args.pages = argv[++i].split(',').map((p) => p.trim());
        else if (arg === '--skip-build') args.skipBuild = true;
        else if (arg === '--record') args.record = argv[++i];
        else if (arg === '--ref') args.ref = argv[++i];
        else {
            console.error(`未知參數：${arg}`);
            console.error(
                '用法：npm run perf:compare -- [--base <ref>] [--runs <n>] [--pages /,/dev/] [--skip-build] [--record <改動說明> [--ref <相關項目>]]',
            );
            process.exit(1);
        }
    }
    if (!Number.isInteger(args.runs) || args.runs < 1) {
        console.error('--runs 必須是正整數');
        process.exit(1);
    }
    if (args.ref && !args.record) {
        console.error('--ref 只能搭配 --record 使用');
        process.exit(1);
    }
    if (args.record !== null) {
        if (!args.record?.trim()) {
            console.error('--record 需要改動說明');
            process.exit(1);
        }
        // 長期記錄要可信：dist 必須是這次 build 的，且能估計雜訊
        if (args.skipBuild || args.runs < 3) {
            console.error('--record 不能搭配 --skip-build，且 --runs 至少 3');
            process.exit(1);
        }
    }
    return args;
}

function git(...args) {
    return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
}

function build(cwd) {
    const env = { ...process.env };
    delete env.VITE_INCLUDE_DRAFTS;
    execFileSync('npx', ['vitepress', 'build'], {
        cwd,
        env,
        stdio: ['ignore', 'ignore', 'inherit'],
    });
}

/**
 * 在暫存 worktree build base commit，結果依 commit sha 快取
 * worktree 不能放在 node_modules 底下，否則 UnoCSS 等 plugin 會略過其中的檔案
 */
function ensureBaseDist(sha) {
    const dist = path.join(CACHE_DIR, 'builds', sha);
    if (fs.existsSync(path.join(dist, 'index.html'))) {
        console.log(`base：使用快取 ${path.relative(REPO_ROOT, dist)}`);
        return dist;
    }

    const worktree = path.join(os.tmpdir(), `blog-perf-base-${sha.slice(0, 12)}`);
    if (fs.existsSync(worktree)) {
        git('worktree', 'remove', '--force', worktree);
    }
    git('worktree', 'add', '--detach', worktree, sha);
    try {
        // 共用目前的 node_modules；base 與 head 的依賴版本若不同，量測會混入依賴差異
        fs.symlinkSync(path.join(REPO_ROOT, 'node_modules'), path.join(worktree, 'node_modules'));
        console.log(`base：build ${sha.slice(0, 7)}（約 1 分鐘）`);
        build(worktree);
        fs.moveSync(path.join(worktree, '.vitepress/dist'), dist, { overwrite: true });
    } finally {
        git('worktree', 'remove', '--force', worktree);
    }
    return dist;
}

/** 模擬 Cloudflare Pages：cleanUrls 解析 + brotli 壓縮文字檔 */
function serve(rootDir) {
    const compressed = new Map();

    const server = http.createServer((req, res) => {
        const { pathname } = new URL(req.url, 'http://localhost');
        const candidates = resolveStaticCandidates(rootDir, pathname) ?? [];
        let file = candidates.find(
            (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
        );
        let status = 200;
        if (!file) {
            status = 404;
            file = path.join(rootDir, '404.html');
        }

        const ext = path.extname(file);
        const headers = { 'Content-Type': CONTENT_TYPES[ext] ?? 'application/octet-stream' };
        let body = fs.readFileSync(file);
        if (COMPRESSIBLE.has(ext) && /\bbr\b/.test(req.headers['accept-encoding'] ?? '')) {
            if (!compressed.has(file)) {
                compressed.set(
                    file,
                    zlib.brotliCompressSync(body, {
                        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 },
                    }),
                );
            }
            body = compressed.get(file);
            headers['Content-Encoding'] = 'br';
        }
        headers['Content-Length'] = body.length;
        res.writeHead(status, headers);
        res.end(body);
    });

    return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () =>
            resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }),
        );
    });
}

async function runLighthouse(port, url) {
    const result = await lighthouse(url, {
        port,
        output: 'json',
        onlyCategories: ['performance'],
        logLevel: 'error',
    });
    const { lhr } = result;
    if (lhr.runtimeError) {
        throw new Error(lhr.runtimeError.message);
    }
    return summarizeLhr(lhr);
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    const baseRef = args.base ?? git('merge-base', 'HEAD', 'master');
    const baseSha = git('rev-parse', baseRef);
    const headSha = git('rev-parse', 'HEAD');
    const dirty = git('status', '--porcelain') !== '';
    if (args.record) {
        // 記錄要能指向確切的改動，所以必須量已 commit 的狀態
        if (dirty) {
            console.error('--record 需要乾淨的工作目錄：先 commit 改動，記錄才能指向確切的 commit');
            process.exit(1);
        }
        if (baseSha === headSha) {
            console.error('--record：base 與 HEAD 相同，沒有可記錄的改動');
            process.exit(1);
        }
    }
    const baseLabel = `${args.base ?? 'merge-base(HEAD, master)'} @ ${baseSha.slice(0, 7)}`;
    const headLabel = `目前工作目錄 @ ${headSha.slice(0, 7)}${dirty ? '（含未 commit 的變更）' : ''}`;

    const baseDist = ensureBaseDist(baseSha);
    if (args.skipBuild) {
        console.log('head：略過 build，使用現有 .vitepress/dist');
    } else {
        console.log('head：build 目前工作目錄（約 1 分鐘）');
        build(REPO_ROOT);
    }

    const baseServer = await serve(baseDist);
    const headServer = await serve(HEAD_DIST);
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });

    const samples = Object.fromEntries(
        args.pages.map((p) => [p, { base: [], head: [], errors: {} }]),
    );
    try {
        // base/head 交錯執行，降低機器負載隨時間漂移造成的偏差
        for (let run = 1; run <= args.runs; run++) {
            for (const pagePath of args.pages) {
                for (const [side, { origin }] of [
                    ['base', baseServer],
                    ['head', headServer],
                ]) {
                    process.stdout.write(`第 ${run}/${args.runs} 輪 ${side} ${pagePath} ... `);
                    try {
                        samples[pagePath][side].push(
                            await runLighthouse(chrome.port, origin + pagePath),
                        );
                        console.log('完成');
                    } catch (error) {
                        samples[pagePath].errors[side] = error.message;
                        console.log(`失敗：${error.message}`);
                    }
                }
            }
        }
    } finally {
        await chrome.kill();
        baseServer.server.close();
        headServer.server.close();
    }

    const pages = args.pages.map((pagePath) => {
        const { base, head, errors } = samples[pagePath];
        return {
            path: pagePath,
            base: base.length ? aggregateRuns(base) : null,
            head: head.length ? aggregateRuns(head) : null,
            baseError: errors.base && `base：${errors.base}`,
            headError: errors.head && `head：${errors.head}`,
        };
    });

    const report = formatReport({ baseLabel, headLabel, runs: args.runs, pages });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(CACHE_DIR, 'reports', `${stamp}.md`);
    fs.outputFileSync(reportFile, report);
    fs.outputJsonSync(
        reportFile.replace(/\.md$/, '.json'),
        { baseLabel, headLabel, runs: args.runs, samples },
        { spaces: 2 },
    );

    console.log(`\n${report}`);
    console.log(
        `報告已存到 ${path.relative(REPO_ROOT, reportFile)}（同名 .json 為每次執行的原始數據）`,
    );

    if (args.record) {
        recordLog({ args, baseSha, headSha, baseLabel, headLabel, pages });
    }
}

/** 把報告寫進 docs/perf-log/ 並更新索引，供長期追蹤 */
function recordLog({ args, baseSha, headSha, baseLabel, headLabel, pages }) {
    const date = new Date().toLocaleDateString('sv-SE');
    const file = `${date}-${headSha.slice(0, 7)}.md`;
    const commits = git('log', '--format=%H%x09%s', `${baseSha}..${headSha}`)
        .split('\n')
        .filter(Boolean)
        .map((line) => {
            const [sha, ...subject] = line.split('\t');
            return { sha, subject: subject.join('\t') };
        });
    const meta = formatLogMeta({
        date,
        branch: git('rev-parse', '--abbrev-ref', 'HEAD'),
        ref: args.ref,
        repoUrl: githubRepoUrl(git('remote', 'get-url', 'origin')),
        baseSha,
        headSha,
        commits,
    });
    const summary = summarizeChanges(pages);
    const report = formatReport({
        title: args.record,
        meta: [...meta, `- 摘要：${summary}`],
        baseLabel,
        headLabel,
        runs: args.runs,
        pages,
    });

    fs.outputFileSync(path.join(LOG_DIR, file), report);
    fs.writeFileSync(
        LOG_INDEX,
        insertLogRow(fs.readFileSync(LOG_INDEX, 'utf8'), {
            date,
            title: args.record,
            file,
            ref: args.ref,
            summary,
        }),
    );
    execFileSync('npx', ['prettier', '--write', LOG_DIR], { cwd: REPO_ROOT, stdio: 'ignore' });

    console.log(`\n已記錄到 docs/perf-log/${file}，並更新 docs/perf-log/README.md`);
    console.log(
        '下一步：commit docs/perf-log/，並在相關項目（TODO、issue、文件）加上這份記錄的連結',
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
