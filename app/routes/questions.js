const Question = require("../model/question");
const pug = require('pug');

module.exports = function (app) {
  app.delete("/d_question/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Question.findOne({ where: { id: id } }).then((question) => {
      question.destroy();
      return res.send("");
    });
  });

  app.get("/e_question/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Question.findOne({ where: { id: id } }).then((question) => {
      return res.send(pug.render(`
tr
  td
    ${id}
  td
    input(name="shorttitle" value=question.shorttitle)
  td
    input(name="question_en" value=question.question_en)
  td
    input(name="question_fr" value=question.question_fr)
  td
    input(name="response_type" value=question.response_type)
  td
    input(name="response_values_en" value=question.response_values_en)
  td
    input(name="response_values_fr" value=question.response_values_fr)
  td
    input(name="successors" value=question.successors)
  td
    input(name="order" value=question.order)
  td
    button(class="btn btn-primary" hx-get="/r_question/${id}") Cancel
  td
    button(class="btn btn-primary" hx-put="/u_question/${id}" hx-include="closest tr") Save`, { question: question }
      ));
    });
  });

  app.post("/c_question", checkAdmin(), async (req, res) => {
    const question = {
      shorttitle: req.body.shorttitle,
      question_en: req.body.question_en,
      question_fr: req.body.question_fr,
      response_type: req.body.response_type,
      response_values_en: req.body.response_values_en,
      response_values_fr: req.body.response_values_fr,
      successors: req.body.successors,
      order: req.body.order,
    };
    await Question.create(question).then((x) => {
      // send id of recently created item
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: x, model: Object.keys(Question.rawAttributes), objectname: "question" }
      ));
    });
  });


  app.get("/r_question/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Question.findOne({ where: { id: id } }).then((question) => {
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: question, model: Object.keys(Question.rawAttributes), objectname: "question" }
      ));
    });
  });

  app.put("/u_question/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    // update book
    await Question.findByPk(id).then((item) => {
      item
        .update({
          shorttitle: req.body.shorttitle,
          question_en: req.body.question_en,
          question_fr: req.body.question_fr,
          response_type: req.body.response_type,
          response_values_en: req.body.response_values_en,
          response_values_fr: req.body.response_values_fr,
          successors: req.body.successors,
          order: req.body.order,
        })
        .then(() => {
          return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: item, model: Object.keys(Question.rawAttributes), objectname: "question" }
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