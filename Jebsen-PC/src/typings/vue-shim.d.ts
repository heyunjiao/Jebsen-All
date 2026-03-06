/* Vue 组件扩展 - 使用 import type 确保 Vue 类型被加载 */
import type { ComponentCustomProperties } from "vue";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    parseTime: typeof import("@/utils").parseTime;
    $modal: typeof import("@/plugins/modal").default;
  }
}
