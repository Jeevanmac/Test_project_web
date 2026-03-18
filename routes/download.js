const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const projectsFile = path.join(__dirname, "../data/projects.json");

router.get("/download", (req, res) => {
  const { token, projectId } = req.query;

  // In this demo, we use a simple token check
  if (token !== "valid_token") {
    return res.status(403).send("Access Denied: Invalid download token.");
  }

  let projects = [];
  if (fs.existsSync(projectsFile)) {
    projects = JSON.parse(fs.readFileSync(projectsFile, "utf-8"));
  }

  // Handle special case where projectId is "proj_3_details" etc due to legacy buttons
  let normalizedId = projectId;
  if (projectId && projectId.startsWith("proj_")) {
    normalizedId = projectId.replace("_details", "").replace("proj_", "p");
  }

  const project = projects.find(p => p.id === projectId || p.id === normalizedId);

  if (!project || !project.zipFilename) {
    return res.status(404).send("Access Denied: Project not found.");
  }

  const fileName = project.zipFilename;

  const filePath = path.join(__dirname, "../../test_zip", fileName);
  
  res.download(filePath, fileName, (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status(404).send("File not found on server.");
      }
    }
  });
});

module.exports = router;
