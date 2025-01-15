import express from "express";
import con from '../utils/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import multer from "multer"
import path from "path"

const router = express.Router()

router.post("/adminlogin", (req, res) => {
    const sql = "SELECT * FROM admin WHERE email = ? AND password = ?"
    con.query(sql, [req.body.email, req.body.password], (err, result) =>{
        if (err) return res.json({loginStatus: false, Error: "Querry error"})
        if( result.length >0) {
            const email = result[0].email;
            const token = jwt.sign({role:"admin", email: email}, "jwt_secret_key", {expiresIn: "1d"});
            res.cookie("token", token)
            return res.json({loginStatus: true})
        } else {
            return res.json({loginStatus: false, Error: "Wrong email or password"})
        }
    })
})

router.post('/add_category', (req, res)=>{
    const sql = "INSERT INTO category (`name`) VALUES (?)";
    con.query(sql, [req.body.category], (err, result) => {
        if(err) return res.json({Status: false, Error: "Querry error"})
        return res.json({Status: true})
    })
})

router.get('/category', (req, res)=> {
    const sql = "SELECT * FROM category";
    con.query(sql, (err, result)=>{
        if(err)  return res.json({Status: false, Error: "Querry error"})
        return res.json({Status: true, Result : result}) 
    })
})
//image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'public/images') 
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})
//end image upload
router.post('/add_employee', upload.single('image'), (req, res) => {
    // Log the password to see what is being passed
    console.log('Password received:', req.body.password);

    // Check if password is undefined or empty
    if (!req.body.password) {
        return res.json({ Status: false, Error: "Password is missing" });
    }
    const sql = `INSERT INTO workers (image, first_name, last_name, employee_code, category_id, role, gender, nid, 
    contact_number, date_of_birth, date_of_joining, date_of_leaving, email, password, hour_of_work, 
    rest_days, salary, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Use bcrypt to hash the password
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            console.error('Bcrypt hashing error:', err);
            return res.json({ Status: false, Error: "Password hashing error" });
        }

        // Construct the values array after the password is hashed
        const values = [
            req.file ? req.file.filename : null, // Ensure there's a file
            req.body.first_name,
            req.body.last_name,
            req.body.employee_code,
            req.body.category_id,
            req.body.role,
            req.body.gender,
            req.body.nid,
            req.body.contact_number,
            req.body.date_of_birth,
            req.body.date_of_joining,
            req.body.date_of_leaving,
            req.body.email,
            hash, // Hashed password
            req.body.hour_of_work,
            req.body.rest_days,
            req.body.salary,
            req.body.address
        ];

       

        // Execute the query after the values array is properly constructed
        con.query(sql, values, (err, result) => {
            if (err) {
                console.error('SQL Query Error:', err);
                return res.json({ Status: false, Error: "Query error" });
            }
            return res.json({ Status: true });
        });
    });
});



router.get('/employee', (req, res)=> {
    const sql = "SELECT * FROM workers";
    con.query(sql, (err, result)=>{
        if(err)  return res.json({Status: false, Error: "Querry error"})
        return res.json({Status: true, Result : result}) 
    })
})
router.get('/employee/:id', (req, res)=>{
    const id = req.params.id;
    const sql = "SELECT * FROM workers WHERE id = ?";
    con.query(sql,[id], (err, result)=>{
        if(err)  return res.json({Status: false, Error: "Querry error"})
        return res.json({Status: true, Result : result}) 
    })
})
router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    
    // Hash the password before storing
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Password hashing error" });
        const values = [
            req.body.first_name,
            req.body.last_name,
            req.body.employee_code,
            req.body.category_id,
            req.body.role,
            req.body.gender,
            req.body.nid,
            req.body.contact_number,
            req.body.date_of_birth,
            req.body.date_of_joining,
            req.body.date_of_leaving,
            req.body.email,
            hash,  // Use the hashed password here
            req.file.filename,  // Assuming you're still handling the file upload here
            req.body.hour_of_work,
            req.body.rest_days,
            req.body.salary,
            req.body.address
        ];

        const sql = `UPDATE workers SET first_name = ?, last_name = ?, employee_code = ?, category_id = ?, role = ?, 
        gender = ?, nid = ?, contact_number = ?, date_of_birth = ?, date_of_joining = ?, date_of_leaving = ?, 
        email = ?, password = ?, image = ?, hour_of_work = ?, rest_days = ?, salary = ?, address = ? WHERE id = ?`;
        
        
        con.query(sql, [...values, id], (err, result) => {
            if (err) return res.json({ Status: false, Error: "Query error" });
            return res.json({ Status: true, Result: result });
        });
    });
});


router.delete('/delete_employee/:id', (req, res)=> {
    const id = req.params.id;
    const sql = "DELETEe FROM workers WHERE id = ?"// i add e to stop deleting
    con.query(sql, [id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "This is example you shouldnt delete it " });
        return res.json({ Status: true, Result: result });
    });
})

router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee_count', (req, res) => {
    const sql = "select count(id) as employee from workers";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/salary_count', (req, res) => {
    const sql = "SELECT SUM(salary) AS totalSalary FROM workers";
    con.query(sql, (err, result) => {
        if(err) return res.json({ Status: false, Error: "Query Error" + err });
        return res.json({ Status: true, Result: result });
    });
});


router.get('/admin_records', (req, res) => {
    const sql = "select * from admin"
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.delete('/delete_admin/:id', (req, res)=> {
    const id = req.params.id;
    const sql = "DELETEe FROM admin WHERE id = ?" //i had add e in DELETE to stop deleting by user
    con.query(sql, [id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "This is example you shouldnt delete it " });
        return res.json({ Status: true, Result: result });
    });
})

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: true });
});

export {router as adminRouter}