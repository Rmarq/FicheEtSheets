// represents the model

const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");

class Box extends Model { }

Box.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
        },
        details: {
            type: DataTypes.STRING,
        },
        parentId: {
            type: DataTypes.INTEGER,
        },
        childrenIds: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
        },
    },
    {
        sequelize,
        modelName: "box",
        timestamps: false,
    }
);

module.exports = Box;
