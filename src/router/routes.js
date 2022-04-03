const routes = [
    {
        path: '/configuration',
        name: "configuration",
        props: true,
        component: () => import('pages/ConfigurationPage.vue')
    },
    {
        path: '/code',
        name: "code",
        props: true,
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
    },
    {
        path: '/needupdate',
        name: 'needupdate',
        props: true,
        component: () => import('pages/NeedUpdate.vue')
    }

]

export default routes
