import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * 数据质量工作台 API
 */

// 上传文件并校验
export interface UploadFileParams {
  file: File;
  dataSource: string; // dms, poas, wws, cap
  reportType?: string; // specific report id for platforms with multiple reports
}

export interface ValidationError {
  rowIndex: number;
  column: string;
  value: any;
  errorMessage: string;
}

export interface ValidationResult {
  code: number;
  msg: string;
  data: {
    total: number;
    success: number;
    error: number;
    hasErrors: boolean;
    errorRows: Array<{
      rowIndex: number;
      [key: string]: any;
      errors: ValidationError[];
    }>;
    tableColumns?: string[];
  };
}

/**
 * 上传文件并校验
 */
export const uploadAndValidateFile = (params: UploadFileParams): Promise<ValidationResult> => {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("dataSource", params.dataSource);
  return http.post<ValidationResult["data"]>(PORT1 + `/dataQuality/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/**
 * 下载标准模板
 */
export const downloadTemplate = (dataSource: string, reportType?: string) => {
  const url = reportType ? `/dataQuality/template/${dataSource}/${reportType}` : `/dataQuality/template/${dataSource}`;
  return http.get(PORT1 + url, {
    responseType: "blob"
  });
};

/**
 * 提交数据（仅导入正确数据）
 */
export const importValidData = (params: { dataSource: string; fileId: string }) => {
  return http.post(PORT1 + `/dataQuality/import/valid`, params);
};

/**
 * 提交所有数据
 */
export const submitAllData = (params: { dataSource: string; fileId: string }) => {
  return http.post(PORT1 + `/dataQuality/submit/all`, params);
};

/**
 * 获取操作追溯日志
 */
export interface AuditLogItem {
  uploadTime: string;
  dataSource: string;
  fileName: string;
  operator: string;
  validationResult: "passed" | "failed" | "pending";
  uploadStatus: "success" | "failed" | "processing";
}

export interface AuditLogResponse {
  code: number;
  msg: string;
  data: {
    list: AuditLogItem[];
    total: number;
  };
}

export const getAuditLog = (params?: { page?: number; pageSize?: number }) => {
  return http.get<AuditLogResponse["data"]>(PORT1 + `/dataQuality/audit/log`, { params });
};
