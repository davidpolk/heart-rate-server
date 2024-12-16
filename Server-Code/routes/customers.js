var express = require('express');
var router = express.Router();
var Customer = require("../models/customer");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require('fs');

// On AWS ec2, you can use to store the secret in a separate file. 
// The file should be stored outside of your code directory. 
// For encoding/decoding JWT

const secret = fs.readFileSync(__dirname + '/../keys/jwtkey').toString();

// example of authentication
// register a new customer

// please fiil in the blanks
// see javascript/signup.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.post("/signUp", function (req, res) {
   Customer.findOne({ email: req.body.email }, function (err, customer) {
       if (err) res.status(401).json({ success: false, err: err });
       else if (customer) {
           res.status(401).json({ success: false, msg: "This email already used" });
       }
       else {
           const passwordHash = bcrypt.hashSync(req.body.password, 10);
           const newCustomer = new Customer({
               email: req.body.email,
               passwordHash: passwordHash,
               deviceName: req.body.deviceName
           });

           newCustomer.save(function (err, customer) {
               if (err) {
                   res.status(400).json({ success: false, err: err });
               }
               else {
                   let msgStr = `Customer (${req.body.email}) account has been created.`;
                   res.status(201).json({ success: true, message: msgStr });
                   console.log(msgStr);
               }
           });
       }
   });
});

// please fill in the blanks
// see javascript/login.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.post("/logIn", function (req, res) {
   if (!req.body.email || !req.body.password) {
       res.status(401).json({ error: "Missing email and/or password" });
       return;
   }
   // Get user from the database
   Customer.findOne({ email: req.body.email }, function (err, customer) {
       if (err) {
           res.status(400).send(err);
       }
       else if (!customer) {
           // Username not in the database
           res.status(401).json({ error: "Login failure!!" });
       }
       else {
           if (bcrypt.compareSync(req.body.password, customer.passwordHash)) {
               const token = jwt.encode({ email: customer.email }, secret);
               //update user's last access time
               customer.lastAccess = new Date();
               customer.save((err, customer) => {
                   console.log("User's LastAccess has been update.");
               });
               // Send back a token that contains the user's username
               res.status(201).json({ success: true, token: token, msg: "Login success" });
           }
           else {
               res.status(401).json({ success: false, msg: "Email or password invalid." });
           }
       }
   });
});

// please fiil in the blanks
// see javascript/account.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.get("/status", function (req, res) {
   // See if the X-Auth header is set
   if (!req.headers["x-auth"]) {
       return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
   }
   // X-Auth should contain the token 
   const token = req.headers["x-auth"];
   try {
       const decoded = jwt.decode(token, secret);
       // Send back email and last access
       Customer.find({ email: decoded.email }, "email deviceName lastAccess", function (err, users) {
           if (err) {
               res.status(400).json({ success: false, message: "Error contacting DB. Please contact support." });
           }
           else {
               res.status(200).json(users);
           }
       });
   }
   catch (ex) {
       res.status(401).json({ success: false, message: "Invalid JWT" });
   }
});
//////////////////////////////////////////////////////
//list all devices
/*
router.get("/devices", function (req, res) {
    // See if the X-Auth header is set
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
    }
    // X-Auth should contain the token 
    const token = req.headers["x-auth"];
    try {
        const decoded = jwt.decode(token, secret);
        // Send back email and last access
        Customer.find({ email: decoded.email }, "deviceName", function (err, users) {
            if (err) {
                res.status(400).json({ success: false, message: "Error contacting DB. Please contact support." });
            }
            else {
                res.status(200).json(users);
            }
        });
    }
    catch (ex) {
        res.status(401).json({ success: false, message: "Invalid JWT" });
    }
 });*/
// Route to add a device----------------------------------------------------------
router.post("/add-devices", async (req, res) => {
    const token = req.headers["x-auth"]; // Token sent in headers

    if (!token) {
        return res.status(401).json({ success: false, message: "Missing token" });
    }

    const { deviceName } = req.body; // Device name from the request body

    if (!deviceName) {
        return res.status(400).json({ success: false, message: "Device name is required" });
    }

    try {
        // Decode the token to get user information
        const decoded = jwt.decode(token, secret);
        const email = decoded.email;

        // Find the customer using the email
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Add the device to the customer's deviceName array
        customer.deviceName.push(deviceName);
        await customer.save();

        res.status(200).json({ 
            success: true, 
            message: "Device added successfully", 
            devices: customer.deviceName 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
//--------------------------------------------------------------------------------
//delete device
router.post("/delete-device", async (req, res) => {
    const token = req.headers["x-auth"]; // Token sent in headers
    if (!token) {
        return res.status(401).json({ success: false, message: "Missing token" });
    }

    const { deviceName } = req.body; // Device name to delete from the request body
    if (!deviceName) {
        return res.status(400).json({ success: false, message: "Device name is required" });
    }

    try {
        // Decode the token to get user information
        const decoded = jwt.decode(token, secret);
        const email = decoded.email;

        // Find the customer using the email
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Remove the device from the customer's deviceName array
        customer.deviceName = customer.deviceName.filter(device => device !== deviceName);
        
        // Save the updated customer document
        await customer.save();

        res.status(200).json({
            success: true,
            message: "Device deleted successfully",
            devices: customer.deviceName // Return updated list of devices
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});



module.exports = router;