import http from "@/api";
import { ResPage } from "@/api/interface";
import { PORT1 } from "@/api/config/servicePort";
import type {
  CollectionConfig,
  CollectionConfigResponse,
  CollectionMonitor,
  CollectionMonitorListResponse,
  NudgeForm,
  NudgeResponse,
  Employee
} from "@/views/collection/interface";

/**
 * 获取催收配置
 */
export const getCollectionConfig = (): Promise<CollectionConfigResponse> => {
  return http.get<CollectionConfig>(`${PORT1}/collection/config`).then((res: any) => {
    // 如果后端返回的数据格式不包含 schedules，转换为新格式
    if (res.data && !res.data.schedules && res.data.targetRoles) {
      res.data = {
        ...res.data,
        schedules: [
          { stage: "T+0", time: "18:00", recipientType: "owner", recipientEmail: "", description: "" },
          { stage: "T+1", time: "9:00", recipientType: "owner", recipientEmail: "", description: "" },
          { stage: "T+2", time: "9:00", recipientType: "dept_head", recipientEmail: "", description: "" }
        ]
      };
    }
    // 兼容旧格式：如果 schedules 中有 recipients 字段，转换为新格式
    if (res.data && res.data.schedules) {
      res.data.schedules = res.data.schedules.map((schedule: any) => {
        if (schedule.recipients && !schedule.recipientEmail) {
          return {
            ...schedule,
            recipientType: schedule.recipients[0] || "owner",
            recipientEmail: ""
          };
        }
        return schedule;
      });
    }
    return res;
  });
};

/**
 * 保存催收配置
 */
export const saveCollectionConfig = (data: CollectionConfig): Promise<CollectionConfigResponse> => {
  return http.post(`${PORT1}/collection/config`, data);
};

/**
 * 获取催收监控列表
 */
export const getCollectionMonitorList = (params: any): Promise<CollectionMonitorListResponse> => {
  return http.post<ResPage<CollectionMonitor>>(`${PORT1}/collection/monitor/list`, params);
};

/**
 * 发送催收通知
 */
export const sendNudge = (data: NudgeForm & { employeeId: number }): Promise<NudgeResponse> => {
  return http.post(`${PORT1}/collection/nudge`, data);
};

/**
 * 获取员工列表（用于选择收件人）
 */
export const getEmployeeList = (): Promise<{ code: number; msg: string; data: Employee[] }> => {
  return http.get<Employee[]>(`${PORT1}/collection/employees`);
};
