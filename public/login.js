// login.js - Обработка авторизации (использует функции из client-utils.js)
document.addEventListener("DOMContentLoaded", function () {
  // Только проверяем авторизацию для обновления интерфейса,
  // но НЕ заполняем форму при загрузке страницы
  checkUserSessionForInterface();

  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    logInfo("Форма входа не найдена");
    return;
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    logInfo("Попытка входа в систему...");

    // Очищаем предыдущие ошибки
    clearErrors();

    // Валидация
    if (!validateLoginForm()) {
      logError("Валидация формы входа не пройдена");
      return;
    }

    const formData = {
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value,
    };

    logInfo("Данные для входа:", {
      email: formData.email,
      password: "***скрыт***",
    });

    try {
      logInfo("Отправляем запрос авторизации...");
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      logInfo("Получен ответ сервера:", response.status);
      const result = await response.json();
      logInfo("Результат авторизации:", result);

      if (result.success) {
        logSuccess("Авторизация успешна!");
        logInfo("Данные пользователя с сервера:", result.user);

        // Сохраняем информацию о пользователе в localStorage
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("isLoggedIn", "true");

        showSuccess("Вход выполнен успешно! Обновляем интерфейс...");

        // Закрываем модальное окно входа и обновляем интерфейс
        setTimeout(() => {
          if (typeof closeLoginForm === "function") {
            closeLoginForm();
          }
          // Обновляем интерфейс для залогиненного пользователя
          updateAuthInterface();
          // Заполняем форму данными пользователя
          fillUserForm(result.user);
          // Загружаем гороскоп пользователя на сегодня (если функция доступна)
          if (typeof loadUserHoroscopeForToday === "function") {
            loadUserHoroscopeForToday(result.user);
          }
        }, 1000);
      } else {
        logError("Ошибка авторизации:", result.message);
        showError(
          "loginGeneralError",
          result.message || "Неверный email или пароль"
        );
      }
    } catch (error) {
      logError("Ошибка сети при авторизации:", error);
      showError("loginGeneralError", "Ошибка соединения с сервером");
    }
  });

  // Обработчик формы профиля
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      logInfo("Попытка обновления профиля...");

      // Очищаем предыдущие ошибки
      clearProfileErrors();

      // Валидация
      if (!validateProfileForm()) {
        logError("Валидация формы профиля не пройдена");
        return;
      }

      const formData = {
        name: document.getElementById("profileName").value.trim(),
        birthday: document.getElementById("profileBirthday").value || null,
      };

      const password = document.getElementById("profilePassword").value;
      if (password) {
        formData.password = password;
      }

      try {
        const userData = localStorage.getItem("user");
        const user = JSON.parse(userData);

        const response = await fetch("/api/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            ...formData,
          }),
        });

        const result = await response.json();

        if (result.success) {
          logSuccess("Профиль обновлен успешно!");

          // Обновляем данные пользователя в localStorage
          const updatedUser = { ...user, ...formData };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          // Обновляем интерфейс
          updateAuthInterface();
          fillUserForm(updatedUser);

          // Показываем успешное сообщение
          const successMsg = document.getElementById("profileSuccessMessage");
          if (successMsg) {
            successMsg.textContent = "Профиль успешно обновлен!";
            successMsg.style.display = "block";
          }

          // Закрываем модальное окно через 2 секунды
          setTimeout(() => {
            if (typeof closeProfileModal === "function") {
              closeProfileModal();
            }
          }, 2000);
        } else {
          logError("Ошибка обновления профиля:", result.message);
          showError(
            "profileGeneralError",
            result.message || "Ошибка обновления профиля"
          );
        }
      } catch (error) {
        logError("Ошибка сети при обновлении профиля:", error);
        showError("profileGeneralError", "Ошибка соединения с сервером");
      }
    });
  }
});

// Валидация формы входа
function validateLoginForm() {
  let isValid = true;

  // Проверка email
  const email = document.getElementById("loginEmail").value.trim();
  if (!email || !isValidEmail(email)) {
    showError("loginEmail", "Введите корректный email");
    isValid = false;
  }

  // Проверка пароля
  const password = document.getElementById("loginPassword").value;
  if (!password) {
    showError("loginPassword", "Введите пароль");
    isValid = false;
  }

  return isValid;
}

// Валидация формы профиля
function validateProfileForm() {
  let isValid = true;

  // Проверка имени
  const name = document.getElementById("profileName").value.trim();
  if (!name) {
    showError("profileNameError", "Введите имя");
    isValid = false;
  }

  // Проверка дня рождения (опционально)
  const birthday = document.getElementById("profileBirthday").value;
  if (birthday && !isValidBirthday(birthday)) {
    showError("profileBirthdayError", "Некорректная дата рождения");
    isValid = false;
  }

  // Проверка пароля (если введен)
  const password = document.getElementById("profilePassword").value;
  const passwordConfirm = document.getElementById(
    "profilePasswordConfirm"
  ).value;

  if (password || passwordConfirm) {
    if (!password) {
      showError("profilePasswordError", "Введите новый пароль");
      isValid = false;
    } else if (!isValidPassword(password)) {
      showError(
        "profilePasswordError",
        "Пароль должен содержать минимум 6 символов"
      );
      isValid = false;
    } else if (password !== passwordConfirm) {
      showError("profilePasswordConfirmError", "Пароли не совпадают");
      isValid = false;
    }
  }

  return isValid;
}

// Проверка сессии только для обновления интерфейса (не заполняет форму)
function checkUserSessionForInterface() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userData = localStorage.getItem("user");

  if (isLoggedIn === "true" && userData) {
    try {
      const user = JSON.parse(userData);
      logInfo("Найдена существующая сессия пользователя:", user.name);
      updateAuthInterface();
      // НЕ заполняем форму при загрузке страницы!
    } catch (error) {
      logError("Ошибка парсинга данных пользователя:", error);
      // Очищаем поврежденные данные
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
    }
  }
}

// Проверка существующей сессии пользователя (заполняет форму - используется при логине)
function checkUserSession() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userData = localStorage.getItem("user");

  if (isLoggedIn === "true" && userData) {
    try {
      const user = JSON.parse(userData);
      logInfo("Найдена существующая сессия пользователя:", user.name);
      updateAuthInterface();
      fillUserForm(user);
    } catch (error) {
      logError("Ошибка парсинга данных пользователя:", error);
      // Очищаем поврежденные данные
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
    }
  }
}

// Обновление интерфейса для залогиненного пользователя
function updateAuthInterface() {
  const userData = localStorage.getItem("user");
  if (!userData) {
    logInfo("Нет данных пользователя для обновления интерфейса");
    return;
  }

  try {
    const user = JSON.parse(userData);
    logInfo("Обновляем интерфейс для пользователя:", user.name);

    // Скрываем кнопки для гостей
    const guestButtons = document.getElementById("guestButtons");
    if (guestButtons) {
      guestButtons.style.display = "none";
      logInfo("Кнопки гостя скрыты");
    } else {
      logError("Элемент guestButtons не найден");
    }

    // Показываем кнопки для пользователей
    const userButtons = document.getElementById("userButtons");
    if (userButtons) {
      userButtons.style.display = "flex";
      logInfo("Кнопки пользователя показаны");

      // Обновляем имя пользователя в заголовке (оставляем как есть)
      const userName = document.getElementById("userName");
      if (userName) {
        userName.textContent = `Hello, ${user.name}!`;
        logInfo(
          "Имя пользователя в заголовке обновлено:",
          `Hello, ${user.name}!`
        );
      } else {
        logError("Элемент userName не найден");
      }
    } else {
      logError("Элемент userButtons не найден");
    }

    // Показываем большое приветствие над формой
    const userWelcome = document.getElementById("userWelcome");
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (userWelcome && welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${user.name}!`;
      userWelcome.style.display = "block";
      logInfo("Приветствие над формой показано:", `Welcome, ${user.name}!`);
    } else {
      logError("Элементы приветствия над формой не найдены");
    }

    logSuccess("Интерфейс обновлен для пользователя:", user.name);
  } catch (error) {
    logError("Ошибка обновления интерфейса:", error);
  }
}

// Заполнение формы данными пользователя
function fillUserForm(user) {
  logInfo("Заполняем форму данными пользователя:", user);

  // Очищаем старый кэшированный гороскоп из localStorage
  localStorage.removeItem("horoscopeResult");
  const horoscopeDiv = document.getElementById("horoscope");
  if (horoscopeDiv) {
    horoscopeDiv.innerHTML = "";
  }

  // Заполняем имя
  const userNameInput = document.getElementById("user_name");
  if (userNameInput) {
    userNameInput.value = user.name || "";
    logInfo("Имя заполнено:", user.name);
  } else {
    logError("Элемент user_name не найден");
  }

  // Заполняем дату рождения
  const userBirthdayInput = document.getElementById("user_birthday");
  if (userBirthdayInput) {
    if (user.birthday) {
      // Дата уже приходит в правильном формате YYYY-MM-DD с сервера
      userBirthdayInput.value = user.birthday;
      logInfo("Дата рождения заполнена:", user.birthday);
    } else {
      logInfo("Дата рождения не указана в данных пользователя");
    }
  } else {
    logError("Элемент user_birthday не найден");
  }

  // Устанавливаем сегодняшнюю дату для гороскопа
  const userDateInput = document.getElementById("user_date");
  if (userDateInput) {
    const today = new Date().toISOString().split("T")[0];
    userDateInput.value = today;
    logInfo("Дата гороскопа установлена на сегодня:", today);
  } else {
    logError("Элемент user_date не найден");
  }
}

// Функция выхода из системы
function logout() {
  logInfo("Выполняем выход из системы...");

  // Очищаем localStorage
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");

  // Показываем кнопки для гостей
  const guestButtons = document.getElementById("guestButtons");
  if (guestButtons) {
    guestButtons.style.display = "flex";
  }

  // Скрываем кнопки для пользователей
  const userButtons = document.getElementById("userButtons");
  if (userButtons) {
    userButtons.style.display = "none";
  }

  // Скрываем приветствие над формой
  const userWelcome = document.getElementById("userWelcome");
  if (userWelcome) {
    userWelcome.style.display = "none";
  }

  // Очищаем форму
  clearUserForm();

  logSuccess("Выход выполнен успешно");
}

// Очистка формы пользователя
function clearUserForm() {
  const userNameInput = document.getElementById("user_name");
  const userBirthdayInput = document.getElementById("user_birthday");
  const userDateInput = document.getElementById("user_date");

  if (userNameInput) userNameInput.value = "";
  if (userBirthdayInput) userBirthdayInput.value = "";
  if (userDateInput) userDateInput.value = "";
}

// Функция открытия профиля
function openProfile() {
  const userData = localStorage.getItem("user");
  if (!userData) {
    showError("profileGeneralError", "Пользователь не авторизован");
    return;
  }

  try {
    const user = JSON.parse(userData);

    // Заполняем форму профиля данными пользователя
    fillProfileForm(user);

    // Показываем модальное окно профиля
    if (typeof showProfileModal === "function") {
      showProfileModal();
    } else {
      logError("Функция showProfileModal не найдена");
    }
  } catch (error) {
    logError("Ошибка чтения данных пользователя:", error);
    showError("profileGeneralError", "Ошибка загрузки профиля");
  }
}

// Функция заполнения формы профиля
function fillProfileForm(user) {
  // Заполняем имя
  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.value = user.name || "";
  }

  // Заполняем email (только для отображения, поле заблокировано)
  const profileEmail = document.getElementById("profileEmail");
  if (profileEmail) {
    profileEmail.value = user.email || "";
  }

  // Заполняем дату рождения
  const profileBirthday = document.getElementById("profileBirthday");
  if (profileBirthday && user.birthday) {
    // Дата уже приходит в правильном формате YYYY-MM-DD с сервера
    profileBirthday.value = user.birthday;
  }

  // Очищаем поля паролей
  const profilePassword = document.getElementById("profilePassword");
  const profilePasswordConfirm = document.getElementById(
    "profilePasswordConfirm"
  );
  if (profilePassword) profilePassword.value = "";
  if (profilePasswordConfirm) profilePasswordConfirm.value = "";

  // Очищаем сообщения об ошибках
  clearProfileErrors();
}

// Функция очистки ошибок в форме профиля
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
