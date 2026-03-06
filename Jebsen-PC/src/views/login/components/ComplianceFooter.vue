<template>
  <div class="compliance-footer">
    <div class="region-tabs-container">
      <div
        v-for="region in regions"
        :key="region.code"
        class="region-tab-item"
        :class="{ active: currentRegion === region.code }"
        @click="selectRegion(region.code)"
      >
        <span class="region-code">{{ region.code }}</span>
        <span class="region-name">{{ region.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Region {
  code: string;
  name: string;
  policyUrl: string;
  termsUrl: string;
}

const regions = computed<Region[]>(() => [
  {
    code: "CN",
    name: "中国大陆",
    policyUrl: "https://example.com/privacy/cn",
    termsUrl: "https://example.com/terms/cn"
  },
  {
    code: "HK",
    name: "中国香港",
    policyUrl: "https://example.com/privacy/hk",
    termsUrl: "https://example.com/terms/hk"
  },
  {
    code: "MO",
    name: "中国澳门",
    policyUrl: "https://example.com/privacy/mo",
    termsUrl: "https://example.com/terms/mo"
  }
]);

const currentRegion = ref<string>("CN");

// 模拟IP地址检测
const detectRegionByIP = async (): Promise<string> => {
  try {
    return "CN";
  } catch (error) {
    console.error("Failed to detect region:", error);
    return "CN";
  }
};

const selectRegion = (code: string) => {
  currentRegion.value = code;
  localStorage.setItem("selectedRegion", code);
};

onMounted(async () => {
  const savedRegion = localStorage.getItem("selectedRegion");
  if (savedRegion) {
    currentRegion.value = savedRegion;
  } else {
    const detected = await detectRegionByIP();
    currentRegion.value = detected;
  }
});
</script>

<style scoped lang="scss">
.compliance-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0 0;

  .region-tabs-container {
    display: inline-flex;
    align-items: center;
    padding: 4px;
    background: #ecf3f8; /* Light blueish gray background */
    border-radius: 8px;

    .region-tab-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 24px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      user-select: none;

      .region-code {
        font-weight: 700;
        font-size: 15px;
        color: #64748b;
      }

      .region-name {
        font-size: 14px;
        color: #64748b;
        font-weight: 400;
        white-space: nowrap;
      }

      &.active {
        background: #ffffff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); // Soft shadow

        .region-code {
          color: #0ea5e9; // Highlight blue
        }

        .region-name {
          color: #0ea5e9;
        }
      }

      &:hover:not(.active) {
        background: rgba(255, 255, 255, 0.5);
        .region-code,
        .region-name {
          color: #475569;
        }
      }
    }
  }
}
</style>
