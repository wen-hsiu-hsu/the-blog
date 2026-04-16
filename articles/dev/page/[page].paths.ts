import { getPosts } from '../../../.vitepress/theme/serverUtils';

export default {
    async paths() {
        const { pagesTotal } = await getPosts({ section: 'dev' });
        return Array.from({ length: pagesTotal }, (_, index) => ({
            params: { page: index + 1 },
        })).filter((item) => item.params.page !== 1);
    },
};
