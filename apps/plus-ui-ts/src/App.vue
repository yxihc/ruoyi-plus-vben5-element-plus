<!--<template>-->
<!--  <el-config-provider :locale="appStore.locale" :size="appStore.size">-->
<!--    <router-view />-->
<!--  </el-config-provider>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { useSettingsStore } from '@/store/modules/settings';-->
<!--import { handleThemeStyle } from '@/utils/theme';-->
<!--import { useAppStore } from '@/store/modules/app';-->

<!--const appStore = useAppStore();-->

<!--onMounted(() => {-->
<!--  nextTick(() => {-->
<!--    // 初始化主题样式-->
<!--    handleThemeStyle(useSettingsStore().theme);-->
<!--  });-->
<!--});-->
<!--</script>-->

<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app';
import { useElementPlusDesignTokens } from '@vben/hooks';
const appStore = useAppStore();
import { ElConfigProvider } from 'element-plus';

import { elementLocale } from '#/locales';

defineOptions({ name: 'App' });

useElementPlusDesignTokens();
</script>

<template>
  <ElConfigProvider :locale="elementLocale">
    <RouterView />
  </ElConfigProvider>
</template>
