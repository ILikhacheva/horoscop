// modal-register.js - Code for the registration modal form in index.html

document.addEventListener("DOMContentLoaded", function () {
  const registerModal = document.getElementById("registerModal");
  const registerForm = document.getElementById("registerForm");

  if (!registerForm) {
    logInfo("Registration form not found in index.html");
    return;
  }

  logSuccess("Registration modal form initialized");

  // Auto-detect zodiac sign by birth date
  const birthdayInput = document.getElementById("birthday");
  const zodiacSelect = document.getElementById("zodiac");
  const noBirthdayCheckbox = document.getElementById("noBirthday");
  const zodiacGroup = document.getElementById("zodiacGroup");
  const birthdayGroup = document.getElementById("birthdayGroup");

  if (birthdayInput) {
    birthdayInput.addEventListener("change", function () {
      const birthday = new Date(this.value);
      const zodiac = getZodiacSign(birthday);
      if (zodiac && zodiacSelect) {
        zodiacSelect.value = zodiac;
      }
    });

    // Limit date selection (not in the future)
    const today = new Date().toISOString().split("T")[0];
    birthdayInput.setAttribute("max", today);
  }

  // Handle "I don't want to specify my birthday" checkbox
  if (noBirthdayCheckbox) {
    noBirthdayCheckbox.addEventListener("change", function () {
      if (this.checked) {
        birthdayGroup.style.display = "none";
        zodiacGroup.style.display = "block";
        birthdayInput.value = "";
        birthdayInput.removeAttribute("required");
        zodiacSelect.setAttribute("required", "required");
      } else {
        birthdayGroup.style.display = "block";
        zodiacGroup.style.display = "none";
        zodiacSelect.value = "";
        zodiacSelect.removeAttribute("required");
      }
    });
  }

  // Handle form submission
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    logInfo("Sending registration form...");
    // Clear previous errors
    clearModalErrors();

    // Validation
    if (!validateModalForm()) {
      logError("Validation failed");
      return;
    }

    const formData = {
      email: document.getElementById("registerEmail").value.trim(),
      name: document.getElementById("registerName").value.trim(),
      birthday: document.getElementById("birthday").value || null,
      zodiac: document.getElementById("birthday").value
        ? getZodiacSign(new Date(document.getElementById("birthday").value))
        : document.getElementById("zodiac").value,
      password: document.getElementById("registerPassword").value,
    };

    //    console.log("Zodiac", document.getElementById("zodiac").value);

    logInfo("Registration form data:", {
      ...formData,
      password: "***hidden***",
    });

    try {
      logInfo("Sending request to server...");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      logInfo("Received server response:", response.status);
      const result = await response.json();
      logInfo("Result:", result);

      if (result.success) {
        logSuccess("Registration successful!");
        showModalSuccess("Success! Now you can log in.");

        // Save user data and close modal
        setTimeout(() => {
          closeRegisterModal();
          // Automatically open login form
          showLoginForm();
        }, 2000);
      } else {
        logError("Registration error:", result.message);
        showModalError(
          "registerGeneralError",
          result.message || "Registration error"
        );
      }
    } catch (error) {
      logError("Network error:", error);
      showModalError("registerGeneralError", "Connection error");
    }
  });
});

// Validation functions for modal form
function validateModalForm() {
  let isValid = true;

  // Email validation
  const email = document.getElementById("registerEmail").value.trim();
  if (!email || !isValidEmail(email)) {
    showModalError("registerEmail", "Input valid email");
    isValid = false;
  }

  // Name validation
  const name = document.getElementById("registerName").value.trim();
  if (!name || name.length < 2) {
    showModalError("registerName", "Name must be at least 2 characters long");
    isValid = false;
  }

  // Password validation
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword"
  )?.value;
  if (!password || password.length < 6) {
    showModalError(
      "registerPassword",
      "Password must be at least 6 characters long"
    );
    isValid = false;
  }
  // Confirm password validation
  if (confirmPassword !== undefined && password !== confirmPassword) {
    showModalError("confirmPasswordError", "Passwords do not match");
    isValid = false;
  }

  // Zodiac sign validation
  const noBirthday = document.getElementById("noBirthday").checked;
  const birthday = document.getElementById("birthday").value;
  const zodiac = document.getElementById("zodiac").value;

  if (noBirthday && !zodiac) {
    showModalError("zodiac", "Choose your zodiac sign");
    isValid = false;
  }

  if (!noBirthday && !birthday) {
    showModalError(
      "birthday",
      "Input your birth date or select 'I don't want to specify'"
    );
    isValid = false;
  }

  // Birth date validation (not in the future)
  if (birthday) {
    const today = new Date().toISOString().split("T")[0];
    if (birthday > today) {
      showModalError("birthday", "Birth date cannot be in the future");
      isValid = false;
    }
  }

  return isValid;
}

// Functions for handling errors in the modal form (use common functions from client-utils.js)
function showModalError(fieldId, message) {
  showError(fieldId, message);
}

function showModalSuccess(message) {
  const successElement = document.getElementById("registerSuccessMessage");
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = "block";
  }
}

function clearModalErrors() {
  clearErrors();
}
