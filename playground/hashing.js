const { SHA256 } = require("crypto-js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

var data = {
  id: 10
};

// const token = jwt.sign(data, "somesecret");
// console.log(token);

let password = "123abc!";
let hashedPass = "$2a$10$lMODzYa0emmDRNgEeo5rku5XER/3UhH3pR4WCbeA.E8Fa00DPapi6";

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  });
});

bcrypt.compare(password, hashedPass, (err, res) => {
  console.log("result: ", res);
});
// jwt.verify;

// var message = "I am user number 3";

// var hash = SHA256(message).toString();

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
//   id: 4
// };

// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + "somesecret").toString()
// };

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

// const resultHash = SHA256(JSON.stringify(token.data) + "somesecret").toString();

// if (resultHash === token.hash) {
//   console.log("Data was not changed");
// } else {
//   console.log("Data was changed. Do not trust!");
// }
