const { Sequelize } = require("sequelize");
const persistent_path = process.env.PERSISTENT_STORAGE_DIR || ".";

const sequelize = new Sequelize("ushmi-db", "ushmi", "marquerie", {
  dialect: "sqlite",
  host: persistent_path + "/dev.sqlite",
});

module.exports = sequelize;
