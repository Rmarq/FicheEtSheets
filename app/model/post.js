// represents the model

const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");

class Post extends Model { }

Post.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        title_en: {
            type: DataTypes.STRING,
        },
        htmlcontent_en: {
            type: DataTypes.STRING,
        },
        title_fr: {
            type: DataTypes.STRING,
        },
        htmlcontent_fr: {
            type: DataTypes.STRING,
        },
        order: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        modelName: "post",
        timestamps: false,
    }
);

module.exports = Post;
