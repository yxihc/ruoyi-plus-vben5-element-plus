import type { ComponentRecordType, GenerateMenuAndRoutesOptions, RouteMeta, RouteRecordStringComponent } from '@vben/types';

import type { Menu } from '#/api';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { ElLoading } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

import { localMenuList } from './routes/local';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');
const NotFoundComponent = () => import('#/views/_core/fallback/not-found.vue');

/**
 * 后端返回的meta有时候不包括需要的信息 比如activePath等
 * 在这里定义映射
 */
const routeMetaMapping: Record<string, Omit<RouteMeta, 'title'>> = {
  '/system/role-auth/user/:roleId': {
    activePath: '/system/role',
    requireHomeRedirect: true
  },

  '/system/oss-config/index': {
    activePath: '/system/oss',
    requireHomeRedirect: true
  },

  '/tool/gen-edit/index/:tableId': {
    activePath: '/tool/gen',
    requireHomeRedirect: true
  },

  '/workflow/design/index': {
    activePath: '/workflow/processDefinition',
    requireHomeRedirect: true
  },

  '/workflow/leaveEdit/index': {
    activePath: '/demo/leave',
    requireHomeRedirect: true
  }
};

/**
 * 后台路由转vben路由
 * @param menuList 后台菜单
 * @param parentPath 上级目录
 * @returns vben路由
 */
function backMenuToVbenMenu(menuList: Menu[], parentPath = ''): RouteRecordStringComponent[] {
  const resultList: RouteRecordStringComponent[] = [];
  menuList.forEach((menu) => {
    // 根目录为菜单形式
    // 固定有一个children  children为当前菜单
    if (menu.path === '/' && menu.children && menu.children.length === 1) {
      if (!menu.children || !menu.children[0]) {
        return;
      }

      // 需要处理根目录为内嵌的情况 不会带InnerLink
      if (/^https?:\/\//.test(menu.children[0].path)) {
        menu.children[0].component = 'InnerLink';
        menu.children[0].path = menu.children[0].path
          .replaceAll(/^https?:\/\//g, '')
          .replaceAll('/#/', '')
          .replaceAll('#', '')
          .replaceAll(/[?&]/g, '');
      }

      // 取子路径作为父级路径
      const path = menu.children[0].path;
      // 取子菜单的meta作为当前菜单的meta
      menu.meta = menu.children[0].meta;
      // 由于在一级路由 父级路径需要加上/
      menu.path = `/${path}`;
      menu.component = 'RootMenu';
      // 将子路径设置为''
      menu.children[0].path = '';
    }

    // 外链: http开头 & 组件为Layout || ParentView
    // 正则判断是否为http://或者https://开头
    if (/^https?:\/\//.test(menu.path) && (menu.component === 'Layout' || menu.component === 'ParentView')) {
      menu.component = 'Link';
    }

    // 内嵌iframe 组件为InnerLink
    if (menu.meta?.link && menu.component === 'InnerLink') {
      menu.component = 'IFrameView';
    }

    /**
     * 拼接path
     * menu.path为''(根目录路由) 则不拼接
     */
    if (parentPath && menu.path) {
      menu.path = `${parentPath}/${menu.path}`;
    }

    // 创建vben路由对象
    const vbenRoute: RouteRecordStringComponent = {
      component: menu.component,
      meta: {
        // 当前路由不在菜单显示 但是可以通过链接访问
        // 不可访问的路由由后端控制隐藏(不返回对应路由)
        hideInMenu: menu.hidden,
        icon: menu.meta?.icon,
        keepAlive: !menu.meta?.noCache,
        title: menu.meta?.title
      },
      name: menu.name,
      path: menu.path
    };

    // 处理meta映射
    if (Object.keys(routeMetaMapping).includes(vbenRoute.path)) {
      const routeMeta = routeMetaMapping[vbenRoute.path];
      if (routeMeta) {
        vbenRoute.meta = {
          ...vbenRoute.meta,
          ...(routeMeta as RouteMeta)
        };
      }
    }

    // 添加路由参数信息
    if (menu.query) {
      try {
        const query = JSON.parse(menu.query);
        vbenRoute.meta && (vbenRoute.meta.query = query);
      } catch {
        console.error('错误的路由参数类型, 必须为[json]格式');
      }
    }

    /**
     * 处理不同组件
     */
    switch (menu.component) {
      /**
       * iframe内嵌
       */
      case 'IFrameView': {
        vbenRoute.component = 'IFrameView';
        if (vbenRoute.meta) {
          vbenRoute.meta.iframeSrc = menu.meta.link;
        }
        /**
         * 需要判断特殊情况  比如vue的hash是带#的
         * 比如链接 aaa.com/#/bbb  path会转换为 aaa/com/#/bbb
         * 比如链接 aaa.com/?bbb=xxx
         * 需要去除#  否则无法被添加到路由
         */
        vbenRoute.path = vbenRoute.path
          // 替换https:// 或者 http://
          .replaceAll(/^https?:\/\//g, '')
          .replaceAll('/#/', '')
          .replaceAll('#', '')
          .replaceAll(/[?&]/g, '');
        break;
      }
      case 'Layout': {
        vbenRoute.component = 'BasicLayout';
        break;
      }
      /**
       * 外链 新窗口打开
       */
      case 'Link': {
        if (vbenRoute.meta) {
          vbenRoute.meta.link = menu.meta.link;
        }
        vbenRoute.component = 'BasicLayout';
        break;
      }
      /**
       * 三级以上菜单 父级component为ParentView
       * 不能为layout 会套两层BasicLayout
       */
      case 'ParentView': {
        vbenRoute.component = '';
        break;
      }
      /**
       * 根目录菜单
       */
      case 'RootMenu': {
        if (vbenRoute.meta) {
          vbenRoute.meta.hideChildrenInMenu = true;
        }
        vbenRoute.component = 'BasicLayout';
        break;
      }
      /**
       * 其他自定义组件 如system/user/index 拼接/
       */
      default: {
        vbenRoute.component = `/${menu.component}`;
        break;
      }
    }

    // children处理
    if (menu.children && menu.children.length > 0) {
      vbenRoute.children = backMenuToVbenMenu(menu.children, menu.path);
    }
    // 添加
    resultList.push(vbenRoute);
  });
  return resultList;
}

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
    NotFoundComponent
  };

  console.log('preferences.app.accessMode', preferences.app.accessMode);
  return await generateAccessible('backend', {
    ...options,
    fetchMenuListAsync: async () => {
      // 清除以前的message
      const loadingInstance = ElLoading.service({
        text: `${$t('common.loadingMenu')}...`
      });
      setTimeout(() => {
        loadingInstance.close();
      }, 1000);
      // 后台返回路由/菜单
      const backMenuList = await getAllMenusApi();
      // 转换为vben能用的路由
      const vbenMenuList = backMenuToVbenMenu(backMenuList);
      // 特别注意 这里要深拷贝
      const menuList = [...cloneDeep(localMenuList), ...vbenMenuList];
      console.log('menuList', menuList);
      return menuList;
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap
  });
}

export { generateAccess };
