const Post = require("../model/post");
const pug = require('pug');

module.exports = function (app) {
  app.delete("/d_post/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Post.findOne({ where: { id: id } }).then((post) => {
      post.destroy();
      return res.send("");
    });
  });

  app.get("/e_post/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Post.findOne({ where: { id: id } }).then((post) => {
      return res.send(pug.render(`
tr
  td
    ${id}
  td
    input(name="title_en" value=post.title_en)
  td
    input(name="htmlcontent_en" value=post.htmlcontent_en)
  td
    input(name="title_fr" value=post.title_fr)
  td
    input(name="htmlcontent_fr" value=post.htmlcontent_fr)
  td
    input(name="order" value=post.order)
  td
    button(class="btn btn-primary" hx-get="/r_post/${id}") Cancel
  td
    button(class="btn btn-primary" hx-put="/u_post/${id}" hx-include="closest tr") Save`, { post: post }
      ));
    });
  });

  app.post("/c_post", checkAdmin(), async (req, res) => {
    const post = {
      title_en: req.body.title_en,
      htmlcontent_en: req.body.htmlcontent_en,
      title_fr: req.body.title_fr,
      htmlcontent_fr: req.body.htmlcontent_fr,
      order: req.body.order,
    };
    await Post.create(post).then((x) => {
      // send id of recently created item
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: x, model: Object.keys(Post.rawAttributes), objectname: "post" }
      ));
    });
  });


  app.get("/r_post/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    await Post.findOne({ where: { id: id } }).then((post) => {
      return res.send(pug.render(`
tr
  each m in model ? model : [] 
    td= obj[m]
  td
    button(class="btn btn-primary" hx-get=\`/e_\${objectname}/\${obj.id}\`)= "Edit " + objectname
  td
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: post, model: Object.keys(Post.rawAttributes), objectname: "post" }
      ));
    });
  });

  app.put("/u_post/:id", checkAdmin(), async (req, res) => {
    const id = req.params.id;
    // update book
    await Post.findByPk(id).then((item) => {
      item
        .update({
          title_en: req.body.title_en,
          htmlcontent_en: req.body.htmlcontent_en,
          title_fr: req.body.title_fr,
          htmlcontent_fr: req.body.htmlcontent_fr,
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
    button(class="btn btn-primary" hx-delete=\`/d_\${objectname}/\${obj.id}\`) Delete`, { obj: item, model: Object.keys(Post.rawAttributes), objectname: "post" }
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