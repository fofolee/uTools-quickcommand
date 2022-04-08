const routes = [{
        path: '/configuration',
        component: () =>
            import ('pages/ConfigurationPage.vue')
    },
    {
        path: '/code',
        component: () =>
            import ('pages/RunCodePage.vue')
    },
    {
        path: '/newcommand',
        component: () =>
            import ('pages/NewCommand.vue')
    },
    {
        path: '/:type(default|files|key|regex|window|professional)_:uid(\\w+)',
        component: () =>
            import ('pages/CommandPage.vue')
    },
    {
        path: '/panel_:tags(\\w+)',
        component: () =>
            import ('pages/ConfigurationPage.vue')
    },
    {
        path: '/needupdate',
        name: 'needupdate',
        props: true,
        component: () =>
            import ('pages/updateWarningPage.vue')
    },
    {
        path: '/loading',
        component: () =>
            import ('pages/LoadingPage.vue')
    }

]

export default routes