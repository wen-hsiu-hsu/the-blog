import { describe, it, expect } from 'vitest'
import { deriveSection } from './publish-posts.js'

describe('deriveSection', () => {
    it('explicit section: dev → dev', () => {
        expect(deriveSection({ section: 'dev', category: '生活亂談' })).toBe('dev')
    })

    it('explicit section: life → life', () => {
        expect(deriveSection({ section: 'life', category: 'JavaScript' })).toBe('life')
    })

    it('no section + category 生活亂談 → life', () => {
        expect(deriveSection({ category: '生活亂談' })).toBe('life')
    })

    it('no section + other category → dev', () => {
        expect(deriveSection({ category: 'JavaScript' })).toBe('dev')
    })

    it('no section + no category → dev', () => {
        expect(deriveSection({})).toBe('dev')
    })
})
