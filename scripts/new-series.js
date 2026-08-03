import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTICLES_DIR = path.join(__dirname, '../articles');
const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;

function ensureSeriesFolder(baseDir, slug) {
    const dir = path.join(baseDir, slug);
    if (fs.existsSync(dir)) {
        console.log(`已存在，略過：${dir}`);
        return;
    }
    fs.ensureDirSync(dir);
    fs.ensureFileSync(path.join(dir, '.gitkeep'));
    console.log(`已建立：${dir}`);
}

function main() {
    const slug = process.argv[2];

    if (!slug) {
        console.error('用法：npm run new:series -- <slug>');
        process.exit(1);
    }

    if (!SLUG_REGEX.test(slug)) {
        console.error(`不合法的 slug：「${slug}」，僅允許英數字、底線、連字號`);
        process.exit(1);
    }

    ensureSeriesFolder(path.join(ARTICLES_DIR, 'dev'), slug);
    ensureSeriesFolder(path.join(ARTICLES_DIR, 'drafts'), slug);
}

main();
