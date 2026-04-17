import { globby } from 'globby';
import matter from 'gray-matter';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRAFTS_DIR = path.join(__dirname, '../../articles/drafts');

export function deriveSection({ section, category } = {}) {
    return section || (category === '生活亂談' ? 'life' : 'dev');
}
const DEV_DIR = path.join(__dirname, '../../articles/dev');
const LIFE_DIR = path.join(__dirname, '../../articles/life');

async function publishScheduledPosts() {
    console.log('🔍 Checking for scheduled posts...');

    // 取得當前日期（YYYY-MM-DD 格式）
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    console.log(`📅 Current date: ${today} (${now.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })})`);

    // 找到所有 drafts 中的 markdown 檔案（包含子目錄）
    const draftPaths = await globby([`${DRAFTS_DIR}/**/*.md`]);

    if (draftPaths.length === 0) {
        console.log('📭 No draft posts found.');
        return;
    }

    console.log(`📝 Found ${draftPaths.length} draft(s)`);

    let publishedCount = 0;

    for (const draftPath of draftPaths) {
        const content = await fs.readFile(draftPath, 'utf-8');
        const { data: frontMatter } = matter(content);

        if (!frontMatter.date) {
            console.log(`⚠️  Skipping ${path.basename(draftPath)}: No date in frontmatter`);
            continue;
        }

        // 將 date 轉換為 YYYY-MM-DD 格式
        const postDate = new Date(frontMatter.date).toISOString().split('T')[0];

        console.log(`   - ${path.basename(draftPath)}: date=${postDate}`);

        // 如果文章日期 <= 今天，則發布
        if (postDate <= today) {
            // 保留相對於 drafts 目錄的子路徑（支援系列子目錄）
            const relPath = path.relative(DRAFTS_DIR, draftPath);
            const section = deriveSection(frontMatter);
            const destDir = section === 'life' ? LIFE_DIR : DEV_DIR;
            const destPath = path.join(destDir, relPath);

            await fs.ensureDir(path.dirname(destPath));
            await fs.move(draftPath, destPath);
            console.log(`✅ Published: ${relPath}`);
            publishedCount++;
        }
    }

    if (publishedCount === 0) {
        console.log('⏳ No posts are ready to publish yet.');
    } else {
        console.log(`\n🎉 Successfully published ${publishedCount} post(s)!`);
    }

    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `published_count=${publishedCount}\n`);
    }
}

publishScheduledPosts().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
