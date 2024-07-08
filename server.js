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

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/students/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addStudent.html'));
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

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/htmlDemo', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'htmlDemo.html'));
});

app.get('/students', (req, res) => {
    const course = req.query.course;

    if (course) {
        collegeData.getStudentsByCourse(course)
            .then(students => {
                res.json(students);
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
            });
    } else {
        collegeData.getAllStudents()
            .then(students => {
                res.json(students);
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
            });
    }
});

app.get('/tas', (req, res) => {
    collegeData.getTAs()
        .then(tas => {
            res.json(tas);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.get('/student/:num', (req, res) => {
    const num = req.params.num;

    collegeData.getStudentByNum(num)
        .then(student => {
            res.json(student);
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
