const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const projectsFile = path.join(__dirname, "../data/projects.json");

router.get("/", (req, res) => {
  try {
    if (fs.existsSync(projectsFile)) {
      const projects = JSON.parse(fs.readFileSync(projectsFile, "utf-8"));
      res.json(projects);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/:id", (req, res) => {
  try {
    if (fs.existsSync(projectsFile)) {
      const projects = JSON.parse(fs.readFileSync(projectsFile, "utf-8"));
      const project = projects.find(p => p.id === req.params.id);
      if (project) {
        res.json(project);
      } else {
        res.status(404).json({ error: "Project not found" });
      }
    } else {
      res.status(404).json({ error: "No projects available" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
