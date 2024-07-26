/*********************************************************************************
* WEB700 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _Nalinda___ Student ID: _150367233___ Date: __06/23/2024______
*
* Online (vercel) Link: https://web700-6srmsjqrp-nalindas-projects-cd2bf4b3.vercel.app
*
********************************************************************************/

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const collegeData = require('./modules/collegeData'); 
const exphbs = require('express-handlebars'); // Require express-handlebars

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Configure express-handlebars
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
    

}));
app.set('view engine', '.hbs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});


app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/students/add', (req, res) => {
    res.render('addStudent', { title: 'AddStudent' });
});

app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect('/students'); // Redirect to verify the new student was added
        })
        .catch(err => {
            console.error('Error adding student:', err);
            res.status(500).send('Error adding student');
        });
});

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to update student");
        });
})


app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo', { title: 'HtmlDemo' });
});

app.get('/students', (req, res) => {
    const course = req.query.course;

    if (course) {
        collegeData.getStudentsByCourse(course)
            .then(students => {
                res.render('students', { students: students });
            })
            .catch(err => {
                res.render('students', { message: 'No results' });
            });
    } else {
        collegeData.getAllStudents()
            .then(students => {
                res.render('students', { students: students });
            })
            .catch(err => {
                res.render('students', { message: 'No results' });
            });
    }
});

app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    collegeData.getCourseById(courseId)
        .then((course) => {
            res.render('course', { course: course });
        })
        .catch((err) => {
            res.render('course', { message: "Course not found" });
        });
});


app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then(courses => {
            res.render('courses', { courses: courses });
        })
        .catch(err => {
            res.render('courses', { message: "no results" });
        });
});

app.get('/student/:num', (req, res) => {
    const num = req.params.num;

    collegeData.getStudentByNum(num)
        .then(student => {
            res.render("student", { student: student });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running on http://localhost:${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to start server:', err);
    });
