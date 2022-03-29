const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/IndexPage.vue') }
        ]
    },
    {
        path: '/configuration',
        component: () => import('pages/ConfigurationPage.vue')
    },
    {
        path: '/code',
        component: () => import('pages/CodeRunner.vue')
    }
]

export default routes
