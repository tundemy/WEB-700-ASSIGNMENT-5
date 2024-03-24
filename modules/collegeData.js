const fs = require("fs");
const path = require("path");

// Define a class to hold the data
class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

// Initialize dataCollection as an empty object
let dataCollection = {};

// Function to initialize the data
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        // Read the courses data from courses.json
        fs.readFile(path.join(__dirname, "data", "courses.json"), 'utf8', (err, courseData) => {
            if (err) {
                reject("Unable to load courses");
                return;
            }

            // Read the students data from students.json
            fs.readFile(path.join(__dirname, "data", "students.json"), 'utf8', (err, studentData) => {
                if (err) {
                    reject("Unable to load students");
                    return;
                }

                // Create a new Data object with the parsed JSON data
                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}
module.exports.addStudent = function(studentData) {
    return new Promise((resolve, reject) => {
        if (!studentData) {
            reject("No student data provided");
            return;
        }

        // Add the new student to the students array
        dataCollection.students.push(studentData);

        resolve();
    });
};
// Function to get all students
module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        if (!dataCollection.students || dataCollection.students.length === 0) {
            reject("No students found");
            return;
        }

        resolve(dataCollection.students);
    });
}

// Function to update a student
module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        if (!studentData) {
            reject("No student data provided");
            return;
        }

        // Find the index of the student in the dataCollection.students array
        const index = dataCollection.students.findIndex(student => student.studentNum === parseInt(studentData.studentNum));

        // If student is found, update the student object
        if (index !== -1) {
            // Update student data
            dataCollection.students[index] = {
                ...dataCollection.students[index],
                ...studentData,
                TA: studentData.TA === "on" // Convert "on" to boolean
            };
            resolve();
        } else {
            // If student is not found, reject the promise
            reject("Student not found");
        }
    });
};

// Function to get a course by its ID
module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        // Check if dataCollection exists and contains courses
        if (!dataCollection.courses || dataCollection.courses.length === 0) {
            reject("No courses found");
            return;
        }

        // Find the course with the given courseId
        const course = dataCollection.courses.find(course => course.courseId === id);

        // If course is found, resolve the promise with the course
        if (course) {
            resolve(course);
        } else {
            // If course is not found, reject the promise with an appropriate message
            reject("Query returned 0 results");
        }
    });
};

// Function to get all courses
module.exports.getAllCourses = function () {
    return new Promise((resolve, reject) => {
        if (!dataCollection.courses || dataCollection.courses.length === 0) {
            reject("No courses found");
            return;
        }

        resolve(dataCollection.courses);
    });
}

// Function to get a student by their student number
module.exports.getStudentByNum = function(studentNum) {
    return new Promise((resolve, reject) => {
        console.log("Searching for student with number:", studentNum);
        const student = dataCollection.students.find(student => student.studentNum === parseInt(studentNum));
        if (student) {
            console.log("Student found:", student);
            resolve(student);
        } else {
            console.log("Student not found");
            reject("Student not found");
        }
    });
};
