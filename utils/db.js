import mysql from "mysql";

// Ensure that process.env variables are loaded
import dotenv from 'dotenv';
dotenv.config();

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Ensure this is a number, not a string
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the database
con.connect(function(err) {
    if(err){
        console.error("Connection error:", err);
    } else {
        console.log("Connected to the database");
    }
});

export default con;
