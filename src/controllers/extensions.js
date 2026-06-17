const { extensionsServices } = require("../services/extensions");

const getValueByPath = (obj, path) => {
  if (!path) return obj;
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    result = result[key];
  }
  return result;
};

// const BLOCKED_IPS = ["127.0.0.1", "localhost", "0.0.0.0", "::1"];
const BLOCKED_IPS = ["127.0.0.1", "0.0.0.0", "::1"];
const PRIVATE_IP_RANGES = [/^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./];

const isBlockedUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (BLOCKED_IPS.includes(hostname)) return true;
    for (const pattern of PRIVATE_IP_RANGES) {
      if (pattern.test(hostname)) return true;
    }
    return false;
  } catch {
    return true;
  }
};

const buildRequestHeaders = (authType, authConfig, customHeaders = {}) => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    ...customHeaders
  };

  if (authType === "bearer" && authConfig?.token) {
    headers["Authorization"] = `Bearer ${authConfig.token}`;
  } else if (authType === "api-key" && authConfig?.apiKey) {
    const headerName = authConfig.header || authConfig.headerName || "X-API-Key";
    headers[headerName] = authConfig.apiKey;
  } else if (authType === "basic" && authConfig?.username && authConfig?.password) {
    const encoded = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString("base64");
    headers["Authorization"] = `Basic ${encoded}`;
  }

  return headers;
};

const replaceUrlVariables = (url, context) => {
  return url
    .replace(/{companyId}/g, encodeURIComponent(context.companyId || ""))
    .replace(/{companyName}/g, encodeURIComponent(context.companyName || ""))
    .replace(/{projectId}/g, encodeURIComponent(context.projectId || ""))
    .replace(/{projectNo}/g, encodeURIComponent(context.projectNo || ""))
    .replace(/{projectName}/g, encodeURIComponent(context.projectName || ""))
    .replace(/{spk}/g, encodeURIComponent(context.spk || ""));
};

const extensionsControllers = {
  byType: async (req, res) => {
    const { companyId, displayType } = req.params;

    const validTypes = ["page", "project-tab", "dashboard-widget"];
    if (!validTypes.includes(displayType)) {
      return res.status(400).json({ message: "Invalid display type" });
    }

    try {
      const extensions = await extensionsServices.get.byType(companyId, displayType);
      return res.status(200).json({
        status: "success",
        data: extensions,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  list: async (req, res) => {
    const { companyId } = req.params;

    try {
      const extensions = await extensionsServices.get.all(companyId);
      return res.status(200).json({
        message: "Extensions retrieved successfully",
        data: extensions,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getOne: async (req, res) => {
    const { companyId, extensionId } = req.params;

    try {
      const extension = await extensionsServices.get.byId(extensionId, companyId);
      if (!extension) {
        return res.status(404).json({ message: "Extension not found" });
      }
      return res.status(200).json({
        message: "Extension retrieved successfully",
        data: extension,
      });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: error.message });
    }
  },

  testConnection: async (req, res) => {
    const { url, authType, authToken, authUsername, authPassword, authApiKey, authHeader, httpMethod, headers, displayType, sampleProjectId } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    if (isBlockedUrl(url)) {
      return res.status(403).json({ message: "Access to this URL is forbidden" });
    }

    try {
      let finalUrl = url;
      const companyId = req.u?.company?.ID;
      const companyName = req.u?.company?.NAME;

      if (companyId) {
        finalUrl = finalUrl.replace(/{companyId}/g, encodeURIComponent(companyId));
      }
      if (companyName) {
        finalUrl = finalUrl.replace(/{companyName}/g, encodeURIComponent(companyName));
      }

      if (displayType === "tab" && sampleProjectId) {
        const project = await extensionsServices.getProjectContext(sampleProjectId);
        if (!project) {
          return res.status(400).json({
            message: "Selected project not found or does not belong to your company.",
            error: true,
          });
        }

        finalUrl = finalUrl
          .replace(/{projectId}/g, encodeURIComponent(sampleProjectId))
          .replace(/{projectNo}/g, encodeURIComponent(project.PROJECT_NO || ""))
          .replace(/{projectName}/g, encodeURIComponent(project.PROJECT_NAME || ""))
          .replace(/{spk}/g, encodeURIComponent(project.SPK || ""));
      }

      const authConfig = {
        token: authToken,
        username: authUsername,
        password: authPassword,
        apiKey: authApiKey,
        header: authHeader,
      };

      const requestHeaders = buildRequestHeaders(authType || "none", authConfig, headers);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(finalUrl, {
        method: httpMethod || "GET",
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.text();
        return res.status(response.status).json({
          message: `External API error: ${response.statusText}`,
          details: errorBody.substring(0, 200),
          error: true,
        });
      }

      const data = await response.json();

      return res.json({
        message: "Connection successful",
        data,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        return res.status(408).json({ message: "Request timeout", error: true });
      }
      return res.status(500).json({ message: error.message || "Failed to connect to external API", error: true });
    }
  },

  create: async (req, res) => {
    const { companyId } = req.params;
    const {
      name,
      description,
      endpoint_url,
      http_method,
      auth_type,
      auth_config,
      request_headers,
      query_params_config,
      response_path,
      schema_mapping,
      display_type,
      display_config,
      refresh_interval,
    } = req.body;

    const endpointUrl = endpoint_url;
    const httpMethod = http_method;
    const authType = auth_type;
    const authConfig = auth_config;
    const requestHeaders = request_headers;
    const queryParamsConfig = query_params_config;
    const responsePath = response_path;
    const schemaMapping = schema_mapping;
    const displayType = display_type;
    const displayConfig = display_config;
    const refreshInterval = refresh_interval;

    if (!name || !endpointUrl || !displayConfig) {
      return res.status(400).json({ message: "Missing required fields: name, endpoint_url, display_config" });
    }

    const validDisplayTypes = ["page", "project-tab", "dashboard-widget"];
    if (displayType && !validDisplayTypes.includes(displayType)) {
      return res.status(400).json({ message: "Invalid display_type. Must be: page, project-tab, or dashboard-widget" });
    }

    if (isBlockedUrl(endpointUrl)) {
      return res.status(403).json({ message: "Access to this URL is forbidden" });
    }

    try {
      const id = await extensionsServices.create(
        companyId,
        name,
        description || null,
        endpointUrl,
        httpMethod || "GET",
        authType || "none",
        authConfig || null,
        requestHeaders || {},
        displayType || "page",
        displayConfig,
        refreshInterval || null,
        req.u.user.id,
        responsePath,
        schemaMapping,
        queryParamsConfig
      );

      const extension = await extensionsServices.get.byId(id, companyId);

      return res.status(201).json({
        message: "Extension created successfully",
        data: extension,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    const { companyId, extensionId } = req.params;
    const {
      name,
      description,
      endpoint_url,
      http_method,
      auth_type,
      auth_config,
      request_headers,
      query_params_config,
      response_path,
      schema_mapping,
      display_type,
      display_config,
      refresh_interval,
    } = req.body;

    const endpointUrl = endpoint_url;
    const httpMethod = http_method;
    const authType = auth_type;
    const authConfig = auth_config;
    const requestHeaders = request_headers;
    const queryParamsConfig = query_params_config;
    const responsePath = response_path;
    const schemaMapping = schema_mapping;
    const displayType = display_type;
    const displayConfig = display_config;
    const refreshInterval = refresh_interval;

    if (endpointUrl && isBlockedUrl(endpointUrl)) {
      return res.status(403).json({ message: "Access to this URL is forbidden" });
    }

    try {
      await extensionsServices.update(
        extensionId,
        companyId,
        name,
        description,
        endpointUrl,
        httpMethod,
        authType,
        authConfig,
        requestHeaders,
        displayType,
        displayConfig,
        refreshInterval,
        responsePath,
        schemaMapping,
        queryParamsConfig
      );

      const extension = await extensionsServices.get.byId(extensionId, companyId);

      return res.status(200).json({
        message: "Extension updated successfully",
        data: extension,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    const { companyId, extensionId } = req.params;

    try {
      await extensionsServices.delete(extensionId, companyId);
      return res.status(200).json({ message: "Extension deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  fetchData: async (req, res) => {
    const { companyId, extensionId, projectId } = req.params;

    try {
      const extension = await extensionsServices.get.withAuth(extensionId, companyId);
      if (!extension) {
        return res.status(404).json({ status: "error", message: "Extension not found" });
      }

      let projectContext = {};
      if (projectId) {
        const project = await extensionsServices.getProjectContext(projectId);
        if (!project) {
          return res.status(404).json({ status: "error", message: "Project not found" });
        }
        projectContext = project;
      }

      const company = await extensionsServices.getCompanyContext(companyId);

      let finalUrl = replaceUrlVariables(extension.ENDPOINT_URL, {
        companyId,
        companyName: company?.NAME || "",
        projectId: projectId || "",
        projectNo: projectContext.PROJECT_NO || "",
        projectName: projectContext.PROJECT_NAME || "",
        spk: projectContext.SPK || "",
      });

      const queryParams = { ...req.query };

      if (Object.keys(queryParams).length > 0) {
        const urlObj = new URL(finalUrl);
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            urlObj.searchParams.set(key, String(value));
          }
        });
        finalUrl = urlObj.toString();
      }

      const requestHeaders = buildRequestHeaders(
        extension.AUTH_TYPE,
        extension.AUTH_CONFIG,
        extension.REQUEST_HEADERS
      );

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      console.log(finalUrl);
      const response = await fetch(finalUrl, {
        method: extension.HTTP_METHOD,
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.text();
        return res.status(502).json({
          status: "error",
          message: `External API error: ${response.statusText}`,
          details: errorBody.substring(0, 200),
        });
      }

      const data = await response.json();

      return res.json({
        status: "success",
        data,
      });
    } catch (error) {
      console.error(error)
      if (error.name === "AbortError") {
        return res.status(408).json({ status: "error", message: "Request timeout" });
      }
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  sync: async (req, res) => {
    const { companyId, extensionId } = req.params;

    try {
      const extension = await extensionsServices.get.byId(extensionId, companyId);
      if (!extension) {
        return res.status(404).json({ message: "Extension not found" });
      }

      return res.json({
        message: "Sync initiated successfully",
        data: {
          syncId: `sync-${Date.now()}`,
          status: "processing",
        },
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  actionRequest: async (req, res) => {
    const { companyId, extensionId } = req.params;
    const { buttonConfig, projectId, apiData } = req.body;

    if (!buttonConfig?.requestUrl) {
      return res.status(400).json({ message: "Request URL is required" });
    }

    if (isBlockedUrl(buttonConfig.requestUrl)) {
      return res.status(403).json({ message: "Access to this URL is forbidden" });
    }

    try {
      const extension = await extensionsServices.get.byId(extensionId, companyId);
      if (!extension) {
        return res.status(404).json({ message: "Extension not found" });
      }

      const context = {
        companyId,
        companyName: req.u?.company?.NAME || "",
      };

      if (projectId) {
        const project = await extensionsServices.getProjectContext(projectId);
        if (!project) {
          return res.status(400).json({ message: "Project not found" });
        }
        context.projectId = projectId;
        context.projectNo = project.PROJECT_NO || "";
        context.projectName = project.PROJECT_NAME || "";
        context.spk = project.SPK || "";
      }

      const finalUrl = replaceUrlVariables(buttonConfig.requestUrl, context);

      const authConfig = {
        token: buttonConfig.authToken,
        apiKey: buttonConfig.authApiKey,
        header: buttonConfig.authHeader,
      };

      const headers = buildRequestHeaders(buttonConfig.authType || "none", authConfig);

      if (buttonConfig.requestBody?.type === "json") {
        headers["Content-Type"] = "application/json";
      } else if (buttonConfig.requestBody?.type === "form-data") {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }

      let requestBody = undefined;
      if (buttonConfig.requestBody) {
        if (buttonConfig.requestBody.type === "raw") {
          requestBody = buttonConfig.requestBody.raw || "";
          requestBody = requestBody
            .replace(/{companyId}/g, context.companyId)
            .replace(/{companyName}/g, context.companyName)
            .replace(/{projectId}/g, context.projectId || "")
            .replace(/{projectNo}/g, context.projectNo || "")
            .replace(/{projectName}/g, context.projectName || "")
            .replace(/{spk}/g, context.spk || "");
          if (apiData) {
            const matches = requestBody.matchAll(/{apiData\.([^}]+)}/g);
            for (const match of matches) {
              const fieldPath = match[1];
              const value = getValueByPath(apiData, fieldPath);
              requestBody = requestBody.replace(match[0], String(value ?? ""));
            }
          }
        } else if (buttonConfig.requestBody.fields) {
          const body = {};
          (buttonConfig.requestBody.fields || []).forEach(field => {
            let finalValue = field.value || "";
            switch (field.valueType) {
              case "static":
                if (finalValue === "true") finalValue = true;
                else if (finalValue === "false") finalValue = false;
                else if (!isNaN(Number(finalValue)) && finalValue !== "") {
                  finalValue = Number(finalValue);
                }
                break;
              case "dynamic":
                finalValue = String(finalValue)
                  .replace(/{companyId}/g, context.companyId)
                  .replace(/{companyName}/g, context.companyName)
                  .replace(/{projectId}/g, context.projectId || "")
                  .replace(/{projectNo}/g, context.projectNo || "")
                  .replace(/{projectName}/g, context.projectName || "")
                  .replace(/{spk}/g, context.spk || "");
                break;
              case "apiData":
                if (apiData) {
                  finalValue = getValueByPath(apiData, finalValue) ?? "";
                }
                break;
            }
            body[field.key] = finalValue;
          });
          if (buttonConfig.requestBody.type === "json") {
            requestBody = JSON.stringify(body);
          } else if (buttonConfig.requestBody.type === "form-data") {
            requestBody = new URLSearchParams(body).toString();
          }
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(finalUrl, {
        method: buttonConfig.requestMethod || "GET",
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText.substring(0, 200) };
        }
        return res.status(response.status).json({
          message: errorData.message || errorData.error || `Request failed (${response.status})`,
          error: true,
        });
      }

      const data = await response.json();
      return res.json({
        message: data.message || data.msg || "Request completed successfully",
        data,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        return res.status(408).json({ message: "Request timeout" });
      }
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = { extensionsControllers };
