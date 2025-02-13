const routes = [
  {
    path: "/configuration",
    name: "configuration",
    component: () => import("pages/ConfigurationPage.vue"),
  },
  {
    path: "/code",
    name: "code",
    component: () => import("pages/RunCodePage.vue"),
  },
  {
    path: "/composer",
    name: "composer",
    component: () => import("pages/RunComposerPage.vue"),
  },
  {
    path: "/newcommand",
    name: "newcommand",
    component: () => import("pages/ConfigurationPage.vue"),
  },
  {
    path: "/importcommand",
    name: "importcommand",
    component: () => import("pages/ConfigurationPage.vue"),
  },
  {
    path: "/:type(default|files|img|key|regex|over|window|professional)_:uid(\\w+)",
    name: "command",
    component: () => import("pages/CommandPage.vue"),
  },
  {
    path: "/panel_:tags(\\w+)",
    name: "panel",
    component: () => import("pages/ConfigurationPage.vue"),
  },
  {
    path: "/needupdate",
    name: "needupdate",
    props: true,
    component: () => import("pages/updateWarningPage.vue"),
  },
  {
    path: "/",
    name: "loading",
    component: () => import("pages/LoadingPage.vue"),
  },
  {
    path: "/feature_:featuretype(\\w+)",
    name: "feature",
    component: () => import("pages/FeaturesPage.vue"),
  },
  {
    path: "/server",
    name: "server",
    component: () => import("pages/ServerPage.vue"),
  },
];

export default routes;
