const Person = require("../model/person");
const pug = require('pug');
const Question = require("../model/question");
const Answer = require("../model/answer");
const { Op } = require('sequelize');
const sequelize = require('sequelize');

module.exports = function (app, i18n) {
  app.get("/rsvp/person", (req, res) => {
    var language = 'fr';
    if (req.getLocale() == 'en')
      language = 'en';
    i18n.locale = language;
    const firstname = req.query.firstname;
    const lastname = req.query.lastname;

    const trans = generateTranslation(i18n, language);

    Person.findOne({
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('firstname')), '=', firstname.toLowerCase().trim()),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('lastname')), '=', lastname.toLowerCase().trim())
        ]
      }
    }).then((person) => {
      if (person) {
        var response_object = { "persons": [], "questions": [], "translation": trans, "language": language };
        Person.findAll({ where: { family: person.family } }).then((family) => {
          person_ids = family.map(x => x.id);
          Answer.findAll({ where: { person_id: { [Op.or]: person_ids } } }).then((answers) => {
            Question.findAll().then((questions) => {
              var index = 0;
              for (p in family) {
                response_object["persons"].push({ "firstname": family[p].firstname, "lastname": family[p].lastname, "id": family[p].id })
                response_object["persons"][index]['answers'] = [];
                for (a in answers) {
                  if (answers[a].person_id == family[p].id) {
                    answer_object = { "person_id": answers[a].person_id, "question_id": answers[a].question_id, "id": answers[a].id, "answer": answers[a].answer }
                    response_object["persons"][index]['answers'].push(answer_object);
                  }
                }
                index++;
              }
              question_list = []
              for (q in questions) {
                var question = language == "fr" ? questions[q].question_fr : questions[q].question_en;
                var response_values = language == "fr" ? questions[q].response_values_fr : questions[q].response_values_en;
                question_object = { "id": questions[q].id, "question": question, "response_values": response_values, "response_type": questions[q].response_type, "successors": questions[q].successors, "order": questions[q].order }
                question_list.push(question_object);
              }
              response_object['questions'] = question_list;
              res.send(pug.render(`
div(id="base_get_div" class="container-md")
  div(class="separator")
  div(id="data_person" class="d-none") ${JSON.stringify(response_object)}
  button(id="save" class="btn btn-primary formbutton d-none") Save
`));
            });
          });
        });




      } else {
        return res.send(pug.render(`
form(hx-get="/rsvp/person?lang=`+ language + `" hx-swap="innerHTML swap:0.5s" hx-target="closest div" class="mb-3")
  p(class="formtextrsvp") `+ i18n.__('RSVPInfo') + `
  p(class="formtextrsvp alert alert-danger") `+ i18n.__('PersonNotFound') + `
  div(class="d-flex flex-row justify-content-center")
    div(class="d-flex flex-column align-items-start")
      label(class="formrsvp") `+ i18n.__('FirstName') + `
      input(type="text" name="firstname" placeholder="`+ i18n.__('FirstName') + `" class="inputrsvp") 
    div(class="d-flex flex-column align-items-start")
      label(class="formrsvp") `+ i18n.__('LastName') + `
      input(type="text" name="lastname" placeholder="`+ i18n.__('LastName') + `" class="inputrsvp") 
  div(class="d-flex flex-row justify-content-center")
    button(type="submit" class="btn btn-primary formbutton") `+ i18n.__('Next')));
      }

    });


  });

  app.post("/rsvp/save", async (req, res) => {
    console.log(req.body);
    if (req.body.length == 0) {
      res.status(400).send({ message: 'Body is empty' });
      return;
    }

    if (!Object.hasOwn(req.body[0], 'person_id')) {
      res.status(400).send({ message: 'No person id' });
      return;
    }

    var person_id = req.body[0].person_id;

    var answers = [];
    for (a in req.body) {
      var answer = req.body[a];
      if (answer.person_id != person_id) {
        res.status(400).send({ message: 'Inconsistent person id : ' + person_id + ' / ' + answer.person_id });
        return;
      }

      answers.push({ 'person_id': answer.person_id, 'question_id': answer.question_id, 'answer': answer.answer });
    }


    //Delete previous answers
    await Answer.destroy({
      where: {
        'person_id': person_id,
      },
    });

    await Answer.bulkCreate(answers);
    res.status(200).send({ message: 'Answers saved' })

  });
}

function generateTranslation(i18n, language) {
  return i18n.getCatalog(language);
}