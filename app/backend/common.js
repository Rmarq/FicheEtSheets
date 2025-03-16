
function getLocale(req) {
        
    var language = 'fr';
    if (req.getLocale() == 'en') {
      language = 'en';
    }
    return language;
}

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

// Export functions
module.exports = {
    getLocale,
    checkAdmin
};