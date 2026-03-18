async function loadComponents() {
  try {
    const navbarRes = await fetch("/components/navbar.html");
    if (navbarRes.ok) {
      document.getElementById("navbar-container").innerHTML = await navbarRes.text();
      // Initialize interactive elements in the navbar after it loads
      if (typeof initThemeToggle === "function") initThemeToggle();
      if (typeof updateCartCount === "function") updateCartCount();

      // Highlight active link
      const currentPath = window.location.pathname;
      document.querySelectorAll('#nav-links .nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath || (currentPath === '/' && link.getAttribute('href') === '/pages/index.html')) {
          link.classList.remove('text-slate-500', 'dark:text-slate-400');
          link.classList.add('text-primary', 'dark:text-primary');
        }
      });

      // Auth State rendering
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        document.getElementById("nav-login-btn")?.classList.add("hidden");
        const profileBtn = document.getElementById("nav-profile-btn");
        if (profileBtn) {
            profileBtn.classList.remove("hidden");
            profileBtn.classList.add("flex");
            document.getElementById("nav-user-name").innerText = user.name || "Profile";
        }
        if (user.isAdmin) {
          const adminLink = document.getElementById("nav-admin");
          if (adminLink) adminLink.classList.remove("hidden");
          
          // Hide Dashboard for admins to reduce redundancy
          const dashboardLink = document.getElementById("nav-dashboard");
          if (dashboardLink) dashboardLink.classList.add("hidden");
        }
      }
    }
  } catch (error) {
    console.error("Failed to load navbar:", error);
  }

  try {
    const footerRes = await fetch("/components/footer.html");
    if (footerRes.ok) {
      document.getElementById("footer-container").innerHTML = await footerRes.text();
    }
  } catch (error) {
    console.error("Failed to load footer:", error);
  }
}

// Automatically execute when scripts load
loadComponents();
