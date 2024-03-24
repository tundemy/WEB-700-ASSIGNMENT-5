/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name:Titilope Orukotan Student ID: 128275237 Date: 03/24/2024
*
********************************************************************************/ 

const express = require("express");
const exphbs = require('express-handlebars')
const bodyParser = require("body-parser");
const path = require("path");
const collegeData = require("./collegeData");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Set EJS as the view engine
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));
// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // Add body-parser middleware

// Middleware to set active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});
// Handlebars custom helper functions
const handlebars = require('handlebars');
handlebars.registerHelper('navLink', function(url, options) {
    return '<li' + ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
});

handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
    if (arguments.length < 3) throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});
// Routes for API endpoints
app.get("/students", (req, res) => {
    collegeData.getAllStudents()
        .then((students) => {
            if (students.length > 0) {
                // Render the students view with the data
                res.render("students", { students });
            } else {
                // Handle scenario when there are no results
                res.render("noResults");
            }
        })
        .catch((err) => {
            // Handle error
            console.error("Error getting students:", err);
            res.status(500).send("Internal Server Error");
        });
});
// Routes for API endpoints
app.get("/courses", (req, res) => {
    collegeData.getAllCourses()
        .then((courses) => {
            // Render the courses view with the data
            res.render("courses", { courses });
        })
        .catch(() => {
            // Render the courses view with an error message
            res.render("courses", { message: "no results" });
        });
});
app.get("/course/:id", (req, res) => {
    const courseId = parseInt(req.params.id); // Extract the id parameter from the route URL
    
    // Call the getCourseById method from collegeData module
    collegeData.getCourseById(courseId)
        .then(course => {
            // If the promise resolves successfully, render the "course" view
            res.render("course", { course: course });
        })
        .catch(error => {
            // If there's an error, handle it appropriately
            console.error("Error getting course:", error);
            res.status(404).send("Course Not Found");
        });
});
app.get("/student/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;
    collegeData.getStudentByNum(studentNum)
        .then((student) => {
            // Render the student view with the data
            res.render("student", { student });
        })
        .catch((err) => {
            // Handle error
            console.error("Error getting student:", err);
            res.status(500).send("Internal Server Error");
        });
});

// Routes to serve HTML files
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});


app.get("/htmlDemo", (req, res) => {
    res.render("htmlDemo");
});

app.get("/students/add", (req, res) => {
    res.render("addStudent");
});
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            // Handle error
            console.error("Error adding student:", err);
            res.status(500).send("Internal Server Error");
        });
});
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            console.log("Student updated successfully:", req.body);
            res.redirect("/students");
        })
        .catch((err) => {
            console.error("Error updating student:", err);
            res.render("error", { message: "Error updating student", error: error });
        });
});

// Handling unmatched routes
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize data and start the server
collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("Server listening on port " + HTTP_PORT);
        });
    })
    .catch(err => {
        console.error("Error initializing data:", err);
    });
