import path from 'path';

/**
 * 依 cleanUrls 規則把 URL pathname 對應到 dist 裡的候選檔案（依序嘗試）
 * `/` → index.html、`/dev/` → dev/index.html、`/pages/tags` → pages/tags(.html)
 * 回傳 null 代表路徑跳出 dist 根目錄
 */
export function resolveStaticCandidates(rootDir, pathname) {
    const decoded = decodeURIComponent(pathname);
    const target = path.resolve(rootDir, '.' + decoded);
    if (target !== rootDir && !target.startsWith(rootDir + path.sep)) {
        return null;
    }
    if (decoded.endsWith('/')) {
        return [path.join(target, 'index.html')];
    }
    return [target, `${target}.html`, path.join(target, 'index.html')];
}

/**
 * Apple Silicon 上的 x64 Node 啟動 Chrome 時會經過 Rosetta 轉譯，CPU 類指標（TBT 等）嚴重失真。
 * 判斷方式與 Lighthouse CLI 相同：darwin + x64 + CPU 型號含 Apple。
 */
export function isRosettaNode({ platform, arch, cpuModel }) {
    return platform === 'darwin' && arch === 'x64' && cpuModel.includes('Apple');
}

export function median(values) {
    const sorted = values.filter((v) => typeof v === 'number').sort((a, b) => a - b);
    if (sorted.length === 0) return null;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function spread(values) {
    const nums = values.filter((v) => typeof v === 'number');
    if (nums.length === 0) return null;
    return Math.max(...nums) - Math.min(...nums);
}

/**
 * 要比較的指標
 * - kind=time / cls 會受機器負載影響，用多次執行的差距判斷是否在雜訊內
 * - kind=bytes 幾乎是確定值，只有圖片等延遲載入資源會在多次執行間浮動 1–2 KB
 */
export const METRICS = [
    { key: 'score', label: 'Performance 分數', kind: 'score', better: 'higher' },
    { key: 'fcp', label: 'FCP', kind: 'time', better: 'lower' },
    { key: 'lcp', label: 'LCP', kind: 'time', better: 'lower' },
    { key: 'tbt', label: 'TBT', kind: 'time', better: 'lower' },
    { key: 'cls', label: 'CLS', kind: 'cls', better: 'lower' },
    { key: 'si', label: 'Speed Index', kind: 'time', better: 'lower' },
    { key: 'documentBytes', label: 'HTML 傳輸量', kind: 'bytes', better: 'lower' },
    { key: 'scriptBytes', label: 'JS 傳輸量', kind: 'bytes', better: 'lower' },
    { key: 'stylesheetBytes', label: 'CSS 傳輸量', kind: 'bytes', better: 'lower' },
    { key: 'imageBytes', label: '圖片傳輸量', kind: 'bytes', better: 'lower' },
    { key: 'fontBytes', label: '字型傳輸量', kind: 'bytes', better: 'lower' },
    { key: 'otherBytes', label: '其他傳輸量（fetch 等）', kind: 'bytes', better: 'lower' },
    { key: 'totalBytes', label: '總傳輸量', kind: 'bytes', better: 'lower' },
    { key: 'requestCount', label: '請求數', kind: 'count', better: 'lower' },
];

/** 從 Lighthouse 的 LHR 抽出單次執行的指標 */
export function summarizeLhr(lhr) {
    const audit = (id) => lhr.audits[id]?.numericValue ?? null;
    const resources = lhr.audits['resource-summary']?.details?.items ?? [];
    const bytesOf = (type) =>
        resources.find((item) => item.resourceType === type)?.transferSize ?? null;
    const total = resources.find((item) => item.resourceType === 'total');

    return {
        score:
            lhr.categories.performance.score === null
                ? null
                : lhr.categories.performance.score * 100,
        fcp: audit('first-contentful-paint'),
        lcp: audit('largest-contentful-paint'),
        tbt: audit('total-blocking-time'),
        cls: audit('cumulative-layout-shift'),
        si: audit('speed-index'),
        documentBytes: bytesOf('document'),
        scriptBytes: bytesOf('script'),
        stylesheetBytes: bytesOf('stylesheet'),
        imageBytes: bytesOf('image'),
        fontBytes: bytesOf('font'),
        otherBytes: bytesOf('other'),
        totalBytes: total?.transferSize ?? null,
        requestCount: total?.requestCount ?? null,
    };
}

/** 把多次執行彙總成每個指標的中位數與差距 */
export function aggregateRuns(runs) {
    const result = {};
    for (const { key } of METRICS) {
        const values = runs.map((run) => run[key]);
        result[key] = { median: median(values), spread: spread(values) };
    }
    return result;
}

function formatValue(kind, value) {
    if (value === null || value === undefined) return 'n/a';
    switch (kind) {
        case 'score':
        case 'count':
            return String(Math.round(value));
        case 'time':
            return `${Math.round(value)} ms`;
        case 'cls':
            return value.toFixed(3);
        case 'bytes':
            return `${(value / 1024).toFixed(1)} KB`;
    }
}

// 傳輸量差距小於此值（如 hash 檔名長度變動）視為相同
const BYTES_THRESHOLD = 100;

const IMPROVED = '✅ 改善';
const REGRESSED = '⚠️ 退步';

/**
 * 判斷差值方向
 * 差值不大於兩邊多次執行的最大差距時視為雜訊；傳輸量另有最小門檻
 */
export function judgeDelta(metric, base, head) {
    if (base.median === null || head.median === null) return '';
    const delta = head.median - base.median;
    if (delta === 0) return '=';
    if (metric.kind === 'bytes' && Math.abs(delta) < BYTES_THRESHOLD) return '=';
    const noise = Math.max(base.spread ?? 0, head.spread ?? 0);
    if (Math.abs(delta) <= noise) return '≈ 雜訊內';
    const improved = metric.better === 'lower' ? delta < 0 : delta > 0;
    return improved ? IMPROVED : REGRESSED;
}

function formatDelta(metric, base, head) {
    if (base.median === null || head.median === null) return 'n/a';
    const delta = head.median - base.median;
    const sign = delta > 0 ? '+' : delta < 0 ? '−' : '±';
    const abs = formatValue(metric.kind, Math.abs(delta));
    const pct =
        base.median !== 0 ? ` (${sign}${Math.abs((delta / base.median) * 100).toFixed(1)}%)` : '';
    return `${sign}${abs}${pct}`;
}

/**
 * 產生 Markdown 報告
 * pages: [{ path, base: aggregate|null, head: aggregate|null, baseError?, headError? }]
 */
export function formatReport({
    title = '效能比較報告',
    meta = [],
    baseLabel,
    headLabel,
    runs,
    pages,
}) {
    const lines = [
        `# ${title}`,
        '',
        ...meta,
        `- base：${baseLabel}`,
        `- head：${headLabel}`,
        `- 每頁執行 ${runs} 次取中位數；Lighthouse 預設 mobile 設定（模擬節流，與 PageSpeed Insights 相同）`,
        '- 「≈ 雜訊內」：差值小於多次執行間的最大差距，不足以下結論',
        '- 傳輸量幾乎是確定值；時間類指標（FCP、LCP、TBT、Speed Index）受機器負載影響，只看差值與判斷，不看絕對值',
        '',
    ];
    if (runs < 3) {
        lines.splice(
            lines.length - 1,
            0,
            `- ⚠️ 只執行 ${runs} 次，無法估計雜訊，時間類指標的判斷不可靠`,
        );
    }

    for (const page of pages) {
        lines.push(`## \`${page.path}\``, '');
        if (!page.base || !page.head) {
            lines.push(`量測失敗：${page.baseError ?? ''} ${page.headError ?? ''}`.trim(), '');
            continue;
        }
        lines.push('| 指標 | base | head | 差值 | 判斷 |', '| --- | --- | --- | --- | --- |');
        for (const metric of METRICS) {
            const base = page.base[metric.key];
            const head = page.head[metric.key];
            lines.push(
                `| ${metric.label} | ${formatValue(metric.kind, base.median)} | ${formatValue(metric.kind, head.median)} | ${formatDelta(metric, base, head)} | ${judgeDelta(metric, base, head)} |`,
            );
        }
        lines.push('');
    }

    return lines.join('\n');
}

/** 一行摘要：各指標在幾頁超出雜訊地改善或退步，例如「總傳輸量 ✅2 ⚠️3（共 5 頁）」 */
export function summarizeChanges(pages) {
    const measured = pages.filter((page) => page.base && page.head);
    const parts = [];
    for (const metric of METRICS) {
        const verdicts = measured.map((page) =>
            judgeDelta(metric, page.base[metric.key], page.head[metric.key]),
        );
        const improved = verdicts.filter((v) => v === IMPROVED).length;
        const regressed = verdicts.filter((v) => v === REGRESSED).length;
        const counts = [improved && `✅${improved}`, regressed && `⚠️${regressed}`].filter(Boolean);
        if (counts.length) parts.push(`${metric.label} ${counts.join(' ')}`);
    }
    return parts.length ? `${parts.join('；')}（共 ${measured.length} 頁）` : '無超出雜訊的變化';
}

/** git remote URL（ssh 或 https）轉成 GitHub 網頁網址，非 GitHub 回傳 null */
export function githubRepoUrl(remote) {
    const match = remote.trim().match(/github\.com[:/](.+?)(?:\.git)?$/);
    return match ? `https://github.com/${match[1]}` : null;
}

/**
 * 效能記錄的 metadata：指向這次量測對應的改動（commit 範圍與相關項目）
 * commits: [{ sha, subject }]，新到舊
 */
export function formatLogMeta({ date, branch, ref, repoUrl, baseSha, headSha, commits }) {
    const short = (sha) => sha.slice(0, 7);
    const commitLink = (sha) =>
        repoUrl ? `[${short(sha)}](${repoUrl}/commit/${sha})` : `\`${short(sha)}\``;
    const range = `${short(baseSha)}...${short(headSha)}`;
    const rangeText = repoUrl
        ? `[${range}](${repoUrl}/compare/${baseSha}...${headSha})`
        : `\`${range}\``;

    const lines = [
        `- 日期：${date}`,
        branch === 'HEAD' ? '- 分支：（detached HEAD）' : `- 分支：\`${branch}\``,
        `- 改動範圍：${rangeText}（${commits.length} 個 commit）`,
    ];
    if (ref) lines.push(`- 相關項目：${ref}`);
    lines.push('- commits：');
    for (const { sha, subject } of commits) {
        lines.push(`    - ${commitLink(sha)} ${subject}`);
    }
    return lines;
}

/** 在索引表格的分隔線後插入一列（新的在上） */
export function insertLogRow(indexContent, { date, title, file, ref, summary }) {
    const cell = (text) => (text ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const row = `| ${date} | [${cell(title)}](./${file}) | ${cell(ref) || '—'} | ${cell(summary)} |`;
    const lines = indexContent.split('\n');
    const separator = lines.findIndex((line) => /^\|\s*-{3,}/.test(line));
    if (separator === -1) {
        throw new Error('找不到索引表格的分隔線');
    }
    lines.splice(separator + 1, 0, row);
    return lines.join('\n');
}
