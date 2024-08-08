const express = require("express")
const app = express()
const pg = require("pg")
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://postgres:sigzz1029@localhost/the_acme_icecream_db')

app.use(express.json())
app.use(require("morgan")("dev"))

app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * FROM flavors
      ORDER BY id;`
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const SQL = `
      SELECT * FROM flavors WHERE id=$1`
    const response = await client.query(SQL, [id])
    res.send(response.rows)
  } catch (error) {
    
  }
})
app.post("/api/flavors", async (req, res, next) => {
  try {
    const body = req.body
    const name = body.name
    const is_favorite = body.is_favorite
    const SQL = `
    INSERT INTO flavors(name, is_favorite) VALUES($1, $2)
    RETURNING *;`
    const response = await client.query(SQL, [name, is_favorite])
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const SQL = `
    DELETE FROM flavors
    WHERE id=$1;`
    const response = await client.query(SQL, [id])
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const body = req.body
    const name = body.name
    const is_favorite = body.is_favorite
    const SQL = `
      UPDATE flavors
      SET name=$1, is_favorite=$2, updated_at=now()
      WHERE id=$3
      RETURNING *;`
    const response = await client.query(SQL, [name, is_favorite, id])
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})




const init = async () => {
  await client.connect()
  const createSQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      is_favorite BOOLEAN,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now());`
  await client.query(createSQL)
  const seedSQL = `
    INSERT INTO flavors(name, is_favorite) VALUES('Mint Chocolate Chip', true);
    INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', false);
    INSERT INTO flavors(name, is_favorite) VALUES('Cake', false);`
  await client.query(seedSQL)
  console.log("data seeded")
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}

init()