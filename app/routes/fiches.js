
const { Op } = require("sequelize");

const Box = require("../model/box");
const Fiche = require("../model/fiche");
const pug = require("pug");

module.exports = function (app) {

  
// ###################################################### //
// ################# Pages showing Fiche ################# //
// ###################################################### //
app.get("/fiche/:id?", async (req, res) => { // The '?' makes ':id' optional
  const id = req.params.id || null;
  var language = 'fr';
  if (req.getLocale() == 'en')
    language = 'en';
  if (id != null) {
    const currentFiche = await Fiche.findOne({ where: { id: id } });
    const currentBox = await Box.findOne({ where: { id: currentFiche.parentId } });
    return res.render("fiche", { lang: language, currentFiche: currentFiche, currentBox: currentBox });
  }
  const childBoxes = await Box.findAndCountAll({ where: { parentId: { [Op.or]: [null, ""]}  } });
  return res.render("fiches", { lang: language, childBoxes: childBoxes.rows, childFiches: null, current: null });
});
app.get("/editFiche/:id?", async (req, res) => { // The '?' makes ':id' optional
  const id = req.params.id || null;
  var language = 'fr';
  if (req.getLocale() == 'en')
    language = 'en';
  if (id != null) {
    const currentFiche = await Fiche.findOne({ where: { id: id } });
    const currentBox = await Box.findOne({ where: { id: currentFiche.parentId } });
    return res.render("editFiche", { lang: language, currentFiche: currentFiche, currentBox: currentBox });
  }
  const childBoxes = await Box.findAndCountAll({ where: { parentId: { [Op.or]: [null, ""]}  } });
  return res.render("fiches", { lang: language, childBoxes: childBoxes.rows, childFiches: null, current: null });
});
  
// ###################################################### //
// ################# For Fiches edition ################# //
// ###################################################### //


app.get("/editTitle/:id", async (req, res) => {
  const fiche = await Fiche.findByPk(req.params.id);
  res.send(`
      <form hx-post="/saveTitle/${fiche.id}" hx-target="closest .header-title">
          <input type="text" name="title" value="${fiche.title}" class="form-control d-inline w-auto">
          <button type="submit" class="btn btn-success btn-sm"><i class="bi bi-check"></i></button>
          <button type="button" class="btn btn-danger btn-sm" hx-get="/cancelTitle/${fiche.id}" hx-target="closest .header-title">
              <i class="bi bi-x"></i>
          </button>
      </form>
  `);
});

app.post("/saveTitle/:id", async (req, res) => {
  const { title } = req.body;
  await Fiche.update({ title }, { where: { id: req.params.id } });
  res.send(pug.render(`
h1= '${title}'
.button-group
  a(hx-get="/editTitle/${req.params.id}" hx-target="closest .header-title" class="btn btn-primary btn-sm ms-2")
      i(class="bi bi-pencil-fill")
  a(href="/fiche/${req.params.id}", class="btn btn-secondary ms-2")
      i(class="bi bi-arrow-left-circle-fill")`));
});

app.get("/cancelTitle/:id", async (req, res) => {
  const fiche = await Fiche.findByPk(req.params.id);
  res.send(pug.render(`
h1= '${fiche.title}'
.button-group
  a(hx-get="/editTitle/${fiche.id}" hx-target="closest .header-title" class="btn btn-primary btn-sm ms-2")
      i(class="bi bi-pencil-fill")
  a(href="/fiche/${fiche.id}", class="btn btn-secondary ms-2")
      i(class="bi bi-arrow-left-circle-fill")`));
});

app.get("/editContent/:id/:index", async (req, res) => {
  const fiche = await Fiche.findByPk(req.params.id);
  const parts = fiche.content.split(";;");
  const index = parseInt(req.params.index, 10);
  var i = 0;
  while (i < parts.length) {
    i++;
  }
  i = index + 1;
  const tag = parts[index] || "";
  const text = parts[index + 1] || "";
  if (tag === "p") {
    const lineCount = text.split("\n").length;
    const textareaRows = Math.max(lineCount + 1, 2); // At least 2 rows
    res.send(`
        <form hx-post="/saveContent/${fiche.id}/${req.params.index}" hx-target="closest .header-title">
            <textarea id="text" name="text" value="${text}" class="form-control" rows="${textareaRows}" 
                        oninput="autoExpand(this)">${text}</textarea>
            <button type="submit" class="btn btn-success btn-sm"><i class="bi bi-check"></i></button>
            <button type="button" class="btn btn-danger btn-sm" hx-get="/cancelContent/${fiche.id}/${req.params.index}" hx-target="closest .header-title">
                <i class="bi bi-x"></i>
            </button>
        </form>
        <script>
            function autoExpand(textarea) {
                textarea.style.height = 'auto'; 
                textarea.style.height = (textarea.scrollHeight + 10) + 'px'; 
            }
            document.addEventListener("DOMContentLoaded", function() {
                const textarea = document.getElementById("text");
                if (textarea) autoExpand(textarea); // Expand on load
            });
        </script>
    `);
  } else {
    res.send(`
        <form hx-post="/saveContent/${fiche.id}/${req.params.index}" hx-target="closest .header-title">
            <input type="text" name="text" value="${text}" class="form-control d-inline w-auto">
            <button type="submit" class="btn btn-success btn-sm"><i class="bi bi-check"></i></button>
            <button type="button" class="btn btn-danger btn-sm" hx-get="/cancelContent/${fiche.id}/${req.params.index}" hx-target="closest .header-title">
                <i class="bi bi-x"></i>
            </button>
        </form>
    `);
  }
});

app.post("/saveContent/:id/:index", async (req, res) => {
  const fiche = await Fiche.findByPk(req.params.id);
  const index = parseInt(req.params.index, 10);
  let parts = fiche.content.split(";;");
  parts[index + 1] = req.body.text;
  const updatedContent = parts.join(";;");

  await Fiche.update({ content: updatedContent }, { where: { id: req.params.id } });
  
  var tag = parts[index];
  var text = parts[index + 1];
  var content = "<p>";
  if (tag === "p") {
    content = "<p>" + text + "</p>";
  } else if (tag === "h2") {
    content = "<h2>" + text + "</h2>";
  } else if (tag === "h3") {
    content = "<h3>" + text + "</h3>";
  } else if (tag === "l") {
    content = "<ul>"
    let listParts = text.split(";&");
    listParts.forEach(element => {
      content += "<li>" + element + "</li>";
    });
    content += "</ul>";
  }

  res.send(`
      ${content}
      <a hx-get="/editContent/${req.params.id}/${index}" hx-target="closest .header-title" class="btn btn-primary btn-sm ms-2">
          <i class="bi bi-pencil-fill"></i>
      </a>
  `);
});

app.get("/cancelContent/:id/:index", async (req, res) => {
  const fiche = await Fiche.findByPk(req.params.id);
  const index = parseInt(req.params.index, 10);
  const parts = fiche.content.split(";;");
  var tag = parts[index];
  //var text = parts[index + 1];
  var text = parts[index + 1].replace(/'/g, "\\'").replace(/\n/g, "&#10;");
  var content = text;
  if (tag === "p") {
    content = "p= '" + text +"'";
  } else if (tag === "h2") {
    content = "h2= '" + text +"'";
  } else if (tag === "h3") {
    content = "h3= '" + text +"'";
  } else if (tag === "l") {
    //content = "ul= '" + text +"'";

    
    content = "ul" + "\n";
    let listParts = text.split(";&");
    listParts.forEach(element => {
      content += "    li= '" + element + "'\n";
    });

  }
  res.send(pug.render(`
${content}
a(hx-get="/editContent/${req.params.id}/${index}" hx-target="closest .header-title" class="btn btn-primary btn-sm ms-2")
  i(class="bi bi-pencil-fill")`));
});




  // Routes for admin page
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
