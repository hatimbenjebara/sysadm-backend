import express from 'express'
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'


const router = express.Router()

router.post("/employee_login", (req, res) => {
    const sql = "SELECT * FROM workers WHERE email = ?"
    con.query(sql, [req.body.email], (err, result) =>{
        if (err) return res.json({loginStatus: false, Error: "Query error"});
        if( result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password, (err, response) =>{
                if (err) return res.json({loginStatus: false, Error: "Wrong Password"});
                if(response){
                    const email = result[0].email;
                    const token = jwt.sign({role: "employee", email: email}, "employee_secret_key", {expiresIn: "1d"});
                    res.cookie("token", token);
                    return res.json({ loginStatus: true, id: result[0].id });
                } else {
                    return res.json({loginStatus: false, Error: "Wrong email or password"});
                }
            })
        } else {
            return res.json({loginStatus: false, Error: "Wrong email or password"});
        }
    });
});

router.get('/detail/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM workers where id = ?"
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Status: false});
        return res.json({ loginStatus: true, result : result[0] });
    })
})
// In your Node.js/Express backend
router.post('/employee/update-hours', (req, res) => {
    const { id, hoursWorked } = req.body;

    const sql = "UPDATE workers SET hours_of_work = hours_of_work + ? WHERE id = ?";
    con.query(sql, [hoursWorked, id], (err, result) => {
        if (err) {
            console.error("Error updating hours:", err);
            return res.status(500).json({ status: false, error: "Failed to update hours" });
        }
        return res.json({ status: true });
    });
});

router.get('/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        return res.json({ Status: true });
    } catch (error) {
        console.error("Error logging out:", error);
        return res.status(500).json({ Status: false, Error: "An error occurred while logging out" });
    }
});




export {router as EmployeeRouter}