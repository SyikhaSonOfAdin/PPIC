const { departmentServices } = require("../services/department");
const { actualServices } = require("../services/projectActual");
const { remarkServices } = require("../services/journalRemark");
const { emailServices } = require("../services/email");
const { userServices } = require("../services/user");
const { summaryQueue } = require("../services/ai/queue");
const { PPIC } = require("../config/db");

const journalRemarkController = {
  add: async (req, res, next) => {
    const {
      projectId,
      userId,
      description,
      solution,
      deadline,
      departmentId,
      status,
    } = req.body;
    if (
      !projectId ||
      !userId ||
      !description ||
      !deadline ||
      !departmentId ||
      !status
    )
      return res.status(400).json({ message: "Invalid Parameters" });
    try {
      const id = await remarkServices.add(
        projectId,
        userId,
        departmentId,
        description,
        deadline,
        status,
        solution,
      );
      // summaryQueue.enqueue(projectId)
      return res.status(200).json({
        message: "Remark Journal added successfully",
        data: [
          {
            journalRemarkId: id,
          },
        ],
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
  delete: {
    all: async (req, res, next) => {
      const { projectId } = req.body;
      if (!projectId)
        return res.status(400).json({ message: "Invalid Parameters" });
      try {
        await remarkServices.delete.all(projectId);
        return res.status(200).json({
          message: "Remarks Journal deleted successfully",
          data: [],
        });
      } catch (error) {
        res.status(500).json({
          message: error.message,
        });
      }
    },
    onlyOne: async (req, res, next) => {
      const { rowId } = req.body;
      if (!rowId)
        return res.status(400).json({ message: "Invalid Parameters" });
      try {
        await remarkServices.delete.onlyOne(rowId);
        return res.status(200).json({
          message: "Remark Journal deleted successfully",
          data: [],
        });
      } catch (error) {
        res.status(500).json({
          message: error.message,
        });
      }
    },
  },
  edit: async (req, res, next) => {
    const {
      remarkId,
      userId,
      description,
      solution,
      deadline,
      departmentId,
      status,
    } = req.body;
    if (
      !remarkId ||
      !userId ||
      !description ||
      !deadline ||
      !departmentId ||
      !status
    )
      return res.status(400).json({ message: "Invalid Parameters" });
    try {
      await remarkServices.edit(
        remarkId,
        userId,
        description,
        deadline,
        departmentId,
        status,
        solution,
      );
      // try {
      //     const connection = await PPIC.getConnection()
      //     try {
      //         const [rows] = await connection.query(
      //             "SELECT PROJECT_ID FROM project_remark WHERE ID = ? LIMIT 1",
      //             [remarkId]
      //         )
      //         const projectId = rows?.[0]?.PROJECT_ID
      //         if (projectId) summaryQueue.enqueue(projectId)
      //     } finally {
      //         connection.release()
      //     }
      // } catch (e) {
      //     console.error("[ai-queue] enqueue on edit failed", e?.message ?? e)
      // }
      return res.status(200).json({
        message: "Remark Journal edited successfully",
        data: [],
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
  get: {
    onlyOne: async (req, res, next) => {
      const projectId = req.params.projectId;
      if (!projectId)
        return res.status(400).json({ message: "Invalid Parameters" });
      try {
        const data = await remarkServices.get.onlyOne(projectId);
        return res.status(200).json({
          message: "Get Remark Journal successfully",
          data: data,
        });
      } catch (error) {
        res.status(500).json({
          message: error.message,
        });
      }
    },
    all: {
      forReport: async (req, res, next) => {
        const companyId = req.params.companyId;
        if (!companyId)
          return res.status(400).json({ message: "Invalid Parameters" });
        try {
          const data = await remarkServices.get.all.forReport(companyId);
          return res.status(200).json({
            message: "Get Remark Journal successfully",
            data: data,
          });
        } catch (error) {
          res.status(500).json({
            message: error.message,
          });
        }
      },
      all: async (req, res, next) => {
        const companyId = req.params.companyId;
        const s = req.query.s;

        if (!companyId)
          return res.status(400).json({ message: "Invalid Parameters" });

        let connection; // Deklarasikan di luar agar bisa diakses di finally
        try {
          connection = await PPIC.getConnection();
          const data = await remarkServices.get.all.all(
            companyId,
            s,
            connection,
          );

          const projects = [];

          // Menggunakan loop berurutan agar koneksi tidak tabrakan
          for (const p of data) {
            const actualData = await actualServices.get.all(p.ID, connection);
            const totalActual = actualData.reduce(
              (sum, item) => sum + parseFloat(item.AMOUNT || 0),
              0,
            );

            projects.push({
              ...p,
              PERCENTAGE:
                totalActual > 0
                  ? ((totalActual / parseFloat(p.CAPACITY)) * 100).toFixed(2) +
                    "%"
                  : "0%",
            });
          }

          return res.status(200).json({
            message: "Get Remark Journal successfully",
            data: projects,
          });
        } catch (error) {
          // Hapus connection.rollback() karena ini hanya query GET (bukan transaksi INSERT/UPDATE)
          return res.status(500).json({
            message: error.message,
          });
        } finally {
          // Memastikan koneksi selalu dilepas kembali ke pool
          if (connection) connection.release();
        }
      },
    },
  },
  sendEmail: async (req, res) => {
    const companyId = req.params.companyId;
    const { to, data_type, data_from } = req.query;
    console.log({ to, data_type, data_from });
    if (!companyId)
      return res.status(400).json({ message: "Invalid Parameters" });

    try {
      const connection = await PPIC.getConnection();
      try {
        console.log(
          `[sendEmail] START — data_type=${data_type}, to=${to}, data_from=${data_from}, companyId=${companyId}`,
        );

        if (data_type == "all" && to == "assigned department") {
          const departments = await departmentServices.get.all(
            companyId,
            connection,
          );
          console.log(
            `[sendEmail] branch=assigned-department, departments found=${departments.length}`,
          );

          for (const dep of departments) {
            const data = await remarkServices.get.all.byDepId(
              companyId,
              dep.ID,
              connection,
            );
            const users = await userServices.get.byDepId(dep.ID, connection);
            const emails =
              users.length > 1
                ? users.map((u) => u.EMAIL).join(", ")
                : users[0]?.EMAIL;
            console.log(
              `[sendEmail] dep=${dep.NAME}, remarks=${data.length}, users=${users.length}, emails=${emails ?? "NONE"}`,
            );

            if (data.length > 0) {
              const htmlStatic = emailServices.template.projectRemark(
                dep.COMPANY_NAME,
                dep.NAME,
                data,
              );
              if (emails) {
                try {
                  const result = await emailServices.sendEmail(
                    emails,
                    "Remarks Reminder",
                    "",
                    htmlStatic,
                    "PPIC Report",
                  );
                  console.log(
                    `[sendEmail] OK — to=${emails}, messageId=${result.messageId}, response=${result.response}`,
                  );
                } catch (emailErr) {
                  console.error(
                    `[sendEmail] FAILED — to=${emails}, error=${emailErr.message}`,
                  );
                  throw emailErr;
                }
              } else {
                console.log(
                  `[sendEmail] SKIP dep=${dep.NAME} — no email address found`,
                );
              }
            } else {
              console.log(`[sendEmail] SKIP dep=${dep.NAME} — no remarks data`);
            }
          }
        } else if (data_type == "all" && to != "assigned department") {
          const t = [];
          const d = await departmentServices.get.onlyOne(to, connection);
          const departments = await departmentServices.get.all(
            companyId,
            connection,
          );
          console.log(
            `[sendEmail] branch=all-to-one-dept, target dept=${d?.NAME}, departments found=${departments.length}`,
          );

          for (const dep of departments) {
            const data = await remarkServices.get.all.byDepId(
              companyId,
              dep.ID,
              connection,
            );
            t.push(data);
          }
          const users = await userServices.get.byDepId(to, connection);
          const emails =
            users.length > 1
              ? users.map((u) => u.EMAIL).join(", ")
              : users.map((u) => u.EMAIL)[0];
          console.log(
            `[sendEmail] total remark arrays=${t.length}, flat=${t.flat().length}, users=${users.length}, emails=${emails ?? "NONE"}`,
          );

          if (t.length > 0) {
            const htmlStatic = emailServices.template.projectRemark(
              d.COMPANY_NAME,
              d.NAME,
              t.flat(),
            );
            if (emails) {
              try {
                const result = await emailServices.sendEmail(
                  emails,
                  "Remarks Reminder",
                  "",
                  htmlStatic,
                  "PPIC Report",
                );
                console.log(
                  `[sendEmail] OK — to=${emails}, messageId=${result.messageId}, response=${result.response}`,
                );
              } catch (emailErr) {
                console.error(
                  `[sendEmail] FAILED — to=${emails}, error=${emailErr.message}`,
                );
                throw emailErr;
              }
            } else {
              console.log(
                `[sendEmail] SKIP — no email address found for dept=${to}`,
              );
            }
          } else {
            console.log(`[sendEmail] SKIP — no remarks data collected`);
          }
        } else if (data_type == "partial") {
          const departments = await departmentServices.get.onlyOne(
            to,
            connection,
          );
          const data = await remarkServices.get.all.byDepId(
            companyId,
            data_from,
            connection,
          );
          const users = await userServices.get.byDepId(to, connection);
          const emails =
            users.length > 1
              ? users.map((u) => u.EMAIL).join(", ")
              : users.map((u) => u.EMAIL)[0];
          console.log(
            `[sendEmail] branch=partial, dept=${departments?.NAME}, remarks=${data.length}, users=${users.length}, emails=${emails ?? "NONE"}`,
          );

          if (data.length > 0) {
            const htmlStatic = emailServices.template.projectRemark(
              departments.COMPANY_NAME,
              departments.NAME,
              data,
            );
            if (emails) {
              try {
                const result = await emailServices.sendEmail(
                  emails,
                  "Remarks Reminder",
                  "",
                  htmlStatic,
                  "PPIC Report",
                );
                console.log(
                  `[sendEmail] OK — to=${emails}, messageId=${result.messageId}, response=${result.response}`,
                );
              } catch (emailErr) {
                console.error(
                  `[sendEmail] FAILED — to=${emails}, error=${emailErr.message}`,
                );
                throw emailErr;
              }
            } else {
              console.log(
                `[sendEmail] SKIP — no email address found for dept=${to}`,
              );
            }
          } else {
            console.log(
              `[sendEmail] SKIP — no remarks data for data_from=${data_from}`,
            );
          }
        }

        return res.status(200).json({
          message: "Send Email Remark Journal successfully",
          data: [],
        });
      } catch (error) {
        connection.rollback();
        res.status(500).json({
          message: error.message,
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
};

module.exports = { journalRemarkController };
