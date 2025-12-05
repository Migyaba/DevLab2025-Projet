import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const uploadBulkTransfer = async (formData) => {
    return axios.post(`${API_BASE_URL}/bulk/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const getJobStatus = async (jobId) => {
    return axios.get(`${API_BASE_URL}/bulk/status/${jobId}/`);
};

export const getExportUrl = (jobId, format) => {
    return `${API_BASE_URL}/bulk/export/${format}/${jobId}/`;
};

export const getJobHistory = async () => {
    return axios.get(`${API_BASE_URL}/bulk/history/`);
};

export const transferP2P = async (data) => {
    return axios.post(`${API_BASE_URL}/transfers/p2p/`, data);
};