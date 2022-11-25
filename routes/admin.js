var express = require('express');
const { Db } = require('mongodb');
const { response } = require('../app');
const { getAllCategories } = require('../helpers/admin-helpers');
const adminHelpers = require('../helpers/admin-helpers');
var router = express.Router();
const adminHelper = require('../helpers/admin-helpers')
const productHelper = require('../helpers/product-helpers')
var fs = require('fs')

//admin login credentials
const credentials = { email: "habeebav841@gmail.com", password: 123 }
//middleware to check is admin logeed in
const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

//setting layout for admin side seperate...
// const setAdminLayout=(req,res,next)=>{
// res.locals.layout='adminlayout'
// next()
// }
//using admin layout...
// router.use(setAdminLayout)

/* GET admin listing. */
router.get('/', verifyLogin, function (req, res, next) {
  let adminsession = req.session.admin
  res.render('admin/dashboard', { admin: true, adminsession })
});

router.get('/login', (req, res, next) => {
  if (req.session.admin) {
    res.redirect('/admin')
  } else {
    res.render('admin/admin_login', { admin: true, adminLoginError: req.session.adminLoginError })
    req.session.adminLoginError = false
  }
})

router.post('/login', (req, res) => {
  if (credentials.email == req.body.email && credentials.password == req.body.password) {
    req.session.loggedIn = true
    req.session.admin = req.body
    res.redirect('/admin')
  } else {
    req.session.adminLoginError = true
    res.redirect('/admin/login')
  }
})
// router.post('/login', (req, res) => {
//   adminHelper.adminLogin(req.body).then((response) => {
//     if (response.status) {
//       req.session.loggedIn = true
//       req.session.admin = response.user
//       res.redirect('/admin')

//     } else {
//       res.redirect('/admin/login')
//     }

//   })

// })

router.get('/user-management', verifyLogin, (req, res, next) => {
  adminHelpers.getAllUsers().then((allUsers) => {
    // console.log(allUsers);
    res.render('admin/user_management', { admin: true, allUsers })
  })
})

router.get('/block-user/:_id', verifyLogin, (req, res) => {
  let id = req.params._id
  console.log(id);
  adminHelpers.blockUser(id).then((response) => {
    console.log(response);
    res.redirect('/admin/user-management')
  })
})

router.get('/unblock-user/:_id', verifyLogin, (req, res) => {
  let id = req.params._id
  adminHelpers.unblockUser(id).then((response) => {
    res.redirect('/admin/user-management')
  })
})

router.get('/category-management', verifyLogin, (req, res) => {
  adminHelper.getAllCategories().then((allCategories) => {
    res.render('admin/category_management', { admin: true, allCategories })
  })
})

router.get('/add-category', verifyLogin, (req, res) => {
  res.render('admin/add_category', { admin: true, CategoryRedundanyError: req.session.CategoryRedundanyError })
  req.session.CategoryRedundanyError = false
})

router.post('/add-category', (req, res) => {
  adminHelper.addCategory(req.body).then((response) => {
    // console.log(response);
    if (response.status) {
      res.redirect('/admin/category-management')
    } else {
      req.session.CategoryRedundanyError = true
      res.redirect('/admin/add-category')
    }
  })
})

router.get('/delete-category/:_id', verifyLogin, (req, res) => {
  let id = req.params._id
  adminHelper.deleteCategory(id).then((response) => {
    res.redirect('/admin/category-management')

  })
})

router.get('/product-management', verifyLogin, (req, res, next) => {
  productHelper.getAllProducts().then((allProducts) => {
    res.render('admin/product_management', { admin: true, allProducts })
  })
})

router.get('/add-product', verifyLogin, (req, res) => {
  adminHelper.getAllCategories().then((allCategories) => {
    res.render('admin/add_product', { admin: true, allCategories, productRedundancyError: req.session.productRedundancyError })
    req.session.productRedundancyError = false
  })
})

router.post('/add-product', (req, res) => {
  productHelper.addProduct(req.body).then((response) => {
    let id = response.insertedId
    let image1 = req.files.image1
    let image2 = req.files.image2
    let image3 = req.files.image3
    let image4 = req.files.image4
    image1.mv('./public/product-images/' + id + '1.jpg')
    image2.mv('./public/product-images/' + id + '2.jpg')
    image3.mv('./public/product-images/' + id + '3.jpg')
    image4.mv('./public/product-images/' + id + '4.jpg')
    res.redirect('/admin/product-management')
  }).catch(() => {
    req.session.productRedundancyError = true
    res.redirect('/admin/add-product')
  })
})

router.get('/delete-product/:id', verifyLogin, (req, res) => {
  let id = req.params.id
  console.log(id);
  productHelper.deleteProduct(id).then(() => {
    res.redirect('/admin/product-management')
    fs.unlinkSync('public/product-images/' + id + '1.jpg')
    fs.unlinkSync('public/product-images/' + id + '2.jpg')
    fs.unlinkSync('public/product-images/' + id + '3.jpg')
    fs.unlinkSync('public/product-images/' + id + '4.jpg')
  })
})

router.get('/edit-product/:id', verifyLogin, async (req, res) => {
  let id = req.params.id
  let allCategories = await adminHelper.getAllCategories()
  productHelper.getProductDetails(id).then((productDetails) => {
    res.render('admin/edit-product', { admin: true, productDetails, allCategories })
  })
})
router.post('/edit-product', (req, res) => {
  let id = req.body._id
  productHelper.editProduct(req.body).then(() => {
    if (req.files.image1) {
      let image1 = req.files.image1
      image1.mv('./public/product-images/' + id + '1.jpg')
    }
    if (req.files.image2) {
      let image2 = req.files.image2
      image2.mv('./public/product-images/' + id + '2.jpg')
    }
    if (req.files.image3) {
      let image3 = req.files.image3
      image3.mv('./public/product-images/' + id + '3.jpg')
    }
    if (req.files.image4) {
      let image4 = req.files.image4
      image4.mv('./public/product-images/' + id + '4.jpg')
    }
    res.redirect('/admin/product-management')
  })
})
router.get('/logout', (req, res) => {
  req.session.admin = null
  res.redirect('/admin/login')
})








module.exports = router;
