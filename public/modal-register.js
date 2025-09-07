// modal-register.js - Код для модальной формы регистрации в index.html
// Использует функции из client-utils.js

document.addEventListener("DOMContentLoaded", function () {
  const registerModal = document.getElementById("registerModal");
  const registerForm = document.getElementById("registerForm");

  if (!registerForm) {
    logInfo("Форма регистрации не найдена в index.html");
    return;
  }

  logSuccess("Модальная форма регистрации инициализирована");

  // Автоопределение знака зодиака по дате рождения
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

    // Ограничиваем выбор даты (не в будущем)
    const today = new Date().toISOString().split("T")[0];
    birthdayInput.setAttribute("max", today);
  }

  // Обработка чекбокса "Не хочу указывать день рождения"
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

  // Обработка отправки формы
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    logInfo("Отправка формы регистрации...");

    // Очищаем предыдущие ошибки
    clearModalErrors();

    // Валидация
    if (!validateModalForm()) {
      logError("Валидация не пройдена");
      return;
    }

    const formData = {
      email: document.getElementById("registerEmail").value.trim(),
      name: document.getElementById("registerName").value.trim(),
      birthday: document.getElementById("birthday").value || null,
      zodiac:
        document.getElementById("zodiac").value ||
        document.getElementById("birthday").value
          ? getZodiacSign(new Date(document.getElementById("birthday").value))
          : "",
      password: document.getElementById("registerPassword").value,
    };

    logInfo("Данные формы для регистрации:", {
      ...formData,
      password: "***скрыт***",
    });

    try {
      logInfo("Отправляем запрос на сервер...");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      logInfo("Получен ответ от сервера:", response.status);
      const result = await response.json();
      logInfo("Результат:", result);

      if (result.success) {
        logSuccess("Регистрация успешна!");
        showModalSuccess(
          "Регистрация прошла успешно! Теперь вы можете войти в систему."
        );

        // Сохраняем данные пользователя и закрываем модальное окно
        setTimeout(() => {
          closeRegisterModal();
          // Автоматически открываем форму входа
          showLoginForm();
        }, 2000);
      } else {
        logError("Ошибка регистрации:", result.message);
        showModalError(
          "registerGeneralError",
          result.message || "Ошибка регистрации"
        );
      }
    } catch (error) {
      logError("Ошибка сети:", error);
      showModalError("registerGeneralError", "Ошибка соединения с сервером");
    }
  });
});

// Функции валидации для модальной формы
function validateModalForm() {
  let isValid = true;

  // Проверка email
  const email = document.getElementById("registerEmail").value.trim();
  if (!email || !isValidEmail(email)) {
    showModalError("registerEmail", "Введите корректный email");
    isValid = false;
  }

  // Проверка имени
  const name = document.getElementById("registerName").value.trim();
  if (!name || name.length < 2) {
    showModalError("registerName", "Имя должно содержать минимум 2 символа");
    isValid = false;
  }

  // Проверка пароля
  const password = document.getElementById("registerPassword").value;
  if (!password || password.length < 6) {
    showModalError(
      "registerPassword",
      "Пароль должен содержать минимум 6 символов"
    );
    isValid = false;
  }

  // Проверка знака зодиака
  const noBirthday = document.getElementById("noBirthday").checked;
  const birthday = document.getElementById("birthday").value;
  const zodiac = document.getElementById("zodiac").value;

  if (noBirthday && !zodiac) {
    showModalError("zodiac", "Выберите знак зодиака");
    isValid = false;
  }

  if (!noBirthday && !birthday) {
    showModalError(
      "birthday",
      "Укажите дату рождения или выберите 'Не хочу указывать'"
    );
    isValid = false;
  }

  // Проверка даты рождения (не в будущем)
  if (birthday) {
    const today = new Date().toISOString().split("T")[0];
    if (birthday > today) {
      showModalError("birthday", "Дата рождения не может быть в будущем");
      isValid = false;
    }
  }

  return isValid;
}

// Функции для работы с ошибками в модальной форме (используют общие функции из client-utils.js)
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
