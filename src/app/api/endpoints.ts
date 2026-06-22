import axiosInstance, { publicAxiosInstance } from './axiosInstance';

export const queueEndpoints = {
  /**
   * Endpoint: /queues/register
   * Đăng ký hàng đợi và nhận task_id
   */
  registerQueue: async () => {
    const response = await publicAxiosInstance.post('/queues/register');
    return response.data; // { status, data: { task_id, lane, position } }
  },
};

export const documentEndpoints = {
  /**
   * Endpoint: /documents/detect
   * Phân tích và chuyển đổi hình ảnh sang văn bản markdown latex.
   */
  detectLayout: async (taskId: string, file: File, modelOption: string = 'Scorify Medium') => {
    const formData = new FormData();
    formData.append('task_id', taskId);
    formData.append('model_option', modelOption);
    formData.append('file', file);

    const response = await publicAxiosInstance.post('/documents/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // { document_lines: [...] }
  },
};

export const gradingEndpoints = {
  /**
   * Endpoint: /gradings/rubrics
   * Nhận file ảnh và văn bản (document) để chấm điểm chi tiết theo từng dòng.
   */
  gradeByRubric: async (taskId: string, examFile: File, rubricFile: File, documentJsonStr: string, modelOption: string = 'Scorify Medium') => {
    const formData = new FormData();
    formData.append('task_id', taskId);
    formData.append('model_option', modelOption);
    formData.append('exam_file', examFile);
    formData.append('rubrics_file', rubricFile);
    formData.append('document', documentJsonStr);

    const response = await publicAxiosInstance.post('/gradings/rubrics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // { document_lines: [{ content, feedback, line_index, score }] }
  },
};