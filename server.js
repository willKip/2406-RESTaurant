const express = require("express");
const session = require("express-session");
const mongo = require("mongodb");
const {ObjectId} = require("mongodb");
const MongoDBStore = require("connect-mongodb-session")(session);

// Database variables
let MongoClient = mongo.MongoClient;
let userCollection;
let sessionCollection;
let orderCollection;
const MONGODB_URI = "mongodb://localhost:27017/";

// Express app setup
const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI + "a4",
    collection: "sessions"
});

// Set up session cookies to be stored in a4 DB
app.use(require("express-session")({
    secret: "muSGVx$bZYXLjNvM6iwMKcRY*q%UqM",
    store: store,
    resave: true,
    saveUninitialized: false
}));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", "pug");

/* Set up routes and establish connection to DB */

// Ensure template pages will have access to current session status (for navigation header)
// loggedin boolean, username of the session
app.all("*", (req, res, next) => {
    if (req.session.loggedin) {
        res.locals.loggedin = true;
        res.locals.username = req.session.username;
    }
    next();
});

app.get("/", (req, res) => {
    res.status(200).render("pages/home");
});

app.get("/orderform", (req, res) => {
    if (!req.session.loggedin) {
        res.status(403).render("pages/error", {message: "You must be logged in to view the order form."});
        return;
    }
    res.status(200).render("pages/orderform");
});

app.get("/orders/:orderID", ordersGet);

app.post("/orders", ordersPost);

app.get("/profile", (req, res) => {
    if (req.session.loggedin)
        res.redirect(`/users/${req.session.userID}`);
    else
        res.redirect("/users");
});

app.route("/login")
    .get((req, res) => {
        res.status(200).render("pages/login");
    })
    .post(checkUserSessionUniqueness, loginPost);

app.get("/logout", logout);

// Supports query parameter "name"
app.get("/users", usersGet);

app.route("/users/:userID")
    .get(userGet)
    .post(userPost);

app.route("/register")
    .get((req, res) => {
        res.status(200).render("pages/register");
    })
    .put(registerPut);

// Failsafe; all unhandled routes result in a 404 and an appropriate error page
app.all("*", (req, res) => {
    res.status(404)
        .render("pages/error", {
            message: "Requested page doesn't exist; check your URL!"
        });
});

// Initialize database connection
MongoClient.connect(MONGODB_URI, (err, client) => {
    if (err) throw err;

    // Get the a4 database
    let db = client.db("a4");
    userCollection = db.collection("users");
    sessionCollection = db.collection("sessions");
    orderCollection = db.collection("orders");

    // Start server once Mongo is initialized
    app.listen(3000);
    console.log("Server listening on port 3000 at http://localhost:3000");
});

/* Route handlers and helper functions */

function registerPut(req, res) {
    let registerReq = req.body;

    if (!registerReq.username || !registerReq.password) {
        res.status(400).send("Bad request")
        return;
    }

    // Only add new user if username does not exist in the DB
    userCollection.findOne({"username": registerReq.username})
        .then(findUserResult => {
            if (findUserResult) {
                res.status(409).send("Username already exists!");
            } else {
                let newUser = {};
                newUser.username = registerReq.username;
                newUser.password = registerReq.password;
                newUser.privacy = false;
                newUser.orderIDs = [];

                userCollection.insertOne(newUser)
                    .then(insertResult => {
                        // Set session cookies
                        req.session.loggedin = true;
                        req.session.userID = insertResult.insertedId;
                        req.session.username = registerReq.username;

                        res.status(200).send({userID: insertResult.insertedId})
                    })
                    .catch(err => {
                        res.status(500).send(`Error reading database: ${err}.`);
                    });
            }
        })
        .catch(err => {
            res.status(500).send(`Error reading database: ${err}.`);
        });
}

function checkUserSessionUniqueness(req, res, next) {
    sessionCollection.findOne({"session.username": req.body.username},
        (err, result) => {
            if (err) {
                res.status(500).send("Error reading database.");
                return;
            }

            if (result != null && result.session.loggedin === true) {
                // User session already exists, deny login attempt
                res.status(401).render("pages/error", {message: "User is already logged in."});
            } else {
                next();
            }
        });
}

function loginPost(req, res) {
    if (req.session.loggedin) {
        res.status(200).render("pages/error", {message: `Already logged in as ${req.session.username}.`});
        return;
    }

    let username = req.body.username;
    let password = req.body.password;

    console.log("Logging in with credentials:");
    console.log("Username: " + username);
    console.log("Password: " + password);

    userCollection.findOne({username: username, password: password},
        (err, result) => {
            if (err) {
                res.status(500).send("Error reading database.");
                return;
            }
            if (!result) {
                // Username does not exist or the password is incorrect; do not give detailed info
                res.status(401).render("pages/error", {message: "Login failed. Check Username/PW"});
                return;
            }

            // Set session cookies
            req.session.loggedin = true;
            req.session.userID = result._id;
            req.session.username = username;

            res.redirect(`/users/${result._id}`);
        });
}

function logout(req, res) {
    if (req.session.loggedin) {
        // Reset session cookies
        req.session.loggedin = false;
        req.session.userID = undefined;
        req.session.username = undefined;

        res.redirect("/login");
    } else {
        res.status(200).render("pages/error", {
            message: "You cannot log out because you aren't logged in."
        });
    }
}

function ordersGet(req, res) {
    if (!validateObjectId(req.params.orderID)) {
        res.status(404).render("pages/error", {
            message: `Page does not exist`
        });
        return;
    }

    let orderQueryUID = ObjectId(req.params.orderID);

    orderCollection.findOne({"_id": orderQueryUID})
        .then(orderResult => {
            if (!orderResult) {
                res.status(404).render("pages/error", {
                    message: `Order with ID ${orderQueryUID} does not exist`
                });
            } else {
                userCollection.findOne({"_id": ObjectId(orderResult.orderedBy)})
                    .then(userResult => {
                        if (!userResult) {
                            // User ID does not exist
                            res.status(404).render("pages/error", {
                                message: `The order was found but its user with ID ${orderResult.orderedBy} does not exist`
                            });
                        } else if (userResult.privacy && !ObjectId(req.session.userID).equals(userResult._id)) {
                            // Order exists but its user is private and session is not authorized
                            res.status(403)
                                .render("pages/error", {
                                    message: "This order was made by a private profile and can only be viewed by the user."
                                });
                        } else {
                            res.status(200).render("pages/order", {
                                orderData: {
                                    orderID: orderQueryUID,
                                    username: userResult.username,
                                    restaurantName: orderResult.restaurantName,
                                    orderItems: orderResult.order,
                                    subtotal: orderResult.subtotal,
                                    tax: orderResult.tax,
                                    deliveryFee: orderResult.fee,
                                    total: orderResult.total
                                }
                            });
                        }
                    })
                    .catch(err => {
                        res.status(500)
                            .render("pages/error", {
                                message: `Error reading database: ${err}.`
                            })
                    });
            }
        })
        .catch(err => {
            res.status(500)
                .render("pages/error", {
                    message: `Error reading database: ${err}.`
                })
        });
}

function ordersPost(req, res) {
    if (!validateObjectId(req.session.userID)) {
        res.status(400).render("pages/error", {
            message: `ObjectId in request is invalid`
        });
        return;
    }

    let queryUID = req.session.userID;

    let newOrder = req.body;
    newOrder.orderedBy = queryUID;

    orderCollection.insertOne(newOrder)
        .then(insertResult => {
            userCollection.updateOne({_id: queryUID}, {$push: {orderIDs: insertResult.insertedId}})
                .then(() => {
                    res.status(200).send("Order successfully submitted!");
                })
                .catch(err => {
                    res.status(500).send(`Error reading database: ${err}.`);
                });
        })
        .catch(err => {
            res.status(500).send(`Error reading database: ${err}.`);
        });
}

function userGet(req, res) {
    if (!validateObjectId(req.params.userID)) {
        res.status(404).render("pages/error", {
            message: `Page does not exist`
        });
        return;
    }

    let queryUID = ObjectId(req.params.userID);

    userCollection.findOne({_id: queryUID})
        .then(result => {
            if (!result) {
                // User ID does not exist
                res.status(404).render("pages/error", {
                    message: `User with ID ${queryUID} does not exist`
                });
            } else if (result.privacy && !ObjectId(req.session.userID).equals(result._id)) {
                // Page exists but is private and user is not authorized
                res.status(403)
                    .render("pages/error", {
                        message: "This profile is set to private and can only be viewed by the user."
                    });
            } else {
                res.status(200).render("pages/user", {
                    userData: {
                        userID: result._id,
                        username: result.username,
                        privacy: result.privacy,
                        orderIDs: result.orderIDs
                    }
                });
            }
        })
        .catch(err => {
            res.status(500)
                .render("pages/error", {
                    message: `Error reading database: ${err}.`
                })
        });
}

function userPost(req, res) {
    if (!validateObjectId(req.session.userID)) {
        res.status(400).render("pages/error", {
            message: `ObjectId in request is invalid`
        });
        return;
    }

    // Check if user is authorized to update the profile; also ensures profile exists
    if (!req.session.loggedin || !ObjectId(req.params.userID).equals(req.session.userID)) {
        res.status(403).send("You must be logged in as this user to update their profile.");
        return;
    }

    let queryUID = ObjectId(req.params.userID);
    let privacyBool = req.body.privacy === "true";  // Store boolean, not string

    userCollection.updateOne({_id: queryUID}, {$set: {privacy: privacyBool}})
        .then(() => {
            res.status(200).send("Profile updated!");
        })
        .catch(err => {
            res.status(500).send(`Error reading database: ${err}.`);
        });
}

function usersGet(req, res) {
    let queryDocument = [];

    queryDocument.push({privacy: false}); // Find non-private users

    // Find users whose usernames match the query parameter (case insensitive)
    if (req.query.name)
        queryDocument.push({username: {"$regex": req.query.name, "$options": "i"}});

    userCollection.find({"$and": queryDocument}).toArray()
        .then(result => {
            res.status(200).render("pages/users", {
                queryName: req.query.name,
                queryResult: result.map(({_id, username}) => ({_id, username}))
            })
        })
        .catch(err => {
            res.status(500)
                .render("pages/error", {
                    message: `Error reading database: ${err}.`
                })
        });
}

// Returns true if the input is a valid MongoDB BSON ID
function validateObjectId(input) {
    return mongo.ObjectId.isValid(input);
}