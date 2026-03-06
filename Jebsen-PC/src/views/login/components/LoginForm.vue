<template>
  <div class="modern-login-form">
    <!-- SSO Login -->
    <div class="sso-section">
      <div class="sso-description">
        <p class="sso-text">{{ $t("login.sso.title") }}</p>
        <p class="sso-subtext">{{ $t("login.sso.subtitle") }}</p>
      </div>

      <button class="sso-login-btn" @click="handleSSOLogin" :disabled="ssoLoading">
        <span v-if="!ssoLoading" class="sso-btn-content">
          <svg class="sso-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
              fill="currentColor"
            />
          </svg>
          <span class="sso-btn-text">{{ $t("login.sso.button") }}</span>
        </span>
        <span v-else class="sso-loading">
          <span class="spinner"></span>
          <span>{{ $t("login.sso.loading") }}</span>
        </span>
      </button>

      <div class="agreement-section">
        <el-checkbox v-model="agreementChecked" class="custom-checkbox">
          {{ $t("login.form.agreement.prefix") }}
          <span class="link" @click.stop="openTerms">{{ $t("login.form.agreement.terms") }}</span>
          {{ $t("login.form.agreement.and") }}
          <span class="link" @click.stop="openPolicy">{{ $t("login.form.agreement.policy") }}</span>
        </el-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElNotification, ElMessage } from "element-plus";
import { HOME_URL } from "@/config";
import { loginApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { useTabsStore } from "@/stores/modules/tabs";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import { initDynamicRouter } from "@/routers/modules/dynamicRouter";
import md5 from "md5";
import { getTimeState } from "@/utils";

const router = useRouter();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();
const { t } = useI18n();

const ssoLoading = ref(false);
const agreementChecked = ref(true); // 默认自动勾选

// Open Terms/Policy
const openTerms = () => window.open("https://example.com/terms", "_blank");
const openPolicy = () => window.open("https://example.com/privacy", "_blank");

// Validate Agreement
const validateAgreement = () => {
  if (!agreementChecked.value) {
    ElMessage.warning(t("login.form.validation.agreement"));
    return false;
  }
  return true;
};

// Login Handler
const handleSSOLogin = async () => {
  if (!validateAgreement()) return;
  ssoLoading.value = true;

  try {
    const { data } = await loginApi({ username: "admin", password: md5("123456") });
    userStore.setToken(data.access_token);

    await initDynamicRouter();

    tabsStore.setTabs([]);
    keepAliveStore.setKeepAliveName([]);

    router.push(HOME_URL);
    ElNotification({
      title: getTimeState(),
      message: t("login.messages.success"),
      type: "success",
      duration: 3000
    });
  } catch (error: any) {
    ssoLoading.value = false;

    // WAF 拦截处理
    if (error.status === 403) {
      ElNotification({
        title: t("login.messages.limited"),
        message: t("login.messages.limitedDesc"),
        type: "error",
        duration: 5000
      });
    } else {
      ElNotification({
        title: t("login.messages.failed"),
        message: error.message || t("login.messages.failed"),
        type: "error",
        duration: 4000
      });
    }
  }
};

onMounted(() => {
  // 监听 enter 事件（调用登录）
  document.onkeydown = (e: KeyboardEvent) => {
    if (e.code === "Enter" || e.code === "enter" || e.code === "NumpadEnter") {
      if (!ssoLoading.value) {
        handleSSOLogin();
      }
    }
  };
});

onBeforeUnmount(() => {
  document.onkeydown = null;
});
</script>

<style scoped lang="scss">
.modern-login-form {
  width: 100%;

  .agreement-section {
    margin: 16px 0 20px;
    display: flex;
    justify-content: flex-start;

    .custom-checkbox {
      height: auto;

      :deep(.el-checkbox__label) {
        font-size: 13px;
        color: #64748b;
        white-space: normal;
        line-height: 1.5;
      }

      :deep(.el-checkbox__inner) {
        border-radius: 4px;
      }

      .link {
        color: #3b82f6;
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  // SSO Section
  .sso-section {
    .sso-description {
      margin-bottom: 24px;
      text-align: center;

      .sso-text {
        margin: 0 0 8px;
        font-size: 15px;
        font-weight: 500;
        color: #1e293b;
      }

      .sso-subtext {
        margin: 0;
        font-size: 13px;
        color: #94a3b8;
        letter-spacing: 0.5px;
      }
    }

    .sso-login-btn {
      width: 100%;
      padding: 16px 24px;
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      cursor: pointer;
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
      border: none;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .sso-btn-content,
      .sso-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .sso-icon {
        width: 22px;
        height: 22px;
      }

      .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
