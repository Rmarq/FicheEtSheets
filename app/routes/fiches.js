const Fiche = require("../model/fiche");
const pug = require("pug");

module.exports = function (app) {
  app.delete("/d_fiche/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Fiche.findOne({ where: { id: id } }).then((fiche) => {
      fiche.destroy();
      return res.send("");
    });
  });

  app.get("/e_fiche/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Fiche.findOne({ where: { id: id } }).then((fiche) => {
      var timeForInput = fiche.lastDone;
      if (timeForInput) {
        timeForInput.setMinutes(timeForInput.getMinutes() - timeForInput.getTimezoneOffset());
      }
      return res.send(pug.render(`
tr
  td
    ${id}
  td
    input(name="title" value=fiche.title)
  td
    input(name="kind" value=fiche.kind)
  td
    input(name="content" value=fiche.content)
  td
    input(name="parentId" value=fiche.parentId)
  td
    input(type="datetime-local" name="lastDone" value=timeForInput ? timeForInput.toISOString().slice(0, 16) : "")
  td
    button(class="btn btn-primary" hx-get="/r_fiche/${id}") Cancel
  td
    button(class="btn btn-primary" hx-put="/u_fiche/${id}" hx-include="closest tr") Save`, { fiche: fiche, timeForInput: timeForInput }
      ));
    });
  });

  app.post("/c_fiche", checkAdmin(), async (req, res) => {
    const fiche = {
      title: req.body.title,
      kind: req.body.kind,
      content: req.body.content,
      parentId: req.body.parentId,
      lastDone: req.body.lastDone ? new Date(req.body.lastDone) : null,
    };
    await Fiche.create(fiche).then((x) => {
      return res.send(pug.render(`
tr
  each m in model ? model : []
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname    
  td 
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete
`, { obj: x, model: Object.keys(Fiche.rawAttributes), objectname: "fiche" }));
    });
  });

  app.get("/r_fiche/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Fiche.findOne({ where: { id: id } }).then((fiche) => {
      return res.send(pug.render(`
tr
  each m in model ? model : []
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname    
  td 
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete
`, { obj: fiche, model: Object.keys(Fiche.rawAttributes), objectname: "fiche" }));
    });
  });

  app.put("/u_fiche/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Fiche.findByPk(id).then((item) => {
      item.update({
        title: req.body.title,
        kind: req.body.kind,
        content: req.body.content,
        parentId: req.body.parentId,
        lastDone: req.body.lastDone ? new Date(req.body.lastDone) : null,
      }).then(() => {
        return res.send(pug.render(`
tr
  each m in model ? model : []
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: item, model: Object.keys(Fiche.rawAttributes), objectname: "fiche" }
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
    };
  }
};
