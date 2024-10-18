const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI)
  .then(async () => console.log("Connected to database"))
  .catch(console.log);
