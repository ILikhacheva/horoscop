const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
require("dotenv").config({ override: true });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const { OpenAI } = require("openai");
const {
  pool,
  testConnection,
  checkUserTableStructure,
  checkHoroscopeTableStructure,
} = require("./database");
const {
  isValidEmail,
  isValidBirthday,
  isValidZodiac,
  isValidPassword,
  ZODIAC_SIGNS,
  logSuccess,
  logError,
  logInfo,
} = require("./utils");

// Функция для корректного форматирования даты (теперь упрощенная, так как получаем строки)
function formatDateOnly(date) {
  if (!date) return null;

  console.log("formatDateOnly вход:", date, typeof date);

  // Если это уже строка в формате YYYY-MM-DD, возвращаем как есть
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.log("formatDateOnly: строка YYYY-MM-DD:", date);
    return date;
  }

  // Если это еще Date объект (для обратной совместимости)
  if (date instanceof Date) {
    // PostgreSQL DATE поля из-за проблем с часовым поясом могут быть сдвинуты
    // Добавляем половину дня (12 часов) чтобы избежать проблем с границами дней
    const adjustedDate = new Date(date.getTime() + 12 * 60 * 60 * 1000);

    const year = adjustedDate.getUTCFullYear();
    const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(adjustedDate.getUTCDate()).padStart(2, "0");
    const result = `${year}-${month}-${day}`;

    console.log(
      "formatDateOnly: Date объект (fallback):",
      date.toISOString(),
      "->",
      result
    );
    return result;
  }

  console.log("formatDateOnly: неподдерживаемый формат:", typeof date);
  return null;
}

// Инициализация OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
console.log(
  "OpenAI API Key:",
  process.env.OPENAI_API_KEY
    ? process.env.OPENAI_API_KEY.substring(0, 20) + "..."
    : "НЕ НАЙДЕН"
);

// Тестируем подключение к базе данных
testConnection();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Простой тест API

// Маршрут для проверки существующих таблиц
app.get("/api/check-tables", async (req, res) => {
  try {
    // Проверяем какие таблицы существуют
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);
    console.log("Найденные таблицы:", tables);

    // Проверяем структуру таблицы users
    let usersStructure = null;
    if (tables.includes("users")) {
      const usersColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      usersStructure = usersColumns.rows;
    }

    // Проверяем структуру таблицы horoscops
    let horoscopsStructure = null;
    if (tables.includes("horoscops")) {
      const horoscopsColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'horoscops' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      horoscopsStructure = horoscopsColumns.rows;
    }

    res.json({
      success: true,
      tables: tables,
      usersStructure: usersStructure,
      horoscopsStructure: horoscopsStructure,
    });
  } catch (error) {
    console.error("Ошибка проверки таблиц:", error);
    res.status(500).json({
      success: false,
      message: "❌ Ошибка при проверке таблиц",
      error: error.message,
    });
  }
});

// Маршрут для получения всех пользователей
app.get("/api/users", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT id_user, first_name, email, to_char(birthday, 'YYYY-MM-DD') AS birthday, zodiac, subscription, created_at, updated_at FROM users ORDER BY created_at DESC"
    );
    client.release();

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    res.status(500).json({
      success: false,
      message: "❌ Ошибка получения пользователей",
      error: error.message,
    });
  }
});

// Маршрут регистрации
app.post("/api/register", async (req, res) => {
  console.log("🔍 Запрос на регистрацию получен");
  console.log("📦 Данные запроса:", req.body);
  console.log("📋 Headers:", req.headers);

  try {
    const { email, name, birthday, zodiac, password } = req.body;

    console.log("✅ Распарсенные данные:", {
      email,
      name,
      birthday,
      zodiac,
      password: password ? "***скрыт***" : "отсутствует",
    });

    // Валидация: email, name, password и zodiac обязательны, birthday может быть пустым
    if (!email || !name || !password || !zodiac) {
      console.log("❌ Ошибка валидации: не все поля заполнены");
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Валидация email
    if (!isValidEmail(email)) {
      console.log("❌ Ошибка валидации email:", email);
      return res.status(400).json({
        success: false,
        message: "Wrong email format",
      });
    }

    // Валидация пароля
    if (!isValidPassword(password)) {
      console.log("❌ Ошибка валидации пароля: слишком короткий");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Валидация дня рождения
    if (birthday && !isValidBirthday(birthday)) {
      console.log("❌ Ошибка валидации даты рождения:", birthday);
      return res.status(400).json({
        success: false,
        message: "Wrong birthday format",
      });
    }

    // Валидация знака зодиака
    if (!isValidZodiac(zodiac)) {
      console.log("❌ Ошибка валидации знака зодиака:", zodiac);
      return res.status(400).json({
        success: false,
        message: "Wrong zodiac sign",
      });
    }

    console.log("✅ Все валидации пройдены успешно");
    const client = await pool.connect();
    console.log("✅ Подключение к БД установлено");

    try {
      // Проверяем, не существует ли уже пользователь с таким email
      console.log("🔍 Проверяем существование пользователя с email:", email);
      const existingUser = await client.query(
        "SELECT id_user FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        console.log("❌ Пользователь уже существует");
        return res.status(400).json({
          success: false,
          message: "Пользователь с таким email уже существует",
        });
      }

      console.log("✅ Пользователь не существует, продолжаем регистрацию");

      // Хэшируем пароль
      console.log("🔐 Хэшируем пароль...");
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      console.log("✅ Пароль захэширован");

      console.log("💾 Выполняем INSERT запрос...");
      console.log("📝 Параметры:", [
        name,
        email,
        birthday || null,
        zodiac,
        "***скрыт***",
        false,
      ]);

      // Создаем пользователя (используем правильную структуру таблицы)
      // Для поля DATE в PostgreSQL отправляем строку без преобразования в Date
      const birthdayForDB = birthday ? birthday : null;

      console.log("Сохраняем дату в БД:", birthdayForDB);

      const result = await client.query(
        `
        INSERT INTO users (first_name, email, birthday, zodiac, password, subscription, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
        RETURNING id_user, first_name, email, to_char(birthday, 'YYYY-MM-DD') AS birthday, zodiac, created_at
      `,
        [name, email, birthdayForDB, zodiac, passwordHash, false]
      );

      console.log("✅ INSERT выполнен успешно");
      console.log("📄 Результат INSERT:", result.rows[0]);

      const newUser = result.rows[0];
      logSuccess("The new user has been registered:", {
        id: newUser.id_user,
        email: newUser.email,
        name: newUser.first_name,
        zodiac: newUser.zodiac,
      });

      res.json({
        success: true,
        message: "Registration successful!",
        user: {
          id: newUser.id_user,
          email: newUser.email,
          name: newUser.first_name,
          birthday: newUser.birthday,
          zodiac: newUser.zodiac,
        },
      });
    } catch (dbError) {
      logError("Ошибка базы данных при регистрации:", dbError);

      // Проверяем тип ошибки
      if (dbError.code === "23505") {
        // Unique constraint violation
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      throw dbError; // Перебрасываем неизвестные ошибки
    } finally {
      client.release();
    }
  } catch (error) {
    logError("Ошибка регистрации:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при регистрации",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email и пароль обязательны",
      });
    }

    const client = await pool.connect();

    // Ищем пользователя по email (используем вашу структуру)
    // Преобразуем birthday в строку формата YYYY-MM-DD для избежания проблем с часовыми поясами
    const userResult = await client.query(
      "SELECT id_user, email, first_name, to_char(birthday, 'YYYY-MM-DD') AS birthday, zodiac, password FROM users WHERE email = $1",
      [email]
    );

    client.release();

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Wrong email or password",
      });
    }

    const user = userResult.rows[0];

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Неверный email или пароль",
      });
    }

    console.log("Пользователь вошел в систему:", user.email);
    console.log(
      "Дата рождения из БД (строка):",
      user.birthday,
      typeof user.birthday
    );

    // Получаем гороскоп на сегодня, если он есть в БД
    let todayHoroscope = null;
    const today = new Date().toISOString().split("T")[0]; // Формат YYYY-MM-DD

    try {
      const horoscopeClient = await pool.connect();
      const horoscopeResult = await horoscopeClient.query(
        "SELECT response FROM horoscops WHERE id_user = $1 AND horoscop_date = $2",
        [user.id_user, today]
      );

      if (horoscopeResult.rows.length > 0) {
        try {
          const responseData = horoscopeResult.rows[0].response;
          console.log(`🔍 Тип данных в БД:`, typeof responseData);

          console.log(
            `🔍 Первые 100 символов:`,
            String(responseData).substring(0, 100)
          );

          // Если это уже объект, используем как есть
          if (typeof responseData === "object" && responseData !== null) {
            todayHoroscope = responseData;
            console.log(`✅ Гороскоп загружен как объект`);
          } else {
            // Если это строка, парсим JSON
            todayHoroscope = JSON.parse(responseData);
            console.log(`✅ Гороскоп загружен через JSON.parse`);
          }

          console.log(
            `✅ Найден гороскоп на сегодня (${today}) для пользователя ${user.email}`
          );
        } catch (parseError) {
          console.error(
            `❌ Ошибка парсинга JSON гороскопа:`,
            parseError.message
          );
          console.error(
            `❌ Содержимое response:`,
            horoscopeResult.rows[0].response
          );
          todayHoroscope = null;
        }
      } else {
        console.log(
          `ℹ️ Гороскоп на сегодня (${today}) не найден для пользователя ${user.email}`
        );
      }
      horoscopeClient.release();
    } catch (horoscopeError) {
      console.error(
        "❌ Ошибка при получении гороскопа на сегодня:",
        horoscopeError.message
      );
    }

    res.json({
      success: true,
      message: "Вход выполнен успешно!",
      user: {
        id: user.id_user,
        email: user.email,
        name: user.first_name,
        birthday: user.birthday, // теперь это уже строка в правильном формате
        zodiac: user.zodiac,
      },
      todayHoroscope: todayHoroscope, // Добавляем гороскоп на сегодня
    });
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при авторизации",
    });
  }
});

// Временный endpoint для отладки дат
app.get("/api/debug-dates", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT email, to_char(birthday, 'YYYY-MM-DD') AS birthday FROM users WHERE birthday IS NOT NULL LIMIT 3"
    );

    const debugInfo = result.rows.map((row) => ({
      email: row.email,
      rawBirthday: row.birthday,
      birthdayType: typeof row.birthday,
      birthdayString: String(row.birthday),
      formattedBirthday: formatDateOnly(row.birthday),
    }));

    client.release();

    res.json({
      success: true,
      data: debugInfo,
    });
  } catch (error) {
    console.error("Ошибка отладки дат:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint для обновления профиля пользователя
app.post("/api/update-profile", async (req, res) => {
  try {
    const { email, name, birthday, zodiac, password } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required",
      });
    }

    const client = await pool.connect();

    // Проверяем, существует ли пользователь
    const userResult = await client.query(
      "SELECT id_user FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    // Подготавливаем данные для обновления
    let updateQuery = "UPDATE users SET first_name = $1";
    let updateParams = [name];
    let paramIndex = 2;

    // birthday и zodiac
    if (birthday) {
      updateQuery += `, birthday = $${paramIndex}`;
      updateParams.push(birthday);
      paramIndex++;
      // zodiac вычисляется автоматически на клиенте и приходит в req.body
      if (zodiac) {
        updateQuery += `, zodiac = $${paramIndex}`;
        updateParams.push(zodiac);
        paramIndex++;
      }
    } else {
      // birthday отсутствует, zodiac выбирается вручную
      updateQuery += `, birthday = NULL`;
      if (zodiac) {
        updateQuery += `, zodiac = $${paramIndex}`;
        updateParams.push(zodiac);
        paramIndex++;
      }
    }

    // Добавляем пароль, если указан
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = $${paramIndex}`;
      updateParams.push(hashedPassword);
      paramIndex++;
    }

    updateQuery += ` WHERE email = $${paramIndex}`;
    updateParams.push(email);

    // Выполняем обновление
    await client.query(updateQuery, updateParams);

    client.release();

    console.log("Профиль пользователя обновлен:", email);

    res.json({
      success: true,
      message: "The profile has been successfully updated!",
    });
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при обновлении профиля",
    });
  }
});

// Маршрут для получения гороскопов конкретного пользователя
app.get("/api/user-horoscopes/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT h.*, u.first_name, u.zodiac 
      FROM horoscops h 
      JOIN users u ON h.id_user = u.id_user 
      WHERE h.id_user = $1 
      ORDER BY h.horoscop_date DESC 
      LIMIT 20
    `,
      [userId]
    );

    client.release();

    res.json({
      success: true,
      horoscopes: result.rows.map((row) => ({
        id: row.id,
        date: row.horoscop_date,
        content: row.response,
        name: row.first_name,
        zodiac: row.zodiac,
      })),
    });
  } catch (error) {
    console.error("Ошибка получения гороскопов пользователя:", error);
    res.status(500).json({
      success: false,
      message: "❌ Ошибка получения гороскопов",
      error: error.message,
    });
  }
});

// Маршрут для получения гороскопов
app.post("/api/horoscope", async (req, res) => {
  try {
    const { name, zodiac, date, birthday, isLoggedIn, userId } = req.body || {};

    // Переменная для переключения между AI и mock данными
    // 0 = использовать OpenAI API, 1 = использовать тестовые данные
    const USE_MOCK_DATA = 0; // Измените на 1 для использования тестовых данных

    console.log(
      `Запрос гороскопа: пользователь ID ${userId}, дата ${date}, залогинен: ${isLoggedIn}`
    );

    // Для залогиненных пользователей сначала проверяем БД
    if (isLoggedIn && userId) {
      console.log(
        `🔍 Проверяем БД на наличие гороскопа для пользователя ${userId} на дату ${date}`
      );

      const client = await pool.connect();
      try {
        const existingHoroscope = await client.query(
          "SELECT response FROM horoscops WHERE id_user = $1 AND horoscop_date = $2",
          [userId, date]
        );

        if (existingHoroscope.rows.length > 0) {
          console.log(`✅ Найден существующий гороскоп в БД для даты ${date}`);
          try {
            const responseData = existingHoroscope.rows[0].response;
            let savedResponse;

            // Если это уже объект, используем как есть
            if (typeof responseData === "object" && responseData !== null) {
              savedResponse = responseData;
            } else {
              // Если это строка, парсим JSON
              savedResponse = JSON.parse(responseData);
            }

            // Добавляем небольшую задержку для имитации поиска
            await new Promise((resolve) => setTimeout(resolve, 1500));
            console.log(
              `⏰ Задержка 1.5 секунды для имитации поиска завершена`
            );

            return res.json(savedResponse);
          } catch (parseError) {
            console.error(
              `❌ Ошибка парсинга существующего гороскопа:`,
              parseError.message
            );
            console.log(`ℹ️ Генерируем новый гороскоп из-за ошибки парсинга`);
          }
        } else {
          console.log(
            `ℹ️ Гороскоп на дату ${date} не найден в БД, генерируем новый`
          );
        }
      } catch (dbError) {
        console.error("❌ Ошибка при проверке БД:", dbError.message);
      } finally {
        client.release();
      }
    }

    const infoSections = [
      "General",
      "Work",
      "Health",
      "Finance",
      "Travel",
      "Relationships",
      "Advice",
    ];

    let result;

    if (USE_MOCK_DATA === 1) {
      // Используем тестовые данные
      console.log("Используются тестовые данные (mock)");
      result = {
        horoscope: {
          General: `Hello ${name}! As a ${zodiac}, today brings exciting opportunities for personal growth and self-discovery. The stars align favorably for you, encouraging bold decisions and positive changes in your life.`,
          Work: "Your professional life shows promising developments today. New projects may come your way, and your creative abilities will be particularly sharp. Collaboration with colleagues will lead to innovative solutions.",
          Health:
            "Pay attention to your physical well-being today. A balanced diet and regular exercise will boost your energy levels significantly. Consider trying a new wellness routine or meditation practice.",
          Finance:
            "Financial opportunities are on the horizon, but careful planning is essential. Avoid impulsive purchases and focus on long-term investment strategies. A financial advisor's guidance could prove valuable.",
          Travel:
            "Travel plans may face minor delays, but these setbacks will lead to unexpected discoveries. Local exploration might bring more joy than distant journeys. Keep your travel documents updated.",
          Relationships:
            "Your charm and charisma are at their peak today. Single individuals may encounter someone special, while those in relationships should focus on deeper communication. Family bonds strengthen through shared activities.",
          Advice:
            "Trust your intuition and embrace change with confidence. The universe supports your efforts toward personal transformation. Remember that patience and persistence will lead to remarkable achievements.",
        },
      };
    } else {
      // Используем OpenAI API
      const prompt = `Ты астролог. Отвечай структурированным JSON с разделами: ${infoSections.join(
        ", "
      )}. 
          Ответ на английском. Каждый раздел должен содержать один абзац с не менее 2 предложениями. 
          Вот данные пользователя: Имя: ${name}, Знак зодиака: ${zodiac}, Дата гороскопа: ${date}. 
          Сделай гороскоп на эту дату, используя эти данные. В разделе "General" обратись по имени.
          Структура ответа должна быть строго такой:
          {
            "horoscope": {
              "General": "...",
              "Work": "...",
              "Health": "...",
              "Finance": "...",
              "Travel": "...",
              "Relationships": "...",
              "Advice": "..."
            }
          }
      
      Ответь только JSON, без пояснений и текста.`;

      try {
        console.log("Делаем запрос к OpenAI API");
        // Вызов OpenAI API для генерации гороскопа
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });

        result = JSON.parse(completion.choices[0].message.content);
        console.log("Получен ответ от OpenAI API");
      } catch (openaiError) {
        console.error("OpenAI Error:", openaiError);

        // Fallback на mock данные если OpenAI недоступен
        console.log("OpenAI недоступен, используем тестовые данные");
        result = {
          horoscope: {
            General: `Hello ${name}! As a ${zodiac}, today brings exciting opportunities for personal growth and self-discovery. The stars align favorably for you, encouraging bold decisions and positive changes in your life.`,
            Work: "Your professional life shows promising developments today. New projects may come your way, and your creative abilities will be particularly sharp. Collaboration with colleagues will lead to innovative solutions.",
            Health:
              "Pay attention to your physical well-being today. A balanced diet and regular exercise will boost your energy levels significantly. Consider trying a new wellness routine or meditation practice.",
            Finance:
              "Financial opportunities are on the horizon, but careful planning is essential. Avoid impulsive purchases and focus on long-term investment strategies. A financial advisor's guidance could prove valuable.",
            Travel:
              "Travel plans may face minor delays, but these setbacks will lead to unexpected discoveries. Local exploration might bring more joy than distant journeys. Keep your travel documents updated.",
            Relationships:
              "Your charm and charisma are at their peak today. Single individuals may encounter someone special, while those in relationships should focus on deeper communication. Family bonds strengthen through shared activities.",
            Advice:
              "Trust your intuition and embrace change with confidence. The universe supports your efforts toward personal transformation. Remember that patience and persistence will lead to remarkable achievements.",
          },
        };
      }
    }

    // Сохраняем в БД для залогиненных пользователей
    if (isLoggedIn && userId) {
      console.log(
        `Сохраняем гороскоп в БД для пользователя ID: ${userId}, дата: ${date}`
      );

      const client = await pool.connect();
      try {
        // Проверяем, существует ли уже гороскоп на эту дату для этого пользователя
        const existingHoroscope = await client.query(
          "SELECT id FROM horoscops WHERE id_user = $1 AND horoscop_date = $2",
          [userId, date]
        );

        if (existingHoroscope.rows.length === 0) {
          // Сохраняем новый гороскоп
          const insertResult = await client.query(
            "INSERT INTO horoscops (id_user, horoscop_date, response) VALUES ($1, $2, $3) RETURNING id",
            [userId, date, JSON.stringify(result)]
          );

          console.log(
            `✅ Гороскоп сохранен в БД с ID: ${insertResult.rows[0].id}`
          );
        } else {
          console.log(
            "ℹ️ Гороскоп на эту дату уже существует, пропускаем сохранение"
          );
        }
      } catch (dbError) {
        console.error("❌ Ошибка сохранения в БД:", dbError.message);
        console.error("❌ Детали ошибки:", dbError);
      } finally {
        client.release();
      }
    } else {
      console.log(
        "ℹ️ Пользователь не залогинен или userId отсутствует, пропускаем сохранение в БД"
      );
      console.log("isLoggedIn:", isLoggedIn, "userId:", userId);
    }

    res.json(result);
  } catch (error) {
    console.error("❌ КРИТИЧЕСКАЯ ОШИБКА в /api/horoscope:", error);
    console.error("❌ Stack trace:", error.stack);
    console.error("❌ Сообщение ошибки:", error.message);
    res
      .status(500)
      .json({ error: "Ошибка получения гороскопа", details: error.message });
  }
});

// Маршрут для получения сохраненных гороскопов
app.get("/api/horoscopes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT h.*, u.first_name, u.birthday, u.zodiac 
      FROM horoscops h 
      JOIN users u ON h.id_user = u.id_user 
      ORDER BY h.horoscop_date DESC 
      LIMIT 10
    `);

    res.json({
      success: true,
      horoscopes: result.rows,
    });
  } catch (error) {
    console.error("Ошибка получения гороскопов:", error);
    res.status(500).json({
      success: false,
      message: "❌ Ошибка получения гороскопов",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
