"use strict";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "google/gemini-2.5-flash";
const API_KEY = process.env.OPEN_ROUTER_API_KEY;
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 60000;

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const SYSTEM_INSTRUCTION = `Anda adalah analis senior PPIC (Production Planning and Inventory Control) yang berpengalaman.
Tugas Anda adalah menganalisis data project secara menyeluruh — mencakup remark, detail project, rencana progress (plans), realisasi progress (actual), phase schedule, dan kelengkapan dokumen — lalu menghasilkan laporan analitik mendalam.

Data yang Anda terima:
1. PROJECT DETAIL: atribut project seperti kategori, kapasitas, SPK, budget, cost, man hours, produktivitas, tanggal mulai, due date, finish date, dan status pengiriman.
2. PERBANDINGAN PLAN VS ACTUAL: deviasi per periode (side-by-side), plus ringkasan finansial (budget vs cost).
3. PHASE SCHEDULE: jadwal dan realisasi per fase (Engineering, Procurement, Fabrication, dll.) per departemen.
4. KELENGKAPAN DOKUMEN: jumlah attachment per kategori (common, packing list, transfer slip, surat jalan, QC).
5. REMARKS: catatan masalah, obstacle, dan solusi dari tim (seluruh histori, terbaru di atas).
6. KONTEKS WAKTU: tanggal hari ini, status timeline, sisa hari/keterlambatan, perbandingan progress vs waktu berjalan.

**PENTING - AWARENESS TEMPORAL:**
- Anda HARUS menggunakan tanggal hari ini sebagai referensi utama
- Bandingkan due date dengan hari ini untuk menentukan apakah overdue
- Untuk project yang SUDAH SELESAI: evaluasi apakah tepat waktu atau terlambat, bukan lagi kondisi real-time
- Untuk project yang MASIH BERJALAN: hitung gap antara % progress aktual vs % waktu yang sudah berjalan
- Jika progress < waktu berjalan (misal 40% done tapi 60% waktu lewat) = AT RISK
- Jika sudah lewat due date tanpa finish = CRITICAL/OVERDUE
- Deadline dekat (<7 hari) dengan progress rendah = URGENT
- health_score HARUS mencerminkan urgency temporal, bukan hanya angka progress

**PENTING - ANALISIS FASE:**
- Bandingkan PLAN vs ACTUAL per fase di phase schedule
- Fase yang actual_end_week lebih besar dari plan_end_week = DELAY
- Fase yang belum ada actual_end_week = masih berjalan
- Identifikasi fase mana yang paling sering menjadi bottleneck

**PENTING - ANALISIS FINANSIAL:**
- Bandingkan COST vs BUDGET: ratio >100% = over budget = RISK TINGGI
- Produktivitas dan cost per unit adalah indikator efisiensi operasional
- Kelengkapan dokumen (attachment) mencerminkan kematangan administrasi project

Analisis yang harus dihasilkan:

1. RINGKASAN KONDISI PROJECT
   - Gambaran umum kondisi project berdasarkan seluruh data.
   - Bandingkan progress actual vs plan: apakah ahead, on track, atau behind schedule.
   - Evaluasi efisiensi biaya (budget vs cost) dan produktivitas jika data tersedia.
   - Status phase schedule: fase mana yang on track vs delayed.
   - Identifikasi obstacle utama dari remarks.

2. POLA MASALAH
   - Temukan pola berulang dari remarks maupun dari deviasi antara plan dan actual.
   - Contoh: delay konsisten di bulan tertentu, gap plan vs actual yang melebar, cost overrun, fase tertentu selalu terlambat, dll.
   - Sebutkan frekuensi atau indikasi pengulangan jika ada.

3. KUNCI PENYELESAIAN UNTUK PROJECT SELANJUTNYA
   - Rekomendasi konkret berdasarkan lesson learned dari data project ini.
   - Fokus pada perbaikan perencanaan, eksekusi, pengendalian biaya, dan manajemen fase.

4. ACTION ITEMS SAAT INI
   - Tindakan yang perlu segera diambil berdasarkan kondisi terkini.

Aturan ketat:
- Jawab HANYA dalam bentuk JSON valid, tanpa markdown fence, tanpa komentar apapun di luar JSON.
- Gunakan Bahasa Indonesia yang ringkas, padat, dan profesional.
- Jangan mengarang data yang tidak ada dalam input.
- Jika data kosong atau tidak tersedia, gunakan nilai default dan nyatakan keterbatasan di field summary_note.
- health_score (0-100) harus mencerminkan kondisi nyata: deviasi plan vs actual, status remarks, budget vs cost, ketepatan waktu, dan kelengkapan fase.
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
    summary_note: { type: "string" },
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
        required: ["lesson", "recommendation", "applicable_to"],
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
    "summary_note",
    "key_issues",
    "problem_patterns",
    "lessons_learned",
    "action_items",
  ],
};

const buildPrompt = (project, remarks, plans, actual, phaseSchedules, attachmentCount) => {
  const today = new Date();
  const startDate = project.START_DATE ? new Date(project.START_DATE) : null;
  const dueDate = project.DUE_DATE ? new Date(project.DUE_DATE) : null;
  const finishDate = project.FINISH_DATE ? new Date(project.FINISH_DATE) : null;

  let timeStatus = "Unknown";
  let daysInfo = "";
  let timeProgress = null;
  const isCompleted = Boolean(finishDate);

  if (startDate && dueDate) {
    const totalDuration = dueDate - startDate;
    const elapsed = today - startDate;
    timeProgress = totalDuration > 0 ? (elapsed / totalDuration * 100).toFixed(1) : null;

    if (isCompleted) {
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
  const actualPct = capacity > 0 ? ((totalActual / capacity) * 100).toFixed(1) : "0";

  // Progress vs time — hanya relevan untuk project yang masih berjalan
  let progressHealth = null;
  if (!isCompleted && timeProgress && parseFloat(timeProgress) > 0) {
    const gap = parseFloat(actualPct) - parseFloat(timeProgress);
    if (gap >= 10) progressHealth = "AHEAD (progress lebih cepat dari waktu)";
    else if (gap >= 0) progressHealth = "ON TRACK (progress sesuai waktu)";
    else if (gap >= -10) progressHealth = "SLIGHTLY BEHIND (progress sedikit tertinggal)";
    else progressHealth = "SIGNIFICANTLY BEHIND (progress jauh tertinggal - RISK TINGGI)";
  }

  // Financial health
  const budget = parseFloat(project.BUDGET) || 0;
  const cost = parseFloat(project.COST) || 0;
  let financialHealth = null;
  if (budget > 0 && cost > 0) {
    const costRatio = (cost / budget * 100).toFixed(1);
    if (costRatio <= 80) financialHealth = `EFFICIENT — ${costRatio}% dari budget terpakai`;
    else if (costRatio <= 100) financialHealth = `ON BUDGET — ${costRatio}% dari budget terpakai`;
    else financialHealth = `OVER BUDGET — ${costRatio}% dari budget (RISK TINGGI)`;
  }

  const timeContext = [
    `HARI INI          : ${today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    `Status Timeline   : ${timeStatus}`,
    daysInfo ? `Informasi Waktu   : ${daysInfo}` : '',
    !isCompleted && timeProgress ? `Waktu Berjalan    : ${timeProgress}% dari total durasi` : '',
    `Progress Aktual   : ${actualPct}%`,
    progressHealth ? `Progress vs Waktu : ${progressHealth}` : '',
    financialHealth ? `Kondisi Finansial : ${financialHealth}` : '',
  ].filter(Boolean).join("\n");

  const detail = [
    `=== KONTEKS WAKTU REAL-TIME ===`,
    timeContext,
    "",
    "=== PROJECT DETAIL ===",
    `Project No    : ${project.PROJECT_NO ?? "-"}`,
    `Client        : ${project.CLIENT ?? "-"}`,
    `Kategori      : ${project.CATEGORY_NAME ?? "-"} (UOM: ${project.CATEGORY_UOM ?? "-"})`,
    `Nama Project  : ${project.DETAIL_NAME ?? "-"}`,
    `SPK           : ${project.SPK ?? "-"}`,
    `Deskripsi     : ${project.DESCRIPTION ?? "-"}`,
    `PPM           : ${project.PPM ?? "-"}`,
    `Lokasi        : ${project.WORK_PLACE ?? "-"}`,
    `Kapasitas     : ${project.CAPACITY ?? "-"} ${project.CATEGORY_UOM ?? ""}`.trim(),
    `Tanggal Mulai : ${project.START_DATE ?? "-"} ${startDate ? `(${Math.ceil((today - startDate) / (1000*60*60*24))} hari yang lalu)` : ''}`,
    `Due Date      : ${project.DUE_DATE ?? "-"} ${dueDate && !isCompleted ? (dueDate > today ? `(${Math.ceil((dueDate - today) / (1000*60*60*24))} hari lagi)` : `(LEWAT ${Math.ceil((today - dueDate) / (1000*60*60*24))} hari)`) : ''}`,
    `Finish Date   : ${project.FINISH_DATE ?? "-"} ${isCompleted ? `(selesai ${Math.ceil((today - finishDate) / (1000*60*60*24))} hari yang lalu)` : '(belum selesai)'}`,
    `Delivered     : ${project.DELIVERED ? "Ya" : "Belum"}`,
    `Delivery Date : ${project.DELIVERY_DATE ?? "-"}`,
    `Budget        : ${project.BUDGET != null ? project.BUDGET : "-"}`,
    `Cost          : ${project.COST != null ? project.COST : "-"}${financialHealth ? ` → ${financialHealth}` : ''}`,
    `Man Hours     : ${project.MAN_HOURS != null ? project.MAN_HOURS : "-"}`,
    `Produktivitas : ${project.PRODUCTIVITY != null ? project.PRODUCTIVITY : "-"}`,
    `Prod. Cost    : ${project.PRODUCTIVITY_COST != null ? project.PRODUCTIVITY_COST : "-"}`,
  ].join("\n");

  // Side-by-side plan vs actual per periode
  const periodMap = new Map();
  for (const p of (plans ?? [])) {
    const key = `${p.PERIOD_YEAR}|${p.PERIOD_MONTH}|${p.WEEK ?? ""}`;
    periodMap.set(key, { ...periodMap.get(key), plan: p });
  }
  for (const a of (actual ?? [])) {
    const key = `${a.PERIOD_YEAR}|${a.PERIOD_MONTH}|${a.WEEK ?? ""}`;
    periodMap.set(key, { ...periodMap.get(key), actual: a });
  }
  const sortedPeriods = [...periodMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  const planPct = capacity > 0 ? ((totalPlan / capacity) * 100).toFixed(1) : "-";
  const deviation = capacity > 0 ? ((totalActual - totalPlan) / capacity * 100).toFixed(1) : "-";

  const progressSummary = [
    `Total Plan    : ${totalPlan} (${planPct}% dari kapasitas)`,
    `Total Actual  : ${totalActual} (${actualPct}% dari kapasitas)`,
    `Deviasi       : ${deviation}% (positif = ahead, negatif = behind)`,
  ].join("\n");

  const periodCompareBlock = sortedPeriods.length
    ? sortedPeriods.map(([, v]) => {
        const p = v.plan;
        const a = v.actual;
        const label = p?.WEEK ?? a?.WEEK ?? "-";
        const periodMonth = p?.PERIOD_MONTH ?? a?.PERIOD_MONTH ?? "-";
        const planVal = p ? `plan=${p.PERCENTAGE}% (${p.AMOUNT})` : "plan=(tidak ada)";
        const actVal = a ? `actual=${a.PERCENTAGE}% (${a.AMOUNT})` : "actual=(tidak ada)";
        let devNote = "";
        if (p && a && capacity > 0) {
          const dev = ((parseFloat(a.AMOUNT) - parseFloat(p.AMOUNT)) / capacity * 100).toFixed(1);
          devNote = ` | dev=${dev}%`;
        }
        return `  ${periodMonth} [${label}] ${planVal} | ${actVal}${devNote}`;
      }).join("\n")
    : "  (tidak ada data progress)";

  // Phase schedule block
  const phaseBlock = phaseSchedules?.length
    ? phaseSchedules.map((ps) => {
        const planRange = `${ps.PLAN_START_WEEK ?? "-"} → ${ps.PLAN_END_WEEK ?? "-"}`;
        const actualRange = ps.ACTUAL_START_WEEK
          ? `${ps.ACTUAL_START_WEEK} → ${ps.ACTUAL_END_WEEK ?? "(belum selesai)"}`
          : "(belum mulai)";
        let status = "";
        if (ps.PLAN_END_WEEK && ps.ACTUAL_END_WEEK && ps.ACTUAL_END_WEEK > ps.PLAN_END_WEEK) {
          status = " ⚠ DELAY";
        } else if (ps.ACTUAL_END_WEEK && ps.PLAN_END_WEEK && ps.ACTUAL_END_WEEK <= ps.PLAN_END_WEEK) {
          status = " ✓ ON TIME";
        } else if (!ps.ACTUAL_END_WEEK && ps.ACTUAL_START_WEEK) {
          status = " (sedang berjalan)";
        }
        return `  [${ps.DEPARTMENT_NAME ?? "-"}] ${ps.PHASE ?? "-"} | Plan: ${planRange} | Actual: ${actualRange}${status}`;
      }).join("\n")
    : "  (tidak ada data phase schedule)";

  // Attachment count block
  const attachBlock = attachmentCount?.length
    ? attachmentCount.map((a) => `  ${a.label}: ${a.count} file`).join("\n")
    : "  (tidak ada attachment)";

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
    "=== PERBANDINGAN PLAN VS ACTUAL (per periode) ===",
    periodCompareBlock,
    "",
    "=== PHASE SCHEDULE ===",
    phaseBlock,
    "",
    "=== KELENGKAPAN DOKUMEN (attachment) ===",
    attachBlock,
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
  summarizeProjectRemarks: async ({ project, remarks, plans, actual, phaseSchedules, attachmentCount }) => {
    const prompt = buildPrompt(
      project,
      remarks ?? [],
      plans ?? [],
      actual ?? [],
      phaseSchedules ?? [],
      attachmentCount ?? [],
    );

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
