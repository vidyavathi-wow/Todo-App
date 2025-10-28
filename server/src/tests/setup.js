
require("dotenv").config();
const sequelize=require("../config/db")



beforeAll(async () => {
  await sequelize.sync({ force: true, alter: true });
});

afterAll(async () => {
  await sequelize.close();
});
