import type { Component, CSSProperties } from 'vue';
import { markRaw, ref } from 'vue';
import { DEFAULT_TENANT_ID } from '@vben/constants';
import { createGlobalState } from '@vueuse/core';
import { authBinding } from '#/api/core/auth';

/**
 * @description: oauth登录
 * @param title 标题
 * @param description 描述
 * @param avatar 图标
 * @param color 图标颜色可直接写英文颜色/hex
 */
export interface ListItem {
  title: string;
  description: string;
  avatar?: Component;
  style?: CSSProperties;
}

/**
 * @description: 绑定账号
 * @param source 来源 如gitee github 与后端的social-callback?source=xxx对应
 * @param bound 是否已经绑定
 */
export interface BindItem extends ListItem {
  source: string;
  bound?: boolean;
}

/**
 * 这里存储登录页的tenantId 由于个人中心也会用到 需要共享
 * 所以使用`createGlobalState`
 * @see https://vueuse.org/shared/createGlobalState/
 */
export const useLoginTenantId = createGlobalState(() => {
  const loginTenantId = ref(DEFAULT_TENANT_ID);

  return {
    loginTenantId
  };
});

/**
 * 绑定授权
 * @param source
 */
export async function handleAuthBinding(source: string) {
  const { loginTenantId } = useLoginTenantId();
  // 这里返回打开授权页面的链接
  const href = await authBinding(source, loginTenantId.value);
  window.location.href = href;
}
