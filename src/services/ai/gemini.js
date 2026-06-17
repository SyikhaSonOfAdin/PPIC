"use strict";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "google/gemini-2.5-flash";
const API_KEY = process.env.OPEN_ROUTER_API_KEY;
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 60000;

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const SYSTEM_INSTRUCTION = `Anda adalah analis senior PPIC (Production Planning and Inventory Control) yang berpengalaman.
Tugas Anda adalah menganalisis data project secara menyeluruh — mencakup remark, detail project, rencana progress (plans), dan realisasi progress (actual) — lalu menghasilkan laporan analitik mendalam.

Data yang Anda terima:
1. PROJECT DETAIL: atribut project seperti kapasitas, SPK, budget, cost, man hours, produktivitas, tanggal mulai, due date, finish date, dan status pengiriman.
2. PROGRESS PLANS: rencana progress mingguan/bulanan dalam persentase dan jumlah (amount).
3. PROGRESS ACTUAL: realisasi progress mingguan/bulanan dalam persentase dan jumlah (amount).
4. REMARKS: catatan masalah, obstacle, dan solusi dari tim.
5. KONTEKS WAKTU: tanggal hari ini, status timeline, sisa hari/keterlambatan, perbandingan progress vs waktu berjalan.

**PENTING - AWARENESS TEMPORAL:**
- Anda HARUS menggunakan tanggal hari ini sebagai referensi utama
- Bandingkan due date dengan hari ini untuk menentukan apakah overdue
- Hitung gap antara % progress aktual vs % waktu yang sudah berjalan
- Jika progress < waktu berjalan (misal 40% done tapi 60% waktu lewat) = AT RISK
- Jika sudah lewat due date tanpa finish = CRITICAL/OVERDUE
- Deadline dekat (<7 hari) dengan progress rendah = URGENT
- health_score HARUS mencerminkan urgency temporal, bukan hanya angka progress

Analisis yang harus dihasilkan:

1. RINGKASAN KONDISI PROJECT
   - Gambaran umum kondisi project berdasarkan seluruh data.
   - Bandingkan progress actual vs plan: apakah ahead, on track, atau behind schedule.
   - Evaluasi efisiensi biaya (budget vs cost) dan produktivitas jika data tersedia.
   - Identifikasi obstacle utama dari remarks.

2. POLA MASALAH
   - Temukan pola berulang dari remarks maupun dari deviasi antara plan dan actual.
   - Contoh: delay konsisten di bulan tertentu, gap plan vs actual yang melebar, cost overrun, dll.
   - Sebutkan frekuensi atau indikasi pengulangan jika ada.

3. KUNCI PENYELESAIAN UNTUK PROJECT SELANJUTNYA
   - Rekomendasi konkret berdasarkan lesson learned dari data project ini.
   - Fokus pada perbaikan perencanaan, eksekusi, dan pengendalian biaya.

4. ACTION ITEMS SAAT INI
   - Tindakan yang perlu segera diambil berdasarkan kondisi terkini.

Aturan ketat:
- Jawab HANYA dalam bentuk JSON valid, tanpa markdown fence, tanpa komentar apapun di luar JSON.
- Gunakan Bahasa Indonesia yang ringkas, padat, dan profesional.
- Jangan mengarang data yang tidak ada dalam input.
- Jika data kosong atau tidak tersedia, gunakan nilai default dan nyatakan keterbatasan data.
- health_score (0-100) harus mencerminkan kondisi nyata: deviasi plan vs actual, status remarks, budget vs cost, dan ketepatan waktu.
- Setiap poin harus berdasarkan bukti nyata dari data yang diberikan.`;

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

const buildPrompt = (project, remarks, plans, actual) => {
  const today = new Date();
  const startDate = project.START_DATE ? new Date(project.START_DATE) : null;
  const dueDate = project.DUE_DATE ? new Date(project.DUE_DATE) : null;
  const finishDate = project.FINISH_DATE ? new Date(project.FINISH_DATE) : null;
  
  let timeStatus = "Unknown";
  let daysInfo = "";
  let timeProgress = null;
  
  if (startDate && dueDate) {
    const totalDuration = dueDate - startDate;
    const elapsed = today - startDate;
    timeProgress = totalDuration > 0 ? (elapsed / totalDuration * 100).toFixed(1) : null;
    
    if (finishDate) {
      const diff = Math.ceil((finishDate - dueDate) / (1000 * 60 * 60 * 24));
      if (diff <= 0) {
        timeStatus = "Completed On Time";
        daysInfo = `Selesai ${Math.abs(diff)} hari sebelum deadline`;
      } else {
        timeStatus = "Completed Late";
        daysInfo = `Selesai terlambat ${diff} hari`;
      }
    } else {
      const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        timeStatus = "In Progress";
        daysInfo = `Sisa ${diff} hari sampai deadline`;
      } else {
        timeStatus = "OVERDUE";
        daysInfo = `TERLAMBAT ${Math.abs(diff)} hari dari deadline`;
      }
    }
  }
  
  const totalPlan = plans?.reduce((s, p) => s + (parseFloat(p.AMOUNT) || 0), 0) ?? 0;
  const totalActual = actual?.reduce((s, a) => s + (parseFloat(a.AMOUNT) || 0), 0) ?? 0;
  const capacity = parseFloat(project.CAPACITY) || 0;
  const actualProgress = capacity > 0 ? ((totalActual / capacity) * 100).toFixed(1) : "0";
  
  let progressHealth = "Unknown";
  if (timeProgress && actualProgress) {
    const gap = parseFloat(actualProgress) - parseFloat(timeProgress);
    if (gap >= 10) progressHealth = "AHEAD (progress lebih cepat dari waktu)";
    else if (gap >= 0) progressHealth = "ON TRACK (progress sesuai waktu)";
    else if (gap >= -10) progressHealth = "SLIGHTLY BEHIND (progress sedikit tertinggal)";
    else progressHealth = "SIGNIFICANTLY BEHIND (progress jauh tertinggal - RISK TINGGI)";
  }
  
  const timeContext = [
    `HARI INI          : ${today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    `Status Timeline   : ${timeStatus}`,
    daysInfo ? `Informasi Waktu   : ${daysInfo}` : '',
    timeProgress ? `Waktu Berjalan    : ${timeProgress}% dari total durasi` : '',
    `Progress Aktual   : ${actualProgress}%`,
    progressHealth !== "Unknown" ? `Progress vs Waktu : ${progressHealth}` : '',
  ].filter(Boolean).join("\n");

  const detail = [
    `=== KONTEKS WAKTU REAL-TIME ===`,
    timeContext,
    "",
    "=== PROJECT DETAIL ===",
    `Project No    : ${project.PROJECT_NO ?? "-"}`,
    `Client        : ${project.CLIENT ?? "-"}`,
    `Nama Project  : ${project.DETAIL_NAME ?? "-"}`,
    `SPK           : ${project.SPK ?? "-"}`,
    `Deskripsi     : ${project.DESCRIPTION ?? "-"}`,
    `PPM           : ${project.PPM ?? "-"}`,
    `Lokasi        : ${project.WORK_PLACE ?? "-"}`,
    `Kapasitas     : ${project.CAPACITY ?? "-"}`,
    `Tanggal Mulai : ${project.START_DATE ?? "-"} ${startDate ? `(${Math.ceil((today - startDate) / (1000*60*60*24))} hari yang lalu)` : ''}`,
    `Due Date      : ${project.DUE_DATE ?? "-"} ${dueDate && !finishDate ? (dueDate > today ? `(${Math.ceil((dueDate - today) / (1000*60*60*24))} hari lagi)` : `(LEWAT ${Math.ceil((today - dueDate) / (1000*60*60*24))} hari)`) : ''}`,
    `Finish Date   : ${project.FINISH_DATE ?? "-"} ${finishDate ? `(selesai ${Math.ceil((today - finishDate) / (1000*60*60*24))} hari yang lalu)` : '(belum selesai)'}`,
    `Delivered     : ${project.DELIVERED ? "Ya" : "Belum"}`,
    `Delivery Date : ${project.DELIVERY_DATE ?? "-"}`,
    `Budget        : ${project.BUDGET != null ? project.BUDGET : "-"}`,
    `Cost          : ${project.COST != null ? project.COST : "-"}`,
    `Man Hours     : ${project.MAN_HOURS != null ? project.MAN_HOURS : "-"}`,
    `Produktivitas : ${project.PRODUCTIVITY != null ? project.PRODUCTIVITY : "-"}`,
    `Prod. Cost    : ${project.PRODUCTIVITY_COST != null ? project.PRODUCTIVITY_COST : "-"}`,
  ].join("\n");

  const plansBlock = plans?.length
    ? plans
        .map(
          (p) =>
            `  tahun=${p.PERIOD_YEAR} bulan=${p.PERIOD_MONTH} minggu=${p.WEEK ?? "-"} plan=${p.PERCENTAGE}% (${p.AMOUNT})`,
        )
        .join("\n")
    : "  (tidak ada data plan)";

  const actualBlock = actual?.length
    ? actual
        .map(
          (a) =>
            `  tahun=${a.PERIOD_YEAR} bulan=${a.PERIOD_MONTH} minggu=${a.WEEK ?? "-"} actual=${a.PERCENTAGE}% (${a.AMOUNT})`,
        )
        .join("\n")
    : "  (tidak ada data actual)";

  const planPct = capacity > 0 ? ((totalPlan / capacity) * 100).toFixed(1) : "-";
  const actualPct = capacity > 0 ? ((totalActual / capacity) * 100).toFixed(1) : "-";
  const deviation = capacity > 0 ? ((totalActual - totalPlan) / capacity * 100).toFixed(1) : "-";

  const progressSummary = [
    `Total Plan    : ${totalPlan} (${planPct}% dari kapasitas)`,
    `Total Actual  : ${totalActual} (${actualPct}% dari kapasitas)`,
    `Deviasi       : ${deviation}% (positif = ahead, negatif = behind)`,
  ].join("\n");

  const remarksBlock = remarks?.length
    ? remarks
        .map((r, i) => {
          const meta = [
            `#${i + 1}`,
            `tanggal=${r.INPUT_DATE ?? "-"}`,
            `deadline=${r.DEADLINE ?? "-"}`,
            `status=${r.STATUS ?? "-"}`,
            `department=${r.DEPARTMENT_NAME ?? "-"}`,
            `pic=${r.PIC ?? "-"}`,
            `by=${r.INPUT_BY ?? "-"}`,
          ].join(" | ");
          return `${meta}\nDescription: ${r.DESCRIPTION ?? "-"}\nSolution   : ${r.SOLUTION ?? "-"}`;
        })
        .join("\n---\n")
    : "(Belum ada remark untuk project ini)";

  return [
    detail,
    "",
    "=== RINGKASAN PROGRESS ===",
    progressSummary,
    "",
    "=== PROGRESS PLANS (per minggu/bulan) ===",
    plansBlock,
    "",
    "=== PROGRESS ACTUAL (per minggu/bulan) ===",
    actualBlock,
    "",
    "=== REMARKS (terbaru di atas) ===",
    remarksBlock,
    "",
    "Hasilkan JSON sesuai schema.",
  ].join("\n");
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

const callOpenRouter = async (messages, schema) => {
  if (!API_KEY) {
    throw new Error("OPEN_ROUTER_API_KEY is not configured");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "project_analysis",
          strict: true,
          schema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OpenRouter] API error:', response.status, errorText.substring(0, 500));
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (parseError) {
    console.error('[OpenRouter] Non-JSON response:', text.substring(0, 1000));
    throw new Error('OpenRouter returned non-JSON response');
  }

  if (!data.choices?.[0]?.message?.content) {
    console.error('[OpenRouter] Missing content in response:', JSON.stringify(data).substring(0, 500));
    throw new Error('OpenRouter response missing content');
  }

  return data.choices[0].message.content;
};

const geminiServices = {
  isConfigured: () => Boolean(API_KEY),
  getModelName: () => DEFAULT_MODEL,
  summarizeProjectRemarks: async ({ project, remarks, plans, actual }) => {
    const prompt = buildPrompt(project, remarks ?? [], plans ?? [], actual ?? []);
    
    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "user", content: prompt },
    ];

    const text = await withTimeout(
      callOpenRouter(messages, RESPONSE_SCHEMA),
      REQUEST_TIMEOUT_MS,
      "OpenRouter generateContent",
    );

    const parsed = extractJson(text);
    if (!parsed) {
      throw new Error("Failed to parse OpenRouter response as JSON");
    }
    return parsed;
  },
};

module.exports = { geminiServices };
