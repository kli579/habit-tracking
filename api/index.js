const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const { Pool } = require('pg')

// Express app
const app = express()

// Enable cors
app.use(cors())

// Use bodyparser
app.use(bodyParser.json())

// Create postgres pool
const pool = new Pool({
  user: "habittracking",
  host: "192.168.1.180",
  database: "habittracking",
  password: "*tW81wEA6694",
  port: 5432,
});

// Endpoints
app.post("/track-habit", (req, parent_res) => {
  pool
    .connect()
    .then(client => {
      return client
        .query(`INSERT INTO occurence (habit_id) VALUES (${req.body.habit_id}) RETURNING id`)
        .then(res => {
          parent_res.send(res.rows)
        })
        .catch(err => {
          parent_res.status(500)
        })
        .finally(() => {
          client.release()
        })
    })
    .catch(err => {
      console.log("Breaking in connect bs - track-habit")
      parent_res.status(500)
    })
});

app.get("/get-habits", (req, parent_res) => {
  pool
    .connect()
    .then(client => {
      return client
        .query("SELECT * FROM habit")
        .then(res => {
          parent_res.send(res.rows)
        })
        .catch(err => {
          parent_res.status(500)
        })
        .finally(() => {
          client.release()
        })
    })
    .catch(err => {
      console.log("Breaking in connect bs - get-habits")
      parent_res.status(500)
    })
});

app.get("/habit/:habitId", wrapAsync(async (req, res) => {
  const client = await pool.connect();

  const getHabits = async () => {
    const { habitId } = req.params;
    const habits = await client.query(`
      SELECT created_at FROM occurence
      WHERE occurence.habit_id = ${habitId}
    `);
    res.send(habits.rows);
  }

  await getHabits().finally(() => {
    client.release();
  })
}))

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Internal Server Error')
})

app.listen(3001, () => {
  console.log("Listening on port 3001")
});

function wrapAsync(fn) {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
}