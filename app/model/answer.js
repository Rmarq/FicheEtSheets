// represents the model

const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");

class Answer extends Model { }

Answer.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        person_id: {
            type: DataTypes.INTEGER,
        },
        question_id: {
            type: DataTypes.INTEGER,
        },
        answer: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        modelName: "answer",
        timestamps: false,
    }
);

module.exports = Answer;
