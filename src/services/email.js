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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.emailServices = {
    sendEmail: function (to, subject, text, html, from) { return __awaiter(void 0, void 0, void 0, function () {
        var options, info, error_1;
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
                case 2:
                    info = _a.sent();
                    return [2 /*return*/, info];
                case 3:
                    error_1 = _a.sent();
                    throw new Error("Failed to send email: ".concat(error_1.message));
                case 4: return [2 /*return*/];
            }
        });
    }); },
    template: {
        projectRemark: function (username, departmentName, data) {
            if (data === void 0) { data = []; }
            // Ensure data is array
            var safeData = Array.isArray(data) ? data : [];
            // Group data by project
            var grouped = safeData.reduce(function (acc, item) {
                var key = item.ID;
                if (!acc[key]) {
                    acc[key] = {
                        project_id: item.ID,
                        project_no: item.PROJECT_NO,
                        project_name: item.NAME,
                        project_status: item.PROJECT_STATUS,
                        remarks: [],
                    };
                }
                if (item.STATUS !== "Close") {
                    acc[key].remarks.push(item);
                }
                return acc;
            }, {});
            // Build HTML rows
            var rows = Object.values(grouped)
                .filter(function (group) { return group.remarks.length > 0; })
                .map(function (group) {
                var remarkRows = group.remarks
                    .map(function (r) {
                    var statusColor = r.STATUS === "Warm"
                        ? {
                            text: "#fb8c00",
                            bg: "rgba(255,152,0,0.1)",
                            border: "#ff9800",
                        }
                        : r.STATUS === "On Going"
                            ? {
                                text: "#1e88e5",
                                bg: "rgba(33,150,243,0.1)",
                                border: "#2196f3",
                            }
                            : {
                                text: "#e53935",
                                bg: "rgba(244,67,54,0.1)",
                                border: "#f44336",
                            };
                    return "\n            <tr>\n              <td style=\"padding: 0 20px\">\n                <p style=\"\n                  display:inline-block;\n                  padding:2px 8px;\n                  color:".concat(statusColor.text, ";\n                  background-color:").concat(statusColor.bg, ";\n                  border:1px solid ").concat(statusColor.border, ";\n                  border-radius:10px;\n                  text-align:center;\n                  font-size:12px;\n                  line-height:16px;\n                  font-weight:500;\n                \">\n                  ").concat(r.STATUS, "\n                </p>\n              </td>\n              <td style=\"color:#585858;font-size:16px;font-weight:400;line-height:25px;\">\n                ").concat(r.DEPARTMENT_NAME, "\n              </td>\n              <td style=\"color:#585858;font-size:16px;font-weight:400;line-height:25px;\">\n                ").concat(r.PIC || "", "\n              </td>\n              <td style=\"color:#585858;font-size:16px;font-weight:400;line-height:25px;\">\n                ").concat(r.DESCRIPTION, "\n              </td>\n              <td style=\"color:#585858;font-size:16px;font-weight:400;line-height:25px;\">\n                ").concat(r.SOLUTION || "", "\n              </td>\n              <td style=\"color:#585858;font-size:16px;font-weight:400;line-height:25px;\">\n                ").concat(r.DEADLINE, "\n              </td>\n            </tr>\n            <tr>\n              <td style=\"padding: 2px 0\"></td>\n            </tr>\n            <tr>\n              <td style=\"border-bottom: 1px solid #d9d9d9\"></td>\n              <td style=\"border-bottom: 1px solid #d9d9d9\"></td>\n              <td style=\"border-bottom: 1px solid #d9d9d9\"></td>\n              <td style=\"border-bottom: 1px solid #d9d9d9\"></td>\n              <td style=\"border-bottom: 1px solid #d9d9d9\"></td>\n              <td style=\"border-bottom: 1px solid #d9d9d9\"></td>\n            </tr>\n            <tr>\n              <td style=\"padding: 2px 0\"></td>\n            </tr>\n          ");
                })
                    .join("\n");
                var projectColor = group.project_status === "On Time" ||
                    group.project_status === "Ahead"
                    ? {
                        text: "#43a047",
                        bg: "rgba(76,175,80,0.1)",
                        border: "#4caf50",
                    }
                    : group.project_status === "On Going"
                        ? {
                            text: "#1e88e5",
                            bg: "rgba(33,150,243,0.1)",
                            border: "#2196f3",
                        }
                        : {
                            text: "#e53935",
                            bg: "rgba(244,67,54,0.1)",
                            border: "#f44336",
                        };
                return "\n        <tr>\n          <td style=\"width:100%;padding:10px;border:1px solid #d9d9d9;border-radius:15px;\">\n            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;\">\n              <tr>\n                <td>\n                  <table>\n                    <tr>\n                      <td>\n                        <a href=\"".concat(process.env.APP, "/d/").concat(group.project_id, "?open-tabs=remark\" target=\"_blank\" style=\"color:#585858;font-weight:700;font-size:18px;line-height:28px;text-decoration:none;\">\n                          ").concat(group.project_no, "\n                        </a>\n                      </td>\n                      <td style=\"padding: 0 0 0 10px\">\n                        <p style=\"\n                          display:inline-block;\n                          padding:2px 8px;\n                          color:").concat(projectColor.text, ";\n                          background-color:").concat(projectColor.bg, ";\n                          border:1px solid ").concat(projectColor.border, ";\n                          border-radius:10px;\n                          text-align:center;\n                          font-size:12px;\n                          line-height:16px;\n                          font-weight:500;\n                        \">\n                          ").concat(group.project_status, "\n                        </p>\n                      </td>\n                    </tr>\n                  </table>\n                </td>\n              </tr>\n              <tr>\n                  <td>\n                    <table>\n                      <tbody>\n                        <tr>\n                          <td style=\"color:#585858;font-size:16px;font-weight:400;line-height:25px;\">\n                            ").concat(group.project_name, "\n                          </td>\n                        </tr>\n                      </tbody>\n                    </table>\n                  </td>\n              </tr>\n              <tr>\n                <td>\n                  <table width=\"100%\">\n                    <tbody>\n                      ").concat(remarkRows, "\n                    </tbody>\n                  </table>\n                </td>\n              </tr>\n            </table>\n          </td>\n        </tr>\n        <tr>\n          <td style=\"padding: 10px 0\"></td>\n        </tr>\n      ");
            })
                .join("\n");
            // Full HTML
            var html = "\n    <center>\n      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n        <tr>\n          <td align=\"center\" bgcolor=\"#f1f1f1\" style=\"padding:40px 0;\">\n            <table width=\"1000\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"font-family:Inter, Arial, sans-serif;padding:50px 40px 100px 40px;background-color:#ffffff;border:1px solid #d9d9d9;border-radius:15px;\">\n              <tr>\n                <td style=\"font-size:16px;color:#333;\">\n                  <h1 style=\"margin:0;font-size:24px;line-height:32px;color:#2e3849;\">Halo, ".concat(username, "!</h1>\n                  <p style=\"margin:8px 0 0;font-size:16px;line-height:25px;color:#2e3849;\">\n                    Ini adalah remark dengan status selain Close yang ditugaskan pada Departemen ").concat(departmentName, ", Data ini diperbarui per tanggal ").concat(new Date().toLocaleDateString(), ".\n                  </p>\n                </td>\n              </tr>\n              <tr><td style=\"padding:10px\"></td></tr>\n              <tr><td style=\"border-bottom:2px solid #d9d9d9\"></td></tr>\n              <tr><td style=\"padding:10px\"></td></tr>\n              ").concat(rows, "\n              <tr><td style=\"padding:10px\"></td></tr>\n              <tr><td style=\"border-bottom:2px solid #d9d9d9\"></td></tr>\n              <tr><td style=\"padding:10px\"></td></tr>              \n              <tr><td align=\"center\" style=\"text-align: center;\">Copyright Syikha Akmal</td></tr>\n            </table>\n          </td>\n        </tr>\n      </table>\n    </center>\n  ");
            return html;
        },
    },
};
