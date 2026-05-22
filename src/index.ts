import app from "./app.js";
import "./config/db.js"; // Ensures SQLite DB and tables are initialized on boot
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
