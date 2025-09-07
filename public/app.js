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
  document.getElementById("guestButtons").style.display = "flex";
  document.getElementById("userButtons").style.display = "none";
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
  if (confirm("Вы уверены, что хотите выйти?")) {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    checkAuthStatus();
    alert("Вы вышли из системы");
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
  document.getElementById("result_form").classList.remove("form-hidden");

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
  // Сначала восстанавливаем данные из localStorage
  restoreFormFromLocalStorage();

  // Затем проверяем, есть ли залогиненный пользователь
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userData = localStorage.getItem("user");

  if (isLoggedIn === "true" && userData) {
    try {
      const user = JSON.parse(userData);
      // Если пользователь залогинен, заполняем форму его данными
      fillFormWithUserData(user);

      // Также попробуем загрузить гороскоп пользователя на сегодня
      loadUserHoroscopeForToday(user);
    } catch (error) {
      console.error("Ошибка при загрузке данных пользователя:", error);
    }
  }

  // Настройки календаря
  setupCalendarLimits();
});

// Функция восстановления данных из localStorage
function restoreFormFromLocalStorage() {
  const savedInfo = JSON.parse(localStorage.getItem("info")) || {};
  const U_name = document.getElementById("user_name");
  const U_birthday = document.getElementById("user_birthday");
  const U_date = document.getElementById("user_date");

  if (savedInfo.name && U_name) U_name.value = savedInfo.name;
  if (savedInfo.birthday && U_birthday) U_birthday.value = savedInfo.birthday;

  // Восстанавливаем кэшированный результат гороскопа, если есть
  const cachedResult =
    JSON.parse(localStorage.getItem("horoscopeResult")) || null;
  if (cachedResult) {
    displayHoroscopeResult(cachedResult, savedInfo);
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
  const zodiac = getZodiacSignFromString(U_birthday.value.trim());
  //Form info object
  const info = {
    name: U_name.value.trim(),
    birthday: U_birthday.value.trim(),
    date: U_date.value.trim(),
    zodiac: zodiac,
  };

  //Save info to localStorage
  // ИЗМЕНЕННАЯ ЛОГИКА КЭШИРОВАНИЯ
  const isLoggedIn = isUserLoggedIn();

  /*
  if (!isLoggedIn) {
    // Для незалогиненных пользователей - улучшенная проверка кэша
    const cacheKey = getCacheKey(info.name, info.date, info.zodiac);
    const cachedData = JSON.parse(localStorage.getItem(cacheKey));

    if (cachedData && isValidCache(cachedData)) {
      console.log("Используется кэш из localStorage");
      setTimeout(() => {
        displayHoroscopeResult(cachedData.data, info);
        hideLoading();
      }, 800);
      return;
    }
  } else {
    // Для залогиненных пользователей - старая логика (совместимость)
    const saveInfo = JSON.parse(localStorage.getItem("info")) || {};
    const savedResult =
      JSON.parse(localStorage.getItem("horoscopeResult")) || null;

    //If data is the same, show saved result
    if (
      saveInfo.name === info.name &&
      saveInfo.birthday === info.birthday &&
      saveInfo.date === info.date &&
      savedResult
    ) {
      setTimeout(() => {
        let html = `<div class="horoscopeResult"><h2>Гороскоп для ${info.name} (${info.zodiac})</h2>`;
        infoSections.forEach((section) => {
          html += `<p><b>${section}:</b> ${
            savedResult.horoscope?.[section] || "-"
          }</p>`;
        });
        html += `</div>`;

        //Put horoscope result
        document.getElementById("horoscope").innerHTML = html;

        document.getElementById("result_form").classList.remove("form-hidden");
        const resultBox = document.querySelector("#horoscope .horoscopeResult");
        if (resultBox) {
          resultBox.style.backgroundImage = `url('img/zodiac/${zodiac}.png')`;
          resultBox.style.backgroundSize = "cover";
          resultBox.style.backgroundRepeat = "no-repeat";
          resultBox.style.backgroundPosition = "center";
          resultBox.style.opacity = "0.9";
        }

        hideLoading();
      }, 800); //800 ms
      return;
    }
  } // Закрываем блок else
  */

  //saved new data to localStorage
  localStorage.setItem("info", JSON.stringify(info));

  // Получаем ответ от сервера
  let result;

  try {
    // Если пользователь авторизован, используем его данные
    let requestData;
    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem("user"));
      requestData = {
        name: user.name,
        zodiac: user.zodiac,
        date: info.date,
        birthday: user.birthday,
        userId: user.id,
        isLoggedIn: true,
      };
    } else {
      requestData = {
        name: info.name,
        zodiac: info.zodiac,
        date: info.date,
        birthday: info.birthday,
        isLoggedIn: false,
      };
    }

    const response = await fetch("/api/horoscope", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    result = await response.json();
    console.log("Server response:", result);

    // Сохраняем результат в зависимости от статуса авторизации
    if (!isLoggedIn) {
      // Для незалогиненных - новое кэширование с временными метками
      const cacheKey = getCacheKey(info.name, info.date, info.zodiac);
      const cacheData = {
        data: result,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } else {
      // Для залогиненных - старая система (совместимость)
      localStorage.setItem("horoscopeResult", JSON.stringify(result));
    }

    // ИСПОЛЬЗУЕМ ОБЩУЮ ФУНКЦИЮ ДЛЯ ОТОБРАЖЕНИЯ
    displayHoroscopeResult(result, info);
    hideLoading();
  } catch (err) {
    console.error("Error:", err);
    document.getElementById("horoscope").innerHTML =
      "Ошибка получения гороскопа.";
    hideLoading();
    return;
  }
});
