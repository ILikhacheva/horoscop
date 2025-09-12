// login.js - Processing authorization (uses functions from client-utils.js)
document.addEventListener("DOMContentLoaded", function () {
  // === Logic for profile modal window ===
  if (document.getElementById("profileZodiac"))
    fillZodiacSelect("profileZodiac");
  const profileBirthdayInput = document.getElementById("profileBirthday");
  const profileNoBirthdayCheckbox =
    document.getElementById("profileNoBirthday");
  const profileZodiacSelect = document.getElementById("profileZodiac");
  const profileZodiacGroup = document.getElementById("profileZodiacGroup");
  const profileBirthdayGroup = document.getElementById("profileBirthdayGroup");

  function updateProfileFieldsByState() {
    if (
      !profileBirthdayInput ||
      !profileNoBirthdayCheckbox ||
      !profileZodiacSelect ||
      !profileZodiacGroup
    )
      return;
    if (profileBirthdayInput.value) {
      // If birthday is entered
      profileNoBirthdayCheckbox.checked = false;
      profileBirthdayInput.disabled = false;
      profileZodiacSelect.disabled = true;
      profileZodiacGroup.style.display = "block";
      // Automatically calculate zodiac sign
      if (typeof getZodiacSignFromString === "function") {
        profileZodiacSelect.value = getZodiacSignFromString(
          profileBirthdayInput.value
        );
      }
    } else if (profileNoBirthdayCheckbox.checked) {
      // If checkbox is checked (don't want to specify birthday)
      profileBirthdayInput.value = "";
      profileBirthdayInput.disabled = true;
      profileZodiacSelect.disabled = false;
      profileZodiacGroup.style.display = "block";
    } else {
      // If nothing is selected
      profileBirthdayInput.disabled = false;
      profileZodiacSelect.disabled = true;
      profileZodiacGroup.style.display = "block";
    }
  }

  if (profileBirthdayInput) {
    profileBirthdayInput.addEventListener("change", updateProfileFieldsByState);
  }
  if (profileNoBirthdayCheckbox) {
    profileNoBirthdayCheckbox.addEventListener("change", function () {
      if (profileNoBirthdayCheckbox.checked) {
        profileBirthdayInput.value = "";
        profileBirthdayInput.disabled = true;
        profileZodiacSelect.disabled = false;
        profileZodiacGroup.style.display = "block";
      } else {
        profileBirthdayInput.disabled = false;
        profileZodiacSelect.disabled = true;
        profileZodiacGroup.style.display = "block";
        // If birthday is entered, calculate zodiac sign
        if (
          profileBirthdayInput.value &&
          typeof getZodiacSignFromString === "function"
        ) {
          profileZodiacSelect.value = getZodiacSignFromString(
            profileBirthdayInput.value
          );
        }
      }
    });
  }
  // On profile open and form fill also call
  updateProfileFieldsByState();
  // Only check authorization to update interface,
  // but DO NOT fill form on page load
  checkUserSessionForInterface();

  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    logInfo("Login form not found");
    return;
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    logInfo("Attempting login...");

    // Clear previous errors
    clearErrors();

    // Validation
    if (!validateLoginForm()) {
      logError("Login form validation failed");
      return;
    }

    const formData = {
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value,
    };

    logInfo("Data for login:", {
      email: formData.email,
      password: "***hidden***",
    });

    try {
      logInfo("Sending authorization request...");
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      logInfo("Received server response:", response.status);
      const result = await response.json();
      logInfo("Authorization result:", result);

      if (result.success) {
        logSuccess("Authorization successful!");
        logInfo("User data from server:", result.user);

        // Save user information to localStorage
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("isLoggedIn", "true");

        // Clear previous horoscope on login
        const horoscopeDiv = document.getElementById("horoscope");
        if (horoscopeDiv) {
          horoscopeDiv.innerHTML = "";
        }
        const resultForm = document.getElementById("result_form");
        if (resultForm) {
          resultForm.classList.add("form-hidden");
        }

        // Save today's horoscope if it exists
        if (result.todayHoroscope) {
          localStorage.setItem(
            "horoscopeResponse",
            JSON.stringify(result.todayHoroscope)
          );
          console.log(
            "✅ Horoscope on today was loaded from DB:",
            result.todayHoroscope
          );
        } else {
          console.log("ℹ️ Horoscope on today was not found in server response");
        }

        showSuccess("Login successful! Updating interface...");

        // Close login modal and update interface
        setTimeout(() => {
          if (typeof closeLoginForm === "function") {
            closeLoginForm();
          }
          // Update interface for logged-in user
          updateAuthInterface();
          // Fill form with user data
          fillUserForm(result.user);
          // Switch horoscope form for logged-in user
          if (typeof switchHoroscopeForm === "function") switchHoroscopeForm();

          // Temporarily disable automatic horoscope display on login
          // Horoscope will be displayed only on explicit user request
          if (false && result.todayHoroscope) {
            console.log(
              "🎯 Trying to display horoscope:",
              result.todayHoroscope
            );
            const today = new Date().toISOString().split("T")[0];

            // Checking that horoscope is really for today
            const horoscopeDate =
              result.todayHoroscope.date || result.todayHoroscope.horoscop_date;
            if (horoscopeDate && horoscopeDate !== today) {
              console.log(
                "⚠️ Horoscope is not for today:",
                horoscopeDate,
                "vs",
                today
              );
              console.log("ℹ️ Pass displaying outdated horoscope");
              return;
            }

            const horoscopeInfo = {
              name: result.user.name,
              zodiac: result.user.zodiac,
              date: today,
            };
            console.log("🎯 Information for display:", horoscopeInfo);

            // Check if displayHoroscopeResult function exists
            if (typeof displayHoroscopeResult === "function") {
              displayHoroscopeResult(result.todayHoroscope, horoscopeInfo);
              console.log("✅ Horoscope for today was displayed");
            } else {
              console.error("❌ displayHoroscopeResult function not found");
            }
          } else {
            console.log(
              "ℹ️ todayHoroscope is missing from server response or automatic display is disabled"
            );
          }

          // Horoscope will be loaded only on explicit user request
          if (false && typeof loadUserHoroscopeForToday === "function") {
            loadUserHoroscopeForToday(result.user);
          } else {
            console.log(
              "ℹ️ Automatic horoscope loading is disabled - user must request horoscope manually"
            );
          }
        }, 1000);
      } else {
        logError("Authorization error:", result.message);
        showError(
          "loginGeneralError",
          result.message || "Invalid email or password"
        );
      }
    } catch (error) {
      logError("Network error during authorization:", error);
      showError("loginGeneralError", "Connection error");
    }
  });

  // Horoscope form handler
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      logInfo("Attempting to update profile...");
      clearProfileErrors();
      if (!validateProfileForm()) {
        logError("Profile form validation failed");
        return;
      }
      const name = document.getElementById("profileName").value.trim();
      const birthday = document.getElementById("profileBirthday").value;
      const noBirthday = document.getElementById("profileNoBirthday").checked;
      const zodiac = document.getElementById("profileZodiac").value;
      const password = document.getElementById("profilePassword").value;
      let formData = { name };
      if (noBirthday) {
        formData.birthday = null;
        formData.zodiac = zodiac;
      } else {
        formData.birthday = birthday || null;
        if (birthday && typeof getZodiacSignFromString === "function") {
          formData.zodiac = getZodiacSignFromString(birthday);
        } else {
          formData.zodiac = "";
        }
      }
      if (password) formData.password = password;
      try {
        const userData = localStorage.getItem("user");
        const user = JSON.parse(userData);
        const response = await fetch("/api/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, ...formData }),
        });
        const result = await response.json();
        if (result.success) {
          logSuccess("Profile updated successfully!");
          const updatedUser = { ...user, ...formData };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          updateAuthInterface();
          fillUserForm(updatedUser);
          const successMsg = document.getElementById("profileSuccessMessage");
          if (successMsg) {
            successMsg.textContent = "Profile updated successfully!";
            successMsg.style.display = "block";
          }
          setTimeout(() => {
            if (typeof closeProfileModal === "function") closeProfileModal();
          }, 2000);
        } else {
          logError("Profile update error:", result.message);
          showError(
            "profileGeneralError",
            result.message || "Profile update error"
          );
        }
      } catch (error) {
        logError("Network error during profile update:", error);
        showError("profileGeneralError", "Connection error");
      }
    });
  }
});

// Validation for login form
function validateLoginForm() {
  let isValid = true;

  // Email validation
  const email = document.getElementById("loginEmail").value.trim();
  if (!email || !isValidEmail(email)) {
    showError("loginEmail", "Input a valid email");
    isValid = false;
  }

  // Password validation
  const password = document.getElementById("loginPassword").value;
  if (!password) {
    showError("loginPassword", "Input your password");
    isValid = false;
  }

  return isValid;
}

// Validation for profile form
function validateProfileForm() {
  let isValid = true;

  // Name validation
  const name = document.getElementById("profileName").value.trim();
  if (!name) {
    showError("profileNameError", "Input your name");
    isValid = false;
  }

  // Birthday validation (optional)
  const birthday = document.getElementById("profileBirthday").value;
  if (birthday && !isValidBirthday(birthday)) {
    showError("profileBirthdayError", "Incorrect birthday");
    isValid = false;
  }

  // Password validation (if entered)
  const password = document.getElementById("profilePassword").value;
  const passwordConfirm = document.getElementById(
    "profilePasswordConfirm"
  ).value;

  if (password || passwordConfirm) {
    if (!password) {
      showError("profilePasswordError", "Input a new password");
      isValid = false;
    } else if (!isValidPassword(password)) {
      showError(
        "profilePasswordError",
        "Password must be at least 6 characters long"
      );
      isValid = false;
    } else if (password !== passwordConfirm) {
      showError("profilePasswordConfirmError", "Passwords do not match");
      isValid = false;
    }
  }

  return isValid;
}

// Check session only for interface update (does not fill the form)
function checkUserSessionForInterface() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userData = localStorage.getItem("user");

  if (isLoggedIn === "true" && userData) {
    try {
      const user = JSON.parse(userData);
      logInfo("Existing user session found:", user.name);
      updateAuthInterface();
      // Don't fill the form when the page loads!
    } catch (error) {
      logError("Error parsing user data:", error);
      // Clear corrupted data
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
    }
  }
}

// Check user session (fills the form - used during login)
function checkUserSession() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userData = localStorage.getItem("user");

  if (isLoggedIn === "true" && userData) {
    try {
      const user = JSON.parse(userData);
      logInfo("Existing user session found:", user.name);
      updateAuthInterface();
      fillUserForm(user);
    } catch (error) {
      logError("Error parsing user data:", error);
      // Clear corrupted data
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
    }
  }
}

// Update interface for logged-in user
function updateAuthInterface() {
  const userData = localStorage.getItem("user");
  if (!userData) {
    logInfo("No user data found to update interface");
    return;
  }

  try {
    const user = JSON.parse(userData);
    logInfo("Updating interface for user:", user.name);

    // Hide guest buttons
    const guestButtons = document.getElementById("guestButtons");
    if (guestButtons) {
      guestButtons.style.display = "none";
      logInfo("Guest buttons hidden");
    } else {
      logError("Element guestButtons not found");
    }

    // Show user buttons
    const userButtons = document.getElementById("userButtons");
    if (userButtons) {
      userButtons.style.display = "flex";
      logInfo("User buttons shown");

      // Update user name in header (keep as is)
      const userName = document.getElementById("userName");
      if (userName) {
        userName.textContent = `Hello, ${user.name}!`;
        logInfo("User name in header updated:", `Hello, ${user.name}!`);
      } else {
        logError("Element userName not found");
      }
    } else {
      logError("Element userButtons not found");
    }

    // Show welcome message above the form
    const userWelcome = document.getElementById("userWelcome");
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (userWelcome && welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${user.name}!`;
      userWelcome.style.display = "block";
      logInfo(
        "Welcome message shown above the form:",
        `Welcome, ${user.name}!`
      );
    } else {
      logError("Elements for welcome message above the form not found");
    }

    logSuccess("Interface updated for user:", user.name);
  } catch (error) {
    logError("Error updating interface:", error);
  }
}

// Fill user form with data
function fillUserForm(user) {
  // --- Main form (user_name, user_birthday, user_date) ---
  const userNameInput = document.getElementById("user_name");
  if (userNameInput) userNameInput.value = user.name || "";
  const userBirthdayInput = document.getElementById("user_birthday");
  if (userBirthdayInput) userBirthdayInput.value = user.birthday || "";
  const userDateInput = document.getElementById("user_date");
  if (userDateInput) {
    const today = new Date().toISOString().split("T")[0];
    userDateInput.value = today;
    logInfo("Horoscope date set to today:", today);
  }
  logInfo("Filling user form with data:", user);

  // Clear old cached horoscope from localStorage
  localStorage.removeItem("horoscopeResult");
  localStorage.removeItem("horoscopeResponse");
  localStorage.removeItem("info");

  // Clear all cache keys for non-logged-in users
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("horoscope_cache_")) {
      localStorage.removeItem(key);
    }
  });

  const horoscopeDiv = document.getElementById("horoscope");
  if (horoscopeDiv) {
    horoscopeDiv.innerHTML = "";
  }

  // Hide result block
  const resultForm = document.getElementById("result_form");
  if (resultForm) {
    resultForm.classList.add("form-hidden");
    resultForm.style.display = "none";
  }

  // === Filling profile modal window ===
  const profileNameInput = document.getElementById("profileName");
  if (profileNameInput) profileNameInput.value = user.name || "";
  const profileEmailInput = document.getElementById("profileEmail");
  if (profileEmailInput) profileEmailInput.value = user.email || "";
  const profileBirthdayInput = document.getElementById("profileBirthday");
  const profileNoBirthdayCheckbox =
    document.getElementById("profileNoBirthday");
  const profileZodiacSelect = document.getElementById("profileZodiac");
  if (
    profileBirthdayInput &&
    profileNoBirthdayCheckbox &&
    profileZodiacSelect
  ) {
    if (user.birthday) {
      profileBirthdayInput.value = user.birthday;
      profileNoBirthdayCheckbox.checked = false;
      profileBirthdayInput.disabled = false;
      profileZodiacSelect.disabled = true;
      if (typeof getZodiacSignFromString === "function") {
        profileZodiacSelect.value = getZodiacSignFromString(user.birthday);
      }
    } else {
      profileBirthdayInput.value = "";
      profileNoBirthdayCheckbox.checked = true;
      profileBirthdayInput.disabled = true;
      profileZodiacSelect.disabled = false;
      profileZodiacSelect.value = user.zodiac || "";
    }
    const profileZodiacGroup = document.getElementById("profileZodiacGroup");
    if (profileZodiacGroup) profileZodiacGroup.style.display = "block";
  }

  // Set today's date for horoscope (already done above)
}

// Logout function
function logout() {
  logInfo("Logging out...");

  // Save current form data to info before clearing
  const userNameField = document.getElementById("user_name");
  const userBirthdayField = document.getElementById("user_birthday");
  const userDateField = document.getElementById("user_date");

  if (userNameField && userBirthdayField && userDateField) {
    const currentFormData = {
      name: userNameField.value.trim(),
      birthday: userBirthdayField.value.trim(),
      date: userDateField.value.trim(),
    };

    // Save only if there is at least some data
    if (
      currentFormData.name ||
      currentFormData.birthday ||
      currentFormData.date
    ) {
      // Add zodiac sign if birthday is present
      if (currentFormData.birthday) {
        // Import getZodiacSignFromString function from app.js
        if (typeof getZodiacSignFromString === "function") {
          currentFormData.zodiac = getZodiacSignFromString(
            currentFormData.birthday
          );
        }
      }

      localStorage.setItem("info", JSON.stringify(currentFormData));
      console.log(
        "✅ Current form data saved to info on logout:",
        currentFormData
      );
    }
  }

  // Clear user data
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("horoscopeResponse");
  localStorage.removeItem("horoscopeResult");

  // Clear all cache keys for non-logged-in users
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("horoscope_cache_")) {
      localStorage.removeItem(key);
    }
  });

  // Clear horoscope content
  const horoscopeDiv = document.getElementById("horoscope");
  if (horoscopeDiv) {
    horoscopeDiv.innerHTML = "";
    console.log("✅ Horoscope content cleared on logout");
  }

  // Hide result block - this was also a problem!
  const resultForm = document.getElementById("result_form");
  if (resultForm) {
    resultForm.classList.add("form-hidden");
    resultForm.style.display = "none";
    console.log("✅ Result block hidden on logout");
  }

  // Show guest buttons
  const guestButtons = document.getElementById("guestButtons");
  if (guestButtons) {
    guestButtons.style.display = "flex";
  }

  // Hide user buttons
  const userButtons = document.getElementById("userButtons");
  if (userButtons) {
    userButtons.style.display = "none";
  }

  // Hide welcome message above the form
  const userWelcome = document.getElementById("userWelcome");
  if (userWelcome) {
    userWelcome.style.display = "none";
  }

  // Clear user form
  clearUserForm();

  // Switch horoscope form for guest
  if (typeof switchHoroscopeForm === "function") switchHoroscopeForm();

  logSuccess("Logout successful");
}

// Clear user form
function clearUserForm() {
  const userNameInput = document.getElementById("user_name");
  const userBirthdayInput = document.getElementById("user_birthday");
  const userDateInput = document.getElementById("user_date");

  if (userNameInput) userNameInput.value = "";
  if (userBirthdayInput) userBirthdayInput.value = "";
  if (userDateInput) userDateInput.value = "";
}

// Function to open profile
function openProfile() {
  const userData = localStorage.getItem("user");
  if (!userData) {
    showError("profileGeneralError", "User not logged in");
    return;
  }

  try {
    const user = JSON.parse(userData);

    // Fill profile form with user data
    fillProfileForm(user);

    // Show profile modal
    if (typeof showProfileModal === "function") {
      showProfileModal();
    } else {
      logError("Function showProfileModal not found");
    }
  } catch (error) {
    logError("Error reading user data:", error);
    showError("profileGeneralError", "Error loading profile");
  }
}

// Function to fill profile form
function fillProfileForm(user) {
  // Fill name
  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.value = user.name || "";
  }

  // Fill email (read-only)
  const profileEmail = document.getElementById("profileEmail");
  if (profileEmail) {
    profileEmail.value = user.email || "";
  }

  // Fill birthday, no birthday checkbox, and zodiac
  const profileBirthday = document.getElementById("profileBirthday");
  const profileNoBirthdayCheckbox =
    document.getElementById("profileNoBirthday");
  const profileZodiac = document.getElementById("profileZodiac");
  const profileZodiacGroup = document.getElementById("profileZodiacGroup");
  if (profileBirthday && profileNoBirthdayCheckbox && profileZodiac) {
    if (user.birthday) {
      profileBirthday.value = user.birthday;
      profileNoBirthdayCheckbox.checked = false;
      profileBirthday.disabled = false;
      profileZodiac.disabled = true;
      if (typeof getZodiacSignFromString === "function") {
        profileZodiac.value = getZodiacSignFromString(user.birthday);
      }
      if (profileZodiacGroup) profileZodiacGroup.style.display = "block";
    } else if (user.zodiac) {
      // No birthday, but has zodiac
      profileBirthday.value = "";
      profileNoBirthdayCheckbox.checked = true;
      profileBirthday.disabled = true;
      profileZodiac.disabled = false;
      profileZodiac.value = user.zodiac;
      if (profileZodiacGroup) profileZodiacGroup.style.display = "block";
    } else {
      // No birthday, no zodiac
      profileBirthday.value = "";
      profileNoBirthdayCheckbox.checked = false;
      profileBirthday.disabled = false;
      profileZodiac.disabled = true;
      if (profileZodiacGroup) profileZodiacGroup.style.display = "block";
    }
  }

  // Clear password fields
  const profilePassword = document.getElementById("profilePassword");
  const profilePasswordConfirm = document.getElementById(
    "profilePasswordConfirm"
  );
  if (profilePassword) profilePassword.value = "";
  if (profilePasswordConfirm) profilePasswordConfirm.value = "";

  // Clear error messages
  clearProfileErrors();
}

// Function to clear errors in profile form
function clearProfileErrors() {
  const errorElements = document.querySelectorAll(
    "#profileModal .error-message"
  );
  errorElements.forEach((element) => {
    element.style.display = "none";
    element.textContent = "";
  });

  const successElements = document.querySelectorAll(
    "#profileModal .success-message"
  );
  successElements.forEach((element) => {
    element.style.display = "none";
    element.textContent = "";
  });
}

// Information box functionality

function closeInfoBox() {
  document.getElementById("infoBox").style.display = "none";
  // Save the mark that the user closed the window
  localStorage.setItem("infoBoxClosed", "true");
}

document.addEventListener("DOMContentLoaded", function () {
  // Check if the user closed the window earlier
  const wasClosed = localStorage.getItem("infoBoxClosed");
  if (!wasClosed) {
    document.getElementById("infoBox").style.display = "block";
  }
});
//
