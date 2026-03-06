<template>
  <div :style="'height:' + height">
    <div v-if="error" class="iframe-error">
      <el-alert :title="errorTitle" :description="errorDescription" type="warning" :closable="false" show-icon>
        <template #default>
          <div style="margin-top: 10px">
            <p>{{ errorDescription }}</p>
            <div v-if="isDruidPage" style="margin-top: 15px">
              <el-divider content-position="left">解决方案</el-divider>
              <div style="color: #606266; line-height: 1.8">
                <p style="margin: 8px 0"><strong>问题原因：</strong></p>
                <p style="margin: 8px 0; padding-left: 20px">
                  Druid 监控页面依赖外部 CDN 资源（CodeMirror），当前网络环境无法访问
                  <code style="background: #f5f7fa; padding: 2px 6px; border-radius: 3px">github.elemecdn.com</code>
                </p>
                <p style="margin: 15px 0 8px 0"><strong>解决方案：</strong></p>
                <ol style="margin: 8px 0; padding-left: 30px; line-height: 2">
                  <li>检查网络连接，确保可以访问外部 CDN 资源</li>
                  <li>配置网络代理或 VPN 以访问 GitHub CDN</li>
                  <li>联系系统管理员，在后端配置代理服务器替换 CDN 链接</li>
                  <li>使用浏览器开发者工具，手动替换 CDN 链接为可用的镜像源（如 jsDelivr、unpkg）</li>
                </ol>
                <p style="margin: 15px 0 8px 0; color: #909399; font-size: 12px">
                  <el-icon><InfoFilled /></el-icon>
                  注意：这是 Druid 监控系统本身的问题，不影响其他功能使用。
                </p>
              </div>
            </div>
          </div>
        </template>
      </el-alert>
    </div>
    <div v-loading="loading && !error" :style="'height:' + height">
      <iframe
        v-if="!error"
        :src="src"
        frameborder="no"
        style="width: 100%; height: 100%"
        scrolling="auto"
        @load="handleLoad"
        @error="handleError"
      />
    </div>
  </div>
</template>
<script>
import { InfoFilled } from "@element-plus/icons-vue";

export default {
  components: {
    InfoFilled
  },
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      height: document.documentElement.clientHeight - 94.5 + "px;",
      loading: true,
      error: false,
      errorTitle: "页面加载失败",
      errorDescription: "无法加载目标页面，请检查网络连接或联系管理员。"
    };
  },
  computed: {
    isDruidPage() {
      return this.src && this.src.includes("/druid/");
    }
  },
  mounted: function () {
    // 设置超时，如果 10 秒后还没加载完成，显示错误
    setTimeout(() => {
      if (this.loading) {
        this.handleError();
      }
    }, 10000);

    const that = this;
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 94.5 + "px;";
    };

    // 监听 iframe 内的错误（通过 window.onerror 捕获）
    if (this.isDruidPage) {
      this.setupErrorListener();
    }
  },
  methods: {
    handleLoad() {
      this.loading = false;
      // 延迟检查，因为 CodeMirror 错误可能在页面加载后才出现
      if (this.isDruidPage) {
        setTimeout(() => {
          this.checkCodeMirrorError();
        }, 2000);
      }
    },
    handleError() {
      this.loading = false;
      this.error = true;
      if (this.isDruidPage) {
        this.errorTitle = "Druid 监控页面加载失败";
        this.errorDescription = "Druid 监控页面依赖外部 CDN 资源（CodeMirror），当前网络环境可能无法访问相关资源。";
      }
    },
    setupErrorListener() {
      // 尝试通过 postMessage 与 iframe 通信（如果同源）
      // 注意：由于跨域限制，可能无法直接访问 iframe 内容
      window.addEventListener("message", event => {
        // 可以在这里处理来自 iframe 的消息
        if (event.data && event.data.type === "codemirror-error") {
          this.handleCodeMirrorError();
        }
      });
    },
    checkCodeMirrorError() {
      // 由于跨域限制，无法直接检查 iframe 内的 CodeMirror
      // 这里可以添加其他检查逻辑
    },
    handleCodeMirrorError() {
      if (!this.error) {
        this.error = true;
        this.errorTitle = "CodeMirror 加载失败";
        this.errorDescription = "Druid 监控页面所需的 CodeMirror 库无法从 CDN 加载。";
      }
    }
  }
};
</script>
<style scoped>
.iframe-error {
  padding: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
