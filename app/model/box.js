// represents the model

const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");

class Box extends Model { }

Box.init(
    {
        id: { // traditionnal unique id
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        title: { // The title of the box shown in the hmi
            type: DataTypes.STRING,
        },
        kind: { // There will be different kind of boxes for different behavior
            type: DataTypes.STRING,
			defaultValue: "Basic", // Basic boxes to contain other boxes or cards
			// Other values :
			//  - Tasks : Box containing dated tasks which can be recuring
			//  - Learning : Box containing flash cards that can be answered. If correctly answered, the card will be shown later, else it is shown the day after. Leitner.
        },
        details: { // 
            type: DataTypes.STRING,
        },
        parentId: { // Id of the parent box. Null if it is a top box.
            type: DataTypes.INTEGER,
        },
        childrenIds: { // Ids of the boxes contained inside this one.
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        modelName: "box",
        timestamps: false,
    }
);

module.exports = Box;
