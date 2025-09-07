// register.js
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");

  // Автоопределение знака зодиака по дате рождения
  document.getElementById("birthday").addEventListener("change", function () {
    const zodiac = getZodiacSignFromString(this.value);
    if (zodiac) {
      document.getElementById("zodiac").value = zodiac;
    }
  });

  const birthdayInput = document.getElementById("birthday");
  if (birthdayInput) {
    const today = new Date().toISOString().split("T")[0];
    birthdayInput.setAttribute("max", today);
  }

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Очищаем предыдущие ошибки
    clearErrors();

    // Валидация
    if (!validateForm()) {
      return;
    }

    const formData = {
      email: document.getElementById("email").value.trim(),
      name: document.getElementById("name").value.trim(),
      birthday: document.getElementById("birthday").value,
      zodiac: document.getElementById("zodiac").value,
      password: document.getElementById("password").value,
    };
    console.log("📝 Данные формы для регистрации:", formData);

    try {
      console.log("🚀 Отправляем запрос на сервер...");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("📡 Получен ответ от сервера:", response.status);
      const result = await response.json();
      console.log("📄 Результат:", result);

      if (result.success) {
        console.log("✅ Регистрация успешна!");
        showSuccess(
          "Регистрация прошла успешно! Перенаправляем на главную страницу..."
        );
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        console.log("❌ Ошибка регистрации:", result.message);
        showError("generalError", result.message || "Ошибка регистрации");
      }
    } catch (error) {
      console.error("❌ Ошибка сети:", error);
      showError("generalError", "Ошибка соединения с сервером");
    }
  });
});

function validateForm() {
  let isValid = true;

  // Проверка даты рождения (не в будущем)
  const birthdayInput = document.getElementById("birthday");
  if (birthdayInput) {
    const birthday = birthdayInput.value;
    const today = new Date().toISOString().split("T")[0];
    if (birthday > today) {
      document.getElementById("registerGeneralError").textContent =
        "Дата рождения не может быть в будущем.";
      document.getElementById("registerGeneralError").style.display = "block";
      return false;
    }
  }

  // Проверка email
  const email = document.getElementById("email").value.trim();
  if (!email || !isValidEmail(email)) {
    showError("emailError", "Please enter a valid email");
    isValid = false;
  }

  // Проверка имени
  const name = document.getElementById("name").value.trim();
  if (!name || name.length < 2) {
    showError("nameError", "Name must be at least 2 characters long");
    isValid = false;
  }

  // Проверка даты рождения
  const birthday = document.getElementById("birthday").value;
  if (!birthday) {
    showError("birthdayError", "Please select your birth date");
    isValid = false;
  } else {
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 1 || age > 120) {
      showError("birthdayError", "Invalid birth date");
      isValid = false;
    }
  }

  // Проверка знака зодиака
  const zodiac = document.getElementById("zodiac").value;
  if (!zodiac) {
    showError("zodiacError", "Please select your zodiac sign");
    isValid = false;
  }

  // Проверка пароля
  const password = document.getElementById("password").value;
  if (!password || password.length < 6) {
    showError("passwordError", "Password must be at least 6 characters long");
    isValid = false;
  }

  // Проверка повтора пароля
  const confirmPassword = document.getElementById("confirmPassword").value;
  if (password !== confirmPassword) {
    showError("confirmPasswordError", "Passwords do not match");
    isValid = false;
  }

  return isValid;
}

function cancelRegistration() {
  window.location.href = "/";
}
