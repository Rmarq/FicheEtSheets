// represents the model

const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");

class Book extends Model { }

Book.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    author: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "book",
    timestamps: false,
  }
);

module.exports = Book;
