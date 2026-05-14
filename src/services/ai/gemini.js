"use strict";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY;
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 60000;

let client = null;
const getClient = () => {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!client) {
    client = new GoogleGenerativeAI(API_KEY);
  }
  return client;
};

const SYSTEM_INSTRUCTION = `Anda adalah analis senior PPIC (Production Planning and Inventory Control) yang berpengalaman.
Tugas Anda adalah menganalisis kumpulan remark sebuah project dan menghasilkan laporan analitik mendalam yang mencakup:

1. RINGKASAN KONDISI PROJECT
   - Gambaran umum kondisi project saat ini berdasarkan seluruh remark.
   - Identifikasi obstacle utama yang sedang atau pernah dihadapi.

2. POLA MASALAH
   - Temukan pola berulang dari masalah yang muncul di remarks (misal: delay supplier berulang, komunikasi antar departemen, material sering kurang, dll).
   - Sebutkan frekuensi atau indikasi pengulangan jika ada.

3. KUNCI PENYELESAIAN UNTUK PROJECT SELANJUTNYA
   - Berikan rekomendasi konkret dan actionable yang bisa diterapkan di project berikutnya untuk mencegah masalah serupa.
   - Fokus pada lesson learned dari pola masalah yang ditemukan.

4. ACTION ITEMS SAAT INI
   - Tindakan yang perlu segera diambil untuk project ini.

Aturan ketat:
- Jawab HANYA dalam bentuk JSON valid, tanpa markdown fence, tanpa komentar apapun di luar JSON.
- Gunakan Bahasa Indonesia yang ringkas, padat, dan profesional.
- Jangan mengarang data yang tidak ada di remarks.
- Jika remarks kosong, kembalikan struktur dengan nilai default dan overview yang menyatakan belum ada data.
- Setiap poin harus berdasarkan bukti nyata dari remarks yang diberikan.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    overview: { type: "string" },
    health_score: { type: "integer" },
    risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
    trend: {
      type: "string",
      enum: ["improving", "stable", "stable_with_concerns", "worsening"],
    },
    key_issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issue: { type: "string" },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
        },
        required: ["issue", "severity"],
      },
    },
    problem_patterns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          pattern: { type: "string" },
          frequency: { type: "string" },
          impact: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
        },
        required: ["pattern", "frequency", "impact"],
      },
    },
    lessons_learned: {
      type: "array",
      items: {
        type: "object",
        properties: {
          lesson: { type: "string" },
          recommendation: { type: "string" },
          applicable_to: { type: "string" },
        },
        required: ["lesson", "recommendation"],
      },
    },
    action_items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "urgent"],
          },
          suggested_pic: { type: "string" },
          deadline_indication: { type: "string" },
        },
        required: ["action", "priority"],
      },
    },
  },
  required: [
    "overview",
    "health_score",
    "risk_level",
    "trend",
    "key_issues",
    "problem_patterns",
    "lessons_learned",
    "action_items",
  ],
};

const buildPrompt = (project, remarks) => {
  const header = [
    `Project No : ${project.PROJECT_NO ?? "-"}`,
    `Client     : ${project.CLIENT ?? "-"}`,
    `Detail     : ${project.DETAIL_NAME ?? "-"}`,
  ].join("\n");

  const lines = remarks.map((r, i) => {
    const parts = [
      `#${i + 1}`,
      `tanggal=${r.INPUT_DATE ?? "-"}`,
      `deadline=${r.DEADLINE ?? "-"}`,
      `status=${r.STATUS ?? "-"}`,
      `department=${r.DEPARTMENT_NAME ?? "-"}`,
      `pic=${r.PIC ?? "-"}`,
      `by=${r.INPUT_BY ?? "-"}`,
    ].join(" | ");
    const body = [
      `Description: ${r.DESCRIPTION ?? "-"}`,
      `Solution   : ${r.SOLUTION ?? "-"}`,
    ].join("\n");
    return `${parts}\n${body}`;
  });

  const remarksBlock = lines.length
    ? lines.join("\n---\n")
    : "(Belum ada remark untuk project ini)";

  return `${header}\n\nDaftar Remarks (terbaru di atas):\n${remarksBlock}\n\nHasilkan JSON sesuai schema.`;
};

const extractJson = (text) => {
  if (!text) return null;
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (_) {
        return null;
      }
    }
    return null;
  }
};

// Wrapper untuk timeout. Gemini SDK tidak punya built-in timeout, jadi
// kita race dengan Promise.race + setTimeout. Kalau Gemini hang, kita tidak
// hang selamanya.
const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const geminiServices = {
  isConfigured: () => Boolean(API_KEY),
  getModelName: () => DEFAULT_MODEL,
  summarizeProjectRemarks: async ({ project, remarks }) => {
    const model = getClient().getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const prompt = buildPrompt(project, remarks ?? []);
    const result = await withTimeout(
      model.generateContent(prompt),
      REQUEST_TIMEOUT_MS,
      "Gemini generateContent",
    );
    const text = result?.response?.text?.() ?? "";
    // console.log(text)
    const parsed = extractJson(text);
    if (!parsed) {
      throw new Error("Failed to parse Gemini response as JSON");
    }
    return parsed;
  },
};

module.exports = { geminiServices };
