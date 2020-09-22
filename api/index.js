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
        .query(`SELECT * FROM habit`)
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

app.listen(3001, ()=> {
  console.log("Listening on port 3001")
});