import axiosInstance, { publicAxiosInstance } from './axiosInstance';

export const documentEndpoints = {
  /**
   * Endpoint: /documents/detect
   * Phân tích và chuyển đổi hình ảnh sang văn bản markdown latex.
   */
  detectLayout: async (file: File) => {
    const formData = new FormData();
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
  gradeByRubric: async (file: File, documentJsonStr: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document', documentJsonStr);

    const response = await publicAxiosInstance.post('/gradings/rubrics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // { document_lines: [{ content, feedback, line_index, score }] }
  },
};
