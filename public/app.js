// Проверяем авторизацию при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  // Очищаем URL от потенциально конфиденциальных данных
  cleanURLFromSensitiveData();

  checkAuthStatus();
});

// Функция очистки URL от конфиденциальных данных
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
    logInfo("Конфиденциальные данные удалены из URL");
  }
}

// Функции для работы с авторизацией
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
  console.log("🔄 showGuestButtons() вызвана");
  document.getElementById("guestButtons").style.display = "flex";
  document.getElementById("userButtons").style.display = "none";

  // При переходе к гостевому режиму скрываем блок результата гороскопа
  const resultForm = document.getElementById("result_form");
  if (resultForm && !resultForm.classList.contains("form-hidden")) {
    resultForm.classList.add("form-hidden");
    resultForm.style.display = "none";
    console.log("✅ Скрыт блок результата при переходе к гостевому режиму");
  } else if (resultForm) {
    console.log("ℹ️ Блок результата уже скрыт или не найден");
  } else {
    console.log("❌ Элемент result_form не найден");
  }

  // Дополнительно очищаем содержимое гороскопа
  const horoscopeDiv = document.getElementById("horoscope");
  if (horoscopeDiv && horoscopeDiv.innerHTML.trim() !== "") {
    horoscopeDiv.innerHTML = "";
    console.log("✅ Очищено содержимое гороскопа в showGuestButtons");
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
  console.log("⚠️ ВНИМАНИЕ: Эта функция logout в app.js НЕ используется!");
  console.log("⚠️ Реальная функция logout находится в login.js");

  const logoutId = Math.random().toString(36).substr(2, 9);
  console.log(`🔄 [${logoutId}] Начинаем процесс logout`);
  if (confirm("Вы уверены, что хотите выйти?")) {
    console.log(`✅ [${logoutId}] Пользователь подтвердил выход`);

    // Очищаем все данные пользователя из localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("horoscopeResponse");
    localStorage.removeItem("horoscopeResult"); // старый ключ
    localStorage.removeItem("info"); // информация о форме
    console.log(`✅ [${logoutId}] Очищен localStorage`);

    // Очищаем все ключи кеша для незалогиненных пользователей
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("horoscope_cache_")) {
        localStorage.removeItem(key);
        console.log(`✅ [${logoutId}] Удален кеш:`, key);
      }
    });

    // Очищаем отображение гороскопа
    const horoscopeDiv = document.getElementById("horoscope");
    if (horoscopeDiv) {
      console.log(
        `🔍 [${logoutId}] Содержимое horoscope до очистки:`,
        horoscopeDiv.innerHTML.substring(0, 100)
      );
      horoscopeDiv.innerHTML = "";
      horoscopeDiv.textContent = "";
      horoscopeDiv.innerText = "";

      // Принудительно удаляем все дочерние элементы
      while (horoscopeDiv.firstChild) {
        horoscopeDiv.removeChild(horoscopeDiv.firstChild);
      }

      console.log(`✅ [${logoutId}] Очищен контент гороскопа полностью`);
      console.log(
        `🔍 [${logoutId}] Содержимое horoscope после очистки:`,
        horoscopeDiv.innerHTML
      );
    }

    // Скрываем блок с результатом
    const resultForm = document.getElementById("result_form");
    if (resultForm) {
      console.log(
        `🔍 [${logoutId}] Классы resultForm до изменений:`,
        resultForm.className
      );
      console.log(
        `🔍 [${logoutId}] Стиль display до изменений:`,
        resultForm.style.display
      );
      console.log(
        `🔍 [${logoutId}] Видимость resultForm до изменений:`,
        resultForm.offsetHeight,
        "x",
        resultForm.offsetWidth
      );

      // Применяем множественные способы скрытия
      resultForm.classList.add("form-hidden");
      resultForm.style.display = "none";
      resultForm.style.visibility = "hidden";
      resultForm.style.opacity = "0";
      resultForm.style.height = "0";
      resultForm.style.overflow = "hidden";
      resultForm.setAttribute("hidden", "true");

      console.log(
        `✅ [${logoutId}] Скрыт блок результата всеми возможными способами`
      );
    }

    // Дополнительно принудительно скрываем блок результата с помощью стиля
    if (resultForm) {
      console.log(
        `✅ [${logoutId}] Дополнительная проверка скрытия блока результата`
      );
      console.log(
        `🔍 [${logoutId}] Классы resultForm после изменений:`,
        resultForm.className
      );
      console.log(
        `🔍 [${logoutId}] Стиль display после изменений:`,
        resultForm.style.display
      );
      console.log(
        `🔍 [${logoutId}] Видимость resultForm после изменений:`,
        resultForm.offsetHeight,
        "x",
        resultForm.offsetWidth
      );
    }

    // Очищаем ВСЕ поля формы
    const U_name = document.getElementById("user_name");
    const U_birthday = document.getElementById("user_birthday");
    const U_date = document.getElementById("user_date");

    if (U_name) {
      U_name.value = "";
      console.log("✅ Очищено поле имени");
    }
    if (U_birthday) {
      U_birthday.value = "";
      console.log("✅ Очищено поле дня рождения");
    }
    if (U_date) {
      U_date.value = "";
      console.log("✅ Очищено поле даты");
    }

    // Очищаем изображение знака зодиака
    const zodiacImg = document.getElementById("zodiac_img");
    if (zodiacImg) {
      zodiacImg.src = "";
      console.log("✅ Очищено изображение знака зодиака");
    }

    // Сбрасываем форму полностью
    const form = document.getElementById("user_form");
    if (form) {
      form.reset();
      console.log("✅ Форма сброшена");
    }

    // Обновляем статус авторизации
    console.log("🔄 Вызываем checkAuthStatus()");
    checkAuthStatus();

    console.log("✅ Logout завершен, все данные и отображение очищены");

    // Дополнительная проверка после logout
    setTimeout(() => {
      const horoscopeCheck = document.getElementById("horoscope");
      const resultFormCheck = document.getElementById("result_form");
      console.log("🔍 Проверка после logout:");
      console.log(
        "  - horoscope содержимое:",
        horoscopeCheck ? horoscopeCheck.innerHTML.substring(0, 50) : "не найден"
      );
      console.log(
        "  - result_form классы:",
        resultFormCheck ? resultFormCheck.className : "не найден"
      );
      console.log(
        "  - result_form display:",
        resultFormCheck ? resultFormCheck.style.display : "не найден"
      );
    }, 100);

    alert("Вы вышли из системы");
  } else {
    console.log("❌ Пользователь отменил выход");
  }
}

// Loading spinner
function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}
function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

// Функция проверки авторизации
function isUserLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// Функция для улучшенного кэширования с временными метками
function getCacheKey(name, date, zodiac) {
  return `horoscope_${name}_${date}_${zodiac}`;
}

function isValidCache(cacheData) {
  if (!cacheData || !cacheData.timestamp) return false;

  const cacheTime = new Date(cacheData.timestamp);
  const now = new Date();
  const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);

  return hoursDiff < 24; // Кэш действителен 24 часа
}

// Функция для поиска существующих кэшированных гороскопов по параметрам
function findExistingHoroscopeCache(name, birthday, date) {
  console.log("🔍 Ищем существующий кэш для:", { name, birthday, date });

  // Если есть дата рождения, вычисляем знак зодиака
  let zodiac = null;
  if (birthday && typeof getZodiacSignFromString === "function") {
    zodiac = getZodiacSignFromString(birthday);
  }

  // Перебираем все ключи localStorage
  for (let key of Object.keys(localStorage)) {
    if (key.startsWith("horoscope_") && key.includes("_" + date + "_")) {
      try {
        const cacheData = JSON.parse(localStorage.getItem(key));
        if (cacheData && isValidCache(cacheData)) {
          // Извлекаем параметры из ключа
          const parts = key.split("_");
          if (parts.length >= 4) {
            const cachedName = parts[1];
            const cachedDate = parts[2];
            const cachedZodiac = parts[3];

            // Проверяем совпадение параметров
            const nameMatch =
              name && cachedName.toLowerCase() === name.toLowerCase();
            const dateMatch = cachedDate === date;
            const zodiacMatch = zodiac && cachedZodiac === zodiac;

            if (nameMatch && dateMatch && zodiacMatch) {
              console.log("✅ Найден подходящий кэш:", key);
              return cacheData;
            }
          }
        }
      } catch (e) {
        console.log("⚠️ Ошибка при чтении кэша:", key, e);
      }
    }
  }

  console.log("❌ Подходящий кэш не найден");
  return null;
}

// Секции гороскопа
const infoSections = [
  "General",
  "Work",
  "Health",
  "Finance",
  "Travel",
  "Relationships",
  "Advice",
];

// ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ РЕЗУЛЬТАТА
function displayHoroscopeResult(result, info) {
  let html = `<div class="horoscopeResult"> <h2>Horoscope for ${info.name} (${info.zodiac})</h2>`;
  infoSections.forEach((section) => {
    console.log(
      `Значение для ${section}: ${result.horoscope?.[section] || "-"}`
    );
    html += `<p><b>${section}:</b> ${result.horoscope?.[section] || "-"}</p>`;
  });
  html += `</div>`;

  document.getElementById("horoscope").innerHTML = html;
  const resultFormElement = document.getElementById("result_form");

  // Сбрасываем все принудительные стили скрытия
  resultFormElement.classList.remove("form-hidden");
  resultFormElement.style.display = "";
  resultFormElement.style.visibility = "";
  resultFormElement.style.opacity = "";
  resultFormElement.style.height = "";
  resultFormElement.style.overflow = "";
  resultFormElement.removeAttribute("hidden");

  console.log("✅ Отображен результат гороскопа, сброшены все стили скрытия");

  const resultBox = document.querySelector("#horoscope .horoscopeResult");

  // Добавляем фоновое изображение
  if (resultBox) {
    resultBox.style.backgroundImage = `url('img/zodiac/${info.zodiac}.png')`;
    resultBox.style.backgroundSize = "cover";
    resultBox.style.backgroundRepeat = "no-repeat";
    resultBox.style.backgroundPosition = "center";
    resultBox.style.opacity = "0.9";

    // Добавляем overlay для лучшей читаемости
    let overlay = document.createElement("div");
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    resultBox.parentElement.appendChild(overlay);
  }
}

// restore localStorage
window.addEventListener("load", () => {
  console.log("🔄 Событие load сработало");
  console.log("🔍 Проверяем localStorage при загрузке:");
  console.log("  - info:", localStorage.getItem("info"));
  console.log("  - isLoggedIn:", localStorage.getItem("isLoggedIn"));
  console.log("  - user:", localStorage.getItem("user"));

  // Включаем обратно автоматическое восстановление данных формы
  // НО без автоматического отображения гороскопа
  restoreFormFromLocalStorage();

  // Затем проверяем, есть ли залогиненный пользователь
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userData = localStorage.getItem("user");

  if (isLoggedIn === "true" && userData) {
    try {
      const user = JSON.parse(userData);
      // Если пользователь залогинен, заполняем форму его данными
      fillFormWithUserData(user);
      console.log("✅ Форма заполнена данными залогиненного пользователя");

      // НЕ загружаем автоматически гороскоп при загрузке страницы
      // Гороскоп будет загружаться только по явному запросу пользователя
      console.log(
        "ℹ️ Автоматическая загрузка гороскопа при загрузке страницы отключена"
      );
    } catch (error) {
      console.error("Ошибка при загрузке данных пользователя:", error);
    }
  }

  // Настройки календаря
  setupCalendarLimits();
});

// Функция восстановления данных из localStorage
function restoreFormFromLocalStorage() {
  console.log("🔄 Запуск restoreFormFromLocalStorage()");

  // Проверяем оба ключа - user (основной) и info (для совместимости)
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const savedInfo = JSON.parse(localStorage.getItem("info") || "{}");
  console.log("🔍 Сохраненная информация из localStorage (user):", savedUser);
  console.log("🔍 Сохраненная информация из localStorage (info):", savedInfo);

  // Используем данные из user, если они есть, иначе из info
  const dataToUse = Object.keys(savedUser).length > 0 ? savedUser : savedInfo;
  console.log("🔍 Используемые данные:", dataToUse);

  const U_name = document.getElementById("user_name");
  const U_birthday = document.getElementById("user_birthday");
  const U_date = document.getElementById("user_date");

  console.log("🔍 Найденные элементы DOM:", {
    U_name: !!U_name,
    U_birthday: !!U_birthday,
    U_date: !!U_date,
  });

  // Всегда восстанавливаем данные формы
  if (dataToUse.name && U_name) {
    U_name.value = dataToUse.name;
    console.log("✅ Восстановлено имя из localStorage:", dataToUse.name);
  } else {
    console.log("ℹ️ Имя не восстановлено:", {
      hasName: !!dataToUse.name,
      hasElement: !!U_name,
    });
  }

  if (dataToUse.birthday && U_birthday) {
    U_birthday.value = dataToUse.birthday;
    console.log(
      "✅ Восстановлена дата рождения из localStorage:",
      dataToUse.birthday
    );
  } else {
    console.log("ℹ️ Дата рождения не восстановлена:", {
      hasBirthday: !!dataToUse.birthday,
      hasElement: !!U_birthday,
    });
  }

  if (dataToUse.date && U_date) {
    U_date.value = dataToUse.date;
    console.log(
      "✅ Восстановлена дата гороскопа из localStorage:",
      dataToUse.date
    );
  } else {
    console.log("ℹ️ Дата гороскопа не восстановлена:", {
      hasDate: !!dataToUse.date,
      hasElement: !!U_date,
    });
  }

  // НЕ восстанавливаем автоматически гороскоп при загрузке страницы
  // Гороскоп будет отображаться только по явному запросу пользователя
  console.log(
    "ℹ️ Данные формы восстановлены, но гороскоп не отображается автоматически"
  );

  // Проверяем статус авторизации
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    console.log(
      "ℹ️ Пользователь не залогинен, кеш гороскопа НЕ восстанавливается"
    );

    // Но можем проверить, есть ли подходящий кэш для восстановленных данных
    if (dataToUse.name && dataToUse.birthday && dataToUse.date) {
      const existingCache = findExistingHoroscopeCache(
        dataToUse.name,
        dataToUse.birthday,
        dataToUse.date
      );
      if (existingCache) {
        console.log(
          "💡 Найден кэшированный гороскоп для восстановленных данных, но не отображаем автоматически"
        );
      }
    }
  } else {
    console.log(
      "ℹ️ Пользователь залогинен, кеш гороскопа НЕ восстанавливается"
    );
  }
}

// Функция заполнения формы данными пользователя
function fillFormWithUserData(user) {
  const U_name = document.getElementById("user_name");
  const U_birthday = document.getElementById("user_birthday");

  if (U_name) U_name.value = user.name || "";
  if (U_birthday && user.birthday) {
    // Форматируем дату в формат YYYY-MM-DD для input[type="date"]
    const birthDate = new Date(user.birthday);
    const formattedDate = birthDate.toISOString().split("T")[0];
    U_birthday.value = formattedDate;
  }
}

// Функция загрузки гороскопа пользователя на сегодня
async function loadUserHoroscopeForToday(user) {
  if (!user.birthday) return;

  const today = new Date().toISOString().split("T")[0];
  const zodiac = getZodiacSignFromString(user.birthday);

  if (zodiac) {
    // Заполняем форму данными пользователя и сегодняшней датой
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

// Функция настройки ограничений календаря
function setupCalendarLimits() {
  const U_date = document.getElementById("user_date");
  const U_birthday = document.getElementById("user_birthday");

  if (U_date) {
    const today = new Date().toISOString().split("T")[0];
    U_date.setAttribute("min", today);

    // Устанавливаем сегодняшний день по умолчанию, если поле пустое
    if (!U_date.value) {
      U_date.value = today;
    }
  }

  if (U_birthday) {
    const today = new Date().toISOString().split("T")[0];
    U_birthday.setAttribute("max", today);
  }
}

// Используем функцию getZodiacSign из client-utils.js (функция удалена отсюда для избежания дублирования)

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
    // Если у пользователя нет даты рождения, но есть зодиак в профиле — используем его
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if ((!info.birthday || !zodiac) && user.zodiac) {
      zodiac = user.zodiac;
      info.zodiac = user.zodiac;
    }
  }

  //Save info to localStorage
  // УЛУЧШЕННАЯ ЛОГИКА КЭШИРОВАНИЯ
  // const isLoggedIn = isUserLoggedIn(); // переменная уже объявлена выше

  if (isLoggedIn) {
    // ЗАЛОГИНЕННЫЙ: не используем localStorage-кэш, только сервер
    // Обновляем user-данные в localStorage
    const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = {
      ...existingUser,
      name: info.name,
      birthday: info.birthday,
      date: info.date,
      zodiac: info.zodiac,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    console.log(
      "✅ Данные пользователя обновлены в localStorage (user):",
      updatedUser
    );

    let result;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      // Если у пользователя нет даты рождения, но есть зодиак — явно передаем зодиак
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
      // Сохраняем только для совместимости (можно убрать)
      localStorage.setItem("horoscopeResult", JSON.stringify(result));
      // Для отображения и картинки используем info с актуальным зодиаком
      displayHoroscopeResult(result, info);
      hideLoading();
    } catch (err) {
      console.error("Error:", err);
      document.getElementById("horoscope").innerHTML =
        "Ошибка получения гороскопа.";
      hideLoading();
      return;
    }
    return;
  } else {
    // ГОСТЬ: обязательно должны быть введены имя и дата рождения
    if (!info.name || !info.birthday) {
      alert("To get a horoscope, you must enter your name and date of birth.");
      hideLoading();
      return;
    }
    // сначала ищем в localStorage, если нет — запрос к серверу
    const cachedData = findExistingHoroscopeCache(
      info.name,
      info.birthday,
      info.date
    );
    if (cachedData) {
      console.log(
        "✅ Найден действующий кэш, используем сохраненный результат"
      );
      setTimeout(() => {
        displayHoroscopeResult(cachedData.data, info);
        hideLoading();
      }, 800);
      return;
    }
    // Сохраняем данные формы
    localStorage.setItem("info", JSON.stringify(info));
    console.log("✅ Данные формы сохранены в localStorage (info):", info);
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
      // Кэшируем результат
      const cacheKey = getCacheKey(info.name, info.date, info.zodiac);
      const cacheData = { data: result, timestamp: new Date().toISOString() };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      displayHoroscopeResult(result, info);
      hideLoading();
    } catch (err) {
      console.error("Error:", err);
      document.getElementById("horoscope").innerHTML =
        "Ошибка получения гороскопа.";
      hideLoading();
      return;
    }
  }
});
