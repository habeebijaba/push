var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helpers')
const productHelper = require('../helpers/product-helpers')
const adminHelper = require('../helpers/admin-helpers');
const { response } = require('../app');
const { Code } = require('mongodb');

//credentials for twilio otp login...
// const serviceSID = ""
// const accountSID = ""
// const authToken = ""
// const client = require('twilio')(accountSID, authToken)

/* GET users page. */
router.get('/', function (req, res, next) {
  let user = req.session.user
  res.render('user/index', { user });
});

router.get('/signup', (req, res) => {
  res.render('user/user_signup', { mailRedundancyError: req.session.mailRedundancyError })
  req.session.mailRedundancyError = false
})

router.post('/signup', (req, res) => {
  userHelper.userSignup(req.body).then((status) => {
    if (status) {
      res.redirect('/login')
    } else {
      req.session.mailRedundancyError = true
      res.redirect('/signup')
    }
  })
})

router.get('/login', (req, res) => {
  res.render('user/user_login', { loginError: req.session.loginError, blockError: req.session.blockError })
  req.session.loginError = false
  req.session.blockError = false
})

router.post('/login', (req, res) => {
  userHelper.userLogin(req.body).then((response) => {
    if (response.isBlocked) {
      req.session.blockError = true
      res.redirect('/login')
    } else {
      if (response.status) {
        req.session.loggedIn = true
        req.session.user = response.user
        res.redirect('/')
      } else {
        req.session.loginError = true
        res.redirect('/login')
      }
    }
  })
})

router.get('/otp-login', (req, res) => {
  res.render('user/otp_login', {})

})

router.post('/otp-login', (req, res) => {
  client.verify
    .services(serviceSID)
    .verifications.create({
      to: `+91${req.body.phone}`,
      channel: "sms"
    }).then((response) => {
      // console.log(response);
      res.render('user/enter_otp', { phone: req.body.phone })
    }).catch((e) => {
      console.log(e);
      console.log('failedd');
    })
})

router.get('/enter-otp', (req, res) => {
  res.render('user/enter_otp', { invalidOtpError: req.session.invalidOtpError })
  req.session.invalidOtpError = false
})

router.post('/enter-otp', (req, res) => {
  let otp = req.body.otp
  let phone = req.body.phone
  console.log(otp);
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: `+91${phone}`,
      code: otp
    }).then((response) => {
      console.log('haiiii');
      console.log(response);
      let valid = response.valid
      if (valid) {
        res.redirect('/')
      } else {
        req.session.invalidOtpError = true
        res.redirect('/enter-otp')
      }
    }).catch((err) => {
      console.log(err);
    })
})

router.get('/view-products', (req, res) => {
  productHelper.getAllProducts().then(async (allProducts) => {
    // console.log(allProducts);
    let allCategories = await adminHelper.getAllCategories()
    console.log(allCategories);
    let user = req.session.user
    res.render('user/view_products', { allProducts, allCategories, user })
  })
})

router.get('/product-details/:id', async (req, res) => {
  let id = req.params.id
  productDetails = await productHelper.getProductDetails(id)
  let user = req.session.user
  res.render('user/product_details', { productDetails, user })
})










module.export