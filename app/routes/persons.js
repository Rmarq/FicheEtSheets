const Person = require("../model/person");
const pug = require('pug');
const nanoid = require('nanoid-esm');

module.exports = function (app) {
  app.delete("/d_person/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Person.findOne({ where: { id: id } }).then((person) => {
      person.destroy();
      return res.send("");
    });
  });



  app.get("/e_person/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Person.findOne({ where: { id: id } }).then((person) => {
      return res.send(pug.render(`
tr
  td
    ${id}
  td
    input(name="firstname" value=person.firstname)
  td
    input(name="lastname" value=person.lastname)
  td
    input(name="family" value=person.family)
  td
    button(class="btn btn-primary" hx-get="/r_person/${id}") Cancel
  td
    button(class="btn btn-primary" hx-put="/u_person/${id}" hx-include="closest tr") Save`, { person: person }
      ));
    });
  });

  app.post("/c_person", checkAdmin(), async (req, res) => {
    var fam = req.body.family.replace(/[^(]*\((([^)]*))\)/, "$1");
    if (fam == "NEW") {
      fam = nanoid(8);
    }

    const person = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      family: fam,
    };
    await Person.create(person).then((x) => {
      // send id of recently created item
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: x, model: Object.keys(Person.rawAttributes), objectname: "person" }
      ));
    });
  });

  app.get("/refresh_select", checkAdmin(), async (req, res) => {
    const persons = await Person.findAndCountAll();

    var fammap = new Map();
    for (var i in persons.rows) {
      var p = persons.rows[i];
      if (!fammap.has(p.family)) {
        fammap[p.family] = p.firstname + ' ' + p.lastname + ' (' + p.family + ')';
        fammap.set(p.family, p.firstname + ' ' + p.lastname + ' (' + p.family + ')');
      }
    }

    return res.send(pug.render(`
select(class="form-select" name="family" aria-label="Default select example" id="selfam")
  option(value="(NEW)" selected) New family
  each fam in families
    option(value=\`\${ fam }\`)= fam`,
      { families: fammap }
    ));
  });


  app.get("/r_person/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Pperson.findOne({ where: { id: id } }).then((person) => {
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: person, model: Object.keys(Person.rawAttributes), objectname: "person" }
      ));
    });
  });

  app.put("/u_person/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    // update book
    await Person.findByPk(id).then((item) => {
      item
        .update({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          family: req.body.family,
        })
        .then(() => {
          return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: item, model: Object.keys(Person.rawAttributes), objectname: "person" }
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
}