import { describe, it, expect } from 'vitest'
import { getPaginationLink } from './pagination'

describe('getPaginationLink', () => {
    it('page=1 with root pageBase returns /', () => {
        expect(getPaginationLink(1, '/page/')).toBe('/')
    })

    it('page=1 with /dev/page/ returns /dev/', () => {
        expect(getPaginationLink(1, '/dev/page/')).toBe('/dev/')
    })

    it('page=1 with /life/page/ returns /life/', () => {
        expect(getPaginationLink(1, '/life/page/')).toBe('/life/')
    })

    it('page=2 returns pageBase + 2', () => {
        expect(getPaginationLink(2, '/page/')).toBe('/page/2')
    })

    it('page=3 returns pageBase + 3', () => {
        expect(getPaginationLink(3, '/dev/page/')).toBe('/dev/page/3')
    })
})
