<template>
  <div class="modern-login-form">
    <!-- Login Mode Tabs -->
    <div class="login-tabs">
      <button :class="['tab-btn', { active: loginMode === 'sso' }]" @click="loginMode = 'sso'">
        <span class="tab-icon">🔐</span>
        <span>{{ $t("login.tabs.sso") }}</span>
      </button>
      <button :class="['tab-btn', { active: loginMode === 'local' }]" @click="loginMode = 'local'">
        <span class="tab-icon">👤</span>
        <span>{{ $t("login.tabs.local") }}</span>
      </button>
    </div>

    <!-- SSO Login -->
    <div v-if="loginMode === 'sso'" class="sso-section">
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

      <div class="sso-info">
        <span class="info-icon">ℹ️</span>
        <span class="info-text">{{ $t("login.sso.info") }}</span>
      </div>
    </div>

    <!-- Traditional Login (Admin Fallback) -->
    <div v-else class="local-section">
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" :placeholder="$t('login.form.usernamePlaceholder')" class="modern-input">
            <template #prefix>
              <el-icon class="el-input__icon">
                <user />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="$t('login.form.passwordPlaceholder')"
            show-password
            autocomplete="new-password"
            class="modern-input"
          >
            <template #prefix>
              <el-icon class="el-input__icon">
                <lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <div class="agreement-section">
        <el-checkbox v-model="agreementChecked" class="custom-checkbox">
          {{ $t("login.form.agreement.prefix") }}
          <span class="link" @click.stop="openTerms">{{ $t("login.form.agreement.terms") }}</span>
          {{ $t("login.form.agreement.and") }}
          <span class="link" @click.stop="openPolicy">{{ $t("login.form.agreement.policy") }}</span>
        </el-checkbox>
      </div>

      <div class="login-btn">
        <el-button :icon="CircleClose" round size="large" @click="resetForm(loginFormRef)" class="reset-btn">
          {{ $t("login.buttons.reset") }}
        </el-button>
        <el-button
          :icon="UserFilled"
          round
          size="large"
          type="primary"
          :loading="loading"
          @click="login(loginFormRef)"
          class="submit-btn"
        >
          {{ $t("login.buttons.login") }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { HOME_URL } from "@/config";
import { Login } from "@/api/interface";
import { ElNotification, ElMessage } from "element-plus";
import { loginApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { useTabsStore } from "@/stores/modules/tabs";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import { initDynamicRouter } from "@/routers/modules/dynamicRouter";
import { CircleClose, UserFilled } from "@element-plus/icons-vue";
import type { ElForm } from "element-plus";
import md5 from "md5";
import { getTimeState } from "@/utils";

const router = useRouter();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();
const { t } = useI18n();

type FormInstance = InstanceType<typeof ElForm>;
const loginFormRef = ref<FormInstance>();
const loginMode = ref<"sso" | "local">("sso");
const ssoLoading = ref(false);
const agreementChecked = ref(true); // 默认自动勾选

const loginRules = computed(() => ({
  username: [{ required: true, message: t("login.form.validation.username"), trigger: "blur" }],
  password: [{ required: true, message: t("login.form.validation.password"), trigger: "blur" }]
}));

const loading = ref(false);
const loginForm = reactive<Login.ReqLoginForm>({
  username: "",
  password: ""
});

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

// SSO Login Handler
const handleSSOLogin = async () => {
  if (!validateAgreement()) return;
  ssoLoading.value = true;

  try {
    // OAuth 2.0 配置 - 实际项目中应该从配置文件读取
    const ssoConfig = {
      authUrl: "https://idaas.example.com/oauth/authorize", // IDaaS 授权端点
      clientId: "your-client-id",
      redirectUri: `${window.location.origin}/auth/callback`,
      responseType: "code",
      scope: "openid profile email"
    };

    // 构建 OAuth 授权 URL
    const authUrl = new URL(ssoConfig.authUrl);
    authUrl.searchParams.append("client_id", ssoConfig.clientId);
    authUrl.searchParams.append("redirect_uri", ssoConfig.redirectUri);
    authUrl.searchParams.append("response_type", ssoConfig.responseType);
    authUrl.searchParams.append("scope", ssoConfig.scope);
    authUrl.searchParams.append("state", generateState()); // CSRF 保护

    // 模拟延迟后跳转 (实际项目中直接跳转)
    await new Promise(resolve => setTimeout(resolve, 800));

    // 跳转到 IDaaS 授权页面
    // window.location.href = authUrl.toString();

    // 开发环境模拟 SSO 登录成功
    ElMessage.info(t("login.messages.ssoNeedConfig"));
    console.log("SSO Auth URL:", authUrl.toString());
    ssoLoading.value = false;
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

// 生成 CSRF 保护的 state
const generateState = (): string => {
  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem("oauth_state", state);
  return state;
};

// Traditional login
const login = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  if (!validateAgreement()) return;

  formEl.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      // 1.执行登录接口
      const { data } = await loginApi({ ...loginForm, password: md5(loginForm.password) });
      userStore.setToken(data.access_token);

      // 2.添加动态路由
      await initDynamicRouter();

      // 3.清空 tabs、keepAlive 数据
      tabsStore.setTabs([]);
      keepAliveStore.setKeepAliveName([]);

      // 4.跳转到首页
      router.push(HOME_URL);
      ElNotification({
        title: getTimeState(),
        message: t("login.messages.success"),
        type: "success",
        duration: 3000
      });
    } catch (error: any) {
      // WAF 拦截处理
      if (error.status === 403) {
        ElNotification({
          title: t("login.messages.limited"),
          message: t("login.messages.limitedDesc"),
          type: "error",
          duration: 5000
        });
      }
    } finally {
      loading.value = false;
    }
  });
};

// resetForm
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

onMounted(() => {
  // 监听 enter 事件（调用登录）
  document.onkeydown = (e: KeyboardEvent) => {
    if (e.code === "Enter" || e.code === "enter" || e.code === "NumpadEnter") {
      if (loginMode.value === "local" && !loading.value) {
        if (validateAgreement()) {
          login(loginFormRef.value);
        }
      } else if (loginMode.value === "sso" && !ssoLoading.value) {
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

  .login-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
    padding: 4px;
    background: #f1f5f9;
    border-radius: 10px;

    .tab-btn {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      background: transparent;
      border: none;
      border-radius: 7px;
      transition: all 0.2s ease;

      .tab-icon {
        font-size: 17px;
      }

      &:hover {
        color: #475569;
        background: rgba(255, 255, 255, 0.6);
      }

      &.active {
        color: #3b82f6;
        background: #ffffff;
        box-shadow:
          0 2px 8px rgba(0, 0, 0, 0.06),
          0 1px 2px rgba(0, 0, 0, 0.04);
      }
    }
  }

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

    .sso-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 18px;
      font-size: 13px;
      color: #94a3b8;

      .info-icon {
        font-size: 16px;
      }
    }
  }

  // Local Login Section
  .local-section {
    .modern-input {
      :deep(.el-input__wrapper) {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        box-shadow: none;
        transition: all 0.2s ease;

        &:hover {
          background: #ffffff;
          border-color: #cbd5e1;
        }

        &.is-focus {
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }

      :deep(.el-input__inner) {
        color: #1e293b;

        &::placeholder {
          color: #94a3b8;
        }
      }

      :deep(.el-input__icon) {
        color: #64748b;
      }
    }

    :deep(.el-form-item) {
      margin-bottom: 20px;
    }

    .login-btn {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-top: 16px;

      .el-button {
        flex: 1;
        padding: 13px 20px;
        font-size: 15px;
        font-weight: 600;
        border: none;
        transition: all 0.2s ease;

        &.reset-btn {
          color: #64748b;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;

          &:hover {
            color: #475569;
            background: #e2e8f0;
            border-color: #cbd5e1;
            transform: translateY(-1px);
          }
        }

        &.submit-btn {
          color: #ffffff;
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
          }
        }
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
