// represents the model

const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");

class Question extends Model { }

Question.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        shorttitle: {
            type: DataTypes.STRING,
        },
        question_en: {
            type: DataTypes.STRING,
        },
        question_fr: {
            type: DataTypes.STRING,
        },
        response_type: {
            type: DataTypes.STRING,
        },
        response_values_en: {
            type: DataTypes.STRING,
        },
        response_values_fr: {
            type: DataTypes.STRING,
        },
        successors: {
            type: DataTypes.STRING,
        },
        order: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        modelName: "question",
        timestamps: false,
    }
);

module.exports = Question;
