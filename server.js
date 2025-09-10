const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

let scores = [];

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false}
});

(async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS scores (
            id SERIAL PRIMARY KEY,
            player TEXT NOT NULL,
            score INT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
            )`
    );
})();

app.post("/score", async (req,res) => {
    const {player, score} = req.body;
    if(!player || typeof score !== "number"){
        return res.status(400).json({ error: "Invalid input"});
    }
    await pool.query(
        "INSERT INTO scores (player, score) VALUES ($1, $2)",
        [player, score]
    );

    res.json({ success: true});
});

app.get("/ranking", async (req,res) => {
    const result = await pool.query(
        "SELECT player, score FROM scores ORDER BY score DESC LIMIT 10"
    );
    res.json(result.rows);
});

app.listen(3000, () => console.log("Server runnning"));