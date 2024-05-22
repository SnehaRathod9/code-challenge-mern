const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

mongoose
  .connect("mongodb+srv://slrathod99:sneha123@cluster0.dvw4y2x.mongodb.net", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/statistics", require("./routes/statistics"));
app.use("/api/barchart", require("./routes/barchart"));
app.use("/api/piechart", require("./routes/piechart"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
