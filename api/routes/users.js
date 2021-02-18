const express = require('express');
const router = express.Router();
const Users = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtConf = require('../config/jwt');

router.post('/', function (req, res) {
  let requestBody = req.body;
  console.log('requestBody', requestBody)
  if (requestBody && (!requestBody.username || !requestBody.password || !requestBody.email)) {
    res.json({
      success: false, message: 'Invalid Input Data'
    });
  } else {
    getUserByEmail(requestBody.email, async (data, err) => {
      console.log('data in call back', data, err)
      if (!err) {
        if (data && data.length > 0) {
          res.json({
            success: false, message: 'User already exist for this E-mail'
          })
        } else {
          await bcrypt.hash(requestBody.password, 10).then(data => requestBody.password = data);
          console.log('hashed password', requestBody.password);
          const userModel = new Users(requestBody);
          console.log('userModel::', userModel);
          Users.create(userModel).then(data => {
            console.log(data)
            res.json({
              success: true, message: 'User saved successfully', data: data
            })
          }).catch(err => {
            console.log(err)
            res.json({
              success: false, message: 'Failed to save User'
            })
          });
        }
      } else {
        res.json({
          success: false, message: 'Failed to save User'
        })
      }
    });
  }
});

function getUserByEmail(email, callback) {
  Users.find({ email: email }).then(data => {
    console.log('get user by email::', data)
    callback(data, null);
  }).catch(err => {
    console.log('Err in getting user by email ', err)
    callback(null, err);
  })
}

router.get('/getUserByEmail/:email', function (req, res) {
  let email = req.params.email;
  if (!email) {
    res.json({
      success: false,
      message: 'Invalid Request Params'
    });
  } else {
    getUserByEmail(email, (data, err) => {
      if (err) {
        res.json({
          success: false, message: 'Unable to retrive records'
        });
      } else if (data && data.length == 1) {
        console.log('----', data)
        res.json({
          success: true, data: data[0]
        })
      } else if (data && data.length == 0) {
        res.json({
          success: true, message: 'No records found for this E-mail'
        });
      }
    })
  }
});

router.get('/getAllUsers', function (req, res) {
  console.log('inside in')
  Users.find({}).then(data => {
    console.log(data)
    res.json({ success: true, data: data });
  }).catch(err => {
    console.log('err in getAllUsers', err)
    res.json({
      success: false, message: 'Error in retriving records'
    });
  });
});

router.put('/updateUser', async function (req, res) {
  let requestBody = req.body;
  console.log('requestBody', requestBody)
  if (requestBody && (!requestBody.id || !requestBody.username || !requestBody.password || !requestBody.email)) {
    res.json({
      success: false, message: 'Invalid Input Data'
    });
  } else {
    await bcrypt.hash(requestBody.password, 10).then(data => requestBody.password = data);
    console.log(' requestBody.password', requestBody.password) 
    Users.findByIdAndUpdate(requestBody.id, requestBody, { new: true }, (err, data) => {
      if (err) {
        console.log('err in update user', err)
        res.json({
          success: false, message: 'Unable to Update User'
        });
      }
      console.log(data);
      res.json({ success: true, message: 'User updated successfully', data: data });
    });
  }
});

router.put('/updateUserData', async function (req, res) {
  let requestBody = req.body;
  console.log('requestBody', requestBody)
  if (requestBody && (!requestBody.id || !requestBody.username || !requestBody.email)) {
    res.json({
      success: false, message: 'Invalid Input Data'
    });
  } else {
    Users.findById(requestBody.id, (err, data) => {
      let list = Object.keys(requestBody);
      for (i = 0; i < list.length; i++) {
        if (data[list[i]]) {
          data[list[i]] = requestBody[list[i]];
        }
      }
      Users.replaceOne({ _id: requestBody.id }, data, (err, data1) => {
        if (err) {
          console.log('err in update user', err)
          res.json({
            success: false, message: 'Unable to Update User'
          });
        } else if (data1 && data1.ok) {
          res.json({ success: true, message: 'User updated successfully', data: data });
        }
      })
    })
  }
});

router.delete('/deleteUser/:email', (req, res) => {
  let email = req.params.email;
  if (!email) {
    res.json({
      success: false, message: 'Invalid params'
    });
  }
  Users.findOneAndDelete({ email: email }, (err, data) => {
    console.log(err, data)
    if (err) {
      res.json({
        success: false, message: 'Unable to delete the user.'
      });
    }
    if (!data) {
      res.json({
        success: false, message: 'User not found for this E-mail'
      });
    } else {
      res.json({
        success: true, message: 'User deleted successfully.'
      });
    }
  });
});

router.get("/getUserDetails/:userToken", (req, res) => {
  let token1 = req.params.userToken;
  let token2 = token1.slice(4, token1.length);
  jwt.verify(token2, jwtConf.secret, function (err, decoded) {
      if (err) {
        res.json({
          success: false, message: 'Invalid Token.'
        });
      }
      if(decoded.user.email){
        getUserByEmail(decoded.user.email,(userDetails)=>{
          if(userDetails.length > 0) {
            res.json({
              success: true, data: userDetails[0]
            });
          }
        })
      }
  });
});


module.exports = router;
