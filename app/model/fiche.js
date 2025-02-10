// represents the model

const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");

class Fiche extends Model { }

Fiche.init(
    {
        id: { // traditionnal unique id
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        title: { // The title of the Fiche shown in the hmi
            type: DataTypes.STRING,
        },
        kind: { // There will be different kind of Fiches for different behavior
            type: DataTypes.STRING,
			defaultValue: "Basic", // Basic Fiche to contain plain text
			// Other values :
			//  - Learn : Fiche to Learn something, should be in a Learning Box
			//  - Recipe : Fiche for cooking recipe.
        },
        content: { // the html content of the fiche
            type: DataTypes.STRING,
        },
        parentId: { // Id of the parent box. Null if it is not in a box.
            type: DataTypes.INTEGER,
        },
        lastDone: { // Stores the last time the "Fiche" was completed
            type: DataTypes.DATE,
            allowNull: true, // This allows the field to be empty initially
        },
    },
    {
        sequelize,
        modelName: "fiche",
        timestamps: false,
    }
);

module.exports = Fiche;
