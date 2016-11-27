var express = require('express');
var pgp = require('pg-promise')(/* options */);
var bodyParser = require('body-parser');
var db = pgp('postgres://postgres:password@localhost:5432/postgres'); // TODO: abstract out the various requirements in this string

var taManager = express();
taManager.use(bodyParser.json());       // only need this for JSON-encoded bodies
taManager.use(bodyParser.urlencoded({   // only need this for URL-encoded bodies
    extended: true
}));
taManager.use(express.static(__dirname + '/public'));

// Now we can use
// POST: name=foo&color=red            <-- URL encoding
// and
// POST: {"name":"foo","color":"red"}  <-- JSON encoding
// req.body.name for both

// =========================================== COURSES PAGE ===========================================
taManager.get('/getAllCourses', function (req, res) {
    db.query('SELECT "CourseId" AS "courseId", "CourseCode" AS "courseCode", "Title" AS "title", "StartDate" AS "startDate", "EndDate" AS "endDate", "HasLab" AS "hasLab", "IsActive" AS "isActive" FROM thesis."Course" ORDER BY "CourseCode" ASC;')
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/addCourse', function (req, res) {
    var course = req.body;
    db.query('INSERT INTO thesis."Course"("CourseCode", "Title", "StartDate", "EndDate", "HasLab", "IsActive") ' +
        'VALUES ($1, $2, $3, $4, $5, $6);', [course.courseCode, course.title, null, null, course.hasLab, course.isActive]) // TODO: Add support for dates
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/editCourse', function (req, res) {
    var course = req.body;
    db.query('UPDATE thesis."Course" SET "CourseCode" = $1, "Title" = $2, "StartDate" = $3, "EndDate" = $4, "HasLab" = $5, "IsActive" = $6 WHERE "CourseId" = $7', 
        [course.courseCode, course.title, null, null, course.hasLab, course.isActive, course.courseId])
    .then(function (data) {
        res.send();
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.post('/removeCourse', function (req, res) {
    var course = req.body;
    db.query('DELETE FROM thesis."Course" WHERE "CourseId" = $1', course.courseId)
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

// =========================================== TEST FUNCTIONS ===========================================
taManager.get('/', function (req, res) {
    res.send('Hello World!!');
});

taManager.get('/airspeed', function (req, res) {
    res.send('African or European?');
});

taManager.get('/africanOrEuropean', function (req, res) {
    if (req.query.birdType === "AFRICAN") {
        res.send('11');
    } else {
        res.send('22');
    }
});

taManager.post('/africanOrEuropean', function (req, res) {
    if (req.body.birdType === "AFRICAN") {
        res.send('33');
    } else {
        res.send('44');
    }
});

taManager.get('/testDb', function (req, res) {
    db.one('SELECT * FROM thesis."Course"')
        .then(function (data) {
            console.log('DATA: ', data.value);
            res.send(data);
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

// Listen on 8080
taManager.listen(8080, function () {
    console.log('Example app listening on port 8080');
});