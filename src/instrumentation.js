import connect from "../lib/db.js";

export async function register() {
  console.log("Connecting to database...");
  await connect();
}