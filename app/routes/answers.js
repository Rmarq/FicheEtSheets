const Answer = require("../model/answer");
const pug = require('pug');

module.exports = function (app) {
  app.delete("/d_answer/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Answer.findOne({ where: { id: id } }).then((answer) => {
      answer.destroy();
      return res.send("");
    });
  });

  app.get("/e_answer/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Answer.findOne({ where: { id: id } }).then((answer) => {
      return res.send(pug.render(`
tr
  td
    ${id}
  td
    input(name="person_id" value=answer.person_id)
  td
    input(name="question_id	" value=answer.question_id)
  td
    input(name="answer" value=answer.answer)
  td
    button(class="btn btn-primary" hx-get="/r_answer/${id}") Cancel
  td
    button(class="btn btn-primary" hx-put="/u_answer/${id}" hx-include="closest tr") Save`, { answer: answer }
      ));
    });
  });

  app.post("/c_answer", checkAdmin(), async (req, res) => {
    const answer = {
      person_id: req.body.person_id,
      question_id: req.body.question_id,
      answer: req.body.answer,
    };
    await Answer.create(answer).then((x) => {
      // send id of recently created item
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: x, model: Object.keys(Answer.rawAttributes), objectname: "answer" }
      ));
    });
  });


  app.get("/r_answer/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Answer.findOne({ where: { id: id } }).then((answer) => {
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: answer, model: Object.keys(Answer.rawAttributes), objectname: "answer" }
      ));
    });
  });

  app.put("/u_answer/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    // update book
    await Answer.findByPk(id).then((item) => {
      item
        .update({
          person_id: req.body.person_id,
          question_id: req.body.question_id,
          answer: req.body.answer,
        })
        .then(() => {
          return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: item, model: Object.keys(Answer.rawAttributes), objectname: "answer" }
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