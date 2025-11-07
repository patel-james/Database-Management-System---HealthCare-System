import mysql from "mysql2/promise";

const config = {
  host: "35.192.178.34", // Cloud SQL public IP
  user: "james",
  password: "Knpatel78@",
  database: "healthcare_db",
  connectTimeout: 20000,
  ssl: { rejectUnauthorized: false }, // optional but good for GCP
};

console.log("🔍 Starting detailed Cloud SQL connection test...");
console.log("Connection config:", config);

async function testConnection() {
  try {
    console.time("ConnectionTime");
    const connection = await mysql.createConnection(config);
    console.timeEnd("ConnectionTime");
    console.log("✅ Connected successfully!");

    const [rows] = await connection.query("SHOW TABLES;");
    console.log("📋 Tables found:", rows);

    await connection.end();
    console.log("🔒 Connection closed cleanly.");
  } catch (err) {
    console.error("\n❌ Connection failed.");
    console.error("Error name:", err.name);
    console.error("Error code:", err.code);
    console.error("Error number:", err.errno);
    console.error("SQL state:", err.sqlState);
    console.error("Message:", err.message);
    console.error("\n🔎 Full error object for debugging:\n", err);
  }
}

testConnection();
