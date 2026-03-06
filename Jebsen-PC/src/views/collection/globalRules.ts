import type { GlobalRuleConfig } from "./interface";

export const createDefaultGlobalRules = (): GlobalRuleConfig[] => {
  return [
    {
      key: "auto_source_stopped",
      enabled: true,
      extraRecipients: ""
    },
    {
      key: "data_quality_fatal",
      enabled: true,
      extraRecipients: ""
    },
    {
      key: "system_capacity_threshold",
      enabled: true,
      thresholdPercent: 50,
      extraRecipients: ""
    }
  ];
};
