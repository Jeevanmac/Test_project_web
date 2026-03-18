const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/payment");
const downloadRoutes = require("./routes/download");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const projectsRoutes = require("./routes/projects");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", paymentRoutes);
app.use("/api", downloadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectsRoutes);

// Serve the frontend static files from public directory
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
