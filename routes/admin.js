const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const projectsFile = path.join(__dirname, '../data/projects.json');
const imagesDir = path.join(__dirname, '../public/images');
const zipDir = path.join(__dirname, '../../test_zip');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
if (!fs.existsSync(zipDir)) {
  fs.mkdirSync(zipDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'imageFile') {
      cb(null, imagesDir);
    } else if (file.fieldname === 'zipFile') {
      cb(null, zipDir);
    } else {
      cb(new Error('Invalid field name'));
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, crypto.randomUUID() + ext);
  }
});

const upload = multer({ storage: storage });

router.post('/project', upload.fields([{ name: 'imageFile', maxCount: 1 }, { name: 'zipFile', maxCount: 1 }]), (req, res) => {
  try {
    const { title, desc, price, oldPrice, category, tech } = req.body;
    
    // Parse tech stack 
    const techArray = tech ? tech.split(',').map(t => t.trim()) : [];

    const newProject = {
      id: "proj_" + Date.now(),
      title,
      reviews: "0.0 (0 reviews)",
      oldPrice: oldPrice || (price * 1.5).toFixed(2),
      price: parseInt(price),
      tech: techArray,
      category,
      desc
    };

    // Images
    if (req.files['imageFile'] && req.files['imageFile'].length > 0) {
      newProject.image = `/images/${req.files['imageFile'][0].filename}`;
    }

    // Zip File
    if (req.files['zipFile'] && req.files['zipFile'].length > 0) {
      newProject.zipFilename = req.files['zipFile'][0].filename;
    }

    // Save to projects.json
    let projects = [];
    if (fs.existsSync(projectsFile)) {
      projects = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));
    }
    projects.push(newProject);
    fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));

    res.json({ success: true, project: newProject });
  } catch (error) {
    console.error('Error uploading project:', error);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

module.exports = router;
