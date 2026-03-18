const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const usersFile = path.join(__dirname, "../data/users.json");

// Helper to read users
const getUsers = () => {
    if (!fs.existsSync(usersFile)) return [];
    return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
};

// Helper to save users
const saveUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

router.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    const users = getUsers();

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: "User already exists" });
    }

    const newUser = { id: Date.now().toString(), name, email, password, projects: [] };
    users.push(newUser);
    saveUsers(users);

    res.json({ message: "Registration successful", user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ 
        message: "Login successful", 
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            isAdmin: user.isAdmin || false
        } 
    });
});

module.exports = router;
