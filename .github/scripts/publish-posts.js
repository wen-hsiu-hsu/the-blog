import { globby } from 'globby';
import matter from 'gray-matter';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildPublishedSlugs, extractWikilinks } from './wikilink-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRAFTS_DIR = path.join(__dirname, '../../articles/drafts');
const ARTICLES_DIR = path.join(__dirname, '../../articles');

export function deriveSection({ section, category } = {}) {
    return section || (category === '生活亂談' ? 'life' : 'dev');
}
const DEV_DIR = path.join(__dirname, '../../articles/dev');
const LIFE_DIR = path.join(__dirname, '../../articles/life');

function writeStepSummary(published, skipped) {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryFile) return;

    const lines = ['## 📰 Auto-publish 摘要\n'];

    if (published.length > 0) {
        lines.push(`### ✅ 已發布 (${published.length})\n`);
        published.forEach((f) => lines.push(`- \`${f}\``));
        lines.push('');
    }

    if (skipped.length > 0) {
        lines.push(`### ⏭️ 跳過 (${skipped.length})\n`);
        skipped.forEach(({ file, reason }) => lines.push(`- \`${file}\` — ${reason}`));
        lines.push('');
    }

    if (published.length === 0 && skipped.length === 0) {
        lines.push('沒有草稿需要處理。');
    }

    fs.appendFileSync(summaryFile, lines.join('\n'));
}

async function publishScheduledPosts() {
    console.log('🔍 Checking for scheduled posts...');

    // 取得當前日期（YYYY-MM-DD 格式）
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    console.log(
        `📅 Current date: ${today} (${now.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })})`,
    );

    // 找到所有 drafts 中的 markdown 檔案（包含子目錄）
    const draftPaths = await globby([`${DRAFTS_DIR}/**/*.md`]);

    if (draftPaths.length === 0) {
        console.log('📭 No draft posts found.');
        writeStepSummary([], []);
        return;
    }

    console.log(`📝 Found ${draftPaths.length} draft(s)`);

    const published = [];
    const skipped = [];

    const publishedSlugs = await buildPublishedSlugs(ARTICLES_DIR);

    for (const draftPath of draftPaths) {
        const content = await fs.readFile(draftPath, 'utf-8');
        const { data: frontMatter } = matter(content);
        const fileName = path.basename(draftPath);

        if (!frontMatter.date) {
            console.log(`⚠️  Skipping ${fileName}: No date in frontmatter`);
            skipped.push({ file: fileName, reason: 'no date' });
            continue;
        }

        // 將 date 轉換為 YYYY-MM-DD 格式
        const postDate = new Date(frontMatter.date).toISOString().split('T')[0];

        console.log(`   - ${fileName}: date=${postDate}`);

        // 如果文章日期 <= 今天，則發布
        if (postDate <= today) {
            // 檢查 wikilink 是否都存在
            const brokenWikilinks = extractWikilinks(content).filter(
                (slug) => !publishedSlugs.has(slug),
            );
            if (brokenWikilinks.length > 0) {
                const reason = `broken wikilinks: ${brokenWikilinks.map((s) => `[[${s}]]`).join(', ')}`;
                console.warn(
                    `⚠️  Skipped: ${fileName} has broken wikilinks: ${brokenWikilinks.join(', ')}`,
                );
                skipped.push({ file: fileName, reason });
                continue;
            }
            // 保留相對於 drafts 目錄的子路徑（支援系列子目錄）
            const relPath = path.relative(DRAFTS_DIR, draftPath);
            const section = deriveSection(frontMatter);
            const destDir = section === 'life' ? LIFE_DIR : DEV_DIR;
            const destPath = path.join(destDir, relPath);

            await fs.ensureDir(path.dirname(destPath));
            await fs.move(draftPath, destPath);
            console.log(`✅ Published: ${relPath}`);
            published.push(relPath);
        } else {
            skipped.push({ file: fileName, reason: `not due yet (${postDate})` });
        }
    }

    if (published.length === 0) {
        console.log('⏳ No posts are ready to publish yet.');
    } else {
        console.log(`\n🎉 Successfully published ${published.length} post(s)!`);
    }

    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `published_count=${published.length}\n`);
    }

    writeStepSummary(published, skipped);
}

publishScheduledPosts().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
