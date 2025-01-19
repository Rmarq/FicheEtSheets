// represents the model

const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");

class Person extends Model { }

Person.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        firstname: {
            type: DataTypes.STRING,
        },
        lastname: {
            type: DataTypes.STRING,
        },
        family: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        modelName: "person",
        timestamps: false,
    }
);

module.exports = Person;
