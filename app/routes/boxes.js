//* To keep for admin page
const Box = require("../model/box");
const Fiche = require("../model/fiche");
//*/
const pug = require('pug');

const { Op } = require("sequelize");

const { checkAdmin, getLocale } = require("../backend/common");
const BoxUtils = require("../backend/Box");
const FicheUtils = require("../backend/Fiche");

module.exports = function (app) {

  // Route rendering a box.
  app.get("/fiches/:id?", async (req, res) => { // The '?' makes ':id' optional
    const id = req.params.id || null;
    var language = getLocale(req);
    if (id != null) {
      const currentBox = await BoxUtils.getBox(id);
      const childBoxes = await BoxUtils.getChildren(id);
      const childFiches = await FicheUtils.getChildren(id);
      return res.render("Box", { lang: language, childBoxes: childBoxes.rows, childFiches: childFiches.rows, current: currentBox });
    }
    const childBoxes = await BoxUtils.getChildren(null);
    return res.render("Box", { lang: language, childBoxes: childBoxes.rows, childFiches: null, current: null });
  });
  
  // Route rendering a box for edition.
  app.get("/EditBox/:parentId?/:id?", async (req, res) => { // The '?' makes ':id' optional
    const parentId = req.params.parentId || 0;
    const id = req.params.id || null;
    var language = getLocale(req);
    if (id != null) {
      const currentBox = await BoxUtils.getBox(id);
      return res.render("EditBox", { lang: language, parentId: parentId, current: currentBox }); // Editing the current box
    }
    return res.render("EditBox", { lang: language, parentId: parentId, current: null }); // creating a new box
  });

  // Route handleling save box.
  app.post("/saveBox", async (req, res) => {
    const { id, title, details, parentId } = req.body;
    console.log("saveBox id " + id + ", title " + title + ", details " + details + ", parentId " + parentId);

    try {
        let box;
        if (id) {
            // Updating existing box
            box = await BoxUtils.updateBox(id, { title, details, parentId });
        } else {
            // Creating a new box
            box = await BoxUtils.createBox({ title, details, parentId });
        }

        if (box) {
            res.redirect(`/fiches/${box.id}`);
        } else {
            res.status(500).send("Error saving the box.");
        }
    } catch (error) {
        console.error("Error saving box:", error);
        res.status(500).send("Internal server error.");
    }
  });


  // Route handling box drag/drop.
  app.post("/moveBox/:boxId/:newParentId", async (req, res) => {
    console.log("moveBox in boxes");
    const { boxId, newParentId } = req.params;
    if (await BoxUtils.moveBox(boxId, newParentId) != null) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
  });









// Routes for the admin pages
  app.delete("/d_box/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Box.findOne({ where: { id: id } }).then((box) => {
        box.destroy();
      return res.send("");
    });
  });

  app.get("/e_box/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Box.findOne({ where: { id: id } }).then((box) => {
      return res.send(pug.render(`
tr
  td
    ${id}
  td
    input(name="title" value=box.title)
  td
    input(name="kind" value=box.kind)
  td
    input(name="details" value=box.details)
  td
    input(name="parentId" value=box.parentId)
  td
    input(name="childrenIds" value=box.childrenIds)
  td
    button(class="btn btn-primary" hx-get="/r_box/${id}") Cancel
  td
    button(class="btn btn-primary" hx-put="/u_box/${id}" hx-include="closest tr") Save`, { box: box }
      ));
    });
  });

  app.post("/c_box", checkAdmin(), async (req, res) => {
    const box = {
      title: req.body.title,
      kind: req.body.kind,
      details: req.body.details,
      parentId: req.body.parentId,
      childrenIds: req.body.childrenIds,
    };
    await Box.create(box).then((x) => {
      // send id of recently created item
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: x, model: Object.keys(Box.rawAttributes), objectname: "box" }
      ));
    });
  });


  app.get("/r_box/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Box.findOne({ where: { id: id } }).then((box) => {
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: box, model: Object.keys(Box.rawAttributes), objectname: "box" }
      ));
    });
  });

  app.put("/u_box/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    // update book
    await Box.findByPk(id).then((item) => {
      item
        .update({
          title: req.body.title,
          kind: req.body.kind,
          details: req.body.details,
          parentId: req.body.parentId,
          childrenIds: req.body.childrenIds,
        })
        .then(() => {
          return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: item, model: Object.keys(Box.rawAttributes), objectname: "box" }
          ));
        });
    });
  });

// FIN Routes for the admin pages */



}