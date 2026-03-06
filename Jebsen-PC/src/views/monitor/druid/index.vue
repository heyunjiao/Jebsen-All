<template>
  <div class="druid-container">
    <el-alert
      v-if="showWarning"
      title="Druid 监控页面提示"
      type="info"
      :closable="true"
      @close="showWarning = false"
      style="margin-bottom: 10px"
    >
      <template #default>
        <div>
          <p>Druid 监控页面依赖外部 CDN 资源（CodeMirror），如果出现加载失败或 CodeMirror 未定义的错误：</p>
          <ul style="margin: 10px 0; padding-left: 20px">
            <li>这是 Druid 监控系统本身的问题，不影响其他功能</li>
            <li>可能是网络环境无法访问 GitHub CDN 导致的</li>
            <li>可以尝试刷新页面或检查网络连接</li>
            <li>如果问题持续，请联系系统管理员配置代理或使用本地资源</li>
          </ul>
        </div>
      </template>
    </el-alert>
    <i-frame :src="url" />
  </div>
</template>
<script>
import iFrame from "@/components/iFrame/index.vue";
export default {
  name: "Druid",
  components: { iFrame },
  data() {
    return {
      url: import.meta.env.VITE_API_URL + "/druid/login.html",
      showWarning: true
    };
  },
  mounted() {
    // 3秒后自动关闭提示
    setTimeout(() => {
      this.showWarning = false;
    }, 5000);
  }
};
</script>
<style scoped>
.druid-container {
  height: 100%;
}
</style>
