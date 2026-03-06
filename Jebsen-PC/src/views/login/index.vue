<template>
  <div class="dashboard-login-layout">
    <!-- Background -->
    <div class="background-layer">
      <DataAutomotiveBackground />
    </div>

    <!-- Top Header -->
    <header class="login-header">
      <div class="header-left">
        <img class="logo-sm" src="@/assets/images/logo.svg" alt="Logo" />
        <span class="system-name">CompanyX IDaaS</span>
      </div>
      <div class="header-right">
        <div class="status-pill">
          <span class="dot"></span>
          <span class="text">{{ $t("login.status.operational") }}</span>
        </div>

        <el-dropdown trigger="click" @command="handleSetLanguage">
          <div class="lang-switch">
            <span class="icon">🌐</span>
            <span class="text">{{ languageLabels[language] || "Language" }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh" :disabled="language === 'zh'">简体中文</el-dropdown-item>
              <el-dropdown-item command="zh-TW" :disabled="(language as string) === 'zh-TW'">繁體中文</el-dropdown-item>
              <el-dropdown-item command="en" :disabled="language === 'en'">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- Main Content -->
    <main class="login-main">
      <div class="content-wrapper">
        <!-- INTRO SECTION (Moved Above) -->
        <div class="hero-intro">
          <h1 class="hero-title">
            {{ $t("login.slogan") }}
          </h1>
          <p class="hero-subtitle">
            {{ $t("login.subtitle") }}
          </p>

          <!-- Feature Tags -->
          <div class="feature-tags">
            <div class="tag-item">
              <span class="icon">🛡️</span>
              <span class="text">{{ $t("login.feature1") }}</span>
            </div>
            <div class="tag-item">
              <span class="icon">⚡</span>
              <span class="text">{{ $t("login.feature2") }}</span>
            </div>
            <div class="tag-item">
              <span class="icon">🌍</span>
              <span class="text">{{ $t("login.feature3") }}</span>
            </div>
          </div>
        </div>

        <!-- Login Card -->
        <div class="login-card glass-panel">
          <div class="card-header-text">
            <h3>{{ $t("login.title") }}</h3>
          </div>
          <LoginForm />
        </div>

        <!-- Compliance Area -->
        <div class="bottom-compliance">
          <ComplianceFooter />
        </div>
      </div>
    </main>

    <!-- Bottom Footer -->
    <footer class="login-footer">
      <p>&copy; 2026 CompanyX Motors Inc. All Rights Reserved.</p>
      <div class="links">
        <span>{{ $t("login.help") }}</span>
        <span class="divider">|</span>
        <span>{{ $t("login.privacy") }}</span>
        <span class="divider">|</span>
        <span>{{ $t("login.support") }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts" name="login">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useGlobalStore } from "@/stores/modules/global";
import LoginForm from "./components/LoginForm.vue";
import ComplianceFooter from "./components/ComplianceFooter.vue";
import DataAutomotiveBackground from "./components/DataAutomotiveBackground.vue";

const i18n = useI18n();
const globalStore = useGlobalStore();
const language = computed(() => globalStore.language || "zh");

const languageLabels: Record<string, string> = {
  zh: "简体中文",
  "zh-TW": "繁體中文",
  en: "English"
};

const handleSetLanguage = (lang: string) => {
  i18n.locale.value = lang;
  globalStore.setGlobalState("language", lang as any);
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
