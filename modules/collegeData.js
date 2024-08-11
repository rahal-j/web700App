const Sequelize = require('sequelize');

// Set up sequelize to point to your PostgreSQL database
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'ycECarZIx63z', {
    host: 'ep-small-mode-a5uajwkz.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { 
            rejectUnauthorized: false 
        }
    },
    query: {
        raw: true
    }
});

// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    course: Sequelize.INTEGER 
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

Course.hasMany(Student, {
    foreignKey: 'course',
    onDelete: 'SET NULL'
});

// Initialize the database and sync all models
module.exports.initialize = function () {
    return sequelize.sync().then(() => {
        console.log('Database synchronized successfully.');
        return Promise.resolve();
    }).catch((error) => {
        console.error('Unable to sync the database:', error);
        return Promise.reject("unable to sync the database");
    });
};

module.exports.getAllStudents = function() {
    return new Promise((resolve, reject) => {
        Student.findAll().then(students => {
            if (students.length > 0) {
                resolve(students);
            } else {
                reject("no results returned");
            }
        }).catch(error => {
            console.error('Error fetching students:', error);
            reject("no results returned");
        });
    });
};

module.exports.getStudentsByCourse = function(course) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                course: course // Filter to match the 'course' column with the provided course ID
            }
        }).then(students => {
            if (students && students.length > 0) {
                resolve(students);
            } else {
                reject("no results returned"); // Reject the promise if no students are found
            }
        }).catch(error => {
            console.error('Error fetching students by course:', error);
            reject("no results returned"); // Reject the promise if there is an error during the fetch operation
        });
    });
};

module.exports.getStudentByNum = function(num) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                studentNum: num // Filter to match the 'studentNum' column with the provided student number
            }
        }).then(students => {
            if (students && students.length > 0) {
                resolve(students[0]); // Resolve with the first student object
            } else {
                reject("no results returned"); // Reject the promise if no student is found
            }
        }).catch(error => {
            console.error('Error fetching student by number:', error);
            reject("no results returned"); // Reject the promise if there is an error during the fetch operation
        });
    });
};

module.exports.getCourses = function() {
    return new Promise((resolve, reject) => {
        Course.findAll().then(courses => {
            if (courses && courses.length > 0) {
                resolve(courses); // Resolve the promise with the courses data
            } else {
                reject("no results returned"); // Reject the promise if no courses are found
            }
        }).catch(error => {
            console.error('Error fetching courses:', error);
            reject("no results returned"); // Reject the promise if there is an error during the fetch operation
        });
    });
};

module.exports.getCourseById = function(id) {
    return new Promise((resolve, reject) => {
        Course.findAll({
            where: {
                courseId: id // Filter to match the 'courseId' column with the provided ID
            }
        }).then(courses => {
            if (courses && courses.length > 0) {
                resolve(courses[0]); // Resolve with the first course object if found
            } else {
                reject("no results returned"); // Reject the promise if no course is found
            }
        }).catch(error => {
            console.error('Error fetching course by ID:', error);
            reject("no results returned"); // Reject the promise if there is an error during the fetch operation
        });
    });
};

module.exports.addStudent = function(studentData) {
    return new Promise((resolve, reject) => {
        // Set TA correctly
        studentData.TA = (studentData.TA) ? true : false;

        // Replace empty strings with null
        for (const key in studentData) {
            if (studentData.hasOwnProperty(key) && studentData[key] === "") {
                studentData[key] = null;
            }
        }

        // Create the student
        Student.create(studentData)
            .then(student => {
                resolve(student);
            })
            .catch(error => {
                console.error('Error creating new student:', error);
                reject("unable to create student");
            });
    });
};

module.exports.updateStudent = function(studentData) {
    return new Promise((resolve, reject) => {
        // Ensure TA is explicitly set to true or false
        studentData.TA = (studentData.TA) ? true : false;

        // Convert any blank string values to null for all properties
        for (const key in studentData) {
            if (studentData.hasOwnProperty(key) && studentData[key] === "") {
                studentData[key] = null;
            }
        }

        // Update the student in the database
        Student.update(studentData, {
            where: {
                studentNum: studentData.studentNum // Filter operation by studentNum
            }
        }).then(result => {
            if (result[0] > 0) { // Sequelize update returns an array where the first element is the number of affected rows
                resolve("Student updated successfully"); // Resolve the promise if the update was successful
            } else {
                reject("Student not found"); // Reject if no rows were updated (meaning the student wasn't found)
            }
        }).catch(error => {
            console.error('Error updating student:', error);
            reject("unable to update student"); // Reject the promise if there's an error during the update operation
        });
    });
};

module.exports.addCourse = function(courseData) {
    return new Promise((resolve, reject) => {
        // Convert any empty string values to null
        for (const key in courseData) {
            if (courseData.hasOwnProperty(key) && courseData[key] === "") {
                courseData[key] = null;
            }
        }

        // Create a new course in the database
        Course.create(courseData)
            .then(course => {
                resolve(course); // Resolve the promise with the newly created course object
            })
            .catch(error => {
                console.error('Error creating new course:', error);
                reject("unable to create course"); // Reject the promise if there's an error
            });
    });
};

module.exports.updateCourse = function(courseData) {
    return new Promise((resolve, reject) => {
        // Convert any empty string values to null for all properties
        for (const key in courseData) {
            if (courseData.hasOwnProperty(key) && courseData[key] === "") {
                courseData[key] = null;
            }
        }

        // Update the course in the database
        Course.update(courseData, {
            where: {
                courseId: courseData.courseId // Filter operation by courseId
            }
        }).then(result => {
            if (result[0] > 0) { // Sequelize update returns an array where the first element is the number of affected rows
                resolve("Course updated successfully"); // Resolve the promise if the update was successful
            } else {
                reject("Course not found or no data changed"); // Reject if no rows were updated (meaning the course wasn't found or no changes were made)
            }
        }).catch(error => {
            console.error('Error updating course:', error);
            reject("unable to update course"); // Reject the promise if there's an error during the update operation
        });
    });
};

module.exports.deleteCourseById = function(id) {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: {
                courseId: id // Specify which course to delete based on courseId
            }
        })
        .then(result => {
            if (result > 0) { // Check if any rows were deleted
                resolve("Course deleted successfully"); // Resolve the promise if the course was successfully deleted
            } else {
                reject("No course found with that ID"); // Reject the promise if no rows were deleted, implying no course found
            }
        })
        .catch(error => {
            console.error('Error deleting course:', error);
            reject("Unable to delete course"); // Reject the promise if there is an error during the deletion process
        });
    });
};

module.exports.deleteStudentByNum = function(studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: {
                studentNum: studentNum
            }
        }).then(deleted => {
            if (deleted) {
                resolve(); // Resolve when the deletion is successful
            } else {
                reject("Unable to remove student"); // Reject if no student was deleted
            }
        }).catch(err => {
            reject(err); // Reject if there's an error during the operation
        });
    });
};

