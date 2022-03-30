const routes = [
    {
        path: '/configuration',
        component: () => import('pages/ConfigurationPage.vue')
    },
    {
        path: '/code',
        component: () => import('pages/CodeRunner.vue')
    },
    {
        path: '/newcommand',
        component: () => import('pages/NewCommand.vue')
    },
    {
        path: '/:type(default|files|key|regex|window|professional)_:uid(\\w{11})',
        component: () => import('pages/CommandPage.vue')
    },
    {
        path: '/panel_:tags(\\w+)',
        component: () => import('pages/QuickPanel.vue')
    }

]

export default routes
