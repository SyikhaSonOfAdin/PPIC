"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailServices = void 0;
const nodemailer = __importStar(require("nodemailer"));
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.PASSWORD_EMAIL,
    },
});
// ─── Shared style helpers ──────────────────────────────────────────────────
/** Label kecil di atas field (Status, Dept, PIC, dst.) */
const fieldLabel = (text) => `<p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#94a3b8;
    text-transform:uppercase;letter-spacing:.5px;line-height:14px;">${text}</p>`;
/** Badge status remark */
const remarkBadge = (status) => {
    const map = {
        Warm: { text: "#fb8c00", bg: "rgba(255,152,0,0.1)", border: "#ff9800" },
        "On Going": {
            text: "#1e88e5",
            bg: "rgba(33,150,243,0.1)",
            border: "#2196f3",
        },
    };
    const c = map[status] ?? {
        text: "#e53935",
        bg: "rgba(244,67,54,0.1)",
        border: "#f44336",
    };
    return `<span style="display:inline-block;padding:2px 10px;
    color:${c.text};background:${c.bg};border:1px solid ${c.border};
    border-radius:20px;font-size:11px;font-weight:600;line-height:18px;">${status}</span>`;
};
/** Badge status project */
const projectBadge = (status) => {
    const ok = status === "On Time" || status === "Ahead";
    const ongoing = status === "On Going";
    const c = ok
        ? { text: "#43a047", bg: "rgba(76,175,80,0.1)", border: "#4caf50" }
        : ongoing
            ? { text: "#1e88e5", bg: "rgba(33,150,243,0.1)", border: "#2196f3" }
            : { text: "#e53935", bg: "rgba(244,67,54,0.1)", border: "#f44336" };
    return `<span style="display:inline-block;padding:2px 10px;
    color:${c.text};background:${c.bg};border:1px solid ${c.border};
    border-radius:20px;font-size:11px;font-weight:600;line-height:18px;">${status}</span>`;
};
/**
 * Satu remark = card vertikal.
 * PIC dan deskripsi tidak pernah tabrakan karena masing-masing full-width.
 */
const buildRemarkCard = (r, isLast) => {
    const hasSolution = r.SOLUTION && r.SOLUTION.trim() !== "";
    // Jika ada solusi → description & solution berdampingan (50/50)
    // Jika tidak → description full-width
    const descSolutionBlock = hasSolution
        ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
        <tr>
          <td width="49%" valign="top"
            style="background:#f8fafc;border-left:3px solid #e2e8f0;
              border-radius:0 6px 6px 0;padding:10px 12px;">
            ${fieldLabel("Deskripsi")}
            <p style="margin:0;font-size:13px;color:#475569;line-height:21px;
              word-break:break-word;">${r.DESCRIPTION}</p>
          </td>
          <td width="2%"></td>
          <td width="49%" valign="top"
            style="background:#f0fdf4;border-left:3px solid #bbf7d0;
              border-radius:0 6px 6px 0;padding:10px 12px;">
            ${fieldLabel("Solusi")}
            <p style="margin:0;font-size:13px;color:#166534;line-height:21px;
              word-break:break-word;">${r.SOLUTION}</p>
          </td>
        </tr>
      </table>`
        : `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
        <tr>
          <td style="background:#f8fafc;border-left:3px solid #e2e8f0;
            border-radius:0 6px 6px 0;padding:10px 12px;">
            ${fieldLabel("Deskripsi")}
            <p style="margin:0;font-size:13px;color:#475569;line-height:21px;
              word-break:break-word;">${r.DESCRIPTION}</p>
          </td>
        </tr>
      </table>`;
    const bottomPad = isLast ? "16px" : "12px";
    const divider = isLast
        ? ""
        : `
    <tr>
      <td style="padding:0 18px;">
        <div style="height:1px;background:#f1f5f9;"></div>
      </td>
    </tr>`;
    return `
    <tr>
      <td style="padding:14px 18px ${bottomPad};">

        <!-- Meta: status / dept / deadline -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="top">
              ${fieldLabel("Status")}
              ${remarkBadge(r.STATUS)}
            </td>
            <td valign="top" style="padding-left:20px;">
              ${fieldLabel("Departemen")}
              <p style="margin:0;font-size:13px;color:#334155;font-weight:500;
                line-height:20px;">${r.DEPARTMENT_NAME}</p>
            </td>
            <td valign="top" align="right" style="white-space:nowrap;">
              ${fieldLabel("Deadline")}
              <p style="margin:0;font-size:13px;color:#334155;font-weight:500;
                line-height:20px;">${r.DEADLINE}</p>
            </td>
          </tr>
        </table>

        <!-- PIC — full width agar nama panjang tidak tabrakan -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
          <tr>
            <td>
              ${fieldLabel("PIC")}
              <p style="margin:0;font-size:13px;color:#334155;line-height:20px;
                word-break:break-word;">${r.PIC || "—"}</p>
            </td>
          </tr>
        </table>

        <!-- Description / Solution -->
        ${descSolutionBlock}

      </td>
    </tr>
    ${divider}`;
};
const buildProjectCard = (group, appUrl) => {
    const remarkRows = group.remarks
        .map((r, i) => buildRemarkCard(r, i === group.remarks.length - 1))
        .join("\n");
    return `
    <tr>
      <td style="border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;padding:0;
        mso-border-alt:solid #e0e0e0 1px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">

          <!-- Project header -->
          <tr>
            <td style="background:#f8fafc;padding:14px 18px;
              border-bottom:1px solid #e9ecef;border-radius:12px 12px 0 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <a href="${appUrl}/d/${group.project_id}?open-tabs=remark"
                      target="_blank"
                      style="color:#1e293b;font-weight:700;font-size:16px;
                        text-decoration:none;line-height:24px;">
                      ${group.project_no}
                    </a>
                  </td>
                  <td style="padding-left:10px;">
                    ${projectBadge(group.project_status)}
                  </td>
                </tr>
              </table>
              <p style="margin:5px 0 0;font-size:13px;color:#64748b;line-height:20px;">
                ${group.project_name}
              </p>
            </td>
          </tr>

          <!-- Remarks -->
          ${remarkRows}

        </table>
      </td>
    </tr>
    <tr><td style="padding:6px 0;"></td></tr>`;
};
exports.emailServices = {
    sendEmail: async (to, subject, text, html, from) => {
        const options = {
            from: `${from} <${process.env.EMAIL_HOST_USER}>`,
            to,
            subject,
            text,
            html,
        };
        try {
            return await transporter.sendMail(options);
        }
        catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    },
    template: {
        projectRemark: (username, departmentName, data = []) => {
            const safeData = Array.isArray(data) ? data : [];
            const appUrl = process.env.APP ?? "";
            const today = new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
            // Group by project, only include non-Closed remarks
            const grouped = safeData.reduce((acc, item) => {
                if (!acc[item.ID]) {
                    acc[item.ID] = {
                        project_id: item.ID,
                        project_no: item.PROJECT_NO,
                        project_name: item.NAME,
                        project_status: item.PROJECT_STATUS,
                        remarks: [],
                    };
                }
                if (item.STATUS !== "Close") {
                    acc[item.ID].remarks.push({
                        STATUS: item.STATUS,
                        DEPARTMENT_NAME: item.DEPARTMENT_NAME,
                        PIC: item.PIC,
                        DESCRIPTION: item.DESCRIPTION,
                        SOLUTION: item.SOLUTION,
                        DEADLINE: item.DEADLINE,
                    });
                }
                return acc;
            }, {});
            const projectCards = Object.values(grouped)
                .filter((g) => g.remarks.length > 0)
                .map((g) => buildProjectCard(g, appUrl))
                .join("\n");
            return `
        <center>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="#f1f1f1" style="padding:40px 0;">
                <table width="680" cellpadding="0" cellspacing="0" border="0"
                  style="font-family:Inter,Arial,sans-serif;
                    padding:48px 40px 60px;
                    background:#ffffff;
                    border:1px solid #e0e0e0;
                    border-radius:16px;">

                  <!-- HEADER -->
                  <tr>
                    <td>
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <!-- Accent bar biru -->
                          <td width="6" style="background:#2563eb;border-radius:4px;"></td>
                          <td style="padding-left:14px;">
                            <h1 style="margin:0;font-size:22px;line-height:30px;
                              color:#1a2233;font-weight:700;">
                              Halo, ${username}!
                            </h1>
                            <p style="margin:6px 0 0;font-size:14px;line-height:22px;color:#64748b;">
                              Dimohon untuk melakukan update status obstacle pada
                              <strong style="color:#334155;">PPIC Dashboard</strong>
                              secara berkala.<br>
                              Data ini diperbarui per tanggal
                              <strong style="color:#334155;">${today}</strong>.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding:20px 0;">
                      <div style="height:1px;background:#e9ecef;"></div>
                    </td>
                  </tr>

                  <!-- PROJECT CARDS -->
                  ${projectCards}

                  <!-- Divider -->
                  <tr>
                    <td style="padding:14px 0 20px;">
                      <div style="height:1px;background:#e9ecef;"></div>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td align="center">
                      <p style="margin:0;font-size:12px;color:#94a3b8;">
                        PPIC Dashboard &nbsp;&middot;&nbsp; &copy; ${new Date().getFullYear()} Syikha Akmal
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </center>`;
        },
    },
};
