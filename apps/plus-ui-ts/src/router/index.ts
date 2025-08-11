// import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';
// /* Layout */
// import Layout from '@/layout/index.vue';
// import { BasicLayout } from '@/layouts';
//
// /**
//  * Note: 路由配置项
//  *
//  * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
//  * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
//  *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
//  *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
//  *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
//  * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
//  * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
//  * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
//  * roles: ['admin', 'common']       // 访问路由的角色权限
//  * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
//  * meta : {
//  noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
//  title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
//  icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
//  breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
//  activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
//  }
//  */
//
// // 公共路由
// export const constantRoutes: RouteRecordRaw[] = [
//   {
//     path: '/redirect',
//     component: Layout,
//     hidden: true,
//     children: [
//       {
//         path: '/redirect/:path(.*)',
//         component: () => import('@/views/redirect/index.vue')
//       }
//     ]
//   },
//   {
//     path: '/social-callback',
//     hidden: true,
//     component: () => import('@/layout/components/SocialCallback/index.vue')
//   },
//   {
//     path: '/login',
//     component: () => import('@/views/login.vue'),
//     hidden: true
//   },
//   {
//     path: '/register',
//     component: () => import('@/views/register.vue'),
//     hidden: true
//   },
//   {
//     path: '/:pathMatch(.*)*',
//     component: () => import('@/views/error/404.vue'),
//     hidden: true
//   },
//   {
//     path: '/401',
//     component: () => import('@/views/error/401.vue'),
//     hidden: true
//   },
//   {
//     path: '',
//     component: Layout,
//     redirect: '/index',
//     children: [
//       {
//         path: '/index',
//         component: () => import('@/views/index.vue'),
//         name: 'Index',
//         meta: { title: '首页', icon: 'dashboard', affix: true }
//       }
//     ]
//   },
//
//   {
//     component: BasicLayout,
//     name: 'Root',
//     path: '/t',
//     children: [
//       {
//         path: '/tt',
//         component: () => import('@/views/system/user/index.vue'),
//         hidden: true
//       }
//     ]
//   },
//   {
//     path: '/user',
//     component: Layout,
//     hidden: true,
//     redirect: 'noredirect',
//     children: [
//       {
//         path: 'profile',
//         component: () => import('@/views/system/user/profile/index.vue'),
//         name: 'Profile',
//         meta: { title: '个人中心', icon: 'user' }
//       }
//     ]
//   }
// ];
//
// // 动态路由，基于用户权限动态去加载
// export const dynamicRoutes: RouteRecordRaw[] = [];
//
// /**
//  * 创建路由
//  */
// export const router = createRouter({
//   history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
//   routes: constantRoutes,
//   // 刷新时，滚动条位置还原
//   scrollBehavior(to, from, savedPosition) {
//     if (savedPosition) {
//       return savedPosition;
//     }
//     return { top: 0 };
//   }
// });
//
export const constantRoutes: RouteRecordRaw[] = [];
export const dynamicRoutes: RouteRecordRaw[] = [];

import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router';

import { resetStaticRoutes } from '@vben/utils';

import { createRouterGuard } from './guard';
import { routes } from './routes';

/**
 *  @zh_CN 创建vue-router实例
 */
const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === 'hash' ? createWebHashHistory(import.meta.env.VITE_BASE) : createWebHistory(import.meta.env.VITE_BASE),
  // 应该添加到路由的初始路由列表。
  routes,
  scrollBehavior: (to, _from, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    }
    return to.hash ? { behavior: 'smooth', el: to.hash } : { left: 0, top: 0 };
  }
  // 是否应该禁止尾部斜杠。
  // strict: true,
});

const resetRoutes = () => resetStaticRoutes(router, routes);

// 创建路由守卫
createRouterGuard(router);
console.log(routes);

export { resetRoutes, router };
