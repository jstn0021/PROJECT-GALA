let pool = null;

export const db = {
  async getConnection() {
    if (!pool && process.env.DB_HOST) {
      const mysql = await import("mysql2/promise");
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
      });
    }
    if (pool) {
      return pool.getConnection();
    }
    throw new Error("MySQL database is not configured. Using memory store fallback.");
  },
  async query(...args) {
    const conn = await this.getConnection();
    try {
      return await conn.query(...args);
    } finally {
      conn.release();
    }
  },
};

export default db;
