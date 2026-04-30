import { globby } from 'globby';
import matter from 'gray-matter';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRAFTS_DIR = path.join(__dirname, '../../articles/drafts');
const ARTICLES_DIR = path.join(__dirname, '../../articles');

const REQUIRED_FIELDS = ['title', 'description', 'date', 'category', 'section', 'tags'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_SECTIONS = ['dev', 'life'];

/** 建立已發布文章的 slug set */
async function buildPublishedSlugs() {
    const files = await globby('**/*.md', {
        cwd: ARTICLES_DIR,
        ignore: ['drafts/**', '**/index.md', 'page/**'],
    });
    return new Set(files.map((f) => path.basename(f, '.md')));
}

/** 建立草稿的 slug set */
async function buildDraftSlugs() {
    const files = await globby('**/*.md', { cwd: DRAFTS_DIR });
    return new Set(files.map((f) => path.basename(f, '.md')));
}

/** 從內容中提取所有 wikilink slug */
function extractWikilinks(content) {
    // 先移除 inline code（backtick）內容，避免誤判 `[[Scope]]` 等程式碼文字
    const stripped = content.replace(/`[^`]*`/g, '``');
    const regex = /(?<!!)\[\[([^\]|#]+?)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;
    const slugs = [];
    for (const match of stripped.matchAll(regex)) {
        const rawSlug = match[1].trim();
        const slug = rawSlug.includes('/') ? rawSlug.split('/').pop() : rawSlug;
        if (slug) slugs.push(slug);
    }
    return slugs;
}

/** 驗證單一草稿，回傳 { errors, warnings } */
function validateDraft(filePath, content, frontMatter, publishedSlugs, draftSlugs) {
    const errors = [];
    const warnings = [];

    // 必填欄位檢查
    for (const field of REQUIRED_FIELDS) {
        if (
            frontMatter[field] === undefined ||
            frontMatter[field] === null ||
            frontMatter[field] === ''
        ) {
            errors.push(`缺少必填欄位：${field}`);
        }
    }

    // tags 必須是陣列
    if (frontMatter.tags !== undefined && !Array.isArray(frontMatter.tags)) {
        errors.push(`tags 必須是陣列`);
    }

    // date 格式驗證（gray-matter 會自動將 YAML 日期解析為 Date 物件，需先轉回字串）
    if (frontMatter.date) {
        const dateStr =
            frontMatter.date instanceof Date
                ? frontMatter.date.toISOString().split('T')[0]
                : String(frontMatter.date).trim();
        if (!DATE_REGEX.test(dateStr)) {
            errors.push(`date 格式錯誤（應為 YYYY-MM-DD）：${dateStr}`);
        }
    }

    // section 值驗證
    if (frontMatter.section && !VALID_SECTIONS.includes(frontMatter.section)) {
        errors.push(`section 值無效（應為 dev 或 life）：${frontMatter.section}`);
    }

    // wikilink 檢查：允許指向已發布文章或其他草稿
    const wikilinks = extractWikilinks(content);
    const allowedSlugs = new Set([...publishedSlugs, ...draftSlugs]);
    for (const slug of wikilinks) {
        if (!allowedSlugs.has(slug)) {
            warnings.push(`broken wikilink：[[${slug}]]（在已發布文章及草稿中均找不到）`);
        }
    }

    return { errors, warnings };
}

async function validateDrafts() {
    const draftPaths = await globby('**/*.md', { cwd: DRAFTS_DIR });

    if (draftPaths.length === 0) {
        console.log('📭 No drafts found.');
        process.exit(0);
    }

    console.log(`🔍 Validating ${draftPaths.length} draft(s)...\n`);

    const [publishedSlugs, draftSlugs] = await Promise.all([
        buildPublishedSlugs(),
        buildDraftSlugs(),
    ]);

    let totalErrors = 0;
    let totalWarnings = 0;

    for (const relPath of draftPaths) {
        const fullPath = path.join(DRAFTS_DIR, relPath);
        const raw = await fs.readFile(fullPath, 'utf-8');
        const { data: frontMatter, content } = matter(raw);

        const { errors, warnings } = validateDraft(
            relPath,
            content,
            frontMatter,
            publishedSlugs,
            draftSlugs,
        );

        if (errors.length > 0 || warnings.length > 0) {
            console.log(`📄 ${relPath}`);
            for (const e of errors) {
                console.log(`   ❌ ERROR: ${e}`);
                // GitHub Actions annotation
                if (process.env.GITHUB_ACTIONS) {
                    console.log(`::error file=articles/drafts/${relPath}::${e}`);
                }
            }
            for (const w of warnings) {
                console.log(`   ⚠️  WARN:  ${w}`);
                if (process.env.GITHUB_ACTIONS) {
                    console.log(`::warning file=articles/drafts/${relPath}::${w}`);
                }
            }
            console.log('');
        }

        totalErrors += errors.length;
        totalWarnings += warnings.length;
    }

    if (totalErrors === 0 && totalWarnings === 0) {
        console.log('✅ All drafts passed validation.');
    } else {
        console.log(`\n📊 Results: ${totalErrors} error(s), ${totalWarnings} warning(s)`);
        if (totalErrors > 0) {
            console.error('\n❌ Validation failed due to errors above.');
            process.exit(1);
        } else {
            console.log('\n⚠️  Validation passed with warnings.');
        }
    }
}

validateDrafts().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
