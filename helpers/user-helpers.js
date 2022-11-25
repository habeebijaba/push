var db = require('../configurations/connection');
var bcrypt = require('bcrypt');
var collection = require('../configurations/collections')
module.exports = {
    userSignup: (data) => {
        return new Promise(async (resolve, rejet) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: data.email })
            if (user) {
                resolve(response.status = false)
            } else {
                data.password = await bcrypt.hash(data.password, 10)
                console.log(data.password);
                db.get().collection(collection.USER_COLLECTION).insertOne(data).then((req, res) => {
                    resolve(response.status = true)
                })
            }
        })
    },
    userLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: data.email })
            if (user) {
                if (user.isBlocked) {
                    response.isBlocked = true;
                    console.log('it is blocked');
                    resolve(response)
                } else {
                    bcrypt.compare(data.password, user.password).then((status) => {
                        if (status) {
                            console.log('success');
                            response.user = user;
                            response.status = true;
                            resolve(response)
                        } else {
                            console.log('faied');

                            resolve({ status: false })
                        }
                    })
                }
            } else {
                console.log('not exist');

                resolve({ status: false })
            }
        })
    }













}