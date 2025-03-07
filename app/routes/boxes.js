const Box = require("../model/box");
const pug = require('pug');

module.exports = function (app) {
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

  function checkAdmin() {
    return (req, res, next) => {
      const reject = () => {
        res.setHeader("www-authenticate", "Basic");
        res.sendStatus(401);
      };

      const authorization = req.headers.authorization;

      if (!authorization) {
        return reject();
      }

      const [username, password] = Buffer.from(
        authorization.replace("Basic ", ""),
        "base64"
      )
        .toString()
        .split(":");

      if (!(username === "Rémi" && password === "Marquerie")) {
        return reject();
      }

      next();
    }
  }


// ###################################################### //
// ################# For Boxes edition ################# //
// ###################################################### //
app.post("/moveBox/:boxId/:newParentId", async (req, res) => {
  console.log("moveBox in boxes");
  const { boxId, newParentId } = req.params;
  try {
      await Box.update({ parentId: newParentId }, { where: { id: boxId } });
      res.json({ success: true });
  } catch (error) {
    console.log("error catched = " + error);
      res.json({ success: false, error: error.message });
  }
});


}