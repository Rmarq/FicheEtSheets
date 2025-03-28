
const { Op } = require("sequelize");

const box = require("../model/box");


//##########################################//
//########### Private functions ############//
//##########################################//
function checkId(id) {
    if (!(Number.isFinite(Number(id)) && Number(id) > 0)) {
        id = "";
    }
    return id;
}

async function checkIdExist(id) {
    if (!(Number.isFinite(Number(id)) && Number(id) > 0)) {
        id = "";
    }
    if (id != "") {
        const parentBox = await box.findOne({ where: { id: id } });

        // If parent does not exist, set parentId to an empty string
        if (!parentBox) {
            id = "";
        }
    }
    return id;
}

//##########################################//
//########## Exported functions ############//
//##########################################//
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
async function createBox(data) {
    data.parentId =  await checkIdExist(data.parentId);
    try {
        return await box.create(data);
    } catch (error) {
        console.error("Error creating box:", error);
        return null;
    }
}

async function updateBox(id, data) {
    data.parentId =  await checkIdExist(data.parentId);
    try {
        await box.update(data, { where: { id } });
        return await getBox(id);
    } catch (error) {
        console.error("Error updating box:", error);
        return null;
    }
}

async function moveBox(boxId, newParentBoxId) {
    newParentBoxId = checkId(newParentBoxId);
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
    createBox,
    updateBox,
    moveBox
};