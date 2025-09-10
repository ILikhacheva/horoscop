const { Pool } = require("pg");

const pool = new Pool({
  /*host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,*/
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Тестируем подключение
pool.on("connect", () => {
  console.log("✅ Подключение к PostgreSQL установлено");
});

pool.on("error", (err) => {
  console.error("❌ Ошибка подключения к PostgreSQL:", err);
});

// Функция для тестирования подключения
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Тест подключения успешен:", result.rows[0]);
    client.release();
    return true;
  } catch (err) {
    console.error("❌ Тест подключения failed:", err);
    return false;
  }
}

// Функция для проверки структуры таблиц пользователя
async function checkUserTableStructure() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    client.release();

    console.log("Структура таблицы users:");
    result.rows.forEach((row) => {
      console.log(
        `- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    return result.rows;
  } catch (err) {
    console.error("❌ Ошибка проверки структуры таблицы users:", err);
    return null;
  }
}

// Функция для проверки структуры таблицы гороскопов
async function checkHoroscopeTableStructure() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'horoscops' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    client.release();

    console.log("Структура таблицы horoscops:");
    result.rows.forEach((row) => {
      console.log(
        `- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    return result.rows;
  } catch (err) {
    console.error("❌ Ошибка проверки структуры таблицы horoscops:", err);
    return null;
  }
}

module.exports = {
  pool,
  testConnection,
  checkUserTableStructure,
  checkHoroscopeTableStructure,
};
