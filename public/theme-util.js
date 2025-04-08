// /public/theme-util.js

const storageKey = "theme-preference";

// --- Core Functions ---

const getColorPreference = () => {
  // Check localStorage first
  let preference = localStorage.getItem(storageKey);

  // If no preference in localStorage, check system preference
  if (!preference) {
    preference = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // Return 'light' or 'dark'
  return preference;
};

// Function to apply the theme and sync toggle states
const syncThemeAndToggles = () => {
  const theme = getColorPreference();

  // 1. Set data-theme on the <html> element
  // Use document.documentElement which is the <html> tag
  document.documentElement.setAttribute("data-theme", theme);

  // 2. Find ALL theme toggle checkboxes on the current page
  // Use a specific class like 'theme-toggle' added to the input
  const themeToggles = document.querySelectorAll(
    'input.theme-toggle[type="checkbox"]',
  );

  // 3. Set their 'checked' state based on the current theme
  themeToggles.forEach((toggle) => {
    if (toggle) {
      // Check the box if the theme is 'dark', uncheck if 'light'
      toggle.checked = theme === "dark";
    }
  });

  // console.log(`Theme synced: ${theme}, Toggles updated: ${themeToggles.length}`); // For debugging
};

// Function to save preference and trigger sync
const setPreference = (themeName) => {
  localStorage.setItem(storageKey, themeName);
  // Apply the change and sync toggles immediately
  syncThemeAndToggles();
};

// Function called by toggle button's onclick
const togglePreference = () => {
  // Get the *opposite* of the current preference
  const newTheme = getColorPreference() === "dark" ? "light" : "dark";
  setPreference(newTheme);
};

// --- Initialization and Event Listeners ---
const handleToggleClick = () => {
  const newTheme = getColorPreference() === "dark" ? "light" : "dark";
  setPreference(newTheme); // setPreference still calls syncThemeAndToggles
};

// Function to find toggles and attach listeners
const setupToggleListeners = () => {
  const themeToggles = document.querySelectorAll(
    'input.theme-toggle[type="checkbox"]',
  );
  themeToggles.forEach((toggle) => {
    // Remove listener first to prevent duplicates if this runs multiple times
    toggle.removeEventListener("click", handleToggleClick);
    // Add the actual listener
    toggle.addEventListener("click", handleToggleClick);
  });
  // console.log(`Attached listeners to ${themeToggles.length} toggles.`); // For debugging
};

// --- Initialization and Event Listeners ---

// 1. Initial sync and listener setup on page load
syncThemeAndToggles();
setupToggleListeners();

// 2. Sync and re-attach listeners after Astro swaps page content
document.addEventListener("astro:after-swap", () => {
  syncThemeAndToggles(); // Ensure theme attribute and toggle state are correct
  setupToggleListeners(); // Re-attach listeners to potentially new toggle elements
});

// 3. Optional: System theme changes listener (no change needed here)
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (!localStorage.getItem(storageKey)) {
      syncThemeAndToggles();
    }
  });
// 1. Initial sync when the script loads
// // This runs on the very first page load.
// syncThemeAndToggles();

// // 2. Sync *after* Astro swaps page content during client-side navigation
// // This is the key fix for View Transitions!
// document.addEventListener("astro:after-swap", syncThemeAndToggles);

// // Optional: Listen for system theme changes (if user hasn't set a preference)
// window
//   .matchMedia("(prefers-color-scheme: dark)")
//   .addEventListener("change", () => {
//     // Only sync if the user hasn't explicitly chosen a theme via the toggle
//     if (!localStorage.getItem(storageKey)) {
//       syncThemeAndToggles();
//     }
//   });
