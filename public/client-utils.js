// client-utils.js - Общие утилиты для клиентской части

// Валидация email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Валидация пароля
function isValidPassword(password) {
  return password && password.length >= 6;
}

// Валидация даты рождения
function isValidBirthday(birthday) {
  if (!birthday) return true; // День рождения не обязателен
  const date = new Date(birthday);
  const now = new Date();
  return date instanceof Date && !isNaN(date) && date < now;
}

// Определение знака зодиака по дате
function getZodiacSign(date) {
  if (!date || isNaN(date)) return "";

  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";

  return "";
}

// Функция для определения знака зодиака из строки даты (совместимость)
function getZodiacSignFromString(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return getZodiacSign(date);
}

// Показать ошибку
function showError(elementId, message) {
  const element =
    document.getElementById(elementId + "Error") ||
    document.getElementById(elementId);
  if (element) {
    if (element.classList.contains("error-message")) {
      element.textContent = message;
      element.style.display = "block";
    } else {
      element.style.borderColor = "#e74c3c";
      let errorElement = document.getElementById(elementId + "Error");
      if (!errorElement) {
        errorElement = document.createElement("div");
        errorElement.id = elementId + "Error";
        errorElement.className = "error-message";
        element.parentNode.appendChild(errorElement);
      }
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }
}

// Показать успех
function showSuccess(message) {
  const successElements = document.querySelectorAll(".success-message");
  successElements.forEach((element) => {
    element.textContent = message;
    element.style.display = "block";
  });
}

// Очистить ошибки
function clearErrors() {
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach((element) => {
    element.style.display = "none";
    element.textContent = "";
  });

  const successElements = document.querySelectorAll(".success-message");
  successElements.forEach((element) => {
    element.style.display = "none";
    element.textContent = "";
  });

  // Убираем красные границы у полей
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.style.borderColor = "";
  });
}

// Форматирование даты
function formatDate(date) {
  return new Date(date).toLocaleDateString("ru-RU");
}

// Логирование (можно отключить в продакшене)
const DEBUG = true;

function logInfo(message, data = null) {
  if (DEBUG) {
    console.log("ℹ️", message, data || "");
  }
}

function logSuccess(message, data = null) {
  if (DEBUG) {
    console.log("✅", message, data || "");
  }
}

function logError(message, error = null) {
  if (DEBUG) {
    console.error("❌", message, error || "");
  }
}
