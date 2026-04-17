import { describe, it, expect } from 'vitest'

const pageSize = 10

function calcPagesTotal(postsTotal: number): number {
    if (postsTotal === 0) return 0
    return postsTotal % pageSize === 0
        ? postsTotal / pageSize
        : Math.floor(postsTotal / pageSize) + 1
}

describe('pagesTotal calculation', () => {
    it('exact multiple: 20 posts → 2 pages', () => {
        expect(calcPagesTotal(20)).toBe(2)
    })

    it('with remainder: 21 posts → 3 pages', () => {
        expect(calcPagesTotal(21)).toBe(3)
    })

    it('0 posts → 0 pages', () => {
        expect(calcPagesTotal(0)).toBe(0)
    })

    it('1 post → 1 page', () => {
        expect(calcPagesTotal(1)).toBe(1)
    })

    it('exactly 10 posts → 1 page', () => {
        expect(calcPagesTotal(10)).toBe(1)
    })

    it('11 posts → 2 pages', () => {
        expect(calcPagesTotal(11)).toBe(2)
    })
})

describe('section filtering', () => {
    const posts = [
        { frontMatter: { section: 'dev', date: '2024-01-01' } },
        { frontMatter: { section: 'dev', date: '2024-01-02' } },
        { frontMatter: { section: 'life', date: '2024-01-03' } },
        { frontMatter: { date: '2024-01-04' } },
    ]

    it('filters dev section only', () => {
        const result = posts.filter((p) => p.frontMatter.section === 'dev')
        expect(result).toHaveLength(2)
        expect(result.every((p) => p.frontMatter.section === 'dev')).toBe(true)
    })

    it('filters life section only', () => {
        const result = posts.filter((p) => p.frontMatter.section === 'life')
        expect(result).toHaveLength(1)
        expect(result[0].frontMatter.section).toBe('life')
    })

    it('no filter returns all posts', () => {
        expect(posts).toHaveLength(4)
    })
})

describe('paths.ts page route generation', () => {
    // Simulate the paths generation logic: skip page 1 (handled by index route)
    function generatePagePaths(pagesTotal: number): { params: { page: string } }[] {
        return Array.from({ length: pagesTotal - 1 }, (_, i) => ({
            params: { page: String(i + 2) },
        }))
    }

    it('does not generate page=1 path', () => {
        const paths = generatePagePaths(5)
        expect(paths.some((p) => p.params.page === '1')).toBe(false)
    })

    it('generates pages 2..N', () => {
        const paths = generatePagePaths(5)
        expect(paths.map((p) => p.params.page)).toEqual(['2', '3', '4', '5'])
    })

    it('pagesTotal=1 returns empty paths array', () => {
        expect(generatePagePaths(1)).toHaveLength(0)
    })
})
