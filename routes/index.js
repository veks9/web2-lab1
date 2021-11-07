var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
    req.user = {
        isAuthenticated: req.oidc.isAuthenticated()
    };
    if (req.user.isAuthenticated) {
        req.user.name = req.oidc.user.name;
        req.user.email = req.oidc.user.email;
    }

    res.render('index', { user: req.user });
});

module.exports = router;