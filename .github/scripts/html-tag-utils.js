import MarkdownIt from 'markdown-it';
import fs from 'fs-extra';
import { isHTMLTag, isSVGTag, isMathMLTag } from '@vue/shared';

// 與 VitePress 相同：允許 Markdown 內嵌 HTML
const md = new MarkdownIt({ html: true });

// VitePress 內建、可直接在 Markdown 使用的全域元件
const BUILTIN_COMPONENTS = ['ClientOnly', 'Content', 'Badge'];

// 與 Vue 編譯器相同的判斷：`<` 或 `</` 後面接英文字母就視為標籤開頭，名稱讀到空白、`/` 或 `>` 為止
const TAG_REGEX = /<\/?([A-Za-z][^\s/>]*)/g;

function countNewlines(text) {
    return text.split('\n').length - 1;
}

/**
 * 從 theme 入口檔讀取以 app.component('Name', ...) 註冊的全域元件名稱
 * @param {string} themeIndexPath
 * @returns {Promise<string[]>}
 */
export async function loadRegisteredComponents(themeIndexPath) {
    const source = await fs.readFile(themeIndexPath, 'utf-8');
    return [...source.matchAll(/app\.component\(\s*['"]([\w-]+)['"]/g)].map((m) => m[1]);
}

/**
 * 找出會被 Vue 誤認為標籤、導致 build 失敗的 `<`。
 *
 * Markdown 的 raw HTML（例如 <details>/<summary> 區塊）不會被 markdown-it 跳脫，
 * 裡面的反引號也不會變成 inline code，所以 `Promise<Type>` 會原樣交給 Vue 編譯，
 * 被當成沒有結尾的 <Type> 標籤而報 "Element is missing end tag"。
 * 程式碼區塊與 inline code 會被 markdown-it 正確跳脫，不在檢查範圍內。
 *
 * @param {string} markdown - 不含 front matter 的 Markdown 內容
 * @param {string[]} [components] - 額外允許的元件名稱（例如 theme 註冊的全域元件）
 * @returns {{ line: number, tag: string }[]} line 為 1-based，相對於傳入的 markdown
 */
export function findInvalidHtmlTags(markdown, components = []) {
    const allowed = new Set([...BUILTIN_COMPONENTS, ...components]);
    const isValidTag = (name) =>
        isHTMLTag(name) || isSVGTag(name) || isMathMLTag(name) || allowed.has(name);

    const results = [];
    const scan = (html, startLine) => {
        for (const match of html.matchAll(TAG_REGEX)) {
            if (!isValidTag(match[1])) {
                results.push({
                    line: startLine + countNewlines(html.slice(0, match.index)),
                    tag: match[0],
                });
            }
        }
    };

    for (const token of md.parse(markdown, {})) {
        if (token.type === 'html_block') {
            scan(token.content, token.map[0] + 1);
        } else if (token.type === 'inline' && token.map) {
            // inline token 的子節點沒有行號，從所屬段落的內容推算
            let offset = 0;
            for (const child of token.children) {
                if (child.type !== 'html_inline') continue;
                const index = token.content.indexOf(child.content, offset);
                offset = index + child.content.length;
                scan(
                    child.content,
                    token.map[0] + 1 + countNewlines(token.content.slice(0, index)),
                );
            }
        }
    }

    return results;
}
