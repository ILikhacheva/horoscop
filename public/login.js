// login.js - Обработка авторизации (использует функции из client-utils.js)
document.addEventListener("DOMContentLoaded", function () {
  // === Логика для модального окна профиля ===
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
      profileNoBirthdayCheckbox.checked = false;
      profileBirthdayInput.disabled = false;
      profileZodiacSelect.disabled = true;
      profileZodiacGroup.style.display = "block";
      // Автоматически вычисляем знак зодиака
      if (typeof getZodiacSignFromString === "function") {
        profileZodiacSelect.value = getZodiacSignFromString(
          profileBirthdayInput.value
        );
      }
    } else if (profileNoBirthdayCheckbox.checked) {
      profileBirthdayInput.value = "";
      profileBirthdayInput.disabled = true;
      profileZodiacSelect.disabled = false;
      profileZodiacGroup.style.display = "block";
    } else {
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
        // Если есть дата рождения, вычислить знак зодиака
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
  // При открытии профиля и заполнении формы тоже вызывать
  updateProfileFieldsByState();
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

    logInfo("Data for login:", {
      email: formData.email,
      password: "***скрыт***",
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

        // Сохраняем информацию о пользователе в localStorage
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("isLoggedIn", "true");

        // Очищаем предыдущий гороскоп при логине
        const horoscopeDiv = document.getElementById("horoscope");
        if (horoscopeDiv) {
          horoscopeDiv.innerHTML = "";
        }
        const resultForm = document.getElementById("result_form");
        if (resultForm) {
          resultForm.classList.add("form-hidden");
        }

        // Сохраняем гороскоп на сегодня, если он есть
        if (result.todayHoroscope) {
          localStorage.setItem(
            "horoscopeResponse",
            JSON.stringify(result.todayHoroscope)
          );
          console.log(
            "✅ Гороскоп на сегодня загружен из БД:",
            result.todayHoroscope
          );
        } else {
          console.log("ℹ️ Гороскоп на сегодня не найден в ответе сервера");
        }

        showSuccess("Login successful! Updating interface...");

        // Закрываем модальное окно входа и обновляем интерфейс
        setTimeout(() => {
          if (typeof closeLoginForm === "function") {
            closeLoginForm();
          }
          // Обновляем интерфейс для залогиненного пользователя
          updateAuthInterface();
          // Заполняем форму данными пользователя
          fillUserForm(result.user);

          // Временно отключаем автоматическое отображение гороскопа при входе
          // Гороскоп будет отображаться только по явному запросу пользователя
          if (false && result.todayHoroscope) {
            console.log(
              "🎯 Пытаемся отобразить гороскоп:",
              result.todayHoroscope
            );
            const today = new Date().toISOString().split("T")[0];

            // Проверяем, что гороскоп действительно на сегодня
            const horoscopeDate =
              result.todayHoroscope.date || result.todayHoroscope.horoscop_date;
            if (horoscopeDate && horoscopeDate !== today) {
              console.log(
                "⚠️ Гороскоп не на сегодняшнюю дату:",
                horoscopeDate,
                "vs",
                today
              );
              console.log("ℹ️ Пропускаем отображение устаревшего гороскопа");
              return;
            }

            const horoscopeInfo = {
              name: result.user.name,
              zodiac: result.user.zodiac,
              date: today,
            };
            console.log("🎯 Информация для отображения:", horoscopeInfo);

            // Проверяем, есть ли функция displayHoroscopeResult
            if (typeof displayHoroscopeResult === "function") {
              displayHoroscopeResult(result.todayHoroscope, horoscopeInfo);
              console.log("✅ Отображен гороскоп на сегодня");
            } else {
              console.error("❌ Функция displayHoroscopeResult не найдена");
            }
          } else {
            console.log(
              "ℹ️ todayHoroscope отсутствует в ответе сервера или автоматическое отображение отключено"
            );
          }

          // Временно отключаем автоматическую загрузку гороскопа при входе
          // Гороскоп будет загружаться только по явному запросу пользователя
          if (false && typeof loadUserHoroscopeForToday === "function") {
            loadUserHoroscopeForToday(result.user);
          } else {
            console.log(
              "ℹ️ Автоматическая загрузка гороскопа отключена - пользователь должен запросить гороскоп вручную"
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

  // Обработчик формы профиля
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

// Валидация формы входа
function validateLoginForm() {
  let isValid = true;

  // Проверка email
  const email = document.getElementById("loginEmail").value.trim();
  if (!email || !isValidEmail(email)) {
    showError("loginEmail", "Input a valid email");
    isValid = false;
  }

  // Проверка пароля
  const password = document.getElementById("loginPassword").value;
  if (!password) {
    showError("loginPassword", "Input your password");
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
    showError("profileNameError", "Input your name");
    isValid = false;
  }

  // Проверка дня рождения (опционально)
  const birthday = document.getElementById("profileBirthday").value;
  if (birthday && !isValidBirthday(birthday)) {
    showError("profileBirthdayError", "Incorrect birthday");
    isValid = false;
  }

  // Проверка пароля (если введен)
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
  // --- Основная форма (user_name, user_birthday, user_date) ---
  const userNameInput = document.getElementById("user_name");
  if (userNameInput) userNameInput.value = user.name || "";
  const userBirthdayInput = document.getElementById("user_birthday");
  if (userBirthdayInput) userBirthdayInput.value = user.birthday || "";
  const userDateInput = document.getElementById("user_date");
  if (userDateInput) {
    const today = new Date().toISOString().split("T")[0];
    userDateInput.value = today;
    logInfo("Дата гороскопа установлена на сегодня:", today);
  }
  logInfo("Заполняем форму данными пользователя:", user);

  // Очищаем старый кэшированный гороскоп из localStorage
  localStorage.removeItem("horoscopeResult");
  localStorage.removeItem("horoscopeResponse");
  localStorage.removeItem("info");

  // Очищаем все ключи кеша для незалогиненных пользователей
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("horoscope_cache_")) {
      localStorage.removeItem(key);
    }
  });

  const horoscopeDiv = document.getElementById("horoscope");
  if (horoscopeDiv) {
    horoscopeDiv.innerHTML = "";
  }

  // Скрываем блок результата
  const resultForm = document.getElementById("result_form");
  if (resultForm) {
    resultForm.classList.add("form-hidden");
    resultForm.style.display = "none";
  }

  // === Заполнение модального окна профиля ===
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

  // Устанавливаем сегодняшнюю дату для гороскопа (уже выполнено выше)
}

// Функция выхода из системы
function logout() {
  logInfo("Выполняем выход из системы...");

  // Сохраняем текущие данные формы в info перед очисткой
  const userNameField = document.getElementById("user_name");
  const userBirthdayField = document.getElementById("user_birthday");
  const userDateField = document.getElementById("user_date");

  if (userNameField && userBirthdayField && userDateField) {
    const currentFormData = {
      name: userNameField.value.trim(),
      birthday: userBirthdayField.value.trim(),
      date: userDateField.value.trim(),
    };

    // Сохраняем только если есть хотя бы какие-то данные
    if (
      currentFormData.name ||
      currentFormData.birthday ||
      currentFormData.date
    ) {
      // Добавляем знак зодиака если есть дата рождения
      if (currentFormData.birthday) {
        // Импортируем функцию getZodiacSignFromString из app.js
        if (typeof getZodiacSignFromString === "function") {
          currentFormData.zodiac = getZodiacSignFromString(
            currentFormData.birthday
          );
        }
      }

      localStorage.setItem("info", JSON.stringify(currentFormData));
      console.log(
        "✅ Сохранены текущие данные формы в info при logout:",
        currentFormData
      );
    }
  }

  // Очищаем данные пользователя
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("horoscopeResponse");
  localStorage.removeItem("horoscopeResult");

  // НЕ удаляем info - там остаются данные формы для восстановления
  // localStorage.removeItem("info");

  // Очищаем все ключи кеша для незалогиненных пользователей
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("horoscope_cache_")) {
      localStorage.removeItem(key);
    }
  });

  // ОЧИЩАЕМ ГОРОСКОП - ЭТО БЫЛО ПРОБЛЕМОЙ!
  const horoscopeDiv = document.getElementById("horoscope");
  if (horoscopeDiv) {
    horoscopeDiv.innerHTML = "";
    console.log("✅ Очищен контент гороскопа при logout");
  }

  // СКРЫВАЕМ БЛОК РЕЗУЛЬТАТА - ЭТО ТОЖЕ БЫЛО ПРОБЛЕМОЙ!
  const resultForm = document.getElementById("result_form");
  if (resultForm) {
    resultForm.classList.add("form-hidden");
    resultForm.style.display = "none";
    console.log("✅ Скрыт блок результата при logout");
  }

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
