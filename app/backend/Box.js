
const { Op } = require("sequelize");

const box = require("../model/box");

async function getBox(id) {
    //return box.findOne({ where: { id: id } });
    
    try {
        const res = await box.findOne({ where: { id: id } });
        return res || null;
    } catch (error) {
        console.error("Error fetching box:", error);
        return null;
    }
}

async function getChildren(parentBoxId) {
    if (parentBoxId != null)
        try {
            const res = await box.findAndCountAll({ where: { parentId: parentBoxId } });
            return res || null;
        } catch (error) {
            console.error("Error fetching children of box:", error);
            return null;
        }
    try {
        const res = await box.findAndCountAll({ where: { parentId: { [Op.or]: [null, ""] } } });
        return res || null;
    } catch (error) {
        console.error("Error fetching children of box:", error);
        return null;
    }
}

async function moveBox(boxId, newParentBoxId) {
    try {
        const res = await box.update({ parentId: newParentBoxId }, { where: { id: boxId } });
        return res || null;
    } catch (error) {
        console.error("Error moving box:", error);
        return null;
    }
}

// Export functions
module.exports = {
    getBox,
    getChildren,
    moveBox
};