const users = require("../models/usersSchema");
const moment = require("moment");
const csv = require("fast-csv");
const fs = require("fs");
const CryptoJS = require('crypto-js');
const BASE_URL = process.env.BASE_URL
const { encryptField, decryptField, decryptFile } = require('../utils/aesEncryptin');

// register user 
exports.userpost = async (req, res) => {
    const file = req.file.filename;
    const encryptedFormData = req.body.encryptedFormData;
    // Decrypt the received data
    const decryptedDataString = decryptField(encryptedFormData);
    const decryptedData = JSON.parse(decryptedDataString);
    const { fname, lname, email, mobile, gender, location, status } = decryptedData;
    
    // validate collected values
    if (!fname || !lname || !email || !mobile || !gender || !location || !status || !file) {
        res.status(401).json("All Inputs is required")
    }
    //check if user already exist
    try {
        const preuser = await users.findOne({ email: email });

        if (preuser) {
            res.status(401).json("This user already exist in our databse")
        } else {

            // Save the user data to the database
            const datecreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
            const userData = new users({
                fname: fname,
                lname: lname,
                email: email,
                mobile: mobile,
                gender: gender,
                location: location,
                status: status,
                profile: file,
                datecreated
            });
            await userData.save();

            // Encrypt the user data before sending to the client
            const encryptedUserData = encryptField(JSON.stringify(userData));
            res.status(200).json({ encryptedUserData });
        }
    } catch (error) {
        res.status(500).json(error);
        console.log("catch block error")
    }
};

// register user test
// exports.userpost = async (req, res) => {
//     try {
//         if (!req.decryptedData) {
//             throw new Error('Decrypted data is missing');
//         }

//         // Log user details
//         const { user, user_profile } = req.decryptedData;
//         console.log('User Details:', user);
//         console.log('User Profile:', user_profile);

//         // Handle image upload using multer
//         const profilePic = req.file.filename;
//         console.log('Profile Pic:', profilePic);
        // Log file details
//         console.log('File Details:', req.file);

//         // You can add additional logic here based on your requirements

//         res.status(200).json({ message: 'Data logged successfully' });
//     } catch (error) {
//         console.error('Error in user registration:', error);
//     }
// }

//all user get
exports.allUsers = async (req, res) => {
    const allUser = await users.find();
    
    res.status(200).json(allUser);
}


// usersget
exports.userget = async (req, res) => {

    const search = req.query.search || ""
    const gender = req.query.gender || ""
    const status = req.query.status || ""
    const sort = req.query.sort || ""
    const page = req.query.page || 1
    const ITEM_PER_PAGE = 5;


    const query = {
        fname: { $regex: search, $options: "i" }
    }

    if (gender !== "All") {
        query.gender = gender
    }

    if (status !== "All") {
        query.status = status
    }

    try {

        const skip = (page - 1) * ITEM_PER_PAGE  // 1 * 4 = 4

        const count = await users.countDocuments(query);

        const usersdata = await users.find(query)
            .sort({ datecreated: sort == "new" ? -1 : 1 })
            .limit(ITEM_PER_PAGE)
            .skip(skip);

        const pageCount = Math.ceil(count / ITEM_PER_PAGE);  // 8 /4 = 2

        res.status(200).json({
            Pagination: {
                count, pageCount
            },
            usersdata
        })
    } catch (error) {
        res.status(401).json(error)
    }
}

// single user get
exports.singleuserget = async (req, res) => {

    const { id } = req.params;

    try {
        const userdata = await users.findOne({ _id: id });
        if (!userdata) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(userdata)
    } catch (error) {
        res.status(401).json(error)
    }
}

// user edit
exports.useredit = async (req, res) => {
    const { id } = req.params;
    const encryptedFormData = req.body.encryptedFormData;
    // Decrypt the received data
    const decryptedDataString = decryptField(encryptedFormData);
    const decryptedData = JSON.parse(decryptedDataString);
    const { fname, lname, email, mobile, gender, location, status, user_profile } = decryptedData;
    const file = req.file ? req.file.filename : user_profile
    const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
    try {
        // Decrypt the received data
        const updateuser = await users.findByIdAndUpdate({ _id: id }, {
            fname: fname,
            lname: lname,
            email: email,
            mobile: mobile,
            gender: gender,
            location: location,
            status: status,
            profile: file,
            dateUpdated
        }, {
            new: true
        });

        await updateuser.save();
        // Encrypt the user data before sending to the client then send it
        const encryptedUserData = encryptField(JSON.stringify(updateuser));
        res.status(200).json({ encryptedUserData });
    } catch (error) {
        res.status(401).json(error)
    }
}


// delete user
exports.userdelete = async (req, res) => {
    const { id } = req.params;
    try {
        const deletuser = await users.findByIdAndDelete({ _id: id });
        res.status(200).json(deletuser);
    } catch (error) {
        res.status(401).json(error)
    }
}

// chnage status
exports.userstatus = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    try {
        const userstatusupdate = await users.findByIdAndUpdate({ _id: id }, { status: data }, { new: true });
        res.status(200).json(userstatusupdate)
    } catch (error) {
        res.status(401).json(error)
    }
}

// export user
exports.userExport = async (req, res) => {
    try {
        const usersdata = await users.find();

        const csvStream = csv.format({ headers: true });

        if (!fs.existsSync("public/files/export/")) {
            if (!fs.existsSync("public/files")) {
                fs.mkdirSync("public/files/");
            }
            if (!fs.existsSync("public/files/export")) {
                fs.mkdirSync("./public/files/export/");
            }
        }

        const writablestream = fs.createWriteStream(
            "public/files/export/users.csv"
        );

        csvStream.pipe(writablestream);

        writablestream.on("finish", function () {
            res.json({
                downloadUrl: `${BASE_URL}/files/export/users.csv`,
            });
        });
        if (usersdata.length > 0) {
            usersdata.map((user) => {
                csvStream.write({
                    FirstName: user.fname ? user.fname : "-",
                    LastName: user.lname ? user.lname : "-",
                    Email: user.email ? user.email : "-",
                    Phone: user.mobile ? user.mobile : "-",
                    Gender: user.gender ? user.gender : "-",
                    Status: user.status ? user.status : "-",
                    Profile: user.profile ? user.profile : "-",
                    Location: user.location ? user.location : "-",
                    DateCreated: user.datecreated ? user.datecreated : "-",
                    DateUpdated: user.dateUpdated ? user.dateUpdated : "-",
                })
            })
        }
        csvStream.end();
        writablestream.end();

    } catch (error) {
        res.status(401).json(error)
    }
}