export function getPaginationLink(page: number, pageBase: string): string {
    if (page === 1) {
        return pageBase === '/page/' ? '/' : pageBase.replace('/page/', '/')
    }
    return `${pageBase}${page}`
}
