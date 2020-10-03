const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express(); // Express app
app.use(cors()); // Enable cors
app.use(bodyParser.json()); // Use bodyparser

// Create postgres pool
const pool = new Pool({
  user: "habittracking",
  host: "192.168.1.180",
  database: "habittracking",
  password: "*tW81wEA6694",
  port: 5432,
});

// Provide the database client to all requests
app.use(
  wrapAsync(async (req, res, next) => {
    req.client = await pool.connect();
    next();
  })
);

// Endpoints
app.post("/habits", (req, parent_res) => {
  req.client
    .query(
      `INSERT INTO occurence (habit_id) VALUES (${req.body.habit_id}) RETURNING id`
    )
    .then((res) => {
      parent_res.send(res.rows);
    })
    .finally(req.client.release);
});

app.get("/habits", (req, parent_res) => {
  req.client
    .query("SELECT * FROM habit")
    .then((res) => {
      parent_res.send(res.rows);
    })
    .finally(req.client.release);
});

app.get(
  "/habits/:habitId",
  wrapAsync(async (req, res) => {
    const getHabits = async () => {
      const { habitId } = req.params;
      const { startTime, endTime } = req.query;

      // TODO: Validation: times are dates, start < end if both exist, habitId exists

      // Form the AND clause
      let andClause = "";
      if (startTime) {
        andClause += `
          AND occurence.created_at >= '${startTime}'
        `;
      }
      if (endTime) {
        andClause += `
          AND occurence.created_at <= '${endTime}'
        `;
      }

      // TODO: look into how to properly format this query string
      const habits = await req.client.query(`
        SELECT created_at FROM occurence
        WHERE occurence.habit_id = ${habitId}
        ${andClause}
        LIMIT 1000
      `);
      const creationTimes = habits.rows.map(({ created_at }) => created_at);
      res.send({ habit_id: habitId, creation_times: creationTimes });
    };

    await getHabits().finally(req.client.release);
  })
);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

app.listen(3001, () => {
  console.log("Listening on port 3001");
});

function wrapAsync(fn) {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
}
