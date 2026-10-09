import path from 'path';
import { describe, expect, it } from 'vitest';
import {
    METRICS,
    aggregateRuns,
    formatReport,
    judgeDelta,
    median,
    resolveStaticCandidates,
    spread,
    summarizeLhr,
} from './perf-utils.js';

const ROOT = path.resolve('/site/dist');
const metric = (key: string) => METRICS.find((m) => m.key === key)!;

describe('resolveStaticCandidates()', () => {
    it('結尾斜線對應 index.html', () => {
        expect(resolveStaticCandidates(ROOT, '/')).toEqual([path.join(ROOT, 'index.html')]);
        expect(resolveStaticCandidates(ROOT, '/dev/')).toEqual([path.join(ROOT, 'dev/index.html')]);
    });

    it('無副檔名依序嘗試原路徑、.html、目錄 index.html（cleanUrls）', () => {
        expect(resolveStaticCandidates(ROOT, '/pages/tags')).toEqual([
            path.join(ROOT, 'pages/tags'),
            path.join(ROOT, 'pages/tags.html'),
            path.join(ROOT, 'pages/tags/index.html'),
        ]);
    });

    it('解碼中文路徑', () => {
        expect(resolveStaticCandidates(ROOT, '/%E6%B8%AC%E8%A9%A6')?.[1]).toBe(
            path.join(ROOT, '測試.html'),
        );
    });

    it('跳出根目錄回傳 null', () => {
        expect(resolveStaticCandidates(ROOT, '/../secret')).toBeNull();
        expect(resolveStaticCandidates(ROOT, '/%2e%2e/secret')).toBeNull();
    });
});

describe('median() / spread()', () => {
    it('奇數個取中間、偶數個取平均', () => {
        expect(median([3, 1, 2])).toBe(2);
        expect(median([4, 1, 3, 2])).toBe(2.5);
    });

    it('忽略 null，全為 null 時回傳 null', () => {
        expect(median([null, 5, null])).toBe(5);
        expect(median([null])).toBeNull();
        expect(spread([null])).toBeNull();
    });

    it('spread 為最大值減最小值', () => {
        expect(spread([10, 30, 20])).toBe(20);
    });
});

describe('summarizeLhr()', () => {
    it('抽出分數、指標與各類型傳輸量', () => {
        const lhr = {
            categories: { performance: { score: 0.87 } },
            audits: {
                'first-contentful-paint': { numericValue: 1000 },
                'largest-contentful-paint': { numericValue: 2000 },
                'total-blocking-time': { numericValue: 300 },
                'cumulative-layout-shift': { numericValue: 0.05 },
                'speed-index': { numericValue: 1500 },
                'resource-summary': {
                    details: {
                        items: [
                            { resourceType: 'total', transferSize: 5000, requestCount: 10 },
                            { resourceType: 'document', transferSize: 1000 },
                            { resourceType: 'script', transferSize: 3000 },
                        ],
                    },
                },
            },
        };
        expect(summarizeLhr(lhr)).toEqual({
            score: 87,
            fcp: 1000,
            lcp: 2000,
            tbt: 300,
            cls: 0.05,
            si: 1500,
            documentBytes: 1000,
            scriptBytes: 3000,
            stylesheetBytes: null,
            imageBytes: null,
            fontBytes: null,
            otherBytes: null,
            totalBytes: 5000,
            requestCount: 10,
        });
    });
});

describe('judgeDelta()', () => {
    it('時間指標差值在雜訊內不下結論', () => {
        expect(
            judgeDelta(metric('lcp'), { median: 2000, spread: 300 }, { median: 2200, spread: 100 }),
        ).toBe('≈ 雜訊內');
    });

    it('時間指標超出雜訊時依方向判斷', () => {
        expect(
            judgeDelta(metric('lcp'), { median: 2000, spread: 100 }, { median: 1500, spread: 100 }),
        ).toBe('✅ 改善');
        expect(
            judgeDelta(metric('score'), { median: 90, spread: 2 }, { median: 80, spread: 2 }),
        ).toBe('⚠️ 退步');
    });

    it('傳輸量不看雜訊，但極小差距視為相同', () => {
        const bytes = metric('documentBytes');
        expect(judgeDelta(bytes, { median: 1000, spread: 0 }, { median: 1050, spread: 0 })).toBe(
            '=',
        );
        expect(judgeDelta(bytes, { median: 1000, spread: 0 }, { median: 2000, spread: 0 })).toBe(
            '⚠️ 退步',
        );
    });

    it('任一邊缺值時回傳空字串', () => {
        expect(
            judgeDelta(metric('lcp'), { median: null, spread: null }, { median: 1, spread: 0 }),
        ).toBe('');
    });
});

describe('formatReport()', () => {
    const run = summarizeLhr({ categories: { performance: { score: 0.5 } }, audits: {} });

    it('每頁輸出一張指標表', () => {
        const agg = aggregateRuns([run, run, run]);
        const report = formatReport({
            baseLabel: 'b',
            headLabel: 'h',
            runs: 3,
            pages: [{ path: '/', base: agg, head: agg }],
        });
        expect(report).toContain('## `/`');
        expect(report).toContain('| Performance 分數 | 50 | 50 | ±0 (±0.0%) | = |');
        expect(report).not.toContain('無法估計雜訊');
    });

    it('執行次數少於 3 時加註警告；量測失敗時列出錯誤', () => {
        const report = formatReport({
            baseLabel: 'b',
            headLabel: 'h',
            runs: 1,
            pages: [{ path: '/x', base: null, head: null, baseError: 'base：boom' }],
        });
        expect(report).toContain('無法估計雜訊');
        expect(report).toContain('量測失敗：base：boom');
    });
});
