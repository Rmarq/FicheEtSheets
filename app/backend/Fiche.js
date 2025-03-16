
const fiche = require("../model/fiche");

async function getFiche(id) {
    try {
        const res = await fiche.findOne({ where: { id: id } });
        return res || null;
    } catch (error) {
        console.error("Error fetching fiche:", error);
        return null;
    }
}

async function getChildren(boxId) {
    try {
        const res = await fiche.findAndCountAll({ where: { parentId: boxId } });
        return res || null;
    } catch (error) {
        console.error("Error fetching children of box:", error);
        return null;
    }
}

// Export functions
module.exports = {
    getFiche,
    getChildren
};