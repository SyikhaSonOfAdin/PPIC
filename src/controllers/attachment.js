const { attachmentServices } = require("../services/attachment");
const { PPIC } = require("../config/db");
const path = require("path");
const fs = require("fs");

const attachmentControllers = {
  add: async (req, res, next) => {
    const fileName = req.file?.filename;
    const { projectId, userId, description, label } = req.body;
    if (!projectId || !userId || !fileName || !label)
      return res.status(400).json({ message: "Invalid Parameter" });

    try {
      const id = await attachmentServices.add(
        projectId,
        userId,
        fileName,
        description,
        label,
      );
      return res.status(200).json({
        message: "Attachment saved successfully",
        data: [
          {
            attachmentId: id,
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
    onlyOne: async (req, res, next) => {
      const { rowId } = req.body;
      if (!rowId) return res.status(400).json({ message: "Invalid Parameter" });
      
      let connection;
      try {
        connection = await PPIC.getConnection();
        
        // Get file info from database
        const fileName = await attachmentServices.get.fileName(rowId, connection);
        
        // Check if attachment exists in database
        if (!fileName || fileName.length === 0) {
          return res.status(404).json({
            message: "Attachment not found in database",
            data: [],
          });
        }
        
        const filePath = path.join(
          __dirname,
          "../../../uploads/ppic",
          fileName[0]["FILE_NAME"],
        );
        
        // Delete from database first
        await attachmentServices.delete.onlyOne(rowId, connection);
        await connection.commit();
        
        // Try to delete file, but don't fail if file doesn't exist
        fs.access(filePath, fs.constants.F_OK, (accessErr) => {
          if (accessErr) {
            // File doesn't exist - log warning but return success
            console.warn(`[DELETE ATTACHMENT] File not found on disk: ${filePath}`);
            console.warn(`[DELETE ATTACHMENT] Database record deleted successfully for rowId: ${rowId}`);
            
            return res.status(200).json({
              message: "Attachment deleted successfully (file not found on disk)",
              data: [],
              warning: "Physical file was already missing",
            });
          }
          
          // File exists, proceed with deletion
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              // File deletion failed - log error but database is already cleaned
              console.error(`[DELETE ATTACHMENT] Failed to delete file: ${filePath}`, unlinkErr);
              
              return res.status(200).json({
                message: "Attachment record deleted, but file deletion failed",
                data: [],
                warning: "Physical file could not be deleted",
              });
            }
            
            // Success - both database and file deleted
            return res.status(200).json({
              message: "Attachment deleted successfully",
              data: [],
            });
          });
        });
        
      } catch (error) {
        // Rollback if transaction is still active
        if (connection) {
          try {
            await connection.rollback();
          } catch (rollbackErr) {
            console.error("[DELETE ATTACHMENT] Rollback failed:", rollbackErr);
          }
        }
        
        console.error("[DELETE ATTACHMENT] Error:", error);
        return res.status(500).json({
          message: error.message || "Failed to delete attachment",
        });
      } finally {
        if (connection) {
          connection.release();
        }
      }
    },
  },
  edit: async (req, res, next) => {
    const { rowId, userId, description } = req.body;
    if (!rowId || !userId)
      return res.status(400).json({ message: "Invalid Parameter" });
    try {
      await attachmentServices.edit(rowId, userId, description);

      return res.status(200).json({
        message: "Attachment edited successfully",
        data: [],
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
  get: async (req, res, next) => {
    const projectId = req.params.projectId;
    const { label, s } = req.query;
    if (!projectId || !label)
      return res.status(400).json({ message: "Invalid Parameter" });
    try {
      const data = await attachmentServices.get.all(projectId, label, s ?? "");
      return res.status(200).json({
        message: "Get Attachments data successfully",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
  download: async (req, res, next) => {
    const attachmentId = req.params.attachmentId;
    if (!attachmentId)
      return res.status(400).json({ message: "Invalid Parameter" });
    
    try {
      const fileName = await attachmentServices.get.fileName(attachmentId);
      
      // Check if attachment exists in database
      if (!fileName || fileName.length === 0) {
        return res.status(404).json({
          message: "Attachment not found in database",
        });
      }
      
      const filePath = path.join(
        __dirname,
        "../../../uploads/ppic",
        fileName[0]["FILE_NAME"],
      );
      
      // Check if file exists before attempting download
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`[DOWNLOAD ATTACHMENT] File not found: ${filePath}`);
          return res.status(404).json({
            message: "File not found on server",
            fileName: fileName[0]["FILE_NAME"],
          });
        }
        
        // File exists, proceed with download
        return res.sendFile(filePath, (sendErr) => {
          if (sendErr) {
            console.error(`[DOWNLOAD ATTACHMENT] Send file error:`, sendErr);
            if (!res.headersSent) {
              return res.status(500).json({
                message: "Failed to send file",
              });
            }
          }
        });
      });
      
    } catch (error) {
      console.error("[DOWNLOAD ATTACHMENT] Error:", error);
      return res.status(500).json({
        message: error.message || "Failed to download attachment",
      });
    }
  },
};

module.exports = {
  attachmentControllers,
};
