// Global theme initialization logic
document.addEventListener("DOMContentLoaded", () => {
  // Apply saved theme immediately
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  } else if (localStorage.getItem("theme") === "light") {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
  } else {
    // Default to dark mode based on initial HTML class
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  }
});

function updateThemeIcon() {
  const icon = document.querySelector("#themeToggle span");
  if (icon) {
    icon.innerText = document.documentElement.classList.contains("dark") ? "light_mode" : "dark_mode";
  }
}

function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  
  // Set initial icon
  updateThemeIcon();

  toggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    document.body.classList.toggle("dark");

    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    // Update icon after toggle
    updateThemeIcon();
  });
}
