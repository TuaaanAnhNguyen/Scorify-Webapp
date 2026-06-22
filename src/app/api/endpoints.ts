import { publicAxiosInstance } from './axiosInstance';

export interface QueueResponse {
  status: string;
  data: {
    task_id: string;
    lane: number;
    position: number;
  };
}

export const documentEndpoints = {
  /**
   * Đăng ký một task vào hàng đợi
   */
  registerQueue: async (): Promise<QueueResponse> => {
    const response = await publicAxiosInstance.post('/queues/register');
    return response.data;
  },

  /**
   * Endpoint: /documents/detect
   * Phân tích và chuyển đổi hình ảnh sang văn bản markdown latex kèm model_option.
   */
  detectLayout: async (file: File, modelOption: string, taskId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_option', modelOption);
    formData.append('task_id', taskId);

    const response = await publicAxiosInstance.post('/documents/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return response;
  },
};

export const gradingEndpoints = {
  /**
   * Endpoint: /gradings/rubrics
   * Đối chiếu bài làm với file rubric đáp án theo model_option cụ thể.
   */
  gradeByRubric: async (examFile: File, rubricsFile: File, documentJsonStr: string, modelOption: string, taskId: string) => {
    const formData = new FormData();
    formData.append('exam_file', examFile);
    formData.append('rubrics_file', rubricsFile);
    formData.append('document', documentJsonStr);
    formData.append('model_option', modelOption);
    formData.append('task_id', taskId);

    const response = await publicAxiosInstance.post('/gradings/rubrics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return response;
  },
};