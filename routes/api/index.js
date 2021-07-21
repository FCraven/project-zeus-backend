const router = require('express').Router();

router.get('/test', (req,res) => {
  res.send('<h1>This is a test of the api broadcasting system weeeooooo weeeeooooooo</h1>')
})

module.exports = router;
