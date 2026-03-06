<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <div>
              <span
                ><el-icon><Collection /></el-icon> 缓存列表</span
              >
              <el-button style="float: right; padding: 3px 0" type="text" @click="refreshCacheNames()">
                <el-icon><RefreshRight /></el-icon>
              </el-button>
            </div>
          </template>
          <ProTable
            :columns="cacheNameColumns"
            :data="cacheNames"
            :pagination="false"
            :tool-button="false"
            :border="false"
            row-key="cacheName"
            @row-click="getCacheKeys"
          >
            <template #cacheName="scope">
              {{ nameFormatter(scope.row) }}
            </template>
            <template #operation="scope">
              <el-button size="small" type="primary" link @click="handleClearCacheName(scope.row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </ProTable>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <div>
              <span
                ><el-icon><Key /></el-icon> 键名列表</span
              >
              <el-button style="float: right; padding: 3px 0" type="text" @click="refreshCacheKeys()">
                <el-icon><RefreshRight /></el-icon>
              </el-button>
            </div>
          </template>
          <ProTable
            :columns="cacheKeyColumns"
            :data="cacheKeys"
            :pagination="false"
            :tool-button="false"
            :border="false"
            row-key="cacheKey"
            @row-click="handleCacheValue"
          >
            <template #cacheKey="scope">
              {{ keyFormatter(scope.row) }}
            </template>
            <template #operation="scope">
              <el-button size="small" type="primary" link @click="handleClearCacheKey(scope.row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </ProTable>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card :bordered="false" style="height: calc(100vh - 125px)">
          <template #header>
            <div>
              <span
                ><el-icon><Document /></el-icon> 缓存内容</span
              >
              <el-button style="float: right; padding: 3px 0" type="text" @click="handleClearCacheAll()">
                <el-icon><RefreshRight /></el-icon>
                清理全部
              </el-button>
            </div>
          </template>
          <el-form :model="cacheForm">
            <el-row :gutter="32">
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存名称:" prop="cacheName">
                  <el-input v-model="cacheForm.cacheName" :read-only="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存键名:" prop="cacheKey">
                  <el-input v-model="cacheForm.cacheKey" :read-only="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存内容:" prop="cacheValue">
                  <el-input v-model="cacheForm.cacheValue" type="textarea" :rows="8" :read-only="true" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  listCacheName,
  listCacheKey,
  getCacheValue,
  clearCacheName,
  clearCacheKey,
  clearCacheAll
} from "@/api/modules/monitor/cache";
import ProTable from "@/components/ProTable/index.vue";
import { reactive } from "vue";
import { Collection, RefreshRight, Delete, Key, Document } from "@element-plus/icons-vue";

export default {
  name: "CacheList",
  components: {
    ProTable,
    Collection,
    RefreshRight,
    Delete,
    Key,
    Document
  },
  setup() {
    // 缓存名称表格列配置
    const cacheNameColumns = reactive([
      { type: "index", label: "序号", width: 60 },
      { prop: "cacheName", label: "缓存名称", align: "center" },
      { prop: "remark", label: "备注", align: "center", showOverflowTooltip: true },
      { prop: "operation", label: "操作", width: 60, align: "center", fixed: "right" }
    ]);

    // 缓存键名表格列配置
    const cacheKeyColumns = reactive([
      { type: "index", label: "序号", width: 60 },
      { prop: "cacheKey", label: "缓存键名", align: "center", showOverflowTooltip: true },
      { prop: "operation", label: "操作", width: 60, align: "center", fixed: "right" }
    ]);

    return {
      cacheNameColumns,
      cacheKeyColumns
    };
  },
  data() {
    return {
      cacheNames: [],
      cacheKeys: [],
      cacheForm: {},
      loading: true,
      subLoading: false,
      nowCacheName: "",
      tableHeight: window.innerHeight - 200
    };
  },
  created() {
    this.getCacheNames();
  },
  methods: {
    /** 查询缓存名称列表 */
    getCacheNames() {
      this.loading = true;
      listCacheName().then(response => {
        this.cacheNames = response.data;
        this.loading = false;
      });
    },
    /** 刷新缓存名称列表 */
    refreshCacheNames() {
      this.getCacheNames();
      this.$modal.msgSuccess("刷新缓存列表成功");
    },
    /** 清理指定名称缓存 */
    handleClearCacheName(row) {
      if (!row || !row.cacheName) {
        this.$modal.msgError("缓存名称不能为空");
        return;
      }
      clearCacheName(row.cacheName).then(response => {
        this.$modal.msgSuccess("清理缓存名称[" + row.cacheName + "]成功");
        this.getCacheKeys();
      });
    },
    /** 查询缓存键名列表 */
    getCacheKeys(row) {
      const cacheName = row !== undefined ? row.cacheName : this.nowCacheName;
      if (cacheName === "") {
        return;
      }
      this.subLoading = true;
      listCacheKey(cacheName).then(response => {
        this.cacheKeys = response.data;
        this.subLoading = false;
        this.nowCacheName = cacheName;
      });
    },
    /** 刷新缓存键名列表 */
    refreshCacheKeys() {
      this.getCacheKeys();
      this.$modal.msgSuccess("刷新键名列表成功");
    },
    /** 清理指定键名缓存 */
    handleClearCacheKey(cacheKey) {
      // 如果传入的是对象，提取实际的键名
      const key = typeof cacheKey === "string" ? cacheKey : cacheKey?.cacheKey || cacheKey;
      if (!key) {
        this.$modal.msgError("缓存键名不能为空");
        return;
      }
      clearCacheKey(key).then(response => {
        this.$modal.msgSuccess("清理缓存键名[" + key + "]成功");
        this.getCacheKeys();
      });
    },
    /** 列表前缀去除 */
    nameFormatter(row) {
      return row.cacheName.replace(":", "");
    },
    /** 键名前缀去除 */
    keyFormatter(cacheKey) {
      return cacheKey.replace(this.nowCacheName, "");
    },
    /** 查询缓存内容详细 */
    handleCacheValue(row) {
      // 如果传入的是对象，提取实际的键名；如果是字符串，直接使用
      const cacheKey = typeof row === "string" ? row : row?.cacheKey || row;
      if (!cacheKey) {
        return;
      }
      getCacheValue(this.nowCacheName, cacheKey).then(response => {
        this.cacheForm = response.data;
      });
    },
    /** 清理全部缓存 */
    handleClearCacheAll() {
      clearCacheAll().then(response => {
        this.$modal.msgSuccess("清理全部缓存成功");
      });
    }
  }
};
</script>
