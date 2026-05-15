"use strict";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const path = require("path");
const os = require("os");

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY;
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 300000;

let client = null;
let fileManager = null;
const getClient = () => {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not configured");
  if (!client) client = new GoogleGenerativeAI(API_KEY);
  return client;
};
const getFileManager = () => {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not configured");
  if (!fileManager) fileManager = new GoogleAIFileManager(API_KEY);
  return fileManager;
};

const SYSTEM_INSTRUCTION = `Anda adalah analis bisnis senior dan konsultan manajemen proyek yang berpengalaman di industri manufaktur dan konstruksi.

Anda diberikan data lengkap seluruh project dari sebuah perusahaan dalam format JSON terstruktur. Data mencakup:
- Detail setiap project (kapasitas, budget, cost, man hours, produktivitas, tanggal, status)
- Progress plans vs actual per project (mingguan/bulanan)
- Remarks/catatan masalah untuk project yang bermasalah (delayed atau deviasi >10%)

Tugas Anda adalah menghasilkan laporan analitik mendalam tingkat perusahaan yang mencakup:

1. EXECUTIVE SUMMARY
   - Gambaran kondisi keseluruhan portfolio project perusahaan.
   - Highlight pencapaian dan masalah utama.

2. KEY FINDINGS
   - Temuan-temuan penting dari analisis data (minimal 5 poin).
   - Berbasis data nyata: angka, persentase, perbandingan.

3. RECOMMENDATIONS
   - Rekomendasi strategis dan operasional yang konkret (minimal 5 poin).
   - Actionable dan spesifik berdasarkan pola yang ditemukan.

4. RISK ALERTS
   - Peringatan risiko yang perlu perhatian segera.
   - Prioritaskan berdasarkan dampak dan urgensi.

5. CHART INSTRUCTIONS
   - Tentukan visualisasi yang paling tepat untuk data ini.
   - Setiap chart harus memiliki data yang akurat dari dataset.
   - Gunakan tipe: pie, bar, line, donut, radialBar, area.
   - Maksimal 6 chart, pilih yang paling informatif.

Aturan ketat:
- Jawab HANYA dalam bentuk JSON valid, tanpa markdown fence, tanpa komentar.
- Gunakan Bahasa Indonesia yang profesional dan ringkas.
- Semua angka dalam chart harus akurat dan bersumber dari data yang diberikan.
- Jangan mengarang data yang tidak ada dalam dataset.
- health_score perusahaan (0-100) harus mencerminkan kondisi nyata portfolio.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    company_health_score: { type: "integer" },
    key_findings: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    risk_alerts: { type: "array", items: { type: "string" } },
    charts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          series: { type: "array", items: {} },
          labels: { type: "array", items: { type: "string" } },
          categories: { type: "array", items: { type: "string" } },
        },
        required: ["id", "type", "title", "series"],
      },
    },
  },
  required: [
    "executive_summary",
    "company_health_score",
    "key_findings",
    "recommendations",
    "risk_alerts",
    "charts",
  ],
};

const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const extractJson = (text) => {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) { return null; }
    }
    return null;
  }
};

const geminiCompanyServices = {
  isConfigured: () => Boolean(API_KEY),
  getModelName: () => DEFAULT_MODEL,
  analyzeCompanyData: async (companyData) => {
    const ai = getClient();
    const tmpFile = path.join(os.tmpdir(), `company_report_${companyData.company_id}_${Date.now()}.json`);
    let fileUri = null;
    let fileName = null;

    try {
      fs.writeFileSync(tmpFile, JSON.stringify(companyData, null, 2), "utf8");

      const uploadResult = await withTimeout(
        getFileManager().uploadFile(tmpFile, { mimeType: "application/json", displayName: `company_report_${companyData.company_id}` }),
        60000,
        "Gemini file upload",
      );

      fileUri = uploadResult.file.uri;
      fileName = uploadResult.file.name;

      const model = getClient().getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      });

      const prompt = `Analisis data portfolio project perusahaan yang terlampir secara mendalam. Hasilkan laporan analitik komprehensif sesuai schema JSON yang diminta. Pastikan semua angka dalam chart akurat berdasarkan data yang diberikan.`;

      const result = await withTimeout(
        model.generateContent([
          { fileData: { mimeType: "application/json", fileUri } },
          { text: prompt },
        ]),
        REQUEST_TIMEOUT_MS,
        "Gemini company analysis",
      );

      const text = result?.response?.text?.() ?? "";
      const parsed = extractJson(text);
      if (!parsed) throw new Error("Failed to parse Gemini response as JSON");
      return parsed;
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      if (fileName) {
        getFileManager().deleteFile(fileName).catch((err) =>
          console.warn("[gemini-company] failed to delete uploaded file", err?.message ?? err),
        );
      }
    }
  },
};

module.exports = { geminiCompanyServices };
