// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import NewLayout from './components/NewLayout.vue';

// 特定頁面使用的
import Archives from './components/page/Archives.vue';
import Category from './components/page/Category.vue';
import Tags from './components/page/Tags.vue';
import Page from './components/page/Page.vue';
import BlogSection from './components/page/BlogSection.vue';

// 可重複使用的
import BaseTag from './components/base/BaseTag.vue';
import BaseIcon from './components/base/BaseIcon.vue';
import BaseButton from './components/base/BaseButton.vue';
import BaseGithubGistIframe from './components/base/BaseGithubGistIframe.vue';

import './custom.css';
import 'virtual:uno.css';

export default {
    ...DefaultTheme,
    Layout: NewLayout,
    enhanceApp({ app, router, siteData }) {
        app.component('BaseButton', BaseButton);
        app.component('BaseGithubGistIframe', BaseGithubGistIframe);
        app.component('BaseIcon', BaseIcon);
        app.component('BaseTag', BaseTag);
        // ...
        app.component('Tags', Tags);
        app.component('Category', Category);
        app.component('Archives', Archives);
        app.component('Page', Page);
        app.component('BlogSection', BlogSection);
    },
} satisfies Theme;
