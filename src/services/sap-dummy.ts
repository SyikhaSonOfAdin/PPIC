import axios from "axios";


const SAP_URL = process.env.SAP_URL || "https://sap.syikha.it.com";
const AXIOS_TIMEOUT = 30000;

const sapDummyServices = {
  update: {
    by: {
      projectNo: async (projectNo: string) => {
        try {
          const response = await axios.post(
            `${SAP_URL}/update/single`,
            JSON.stringify({ projectNo }),
            {
              headers: { "Content-Type": "application/json" },
              timeout: AXIOS_TIMEOUT,
            },
          );
          return response.data;
        } catch (error: any) {
          throw error.response?.data ?? error;
        }
      },
    },
  },
  get: {
    summary: {
      projectNo: async (projectNo: string, page = 1, searchTerms = "", groupFilter = "", limit = 15) => {
        try {
          const encodedProjectNo = encodeURIComponent(projectNo);
          const encodedSearch = encodeURIComponent(searchTerms);
          const encodedGroup = encodeURIComponent(groupFilter);
          const safeLimit = Math.min(Math.max(limit, 1), 10000);
          const response = await axios.get(
            `${SAP_URL}/get/summary/${encodedProjectNo}?page=${page}&s=${encodedSearch}&group=${encodedGroup}&limit=${safeLimit}`,
            { timeout: AXIOS_TIMEOUT },
          );
          return response.data;
        } catch (error: any) {
          throw error.response?.data ?? error;
        }
      },
    },
    by: {
      projectNo: async (projectNo: string, searchTerms: string) => {
        try {
          const encodedProjectNo = encodeURIComponent(projectNo);
          const encodedSearch = encodeURIComponent(searchTerms ?? "");
          const response = await axios.get(
            `${SAP_URL}/get/single/${encodedProjectNo}?s=${encodedSearch}`,
            { timeout: AXIOS_TIMEOUT },
          );
          return response.data;
        } catch (error: any) {
          throw error.response?.data ?? error;
        }
      },
    },
    status: {
      projectNo: async (projectNo: string, searchTerms: string) => {
        try {
          const encodedProjectNo = encodeURIComponent(projectNo);
          const encodedSearch = encodeURIComponent(searchTerms ?? "");
          const response = await axios.get(
            `${SAP_URL}/get/check/status/${encodedProjectNo}?s=${encodedSearch}`,
            { timeout: AXIOS_TIMEOUT },
          );
          return response.data;
        } catch (error: any) {
          throw error.response?.data ?? error;
        }
      },
    },
  },
};

export default sapDummyServices;
