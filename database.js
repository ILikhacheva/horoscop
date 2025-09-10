const { Pool } = require("pg");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || "horoscop",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
      }
);

(async () => {
  try {
    const res = await pool.query("SET search_path TO public");
    console.log("✅ search_path установлен в public");

    const users = await pool.query("SELECT first_name, email FROM users");
    console.table(users.rows);
  } catch (err) {
    console.error(err);
  }
})();

// Testing connection
pool.on("connect", () => {
  console.log("✅ Connection to PostgreSQL established");
});

pool.on("error", (err) => {
  console.error("❌ Connection error to PostgreSQL:", err);
});

// Function to test connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Connection test successful:", result.rows[0]);
    client.release();
    return true;
  } catch (err) {
    console.error("❌ Connection test failed:", err);
    return false;
  }
}

// Function to check user table structure
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

    console.log("Tables in users table:");
    result.rows.forEach((row) => {
      console.log(
        `- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    return result.rows;
  } catch (err) {
    console.error("❌ Connection error to users table structure:", err);
    return null;
  }
}

// Function to check horoscope table structure
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

    console.log("Tables in horoscops table:");
    result.rows.forEach((row) => {
      console.log(
        `- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    return result.rows;
  } catch (err) {
    console.error("❌ Connection error to horoscops table structure:", err);
    return null;
  }
}

module.exports = {
  pool,
  testConnection,
  checkUserTableStructure,
  checkHoroscopeTableStructure,
};
