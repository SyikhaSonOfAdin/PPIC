"use strict";
const axios = require("axios");

const SAP_URL = process.env.SAP_URL || "https://sap.syikha.it.com";
const AXIOS_TIMEOUT = 30000;

const sapDummyServices = {
  update: {
    by: {
      projectNo: async (projectNo) => {
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
        } catch (error) {
          throw error.response?.data ?? error;
        }
      },
    },
  },
  get: {
    summary: {
      projectNo: async (projectNo, page = 1, searchTerms = "", group = "") => {
        try {
          const encodedProjectNo = encodeURIComponent(projectNo);
          const encodedSearch = encodeURIComponent(searchTerms);
          const encodedGroup = encodeURIComponent(group);
          const response = await axios.get(
            `${SAP_URL}/get/summary/${encodedProjectNo}?page=${page}&s=${encodedSearch}&group=${encodedGroup}`,
            { timeout: AXIOS_TIMEOUT },
          );
          return response.data;
        } catch (error) {
          throw error.response?.data ?? error;
        }
      },
    },
    by: {
      projectNo: async (projectNo, searchTerms, group = "") => {
        try {
          const encodedProjectNo = encodeURIComponent(projectNo);
          const encodedSearch = encodeURIComponent(searchTerms ?? "");
          const encodedGroup = encodeURIComponent(group);
          const response = await axios.get(
            `${SAP_URL}/get/single/${encodedProjectNo}?s=${encodedSearch}&group=${encodedGroup}`,
            { timeout: AXIOS_TIMEOUT },
          );
          return response.data;
        } catch (error) {
          throw error.response?.data ?? error;
        }
      },
    },
    status: {
      projectNo: async (projectNo, searchTerms, group = "") => {
        try {
          const encodedProjectNo = encodeURIComponent(projectNo);
          const encodedSearch = encodeURIComponent(searchTerms ?? "");
          const encodedGroup = encodeURIComponent(group);
          const response = await axios.get(
            `${SAP_URL}/get/check/status/${encodedProjectNo}?s=${encodedSearch}&group=${encodedGroup}`,
            { timeout: AXIOS_TIMEOUT },
          );
          return response.data;
        } catch (error) {
          throw error.response?.data ?? error;
        }
      },
    },
  },
};

exports.default = sapDummyServices;
