/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _Nalinda Haputhantrige____ Student ID: _150367233___ Date: __07/26/2024____
*
* Online (vercel) Link: https://web700-app-assignment05.vercel.app/
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

app.get('/courses/add', (req, res) => {
    res.render('addCourse', { title: 'Add New Course' }); // assumes you have an 'addCourse.hbs' view setup
});

app.get('/students/add', (req, res) => {
    collegeData.getCourses()
        .then(data => {
            res.render('addStudent', { courses: data }); // Pass the courses data to the view
        })
        .catch(err => {
            console.error('Error fetching courses:', err);
            res.render('addStudent', { courses: [] }); // Handle errors by passing an empty array
        });
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

app.post('/courses/add', (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => {
            res.redirect('/courses'); // Redirect to the courses list page after successful addition
        })
        .catch(err => {
            console.error('Error adding course:', err);
            res.status(500).send('Error adding course');
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

app.post('/course/update', (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => {
            res.redirect('/courses'); // Redirect to the courses list page after successful update
        })
        .catch(err => {
            console.error('Error updating course:', err);
            res.status(500).send('Unable to update course'); // Provide error feedback
        });
});

app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    collegeData.getCourseById(courseId)
        .then((course) => {
            if (!course) { // Check if the course data is undefined or null
                res.status(404).send("Course Not Found"); // Send a 404 error if no course is found
            } else {
                res.render('course', { course: course }); // Render the 'course' view with the course data
            }
        })
        .catch((err) => {
            console.error('Error fetching course:', err);
            res.status(500).send("Error retrieving course"); // Handle potential server errors
        });
});

app.get('/course/delete/:id', (req, res) => {
    const courseId = req.params.id;
    collegeData.deleteCourseById(courseId)
        .then(() => {
            res.redirect('/courses'); // Redirect to the courses list page after successful deletion
        })
        .catch(err => {
            console.error('Error deleting course:', err);
            res.status(500).send("Unable to Remove Course / Course not found"); // Provide error feedback
        });
});


app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo', { title: 'HtmlDemo' });
});

app.get('/students', (req, res) => {
    const course = req.query.course;
    const handleStudentData = (students) => {
        if (students.length > 0) {
            res.render('students', { students: students });
        } else {
            res.render('students', { message: 'No results' });
        }
    };

    if (course) {
        collegeData.getStudentsByCourse(course)
            .then(handleStudentData)
            .catch(err => {
                res.render('students', { message: 'No results' });
            });
    } else {
        collegeData.getAllStudents()
            .then(handleStudentData)
            .catch(err => {
                res.render('students', { message: 'No results' });
            });
    }
});


app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then(courses => {
            if (courses.length > 0) {
                res.render('courses', { courses: courses });
            } else {
                res.render('courses', { message: "No results" });
            }
        })
        .catch(err => {
            res.render('courses', { message: "No results" });
        });
});

app.get('/student/delete/:studentNum', (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => {
            res.redirect('/students'); // Redirect to the list of students upon successful deletion
        })
        .catch(err => {
            res.status(500).send("Unable to Remove Student / Student not found"); // Send error message if deletion fails
        });
});

app.get("/student/:studentNum", (req, res) => {
    // Initialize an empty object to store the values
    let viewData = {};

    // Fetch student by student number
    collegeData.getStudentByNum(req.params.studentNum).then((studentData) => {
        if (studentData) {
            viewData.student = studentData; // Store student data in the "viewData" object as "student"
        } else {
            viewData.student = null; // Set student to null if none were returned
        }
    }).catch((err) => {
        viewData.student = null; // Set student to null if there was an error fetching student data
    }).then(() => {
        // Chain to fetch courses
        return collegeData.getCourses();
    })
    .then((courseData) => {
        viewData.courses = courseData; // Store course data in the "viewData" object as "courses"

        // Loop through viewData.courses and once we have found the courseId that matches the student's "course" value,
        // add a "selected" property to the matching viewData.courses object
        for (let i = 0; i < viewData.courses.length; i++) {
            if (viewData.courses[i].courseId == viewData.student.course) {
                viewData.courses[i].selected = true;
            }
        }
    }).catch((err) => {
        viewData.courses = []; // Set courses to empty if there was an error fetching courses
    }).then(() => {
        if (viewData.student == null) { // If no student data could be found or fetched
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData }); // Render the "student" view with the compiled data
        }
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

