// --- Processing (userForm, guestForm) ---
document.addEventListener("DOMContentLoaded", function () {
  // Guest form (with name, birthday, and date)
  const guestForm = document.getElementById("guestForm");
  if (guestForm) {
    guestForm.addEventListener("submit", function (e) {
      e.preventDefault();
      document.getElementById("submit_btn").click();
    });
  }
  // Form for logged-in user (only date)
  const userForm = document.getElementById("userForm");
  if (userForm) {
    userForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      // Collect only the date and send it as for logged-in
      showLoading();
      document.getElementById("horoscope").innerHTML = "";
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dateInput = document.getElementById("user_only_date");
      const today = new Date().toISOString().split("T")[0];
      if (!dateInput.value || dateInput.value < today) {
        alert(
          "Date of horoscope cannot be in the past. Please, select a valid date."
        );
        hideLoading();
        return;
      }
      const requestData = {
        name: user.name,
        zodiac: user.zodiac,
        date: dateInput.value,
        birthday: user.birthday,
        userId: user.id,
        isLoggedIn: true,
      };
      try {
        const response = await fetch("/api/horoscope", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        localStorage.setItem("horoscopeResult", JSON.stringify(result));
        displayHoroscopeResult(result, requestData);
        hideLoading();
      } catch (err) {
        console.error("Error:", err);
        document.getElementById("horoscope").innerHTML =
          "Error fetching horoscope.";
        hideLoading();
      }
    });
  }
});
// check authorization status on page load
document.addEventListener("DOMContentLoaded", function () {
  // Clean URL from potentially sensitive data
  cleanURLFromSensitiveData();

  checkAuthStatus();
});

// function to clean URL from sensitive data
function cleanURLFromSensitiveData() {
  const urlParams = new URLSearchParams(window.location.search);
  const sensitiveParams = ["email", "password", "pass", "login"];
  let hasChanged = false;

  for (const param of sensitiveParams) {
    if (urlParams.has(param)) {
      urlParams.delete(param);
      hasChanged = true;
    }
  }

  if (hasChanged) {
    const newURL =
      window.location.pathname +
      (urlParams.toString() ? "?" + urlParams.toString() : "") +
      window.location.hash;
    window.history.replaceState({}, "", newURL);
    logInfo("Confidential data removed from URL");
  }
}

// Functions for working with authorization
function checkAuthStatus() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userStr = localStorage.getItem("user");

  if (isLoggedIn && userStr) {
    const user = JSON.parse(userStr);
    showUserButtons(user);
  } else {
    showGuestButtons();
  }
}

function showUserButtons(user) {
  document.getElementById("guestButtons").style.display = "none";
  document.getElementById("userButtons").style.display = "flex";
  document.getElementById("userName").textContent = user.name;
}

function showGuestButtons() {
  console.log("🔄 showGuestButtons() called");
  document.getElementById("guestButtons").style.display = "flex";
  document.getElementById("userButtons").style.display = "none";

  // Hide horoscope result block when switching to guest mode
  const resultForm = document.getElementById("result_form");
  if (resultForm && !resultForm.classList.contains("form-hidden")) {
    resultForm.classList.add("form-hidden");
    resultForm.style.display = "none";
    console.log("✅ block with result is hidden when switching to guest mode");
  } else if (resultForm) {
    console.log("ℹ️ Block with result is already hidden or not found");
  } else {
    console.log("❌ Element result_form not found");
  }

  // Clean horoscope content
  const horoscopeDiv = document.getElementById("horoscope");
  if (horoscopeDiv && horoscopeDiv.innerHTML.trim() !== "") {
    horoscopeDiv.innerHTML = "";
    console.log("✅ Cleaned horoscope content in showGuestButtons");
  }
}

function openLogin() {
  window.location.href = "/login.html";
}

function openRegister() {
  window.location.href = "/register.html";
}

function openProfile() {
  window.location.href = "/profile.html";
}

function logout() {
  console.log("⚠️ WARNING: This logout function in app.js is NOT used!");
  console.log("⚠️ The real logout function is in login.js");

  const logoutId = Math.random().toString(36).substr(2, 9);
  console.log(`🔄 [${logoutId}] Starting logout process`);
  if (confirm("Are you sure you want to log out?")) {
    console.log(`✅ [${logoutId}] User confirmed logout`);

    // Clear all user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("horoscopeResponse");
    localStorage.removeItem("horoscopeResult"); // old key
    localStorage.removeItem("info"); // info about the form
    console.log(`✅ [${logoutId}] Cleared localStorage`);

    // Clear all cache keys for non-logged-in users
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("horoscope_cache_")) {
        localStorage.removeItem(key);
        console.log(`✅ [${logoutId}] Cache cleared:`, key);
      }
    });

    // Clear horoscope display
    const horoscopeDiv = document.getElementById("horoscope");
    if (horoscopeDiv) {
      console.log(
        `🔍 [${logoutId}] Content of horoscope before clearing:`,
        horoscopeDiv.innerHTML.substring(0, 100)
      );
      horoscopeDiv.innerHTML = "";
      horoscopeDiv.textContent = "";
      horoscopeDiv.innerText = "";

      // Delete all child elements
      while (horoscopeDiv.firstChild) {
        horoscopeDiv.removeChild(horoscopeDiv.firstChild);
      }

      console.log(`✅ [${logoutId}] Cleaned horoscope content completely`);
      console.log(
        `🔍 [${logoutId}] Content of horoscope after clearing:`,
        horoscopeDiv.innerHTML
      );
    }

    // Hide result block
    const resultForm = document.getElementById("result_form");
    if (resultForm) {
      console.log(
        `🔍 [${logoutId}] Classes of resultForm before changes:`,
        resultForm.className
      );
      console.log(
        `🔍 [${logoutId}] Display style before changes:`,
        resultForm.style.display
      );
      console.log(
        `🔍 [${logoutId}] Visibility of resultForm before changes:`,
        resultForm.offsetHeight,
        "x",
        resultForm.offsetWidth
      );

      // Apply multiple ways to hide
      resultForm.classList.add("form-hidden");
      resultForm.style.display = "none";
      resultForm.style.visibility = "hidden";
      resultForm.style.opacity = "0";
      resultForm.style.height = "0";
      resultForm.style.overflow = "hidden";
      resultForm.setAttribute("hidden", "true");

      console.log(
        `✅ [${logoutId}] Block of result hidden by all possible means`
      );
    }

    // Additionally forcibly hide the result block using style
    if (resultForm) {
      console.log(`✅ [${logoutId}] Additional check for hiding result block`);
      console.log(
        `🔍 [${logoutId}] Classes of resultForm after changes:`,
        resultForm.className
      );
      console.log(
        `🔍 [${logoutId}] Display style after changes:`,
        resultForm.style.display
      );
      console.log(
        `🔍 [${logoutId}] Visibility of resultForm after changes:`,
        resultForm.offsetHeight,
        "x",
        resultForm.offsetWidth
      );
    }

    // Clear ALL form fields
    const U_name = document.getElementById("user_name");
    const U_birthday = document.getElementById("user_birthday");
    const U_date = document.getElementById("user_date");

    if (U_name) {
      U_name.value = "";
      console.log("✅ Cleared name field");
    }
    if (U_birthday) {
      U_birthday.value = "";
      console.log("✅ Cleared birthday field");
    }
    if (U_date) {
      U_date.value = "";
      console.log("✅ Cleared date field");
    }

    // Clear zodiac sign image
    const zodiacImg = document.getElementById("zodiac_img");
    if (zodiacImg) {
      zodiacImg.src = "";
      console.log("✅ Cleared zodiac sign image");
    }

    // Reset the form completely
    const form = document.getElementById("user_form");
    if (form) {
      form.reset();
      console.log("✅ Form reset");
    }

    // Update authorization status
    console.log("🔄 Calling checkAuthStatus()");
    checkAuthStatus();

    console.log("✅ Logout completed, all data and display cleared");

    // Additional check after logout
    setTimeout(() => {
      const horoscopeCheck = document.getElementById("horoscope");
      const resultFormCheck = document.getElementById("result_form");
      console.log("🔍 Checking after logout:");
      console.log(
        "  - horoscope content:",
        horoscopeCheck ? horoscopeCheck.innerHTML.substring(0, 50) : "not found"
      );
      console.log(
        "  - result_form classes:",
        resultFormCheck ? resultFormCheck.className : "not found"
      );
      console.log(
        "  - result_form display:",
        resultFormCheck ? resultFormCheck.style.display : "not found"
      );
    }, 100);

    alert("You have logged out");
  } else {
    console.log("❌ User canceled logout");
  }
}

// Loading spinner
function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}
function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

// Function to check authorization
function isUserLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// Function for improved caching with timestamps
function getCacheKey(name, date, zodiac) {
  return `horoscope_${name}_${date}_${zodiac}`;
}

function isValidCache(cacheData) {
  if (!cacheData || !cacheData.timestamp) return false;

  const cacheTime = new Date(cacheData.timestamp);
  const now = new Date();
  const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);

  return hoursDiff < 24; // Cache is valid for 24 hours
}

// Function to find existing cached horoscopes by parameters
function findExistingHoroscopeCache(name, birthday, date) {
  console.log("🔍 Looking for existing cache for:", { name, birthday, date });

  // If there is a birthday, calculate the zodiac sign
  let zodiac = null;
  if (birthday && typeof getZodiacSignFromString === "function") {
    zodiac = getZodiacSignFromString(birthday);
  }

  // Iterate over all keys in localStorage
  for (let key of Object.keys(localStorage)) {
    if (key.startsWith("horoscope_") && key.includes("_" + date + "_")) {
      try {
        const cacheData = JSON.parse(localStorage.getItem(key));
        if (cacheData && isValidCache(cacheData)) {
          // Extract parameters from the key
          const parts = key.split("_");
          if (parts.length >= 4) {
            const cachedName = parts[1];
            const cachedDate = parts[2];
            const cachedZodiac = parts[3];

            // Check parameter matches
            const nameMatch =
              name && cachedName.toLowerCase() === name.toLowerCase();
            const dateMatch = cachedDate === date;
            const zodiacMatch = zodiac && cachedZodiac === zodiac;

            if (nameMatch && dateMatch && zodiacMatch) {
              console.log("✅ Found matching cache:", key);
              return cacheData;
            }
          }
        }
      } catch (e) {
        console.log("⚠️ Error reading cache:", key, e);
      }
    }
  }

  console.log("❌ No matching cache found");
  return null;
}

// Sections of the horoscope
const infoSections = [
  "General",
  "Work",
  "Health",
  "Finance",
  "Travel",
  "Relationships",
  "Advice",
];

// Function to display the result
function displayHoroscopeResult(result, info) {
  let html = `<div class="horoscopeResult"> <h2>Horoscope for ${info.name} (${info.zodiac})</h2>`;
  infoSections.forEach((section) => {
    console.log(`Value for ${section}: ${result.horoscope?.[section] || "-"}`);
    html += `<p><b>${section}:</b> ${result.horoscope?.[section] || "-"}</p>`;
  });
  html += `</div>`;

  document.getElementById("horoscope").innerHTML = html;
  const resultFormElement = document.getElementById("result_form");

  // Drop all forced hiding styles
  resultFormElement.classList.remove("form-hidden");
  resultFormElement.style.display = "";
  resultFormElement.style.visibility = "";
  resultFormElement.style.opacity = "";
  resultFormElement.style.height = "";
  resultFormElement.style.overflow = "";
  resultFormElement.removeAttribute("hidden");

  console.log("✅ Horoscope result displayed, all hiding styles reset");

  const resultBox = document.querySelector("#horoscope .horoscopeResult");

  // Add background image
  if (resultBox) {
    resultBox.style.backgroundImage = `url('img/zodiac/${info.zodiac}.png')`;
    resultBox.style.backgroundSize = "cover";
    resultBox.style.backgroundRepeat = "no-repeat";
    resultBox.style.backgroundPosition = "center";
    resultBox.style.opacity = "0.9";

    // Add overlay for better readability
    let overlay = document.createElement("div");
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    resultBox.parentElement.appendChild(overlay);
  }
}

// restore localStorage
window.addEventListener("load", () => {
  console.log("🔄 Load event triggered");
  console.log("🔍 Checking localStorage on load:");
  console.log("  - info:", localStorage.getItem("info"));
  console.log("  - isLoggedIn:", localStorage.getItem("isLoggedIn"));
  console.log("  - user:", localStorage.getItem("user"));

  // Enable automatic form data restoration

  restoreFormFromLocalStorage();

  // Check if there is a logged-in user
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userData = localStorage.getItem("user");

  if (isLoggedIn === "true" && userData) {
    try {
      const user = JSON.parse(userData);
      // If the user is logged in, fill the form with their data
      fillFormWithUserData(user);
      console.log("✅ Form filled with logged-in user data");

      // Do NOT automatically load horoscope on page load
      // Horoscope will only be loaded on explicit user request
      console.log("ℹ️ Automatic horoscope loading on page load is disabled");
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }

  // Calendar settings
  setupCalendarLimits();
});

// Function to restore data from localStorage
function restoreFormFromLocalStorage() {
  console.log("🔄 Starting restoreFormFromLocalStorage()");

  // Check both keys - user (primary) and info (for compatibility)
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const savedInfo = JSON.parse(localStorage.getItem("info") || "{}");
  console.log("🔍 Saved information from localStorage (user):", savedUser);
  console.log("🔍 Saved information from localStorage (info):", savedInfo);

  // Use data from user if available, otherwise from info
  const dataToUse = Object.keys(savedUser).length > 0 ? savedUser : savedInfo;
  console.log("🔍 Using data:", dataToUse);

  const U_name = document.getElementById("user_name");
  const U_birthday = document.getElementById("user_birthday");
  const U_date = document.getElementById("user_date");

  console.log("🔍 Found DOM elements:", {
    U_name: !!U_name,
    U_birthday: !!U_birthday,
    U_date: !!U_date,
  });

  // Always restore form data
  if (dataToUse.name && U_name) {
    U_name.value = dataToUse.name;
    console.log("✅ Restored name from localStorage:", dataToUse.name);
  } else {
    console.log("ℹ️ Name not restored:", {
      hasName: !!dataToUse.name,
      hasElement: !!U_name,
    });
  }

  if (dataToUse.birthday && U_birthday) {
    U_birthday.value = dataToUse.birthday;
    console.log("✅ Restored birthday from localStorage:", dataToUse.birthday);
  } else {
    console.log("ℹ️ Birthday not restored:", {
      hasBirthday: !!dataToUse.birthday,
      hasElement: !!U_birthday,
    });
  }

  if (U_date) {
    const today = new Date().toISOString().split("T")[0];
    U_date.value = today;
    console.log("✅ Set today's date as default:", today);
  }

  // DO NOT automatically restore horoscope on page load
  // Horoscope will only be displayed on explicit user request
  console.log(
    "ℹ️ Form data restored, but horoscope is not displayed automatically"
  );

  // Check authentication status
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    console.log("ℹ️ User is not logged in, horoscope cache is NOT restored");

    // But we can check if there is a suitable cache for the restored data
    if (dataToUse.name && dataToUse.birthday && dataToUse.date) {
      const existingCache = findExistingHoroscopeCache(
        dataToUse.name,
        dataToUse.birthday,
        dataToUse.date
      );
      if (existingCache) {
        console.log(
          "💡 Found cached horoscope for restored data, but not displaying automatically"
        );
      }
    }
  } else {
    console.log("ℹ️ User is logged in, horoscope cache is NOT restored");
  }
}

// Function to fill the form with user data
function fillFormWithUserData(user) {
  const U_name = document.getElementById("user_name");
  const U_birthday = document.getElementById("user_birthday");

  if (U_name) U_name.value = user.name || "";
  if (U_birthday && user.birthday) {
    // Format date to YYYY-MM-DD for input[type="date"]
    const birthDate = new Date(user.birthday);
    const formattedDate = birthDate.toISOString().split("T")[0];
    U_birthday.value = formattedDate;
  }
}

// Function to load user's horoscope for today
async function loadUserHoroscopeForToday(user) {
  if (!user.birthday) return;

  const today = new Date().toISOString().split("T")[0];
  const zodiac = getZodiacSignFromString(user.birthday);

  if (zodiac) {
    // Fill the form with user data and today's date
    document.getElementById("name").value = user.name || "";
    document.getElementById("zodiac").value = zodiac;
    document.getElementById("date").value = today;
    if (user.birthday) {
      const birthDate = new Date(user.birthday);
      const formattedDate = birthDate.toISOString().split("T")[0];
      document.getElementById("birthday").value = formattedDate;
    }
  }
}

// Function to setup calendar limits
function setupCalendarLimits() {
  const U_date = document.getElementById("user_date");
  const U_birthday = document.getElementById("user_birthday");

  if (U_date) {
    const today = new Date().toISOString().split("T")[0];
    U_date.setAttribute("min", today);

    // Set today's date as default if field is empty
    if (!U_date.value) {
      U_date.value = today;
    }
  }

  if (U_birthday) {
    const today = new Date().toISOString().split("T")[0];
    U_birthday.setAttribute("max", today);
  }
}

// Form zodiac image
function showZodiacImage(zodiac) {
  const imageContainer = document.getElementById("zodiac_img");
  if (!imageContainer) return;
  let src = zodiac !== "unknown" ? `img/zodiac/${zodiac}.png` : "";
  imageContainer.src = src;
}

//Button processing
document.getElementById("submit_btn").addEventListener("click", async (e) => {
  const isLoggedIn = isUserLoggedIn();
  e.preventDefault();

  showLoading();

  document.getElementById("horoscope").innerHTML = "";
  const U_name = document.getElementById("user_name");
  const U_birthday = document.getElementById("user_birthday");
  const U_date = document.getElementById("user_date");
  const today = new Date().toISOString().split("T")[0];

  //Check inputs dates
  if (U_birthday.value > today) {
    alert("Birthday cannot be in the future. Please, select a valid date.");
    hideLoading();
    return;
  }
  if (U_date.value < today) {
    alert(
      "Date of horoscope cannot be in the past. Please, select a valid date."
    );
    hideLoading();
    return;
  }

  // Get zodiac sign
  let zodiac = getZodiacSignFromString(U_birthday.value.trim());
  let info = {
    name: U_name.value.trim(),
    birthday: U_birthday.value.trim(),
    date: U_date.value.trim(),
    zodiac: zodiac,
  };

  if (isLoggedIn) {
    // If user has no birthday but has zodiac in profile — use it
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if ((!info.birthday || !zodiac) && user.zodiac) {
      zodiac = user.zodiac;
      info.zodiac = user.zodiac;
    }
  }

  //Save info to localStorage

  if (isLoggedIn) {
    // Update user data in localStorage
    const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = {
      ...existingUser,
      name: info.name,
      birthday: info.birthday,
      date: info.date,
      zodiac: info.zodiac,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    console.log("✅ User data updated in localStorage (user):", updatedUser);

    let result;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      // If user has no birthday but has zodiac in profile — use it
      const zodiacToSend = info.zodiac || user.zodiac;
      const requestData = {
        name: user.name,
        zodiac: zodiacToSend,
        date: info.date,
        birthday: user.birthday,
        userId: user.id,
        isLoggedIn: true,
      };
      const response = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      result = await response.json();
      console.log("Server response:", result);
      // Save only for compatibility (can be removed)
      localStorage.setItem("horoscopeResult", JSON.stringify(result));
      // For display and image use info with actual zodiac
      displayHoroscopeResult(result, info);
      hideLoading();
    } catch (err) {
      console.error("Error:", err);
      document.getElementById("horoscope").innerHTML =
        "Error fetching horoscope.";
      hideLoading();
      return;
    }
    return;
  } else {
    // GUEST: name and birthday must be entered
    if (!info.name || !info.birthday) {
      alert("To get a horoscope, you must enter your name and date of birth.");
      hideLoading();
      return;
    }
    // First, look for cached data in localStorage, if not found — request to the server
    const cachedData = findExistingHoroscopeCache(
      info.name,
      info.birthday,
      info.date
    );
    if (cachedData) {
      console.log("✅ Found valid cache, using saved result");
      setTimeout(() => {
        displayHoroscopeResult(cachedData.data, info);
        hideLoading();
      }, 800);
      return;
    }
    // Save form data
    localStorage.setItem("info", JSON.stringify(info));
    console.log("✅ Form data saved to localStorage (info):", info);
    let result;
    try {
      const requestData = {
        name: info.name,
        zodiac: info.zodiac,
        date: info.date,
        birthday: info.birthday,
        isLoggedIn: false,
      };
      const response = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      result = await response.json();
      console.log("Server response:", result);
      // Cache the result
      const cacheKey = getCacheKey(info.name, info.date, info.zodiac);
      const cacheData = { data: result, timestamp: new Date().toISOString() };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      displayHoroscopeResult(result, info);
      hideLoading();
    } catch (err) {
      console.error("Error:", err);
      document.getElementById("horoscope").innerHTML =
        "Error fetching horoscope.";
      hideLoading();
      return;
    }
  }
});
