import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

// OG 圖字型：向 Google Fonts css2 要 text= 子集。
// - 不帶瀏覽器 UA 時回傳 TTF（resvg／satori 不吃 WOFF2）。
// - text 超過約 600 字時 Google 會靜默回傳完整字型（約 9.7MB），所以每批最多 CHUNK_SIZE 字。
// - satori 0.33.5 對多份「同名」字型的 fallback 有問題（部分字變豆腐框），
//   所以每批註冊成不同 family（og0、og1…），再以 fontFamily 清單串起來。

const FAMILY = 'Noto Serif TC';
const WEIGHTS = [500, 800] as const;
const CHUNK_SIZE = 400;

export type SatoriFont = {
    name: string;
    data: Buffer;
    weight: (typeof WEIGHTS)[number];
    style: 'normal';
};

export type OgFonts = {
    fonts: SatoriFont[];
    fontFamily: string;
};

/** 去重、排序後切批；排序讓同一組字永遠切出相同的批次，快取才命中 */
export function chunkChars(text: string, size = CHUNK_SIZE): string[] {
    const chars = [...new Set([...text])].filter((c) => c.trim() !== '').sort();
    const chunks: string[] = [];
    for (let i = 0; i < chars.length; i += size) {
        chunks.push(chars.slice(i, i + size).join(''));
    }
    return chunks;
}

async function fetchSubset(weight: number, text: string): Promise<Buffer> {
    const cssUrl =
        `https://fonts.googleapis.com/css2?family=${FAMILY.replace(/ /g, '+')}:wght@${weight}` +
        `&text=${encodeURIComponent(text)}`;
    const cssRes = await fetch(cssUrl);
    if (!cssRes.ok) throw new Error(`css2 ${cssRes.status}`);
    const fontUrl = (await cssRes.text()).match(/src:\s*url\((.+?)\)/)?.[1];
    if (!fontUrl) throw new Error('css2 回應裡沒有字型網址');
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error(`font ${fontRes.status}`);
    return Buffer.from(await fontRes.arrayBuffer());
}

async function loadSubset(weight: number, text: string, cacheDir: string): Promise<Buffer> {
    const key = createHash('sha1').update(`${FAMILY}|${weight}|${text}`).digest('hex');
    const file = path.join(cacheDir, `${key}.ttf`);
    if (fs.existsSync(file)) return fs.readFileSync(file);
    const data = await fetchSubset(weight, text);
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(file, data);
    return data;
}

export async function loadOgFonts(text: string, cacheDir: string): Promise<OgFonts> {
    const chunks = chunkChars(text);
    const fonts = await Promise.all(
        WEIGHTS.flatMap((weight) =>
            chunks.map(async (chunk, i) => ({
                name: `og${i}`,
                data: await loadSubset(weight, chunk, cacheDir),
                weight,
                style: 'normal' as const,
            })),
        ),
    );
    return { fonts, fontFamily: chunks.map((_, i) => `og${i}`).join(', ') };
}
