// Утилиты для приложения гороскопов

// Валидация email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Валидация даты рождения
function isValidBirthday(birthday) {
  if (!birthday) return true; // День рождения не обязателен
  const date = new Date(birthday);
  const now = new Date();
  return date instanceof Date && !isNaN(date) && date < now;
}

// Валидация знака зодиака
function isValidZodiac(zodiac) {
  const validZodiacs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  return validZodiacs.includes(zodiac);
}

// Валидация пароля
function isValidPassword(password) {
  return password && password.length >= 6;
}

// Список знаков зодиака
const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

// Функция для определения знака зодиака по дате рождения
function getZodiacByDate(birthday) {
  if (!birthday) return null;

  const date = new Date(birthday);
  const month = date.getMonth() + 1; // getMonth() возвращает 0-11
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

  return null;
}

// Форматирование даты для отображения
function formatDate(date) {
  return new Date(date).toLocaleDateString("ru-RU");
}

// Логирование с цветами для разработки
function logSuccess(message, data = null) {
  console.log("✅", message, data ? data : "");
}

function logError(message, error = null) {
  console.error("❌", message, error ? error : "");
}

function logInfo(message, data = null) {
  console.log("ℹ️", message, data ? data : "");
}

module.exports = {
  isValidEmail,
  isValidBirthday,
  isValidZodiac,
  isValidPassword,
  ZODIAC_SIGNS,
  getZodiacByDate,
  formatDate,
  logSuccess,
  logError,
  logInfo,
};
