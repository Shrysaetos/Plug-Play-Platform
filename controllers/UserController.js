const jwt = require("jsonwebtoken");
const sql = require("mssql");
const scrypt = require("scrypt-kdf");

//Hashing pw
const asyncGetPasswordKDF = async function (password) {
  //var key = Buffer.from(password); //could also be a string

  //Asynchronous
  const keyBuf = await scrypt.kdf(password, { logN: 15 });
  const keyStr = keyBuf.toString("base64");

  return keyStr;
};

//Verifying pw
const asyncVerifyPasswordKDF = async function (passwordKdf, password) {
  try {
    //const keyBuf = await scrypt.kdf(user.password, { logN: 15 });
    const keyBuf = Buffer.from(passwordKdf, "base64");
    const ok = await scrypt.verify(keyBuf, password);
    return ok;
  } catch (error) {
    console.log(error);
  }
};

const getUserByUsername = async (req, res, next) => {
  const username = req.params.username;

  var request = new sql.Request();

  request.input("username", sql.VarChar, username);

  await request
    .query("select * from users WHERE username= @username")
    .then((results) => {
      const user = results.recordset[0];
      // return 401 status if the credential is not match.
      if (!user) {
        return next(
          new Error("Could not find a user for the provided username.", 404)
        );
      }

      const name = user.name;
      // return the token along with user details
      return res.status(201).json({ name });
    })
    .catch((err) => {
      console.log(err);
    });

  console.log("Getting user " + username);
};

const createUser = async (req, res, next) => {
  const { name, password, email} = req.body;

  const createdUser = {
    name,
    email,
    passwordKdf: await asyncGetPasswordKDF(password),
  };

  var request = new sql.Request();

  request.input("name", sql.VarChar, createdUser.name);
  request.input("email", sql.VarChar, createdUser.email);
  request.input("passwordKdf", sql.VarChar, createdUser.passwordKdf);

  await request
    .query(
      "INSERT INTO USERS VALUES (@name, @email, @passwordKdf)"
    )
    .then((results) => {
      return res.status(201).json({ createdUser });
    })
    .catch((err) => {
      console.log(err);
    });
};

const loginUser = async (req, res, next) => {

  try {
    const { email, password } = req.body;

  // return 400 status if username/password is not exist
  if (!email || !password) {
    return next(new Error("Username and Password required.", 400));
  }

  var request = new sql.Request();

  request.input("email", sql.VarChar, email);

  await request
    .query("select * from USERS WHERE email= @email")
    .then(async (results) =>{
      console.log(email);
      console.log(results.recordset[0]);
      const user = results.recordset[0];
      // return 401 status if the credential is not match.
      if (!user) {
        return next(
          new Error(
            "Username and/or Password is wrong. Please try again.",
            404
          )
        );
      }

      await asyncVerifyPasswordKDF(user.passwordKdf, password).then((ok) => {
        // return 401 status if the credential is not match.
        if (ok === false) {
          return next(
            new Error(
              "Username and/or Password is wrong. Please try again",
              401
            )
          );
        } else {
          // generate token
          const token = jwt.sign(
            { userId: user.userID, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h", // expires in 1 hour
            }
          );

          // return the token along with user details
          return res.status(201).json({
            id: user.userID,
            name: user.name,
            email: user.email,
            token: token,
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
  } catch (error) {
      console.log(error);
  }
  
};

const updatePasswordByUsername = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const username = req.params.username;

  const newPasswordKdf = await asyncGetPasswordKDF(newPassword);

  if (!currentPassword || !newPassword) {
    return next(new Error("You need to fill all the fields.", 400));
  }

  var request = new sql.Request();

  request.input("username", sql.VarChar, username);

  await request
    .query("SELECT passwordKdf from users WHERE username= @username")
    .then(async (results) => {
      const passwordKdf = results.recordset[0].passwordKdf;

      // return 401 status if the credential is not match.
      if (!passwordKdf) {
        return next(
          new Error(
            "Something went fetching user information, please try again.",
            404
          )
        );
      }

      await asyncVerifyPasswordKDF(passwordKdf, currentPassword).then(
        async (ok) => {
          // return 401 status if the credential is not match.
          if (ok === false) {
            return next(
              new Error("Current password is wrong. Please try again", 401)
            );
          } else {
            request = new sql.Request();

            request.input("username", sql.VarChar, username);
            request.input("newPasswordKdf", sql.VarChar, newPasswordKdf);

            await request
              .query(
                "UPDATE users SET passwordKdf= @newPasswordKdf WHERE username= @username"
              )
              .then((results) => {
                console.log(results);

                // return the token along with user details
                return res.status(200).json({ results });
              })
              .catch((err) => {
                console.log(err);
                return res.json({ err });
              });
          }
        }
      );
    })
    .catch((err) => {
      console.log(err);
      return res.json({ err });
    });
};

exports.getUserByUsername = getUserByUsername;
exports.loginUser = loginUser;
exports.createUser = createUser;
exports.updatePasswordByUsername = updatePasswordByUsername;
