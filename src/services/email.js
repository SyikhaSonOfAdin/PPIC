"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailServices = void 0;
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
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
var fieldLabel = function (text) {
    return "<p style=\"margin:0 0 4px;font-size:10px;font-weight:600;color:#94a3b8;\n    text-transform:uppercase;letter-spacing:.5px;line-height:14px;\">".concat(text, "</p>");
};
/** Badge status remark */
var remarkBadge = function (status) {
    var _a;
    var map = {
        Warm: { text: "#fb8c00", bg: "rgba(255,152,0,0.1)", border: "#ff9800" },
        "On Going": {
            text: "#1e88e5",
            bg: "rgba(33,150,243,0.1)",
            border: "#2196f3",
        },
    };
    var c = (_a = map[status]) !== null && _a !== void 0 ? _a : {
        text: "#e53935",
        bg: "rgba(244,67,54,0.1)",
        border: "#f44336",
    };
    return "<span style=\"display:inline-block;padding:2px 10px;\n    color:".concat(c.text, ";background:").concat(c.bg, ";border:1px solid ").concat(c.border, ";\n    border-radius:20px;font-size:11px;font-weight:600;line-height:18px;\">").concat(status, "</span>");
};
/** Badge status project */
var projectBadge = function (status) {
    var ok = status === "On Time" || status === "Ahead";
    var ongoing = status === "On Going";
    var c = ok
        ? { text: "#43a047", bg: "rgba(76,175,80,0.1)", border: "#4caf50" }
        : ongoing
            ? { text: "#1e88e5", bg: "rgba(33,150,243,0.1)", border: "#2196f3" }
            : { text: "#e53935", bg: "rgba(244,67,54,0.1)", border: "#f44336" };
    return "<span style=\"display:inline-block;padding:2px 10px;\n    color:".concat(c.text, ";background:").concat(c.bg, ";border:1px solid ").concat(c.border, ";\n    border-radius:20px;font-size:11px;font-weight:600;line-height:18px;\">").concat(status, "</span>");
};
/**
 * Satu remark = card vertikal.
 * PIC dan deskripsi tidak pernah tabrakan karena masing-masing full-width.
 */
var buildRemarkCard = function (r, isLast) {
    var hasSolution = r.SOLUTION && r.SOLUTION.trim() !== "";
    // Jika ada solusi → description & solution berdampingan (50/50)
    // Jika tidak → description full-width
    var descSolutionBlock = hasSolution
        ? "\n      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin-top:10px;\">\n        <tr>\n          <td width=\"49%\" valign=\"top\"\n            style=\"background:#f8fafc;border-left:3px solid #e2e8f0;\n              border-radius:0 6px 6px 0;padding:10px 12px;\">\n            ".concat(fieldLabel("Deskripsi"), "\n            <p style=\"margin:0;font-size:13px;color:#475569;line-height:21px;\n              word-break:break-word;\">").concat(r.DESCRIPTION, "</p>\n          </td>\n          <td width=\"2%\"></td>\n          <td width=\"49%\" valign=\"top\"\n            style=\"background:#f0fdf4;border-left:3px solid #bbf7d0;\n              border-radius:0 6px 6px 0;padding:10px 12px;\">\n            ").concat(fieldLabel("Solusi"), "\n            <p style=\"margin:0;font-size:13px;color:#166534;line-height:21px;\n              word-break:break-word;\">").concat(r.SOLUTION, "</p>\n          </td>\n        </tr>\n      </table>")
        : "\n      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin-top:10px;\">\n        <tr>\n          <td style=\"background:#f8fafc;border-left:3px solid #e2e8f0;\n            border-radius:0 6px 6px 0;padding:10px 12px;\">\n            ".concat(fieldLabel("Deskripsi"), "\n            <p style=\"margin:0;font-size:13px;color:#475569;line-height:21px;\n              word-break:break-word;\">").concat(r.DESCRIPTION, "</p>\n          </td>\n        </tr>\n      </table>");
    var bottomPad = isLast ? "16px" : "12px";
    var divider = isLast
        ? ""
        : "\n    <tr>\n      <td style=\"padding:0 18px;\">\n        <div style=\"height:1px;background:#f1f5f9;\"></div>\n      </td>\n    </tr>";
    return "\n    <tr>\n      <td style=\"padding:14px 18px ".concat(bottomPad, ";\">\n\n        <!-- Meta: status / dept / deadline -->\n        <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n          <tr>\n            <td valign=\"top\">\n              ").concat(fieldLabel("Status"), "\n              ").concat(remarkBadge(r.STATUS), "\n            </td>\n            <td valign=\"top\" style=\"padding-left:20px;\">\n              ").concat(fieldLabel("Departemen"), "\n              <p style=\"margin:0;font-size:13px;color:#334155;font-weight:500;\n                line-height:20px;\">").concat(r.DEPARTMENT_NAME, "</p>\n            </td>\n            <td valign=\"top\" align=\"right\" style=\"white-space:nowrap;\">\n              ").concat(fieldLabel("Deadline"), "\n              <p style=\"margin:0;font-size:13px;color:#334155;font-weight:500;\n                line-height:20px;\">").concat(r.DEADLINE, "</p>\n            </td>\n          </tr>\n        </table>\n\n        <!-- PIC \u2014 full width agar nama panjang tidak tabrakan -->\n        <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin-top:10px;\">\n          <tr>\n            <td>\n              ").concat(fieldLabel("PIC"), "\n              <p style=\"margin:0;font-size:13px;color:#334155;line-height:20px;\n                word-break:break-word;\">").concat(r.PIC || "—", "</p>\n            </td>\n          </tr>\n        </table>\n\n        <!-- Description / Solution -->\n        ").concat(descSolutionBlock, "\n\n      </td>\n    </tr>\n    ").concat(divider);
};
var buildProjectCard = function (group, appUrl) {
    var remarkRows = group.remarks
        .map(function (r, i) { return buildRemarkCard(r, i === group.remarks.length - 1); })
        .join("\n");
    return "\n    <tr>\n      <td style=\"border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;padding:0;\n        mso-border-alt:solid #e0e0e0 1px;\">\n        <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n\n          <!-- Project header -->\n          <tr>\n            <td style=\"background:#f8fafc;padding:14px 18px;\n              border-bottom:1px solid #e9ecef;border-radius:12px 12px 0 0;\">\n              <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                <tr>\n                  <td>\n                    <a href=\"".concat(appUrl, "/d/").concat(group.project_id, "?open-tabs=remark\"\n                      target=\"_blank\"\n                      style=\"color:#1e293b;font-weight:700;font-size:16px;\n                        text-decoration:none;line-height:24px;\">\n                      ").concat(group.project_no, "\n                    </a>\n                  </td>\n                  <td style=\"padding-left:10px;\">\n                    ").concat(projectBadge(group.project_status), "\n                  </td>\n                </tr>\n              </table>\n              <p style=\"margin:5px 0 0;font-size:13px;color:#64748b;line-height:20px;\">\n                ").concat(group.project_name, "\n              </p>\n            </td>\n          </tr>\n\n          <!-- Remarks -->\n          ").concat(remarkRows, "\n\n        </table>\n      </td>\n    </tr>\n    <tr><td style=\"padding:6px 0;\"></td></tr>");
};
exports.emailServices = {
    sendEmail: function (to, subject, text, html, from) { return __awaiter(void 0, void 0, void 0, function () {
        var options, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = {
                        from: "".concat(from, " <").concat(process.env.EMAIL_HOST_USER, ">"),
                        to: to,
                        subject: subject,
                        text: text,
                        html: html,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, transporter.sendMail(options)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_1 = _a.sent();
                    throw new Error("Failed to send email: ".concat(error_1.message));
                case 4: return [2 /*return*/];
            }
        });
    }); },
    template: {
        projectRemark: function (username, departmentName, data) {
            var _a;
            if (data === void 0) { data = []; }
            var safeData = Array.isArray(data) ? data : [];
            var appUrl = (_a = process.env.APP) !== null && _a !== void 0 ? _a : "";
            var today = new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
            // Group by project, only include non-Closed remarks
            var grouped = safeData.reduce(function (acc, item) {
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
            var projectCards = Object.values(grouped)
                .filter(function (g) { return g.remarks.length > 0; })
                .map(function (g) { return buildProjectCard(g, appUrl); })
                .join("\n");
            return "\n        <center>\n          <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n            <tr>\n              <td align=\"center\" bgcolor=\"#f1f1f1\" style=\"padding:40px 0;\">\n                <table width=\"680\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"\n                  style=\"font-family:Inter,Arial,sans-serif;\n                    padding:48px 40px 60px;\n                    background:#ffffff;\n                    border:1px solid #e0e0e0;\n                    border-radius:16px;\">\n\n                  <!-- HEADER -->\n                  <tr>\n                    <td>\n                      <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n                        <tr>\n                          <!-- Accent bar biru -->\n                          <td width=\"6\" style=\"background:#2563eb;border-radius:4px;\"></td>\n                          <td style=\"padding-left:14px;\">\n                            <h1 style=\"margin:0;font-size:22px;line-height:30px;\n                              color:#1a2233;font-weight:700;\">\n                              Halo, ".concat(username, "!\n                            </h1>\n                            <p style=\"margin:6px 0 0;font-size:14px;line-height:22px;color:#64748b;\">\n                              Dimohon untuk melakukan update status obstacle pada\n                              <strong style=\"color:#334155;\">PPIC Dashboard</strong>\n                              secara berkala.<br>\n                              Data ini diperbarui per tanggal\n                              <strong style=\"color:#334155;\">").concat(today, "</strong>.\n                            </p>\n                          </td>\n                        </tr>\n                      </table>\n                    </td>\n                  </tr>\n\n                  <!-- Divider -->\n                  <tr>\n                    <td style=\"padding:20px 0;\">\n                      <div style=\"height:1px;background:#e9ecef;\"></div>\n                    </td>\n                  </tr>\n\n                  <!-- PROJECT CARDS -->\n                  ").concat(projectCards, "\n\n                  <!-- Divider -->\n                  <tr>\n                    <td style=\"padding:14px 0 20px;\">\n                      <div style=\"height:1px;background:#e9ecef;\"></div>\n                    </td>\n                  </tr>\n\n                  <!-- FOOTER -->\n                  <tr>\n                    <td align=\"center\">\n                      <p style=\"margin:0;font-size:12px;color:#94a3b8;\">\n                        PPIC Dashboard &nbsp;&middot;&nbsp; &copy; ").concat(new Date().getFullYear(), " Syikha Akmal\n                      </p>\n                    </td>\n                  </tr>\n\n                </table>\n              </td>\n            </tr>\n          </table>\n        </center>");
        },
    },
};
