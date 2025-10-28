require("dotenv").config()
const express = require("express");

const cors = require("cors");
const sequelize = require("./config/db");
const corsOptions=require("./config/cors")
const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const authRouter=require("./routes/authRouter.js")
const todosRouter=require("./routes/todoRouter.js")
const analyticsRouter=require("./routes/analyticsRouter");
const logger = require("./utils/logger.js");
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req,res) => {
  res.status(200).json({ success: true, message: "API check" });
});

app.use("/api/v1/auth",authRouter)
app.use("/api/v1/todos",todosRouter);
app.use("/api/v1/analytics",analyticsRouter);
sequelize.authenticate()
  .then(() => {
    logger.info("Database connected successfully");
    return sequelize.sync();
  })
  .then(() => {
    logger.info("Database synced successfully");
    app.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Error connecting/syncing database:", error);
  });
