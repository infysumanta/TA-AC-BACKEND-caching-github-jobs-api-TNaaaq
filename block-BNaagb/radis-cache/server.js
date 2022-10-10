const express = require("express");
const redis = require("redis");
const axios = require("axios");
const app = express();

const client = redis.createClient(6379);
client.on("error", (err) => console.log(err));

function checkCache(req, res, next) {
  let path = req.originalUrl;
  path = path.split("/")[1];
  let id = req.params.id;
  client.get(`${path}-${id}`, async (err, data) => {
    if (err) throw err;
    if (!data) return next();
    return res.json({ data: JSON.parse(data) });
  });
}

app.get("/people/:id", checkCache, async (req, res) => {
  let result = await axios.get(
    `https://swapi.dev/api/people/${req.params.id}/?format=json`
  );
  client.setEx(`people-${req.params.id}`, 1000, JSON.stringify(result.data));
  return res.json({ data: result.data });
});

app.get("/planets/:id", checkCache, async (req, res) => {
  let result = await axios.get(
    `https://swapi.dev/api/planets/${req.params.id}/?format=json`
  );
  client.setEx(`planets-${req.params.id}`, 1000, JSON.stringify(result.data));
  return res.json({ data: result.data });
});

app.get("/starships/:id", checkCache, async (req, res) => {
  let result = await axios.get(
    `https://swapi.dev/api/starships/${req.params.id}/?format=json`
  );
  client.set(`starships-${req.params.id}`, JSON.stringify(result.data));
  return res.json({ data: result.data });
});

app.listen(3000, () => console.log("Listening on port 3000..."));
