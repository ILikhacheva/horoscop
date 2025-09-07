// register.js
/*document.addEventListener("DOMContentLoaded", function () {
  // Функция для заполнения select знаков зодиака
  if (typeof fillZodiacSelect === "function") {
    fillZodiacSelect("zodiac"); // на всякий случай при инициализации
  }
  const registerForm = document.getElementById("registerForm");

  // Автоопределение знака зодиака по дате рождения
  document.getElementById("birthday").addEventListener("change", function () {
    const zodiac = getZodiacSignFromString(this.value);
    if (zodiac) {
      document.getElementById("zodiac").value = zodiac;
    }
  });

  // Обработчик выбора знака зодиака вручную
  document.getElementById("zodiac").addEventListener("change", function () {
    // Просто для отладки можно добавить лог
    // console.log('Выбран знак зодиака:', this.value);
    // Значение select всегда будет актуальным через .value
  });

  const birthdayInput = document.getElementById("birthday");
  const zodiacInput = document.getElementById("zodiac");
  const noBirthdayCheckbox = document.getElementById("noBirthday");
  if (birthdayInput) {
    const today = new Date().toISOString().split("T")[0];
    birthdayInput.setAttribute("max", today);
  }

  // Динамическое управление required для birthday/zodiac
  if (noBirthdayCheckbox && birthdayInput && zodiacInput) {
    let lastNoBirthdayState = noBirthdayCheckbox.checked;
    function updateRequiredFields() {
      const nowNoBirthday = noBirthdayCheckbox.checked;
      if (nowNoBirthday) {
        birthdayInput.removeAttribute("required");
        zodiacInput.setAttribute("required", "required");
        zodiacInput.parentElement.style.display = "block";
        if (typeof fillZodiacSelect === "function") fillZodiacSelect("zodiac");
        // Сбросить значение только если только что включили чекбокс
        if (!lastNoBirthdayState) {
          zodiacInput.value = "";
        }
        zodiacInput.focus();
      } else {
        birthdayInput.setAttribute("required", "required");
        zodiacInput.removeAttribute("required");
        zodiacInput.value = "";
        zodiacInput.parentElement.style.display = "none";
      }
      lastNoBirthdayState = nowNoBirthday;
    }
    noBirthdayCheckbox.addEventListener("change", updateRequiredFields);
    updateRequiredFields();
  }

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Очищаем предыдущие ошибки
    clearErrors();

    // Валидация
    if (!validateForm()) {
      return;
    }

    const noBirthday = document.getElementById("noBirthday")?.checked;
    const birthdayValue = document.getElementById("birthday").value;
    const zodiacValue = document.getElementById("zodiac").value;
    const formData = {
      email: document.getElementById("registerEmail").value.trim(),
      name: document.getElementById("registerName").value.trim(),
      birthday: noBirthday ? "" : birthdayValue,
      zodiac:
        zodiacValue ||
        (birthdayValue ? getZodiacSignFromString(birthdayValue) : ""),
      password: document.getElementById("registerPassword").value,
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

  const noBirthday = document.getElementById("noBirthday")?.checked;
  const birthdayInput = document.getElementById("birthday");
  const birthday = birthdayInput ? birthdayInput.value : "";
  const zodiac = document.getElementById("zodiac").value;
  const email = document.getElementById("registerEmail").value.trim();
  const name = document.getElementById("registerName").value.trim();
  const password = document.getElementById("registerPassword").value;
  // В форме нет поля подтверждения пароля
  // const confirmPassword = document.getElementById("registerConfirmPassword")?.value;

  // Проверка даты рождения (не в будущем)
  if (!noBirthday && birthdayInput) {
    const today = new Date().toISOString().split("T")[0];
    if (birthday > today) {
      document.getElementById("registerGeneralError").textContent =
        "Дата рождения не может быть в будущем.";
      document.getElementById("registerGeneralError").style.display = "block";
      return false;
    }
  }

  // Проверка email
  if (!email || !isValidEmail(email)) {
    showError("emailError", "Please enter a valid email");
    isValid = false;
  }

  // Проверка имени
  if (!name || name.length < 2) {
    showError("nameError", "Name must be at least 2 characters long");
    isValid = false;
  }

  // Проверка даты рождения/знака зодиака
  if (noBirthday) {
    // Если не хотим указывать дату рождения, zodiac обязателен
    if (!zodiac) {
      showError("zodiacError", "Please select your zodiac sign");
      isValid = false;
    }
  } else {
    // Если дата рождения обязательна
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
  }

  // Проверка пароля
  if (!password || password.length < 6) {
    showError("passwordError", "Password must be at least 6 characters long");
    isValid = false;
  }

  // Проверка повтора пароля
  const confirmPassword = document.getElementById(
    "registerConfirmPassword"
  )?.value;
  if (password !== confirmPassword) {
    showError("confirmPasswordError", "Passwords do not match");
    isValid = false;
  }

  return isValid;
}

function cancelRegistration() {
  window.location.href = "/";
}
*/
