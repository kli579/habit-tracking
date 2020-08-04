-- USE habittracking;

CREATE TABLE IF NOT EXISTS habit (
   id SERIAL PRIMARY KEY,
   habit_name VARCHAR(50) NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS occurence (
   id SERIAL PRIMARY KEY,
   habit_id INTEGER NOT NULL REFERENCES habit,
   created_at TIMESTAMP NOT NULL DEFAULT now()
);