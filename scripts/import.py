import sys
import os
import psycopg2
from datetime import datetime


def main():
    if len(sys.argv) < 2:
        sys.exit("Please specify the path to the import file.")

    path = sys.argv[1]
    dbname = os.environ.get("POSTGRES_DATABASE")
    user = os.environ.get("POSTGRES_USER")
    password = os.environ.get("POSTGRES_PASSWORD")
    host = os.environ.get("HOST_ADDR")
    port = os.getenv("PORT", 5432)

    # Connect to an existing database
    conn = psycopg2.connect(
        dbname=dbname, user=user, password=password, host=host, port=port
    )
    # Open a cursor to perform database operations
    cur = conn.cursor()

    try:
        with open(path, "r") as csv:
            # Grab the relevant habit id from the database
            habit_name = csv.readline()  # The header should contain the habit name
            cur.execute("SELECT id FROM habit WHERE habit_name = %s;", (habit_name,))
            habit = cur.fetchone()
            if habit == None:
                # This habit wasn't in the database, so we need to insert it
                cur.execute(
                    "INSERT INTO habit (habit_name) VALUES (%s) RETURNING id;",
                    (habit_name,),
                )
                habit_id = cur.fetchone()[0]
            else:
                habit_id = habit[0]

            # Write the habit entry to the database (TODO: this can be done more efficiently)
            for line in csv:
                date = datetime.strptime(line.strip(), "%m/%d/%Y %H:%M:%S")
                cur.execute(
                    "INSERT INTO occurence (habit_id, created_at) VALUES (%s, %s);",
                    (habit_id, date),
                )

        # Make the changes to the database persistent
        conn.commit()
    finally:
        # Close communication with the database
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
