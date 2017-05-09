var express = require('express');
var pgp = require('pg-promise')(/* options */);
var bodyParser = require('body-parser');
var configDb = require('./config/database.js');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var session = require('express-session');
var dateTools = require('./public/js/date-tools.js');
var db = pgp(configDb.url);
var schema = configDb.schema;
var PORT = 8080;




/**
 * Passport configuration
 */
passport.use(new Strategy(
    function (username, password, done) {
        var user = {
            username: username,
            password: password
        };
        if (user.username === 'agyori' && user.password === 'aPass') {
            return done(null, user); 
        } else {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
  })
);

passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    done(null, username);
});

var taManager = express();
taManager.use(require('cookie-parser')());
taManager.use(bodyParser.json());       // only need this for JSON-encoded bodies
taManager.use(bodyParser.urlencoded({   // only need this for URL-encoded bodies
    extended: true
}));
taManager.use(express.static(__dirname + '/public'));
taManager.use(session({ secret: 'a secret', resave: false, saveUninitialized: false }));
taManager.use(passport.initialize());
taManager.use(passport.session());

// =========================================== AUTHENTICATION TEST ROUTES ==============================
taManager.get('/loginFail', function (req, res) {
    res.send({ message: 'Login failed!' });
});

taManager.post('/login',
    passport.authenticate('local', { failureRedirect: '/loginFail' }),
    function (req, res) {
        res.send({ message: 'Logged in!' });
    }
);

taManager.get('/logout', function (req, res) {
    req.logout();
    res.send({ message: 'Logged out!' });
});

taManager.get('/profile',
    require('connect-ensure-login').ensureLoggedIn('/loginFail'),
    function (req, res) {
        res.send({ message: 'Viewing profile!' });
    }
);

// =========================================== GENERIC CALLS ==========================================

var assignTa = function (res, db, userId, courseId, assignType) {
    return db.query('INSERT INTO ' + schema + '."CourseTaAssigns"("UserId", "CourseId", "AssignType") VALUES ($1, $2, $3);', [userId, courseId, assignType])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
            res.sendStatus(500);
        });
};

var getAssignmentSchedule = function (db) {
    return db.query('SELECT course."CourseId" AS "courseId", "CourseCode" AS "courseCode", "UserId" AS "userId", "StartDate" AS "startDate", "EndDate" AS "endDate", ' +
        '"AssignType" AS "assignType" FROM ' + schema + '."Course" course JOIN ' + schema + '."CourseTaAssigns" assign ON course."CourseId" = assign."CourseId" WHERE "StartDate" IS NOT NULL AND "EndDate" IS NOT NULL;');
};

// =========================================== COURSES PAGE ===========================================
taManager.get('/getAllCourses', function (req, res) {
    db.query('SELECT "CourseId" AS "courseId", "CourseCode" AS "courseCode", "Title" AS "title", "StudentCount" AS "studentCount", "StartDate" AS "startDate", "EndDate" AS "endDate", ' +
        '"HasLab" AS "hasLab", "IsActive" AS "isActive", (SELECT count(*) FROM ' + schema + '."CourseTaAssigns" WHERE "CourseId" = course."CourseId" AND "AssignType" = \'Half\') AS "halfAssignCount", ' +
            '(SELECT count(*) FROM ' + schema + '."CourseTaAssigns" WHERE "CourseId" = course."CourseId" AND "AssignType" = \'Full\') AS "fullAssignCount"FROM ' + schema + '."Course" course ORDER BY "IsActive" DESC, "CourseCode" ASC;')
        .then(function (courses) {
            courses = courses.map(function (course) {
                return formatCourse(course);
            });
            res.send(courses);
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.get('/getCourse', function (req, res) {
    var courseId = req.query.courseId;
    db.query('SELECT "CourseId" AS "courseId", "CourseCode" AS "courseCode", "Title" AS "title", "StudentCount" AS "studentCount", "StartDate" AS "startDate", "EndDate" AS "endDate", ' +
        '"HasLab" AS "hasLab", "IsActive" AS "isActive" FROM ' + schema + '."Course" WHERE "CourseId" = $1', [courseId])
    .then(function (course) {
        res.send(course);
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.post('/addCourse', function (req, res) {
    var course = req.body;
    course.studentCount = (!course.studentCount ? null : course.studentCount);
    course.startDate = (!course.startDate ? null : course.startDate);
    course.endDate = (!course.endDate ? null : course.endDate);
    if (!course.courseCode || !((course.startDate && course.endDate) || (!course.startDate && !course.endDate))) {
        res.send({
            error: true,
            message: 'Course is invalid.'
        });
    } else {
        db.query('INSERT INTO ' + schema + '."Course"("CourseCode", "Title", "StudentCount", "StartDate", "EndDate", "HasLab", "IsActive") ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7);', [course.courseCode, course.title, course.studentCount, course.startDate, course.endDate, course.hasLab, course.isActive]) 
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
    }
});

taManager.post('/editCourse', function (req, res) {
    var course = req.body;
    course.studentCount = (!course.studentCount ? null : course.studentCount);
    course.startDate = (!course.startDate ? null : course.startDate);
    course.endDate = (!course.endDate ? null : course.endDate);
    if (!course.courseId || !course.courseCode || !((course.startDate && course.endDate) || (!course.startDate && !course.endDate))) {
        res.send({
            error: true,
            message: 'Course is invalid.'
        });
    } else {
        db.query('UPDATE ' + schema + '."Course" SET "CourseCode" = $1, "Title" = $2, "StudentCount" = $3, "StartDate" = $4, "EndDate" = $5, "HasLab" = $6, "IsActive" = $7 WHERE "CourseId" = $8',
        [course.courseCode, course.title, course.studentCount, course.startDate, course.endDate, course.hasLab, course.isActive, course.courseId])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
    }
});

taManager.post('/removeCourse', function (req, res) {
    var course = req.body;
    db.task(function (t) {
        return t.query('DELETE FROM ' + schema + '."CourseTaAssigns" WHERE "CourseId" = $1', course.courseId)
            .then(function () {
                return t.query('DELETE FROM ' + schema + '."Course" WHERE "CourseId" = $1', course.courseId);
            });
        })
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.get('/getAllTasForCourse', function (req, res) {
    var courseId = req.query.courseId;
    db.task(t => {
        return t.query('SELECT ta."UserId" AS "userId", ta."FirstName" AS "firstName", ta."LastName" AS "lastName", ta."Email" AS "email", ta."StudentNumber" AS "studentNumber", ' +
        'ta."StudentType" AS "studentType", assign."AssignType" AS "assignType", ta."IsActive" as "isActive" FROM ' + schema + '."CourseTaAssigns" assign ' +
        'INNER JOIN ' + schema + '."TeachingAssistant" ta ON assign."UserId" = ta."UserId" WHERE assign."CourseId" = $1 GROUP BY ta."UserId", assign."AssignType" ORDER BY ta."LastName" ASC', [courseId])
        .then(tas => {
            return getAssignmentSchedule(t)
            .then(assignmentSchedule => {
                tas = tas.map(function (ta) {
                    return formatTa(ta, assignmentSchedule);
                });
                res.send(tas);
            });
        })
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.get('/getAllPreviousTasForCourse', function (req, res) {
    var courseId = req.query.courseId;
    db.task(t => {
        return t.query('SELECT "CourseCode" from ' + schema + '."Course" where "CourseId" = $1', [courseId])
        .then(course => {
            return t.query('SELECT ta."UserId" AS "userId", ta."FirstName" AS "firstName", ta."LastName" AS "lastName", ta."Email" AS "email", ta."StudentNumber" AS "studentNumber", ' + 
            'ta."StudentType" AS "studentType", assign."AssignType" AS "assignType" FROM ' + schema + '."CourseTaAssigns" assign INNER JOIN ' + schema + '."TeachingAssistant" ta ON assign."UserId" = ta."UserId" ' +
            'JOIN ' + schema + '."Course" course ON course."CourseId" = assign."CourseId"' + 
            'WHERE course."CourseCode" = $1 AND assign."CourseId" != $2 GROUP BY ta."UserId", assign."AssignType" ORDER BY ta."LastName" ASC', [course[0].CourseCode, courseId])
            .then(taList => {
                res.send(taList);
            });
        });
    })    
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.get('/getUnassignedTasForCourse', function (req, res) {
    var courseId = req.query.courseId;
    db.task(t => {
        return t.query('SELECT  ta."UserId" AS "userId", ta."FirstName" AS "firstName", ta."LastName" AS "lastName", ta."Email" AS "email", ta."StudentType" AS "studentType", ta."StudentNumber" as "studentNumber", ta."IsActive" as "isActive" ' +
        'FROM ' + schema + '."TeachingAssistant" ta LEFT OUTER JOIN (SELECT * FROM ' + schema + '."CourseTaAssigns" WHERE "CourseId" = $1) assign ' +
        'ON ta."UserId" = assign."UserId" ' +
        'WHERE assign."UserId" is null ' +
        'GROUP BY ta."UserId" ' +
        'ORDER BY ta."LastName" ASC;', [courseId])
        .then(tas => {
            return getAssignmentSchedule(t)
            .then(assignmentSchedule => {
                tas = tas.map(function (ta) {
                    return formatTa(ta, assignmentSchedule);
                });
                res.send(tas);
            });
        });
    })
        
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.get('/getCourseTaAssignsBetweenDates', function (req, res) {
    var startDate = {
        term: req.query.startDateTerm,
        year: req.query.startDateYear
    };
    var endDate = {
        term: req.query.endDateTerm,
        year: req.query.endDateYear
    };

    db.task(t => {
        return t.query('SELECT "CourseId" AS "courseId", "CourseCode" AS "courseCode", "Title" AS "title", "StudentCount" AS "studentCount", "StartDate" AS "startDate", "EndDate" AS "endDate", ' + 
            '"HasLab" AS "hasLab", "IsActive" AS "isActive" FROM ' + schema + '."Course" WHERE "IsActive" = true ')
        .then(activeCourses => {
            return t.query('SELECT assign."CourseId" AS "assignedCourseId", ta."UserId" AS "userId", "FirstName" AS "firstName", "LastName" AS "lastName", "Email" AS "email", "StudentNumber" AS "studentNumber", "StudentType" AS "studentType", ' +
            'ta."IsActive" AS "isActive" FROM ' + schema + '."TeachingAssistant" ta JOIN ' + schema + '."CourseTaAssigns" assign ON ta."UserId" = assign."UserId" JOIN ' + schema + '."Course" course ON course."CourseId" = ' + 
            'assign."CourseId" WHERE course."IsActive" = true')
            .then(tasToActiveCourses => {
                activeCourses = activeCourses.map(function (course) {
                    course.taList = tasToActiveCourses.filter(function (ta) {
                        return course.courseId === ta.assignedCourseId;
                    });
                    course.startDateObj = dateTools.convertPgpStringToDate(course.startDate);
                    course.endDateObj = dateTools.convertPgpStringToDate(course.endDate);
                    return course;
                });
                activeCourses = activeCourses.filter(function (course) {
                    return dateTools.doDateRangesOverlap({ startDate: course.startDate, endDate: course.endDate }, { startDate: dateTools.buildStartDatePgpString(startDate.term, startDate.year), endDate: dateTools.buildEndDatePgpString(endDate.term, endDate.year) });
                });

                res.send(activeCourses);
            });
        });
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.get('/getPreviouslyTaughtForCourse', function (req, res) {
    var courseCode = req.query.courseCode;
    db.query('SELECT assign."UserId" AS "userId" FROM ' + schema + '."CourseTaAssigns" assign JOIN ' + schema + '."Course" course ON assign."CourseId" = course."CourseId" ' +
    'WHERE course."CourseCode" = $1 GROUP BY assign."UserId" ;', [courseCode])
    .then(function (data) {
        res.send(data);
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});


// =========================================== TEACHING ASSISTANTS PAGE ===========================================

var sanitizeStudentType = function (studentType) {
    if (typeof studentType !== "string") {
        return null;
    } else if (studentType.toUpperCase() === "MASTERS") {
        return "Masters";
    } else if (studentType.toUpperCase() === "PHD") {
        return "PhD";
    } else {
        return null;
    }
};

var sanitizeTa = function (ta) {
    ta.studentType = sanitizeStudentType(ta.studentType);
    ta.studentNumber = ta.studentNumber ? ta.studentNumber : null;
    return ta;
};

taManager.get('/getAllTas', function (req, res) {
    db.task(t => {
        return db.query('SELECT "UserId" AS "userId", "FirstName" AS "firstName", "LastName" AS "lastName", "Email" AS "email", "StudentNumber" AS "studentNumber", "StudentType" AS "studentType", ' +
        '"IsActive" AS "isActive" FROM ' + schema + '."TeachingAssistant" ORDER BY "UserId" ASC;')
        .then(tas => {
            return getAssignmentSchedule(t)
            .then(assignmentSchedule => {
                tas = tas.map(function (ta) {
                    return formatTa(ta, assignmentSchedule);
                });
                res.send(tas);
            });
        });
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.get('/getTa', function (req, res) {
    var userId = req.query.userId;
    db.query('SELECT "UserId" AS "userId", "FirstName" AS "firstName", "LastName" AS "lastName", "Email" AS "email", "StudentNumber" AS "studentNumber", "StudentType" AS "studentType", ' + 
        '"IsActive" AS "isActive" FROM ' + schema + '."TeachingAssistant" WHERE "UserId" = $1', [userId])
    .then(function (ta) {
        res.send(ta);
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.post('/addTa', function (req, res) {
    var ta = req.body;
    ta = sanitizeTa(ta);
    db.query('INSERT INTO ' + schema + '."TeachingAssistant"("UserId", "StudentNumber", "FirstName", "LastName", "Email", "StudentType", "IsActive") ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7);', [ta.userId, ta.studentNumber, ta.firstName, ta.lastName, ta.email, ta.studentType, ta.isActive])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/editTa', function (req, res) {
    var ta = req.body;
    ta = sanitizeTa(ta);
    db.query('UPDATE ' + schema + '."TeachingAssistant" SET "StudentNumber" = $1, "FirstName" = $2, "LastName" = $3, "Email" = $4, "StudentType" = $5, "IsActive" = $6 WHERE "UserId" = $7',
        [ta.studentNumber, ta.firstName, ta.lastName, ta.email, ta.studentType, ta.isActive, ta.userId])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/removeTa', function (req, res) {
    var ta = req.body;
    db.task(function (t) {
        return t.query('DELETE FROM ' + schema + '."CourseTaAssigns" WHERE "UserId" = $1', ta.userId)
            .then(function () {
                return t.query('DELETE FROM ' + schema + '."SupervisorTaAssigns" WHERE "UserId" = $1', ta.userId)
                    .then(function () {
                        return t.query('DELETE FROM ' + schema + '."TeachingAssistant" WHERE "UserId" = $1', ta.userId);
                    });
            });
    })
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.get('/getAllActiveTas', function (req, res) {
    db.task(t => {
        return t.query('SELECT "UserId" AS "userId", "FirstName" AS "firstName", "LastName" AS "lastName", "Email" AS "email", "StudentNumber" AS "studentNumber", "StudentType" AS "studentType", ' +
        '"IsActive" AS "isActive" FROM ' + schema + '."TeachingAssistant" WHERE "IsActive" = true ORDER BY "UserId" ASC;')
        .then(activeTas => {
            return t.query('SELECT course."CourseId" AS "courseId", "CourseCode" AS "courseCode", "UserId" AS "userId", "StartDate" AS "startDate", "EndDate" AS "endDate", ' +
            '"AssignType" AS "assignType" FROM ' + schema + '."Course" course JOIN ' + schema + '."CourseTaAssigns" assign ON course."CourseId" = assign."CourseId" ' + 
            'WHERE "StartDate" IS NOT NULL AND "EndDate" IS NOT NULL;')
            .then(assignmentSchedule => {
                activeTas = activeTas.map(function (ta) {
                    return formatTa(ta, assignmentSchedule);
                });
                res.send(activeTas);
            })
        })
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.get('/getAllCoursesForAllActiveTas', function (req, res) {
    db.query('SELECT course."CourseId" AS "courseId", "CourseCode" AS "courseCode", "Title" AS "title", "StudentCount" AS "studentCount", "StartDate" AS "startDate", "EndDate" AS "endDate", ' +
        '"HasLab" AS "hasLab", course."IsActive" AS "isActive", ta."UserId" as "userId" FROM ' + schema + '."CourseTaAssigns" assign JOIN ' + schema + '."Course" course ON assign."CourseId" = course."CourseId" ' +
        'JOIN ' + schema + '."TeachingAssistant" ta ON ta."UserId" = assign."UserId" WHERE ta."IsActive" = true ORDER BY course."CourseCode" ASC;')
    .then(function (courses) {
        res.send(courses);
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.get('/getAllCoursesForTa', function (req, res) {
    var userId = req.query.userId;
    db.query('SELECT course."CourseId" AS "courseId", "CourseCode" AS "courseCode", "Title" AS "title", "StudentCount" AS "studentCount", "StartDate" AS "startDate", "EndDate" AS "endDate", ' +
        '"HasLab" AS "hasLab", "IsActive" AS "isActive", assign."AssignType" as "assignType" FROM ' + schema + '."CourseTaAssigns" assign JOIN ' + schema + '."Course" course ' + 
        'ON assign."CourseId" = course."CourseId" WHERE assign."UserId" = $1 ORDER BY course."CourseCode" ASC;', [userId])
    .then(function (courses) {
        res.send(courses);
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

taManager.get('/getAllSupervisorsForTa', function (req, res) {
    var userId = req.query.userId;
    db.query('SELECT supervisor."SupervisorId" AS "supervisorId", "FirstName" AS "firstName", "LastName" AS "lastName", "Email" AS "email" ' +
        'FROM ' + schema + '."SupervisorTaAssigns" assign JOIN ' + schema + '."Supervisor" supervisor ON assign."SupervisorId" = supervisor."SupervisorId" WHERE assign."UserId" = $1 ' +
        'ORDER BY supervisor."LastName" ASC;', [userId])
    .then(function (supervisors) {
        res.send(supervisors);
    })
    .catch(function (error) {
        console.log('ERROR: ', error);
    });
});

// =========================================== SUPERVISORS PAGE ===========================================

taManager.get('/getAllSupervisors', function (req, res) {
    db.query('SELECT "SupervisorId" AS "supervisorId", "FirstName" AS "firstName", "LastName" AS "lastName", "Email" AS "email" FROM ' + schema + '."Supervisor" ORDER BY "LastName" ASC;')
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/addSupervisor', function (req, res) {
    var supervisor = req.body;
    db.query('INSERT INTO ' + schema + '."Supervisor"("FirstName", "LastName", "Email") ' +
        'VALUES ($1, $2, $3);', [supervisor.firstName, supervisor.lastName, supervisor.email])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/editSupervisor', function (req, res) {
    var supervisor = req.body;
    db.query('UPDATE ' + schema + '."Supervisor" SET "FirstName" = $1, "LastName" = $2, "Email" = $3 WHERE "SupervisorId" = $4',
        [supervisor.firstName, supervisor.lastName, supervisor.email, supervisor.supervisorId])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/removeSupervisor', function (req, res) {
    var supervisor = req.body;
    db.task(function (t) {
        return t.query('DELETE FROM ' + schema + '."SupervisorTaAssigns" WHERE "SupervisorId" = $1', supervisor.supervisorId)
            .then(function () {
                return t.query('DELETE FROM ' + schema + '."Supervisor" WHERE "SupervisorId" = $1', supervisor.supervisorId);
            });
    })
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.get('/getAllTasForSupervisor', function (req, res) {
    var supervisorId = req.query.supervisorId;
    db.query('SELECT ta."UserId" AS "userId", ta."FirstName" AS "firstName", ta."LastName" AS "lastName", ta."Email" AS "email", ta."StudentNumber" AS "studentNumber", ta."StudentType" AS "studentType", ' +
        'ta."IsActive" AS "isActive" FROM ' + schema + '."SupervisorTaAssigns" supervisor INNER JOIN ' + schema + '."TeachingAssistant" ta ON supervisor."UserId" = ta."UserId" WHERE supervisor."SupervisorId" = $1 GROUP BY ta."UserId" ORDER BY ta."LastName" ASC', [supervisorId])
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.get('/getUnassignedTasForSupervisor', function (req, res) {
    var supervisorId = req.query.supervisorId;
    db.query('SELECT  ta."UserId" AS "userId", ta."FirstName" AS "firstName", ta."LastName" AS "lastName", ta."Email" AS "email", ta."StudentNumber" as "studentNumber" ' +
        'FROM ' + schema + '."TeachingAssistant" ta LEFT OUTER JOIN (SELECT * FROM ' + schema + '."SupervisorTaAssigns" WHERE "SupervisorId" = $1) supervisor ' +
        'ON ta."UserId" = supervisor."UserId" ' +
        'WHERE supervisor."UserId" is null ' +
        'GROUP BY ta."UserId" ' +
        'ORDER BY ta."LastName" ASC;', [supervisorId])
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});


// =========================================== ASSIGNMENT FUNCTIONS ===========================================

// Returns a TA with the maxAssigns and numOfAssigns fields
var formatTa = function (ta, assignmentSchedule) {
    ta.maxAssigns = (ta.studentType === 'PhD' ? 8 : 3);
    ta.numOfAssigns = assignmentSchedule.filter(function (assignment) {
        return assignment.userId === ta.userId;
    }).reduce(function (acc, assignment) {
        return +acc + dateTools.convertDateRangeToTermCount(assignment.startDate, assignment.endDate) * (assignment.assignType === "Full" ? 1 : 0.5);
    }, 0);
    return ta;
};

// Returns a Course with the maxAssigns, numOfAssigns, and courseTermCount fields
var formatCourse = function (course) {
    course.maxAssigns = Math.ceil(+course.studentCount / 50);
    course.numOfAssigns = +course.fullAssignCount + 0.5 * course.halfAssignCount;
    course.courseTermCount = dateTools.convertDateRangeToTermCount(course.startDate, course.endDate);
    return course;
};

// A valid TA should not exceed the max number of assignments.
var isValidTa = function (ta) {
    return ta.maxAssigns > ta.numOfAssigns;
};

// A valid Course should not exceed the max amount of assignments and should have a valid start and end date range.
var isValidCourse = function (course) {
    var startDate = dateTools.convertPgpStringToDate(course.startDate);
    var endDate = dateTools.convertPgpStringToDate(course.endDate);
    return course.maxAssigns > course.numOfAssigns && !!course.startDate && !!course.endDate && startDate < endDate;
};

var largestAssignTaToCourse = function (ta, course, assignmentSchedule) {
    // How much is left in the course?
    var courseAssignmentsRemaining = course.maxAssigns - course.numOfAssigns;
    // How much is left in the TA for this term? How much is left in the TA in general?
    var taAssignmentSchedule = assignmentSchedule.filter(function (assignment) {
        return ta.userId === assignment.userId;
    });

    // Make sure that the TA is not already assigned to the course.
    var isCourseSame = function (assignment) {
        return assignment.courseId === course.courseId;
    }
    if (taAssignmentSchedule.some(isCourseSame)) {
        return '';
    }

    var nextTerm = {
        'Winter': 'Summer',
        'Summer': 'Fall',
        'Fall': 'Winter'
    };
    var curCourseDate = dateTools.convertPgpStringToDate(course.startDate);
    curCourseDateObj = {
        term: dateTools.convertDateToTerm(curCourseDate),
        year: curCourseDate.getFullYear()
    }
    var courseEndDate = dateTools.convertPgpStringToDate(course.endDate);
    courseEndDateObj = {
        term: dateTools.convertDateToTerm(courseEndDate),
        year: courseEndDate.getFullYear()
    };
    var largestOverlap = 0;
    var overlap = 0;
    var attempts = 0;
    var maxAttempts = 500;
    // Check for overlaps in the schedule, pick the biggest one
    while (curCourseDateObj.term !== nextTerm[courseEndDateObj.term] && curCourseDateObj.year !== (courseEndDateObj.term === 'Fall' ? courseEndDateObj.year + 1 : courseEndDateObj) && attempts < maxAttempts) {
        overlap = 0;
        var courseDates = {
            startDate: dateTools.buildStartDatePgpString(curCourseDateObj.term, curCourseDateObj.year),
            endDate: dateTools.buildEndDatePgpString(courseEndDateObj.term, courseEndDateObj.year)
        };
        taAssignmentSchedule.forEach(function (assignment) {
            var assignmentDates = {
                startDate: assignment.startDate,
                endDate: assignment.endDate
            };
            if (dateTools.doDateRangesOverlap(courseDates, assignmentDates)) {
                overlap += (assignment.assignType === 'Full' ? 1 : 0.5);
            }
        });
        largestOverlap = largestOverlap > overlap ? largestOverlap : overlap;

        // Increment the term
        curCourseDateObj.year += curCourseDateObj.term === 'Fall' ? 1 : 0;
        curCourseDateObj.term = nextTerm[curCourseDateObj.term];
        attempts++;
    }
    // Take the minimum amount between these two maximum values. Are we doing a full or half assignment?
    var maxAssignTypeForCourse;
    if (largestOverlap === 0 && courseAssignmentsRemaining >= 1) {
        maxAssignTypeForCourse = 'Full';
    } else if (largestOverlap <= 0.5 && courseAssignmentsRemaining >= 0.5) {
        maxAssignTypeForCourse = 'Half';
    } else {
        maxAssignTypeForCourse = '';
    }
    var maximumAssignmentsAllowedForCourse = (1 - largestOverlap) * course.courseTermCount;
    var taAssignmentsRemaining = ta.maxAssigns - ta.numOfAssigns;
    if (maximumAssignmentsAllowedForCourse > taAssignmentsRemaining || taAssignmentsRemaining <= 0 || attempts === maxAttempts) {
        return '';
    } else {
        return maxAssignTypeForCourse;
    }
};

taManager.post('/autoAssignTas', function (req, res) {
    db.task(t => {
        return t.query('SELECT "CourseId" AS "courseId", "CourseCode" AS "courseCode", "Title" AS "title", "StudentCount" AS "studentCount", "StartDate" AS "startDate", "EndDate" AS "endDate", ' +
            '"HasLab" AS "hasLab", "IsActive" AS "isActive", (SELECT count(*) FROM ' + schema + '."CourseTaAssigns" WHERE "CourseId" = course."CourseId" AND "AssignType" = \'Half\') AS "halfAssignCount", ' +
            '(SELECT count(*) FROM ' + schema + '."CourseTaAssigns" WHERE "CourseId" = course."CourseId" AND "AssignType" = \'Full\') AS "fullAssignCount" FROM ' + schema + '."Course" course WHERE "IsActive" = true;')
            .then(activeCourses => {
                return t.query('SELECT "UserId" AS "userId", "FirstName" AS "firstName", "LastName" AS "lastName", "Email" AS "email", "StudentNumber" AS "studentNumber", ' +
                    '"StudentType" AS "studentType" FROM ' + schema + '."TeachingAssistant" WHERE "IsActive" = true;')
                    .then(activeTas => {
                        return t.query('SELECT assign."UserId" AS "userId", course."CourseCode" AS "courseCode" FROM ' + schema + '."CourseTaAssigns" assign JOIN ' + schema + '."Course" course ON assign."CourseId" = course."CourseId" ' +
                            'INNER JOIN (SELECT * FROM ' + schema + '."Course" WHERE "IsActive" = true) activeCourses ON activeCourses."CourseCode" = course."CourseCode" ' +
                            'GROUP BY assign."UserId", course."CourseCode" ORDER BY course."CourseCode";')
                            .then(previouslyTaught => {
                                return t.query('SELECT course."CourseId" AS "courseId", "CourseCode" AS "courseCode", "UserId" AS "userId", "StartDate" AS "startDate", "EndDate" AS "endDate", ' +
                                    '"AssignType" AS "assignType" FROM ' + schema + '."Course" course ' +
                                    'JOIN ' + schema + '."CourseTaAssigns" assign ON course."CourseId" = assign."CourseId" WHERE "StartDate" IS NOT NULL AND "EndDate" IS NOT NULL;')
                                    .then(assignmentSchedule => {
                                        // Format data for processing, define return object.
                                        var autoAssignments = [];
                                        activeCourses.forEach(function (course) {
                                            course = formatCourse(course);
                                        });
                                        activeCourses.sort(function (courseA, courseB) {
                                            return courseB.courseTermCount - courseA.courseTermCount;
                                        });
                                        activeTas.forEach(function (ta) {
                                            ta = formatTa(ta, assignmentSchedule);
                                        });
                                        // Remove full activeCourses and activeTas.  Remove courses lacking start and/or end dates.
                                        activeCourses = activeCourses.filter(isValidCourse);
                                        activeTas = activeTas.filter(isValidTa);

                                        // Priority assignments.
                                        activeCourses.forEach(function (course) {
                                            var activeTasWhoPreviouslyTaughtThisCourse = previouslyTaught.filter(function (assignment) {
                                                return course.courseCode === assignment.courseCode && activeTas.some(function (ta) { return ta.userId === assignment.userId; });
                                            }).map(function (assignment) {
                                                return assignment.userId;
                                            });
                                            // Try to assign them all.
                                            activeTasWhoPreviouslyTaughtThisCourse.forEach(function (userId) {
                                                var ta = activeTas.find(function (ta) {
                                                    return ta.userId === userId
                                                });
                                                var assignmentType = largestAssignTaToCourse(ta, course, assignmentSchedule);
                                                if (assignmentType) {
                                                    ta.numOfAssigns += (assignmentType === "Full" ? 1 : 0.5) * course.courseTermCount;
                                                    course.numOfAssigns += assignmentType === "Full" ? 1 : 0.5;
                                                    assignmentSchedule.push({
                                                        courseId: course.courseId,
                                                        courseCode: course.courseCode,
                                                        userId: ta.userId,
                                                        startDate: course.startDate,
                                                        endDate: course.endDate,
                                                        assignType: assignmentType
                                                    });
                                                    autoAssignments.push({ ta: ta, course: course, assignType: assignmentType });
                                                }
                                            });
                                        });

                                        // Remaining assignments.
                                        for (var i = 0; i < activeCourses.length; i++) {
                                            var course = activeCourses[i];
                                            for (var j = 0; j < activeTas.length; j++) {
                                                var ta = activeTas[j];
                                                if (course.numOfAssigns >= course.maxAssigns) {
                                                    activeCourses.splice(i, 1);
                                                    i--;
                                                    break;
                                                }
                                                if (ta.numOfAssigns >= ta.maxAssigns) {
                                                    activeTas.splice(j, 1);
                                                    j--;
                                                } else {
                                                    var assignmentType = largestAssignTaToCourse(ta, course, assignmentSchedule);
                                                    if (assignmentType) {
                                                        ta.numOfAssigns += (assignmentType === "Full" ? 1 : 0.5) * course.courseTermCount;
                                                        course.numOfAssigns += assignmentType === "Full" ? 1 : 0.5;
                                                        assignmentSchedule.push({
                                                            courseId: course.courseId,
                                                            courseCode: course.courseCode,
                                                            userId: ta.userId,
                                                            startDate: course.startDate,
                                                            endDate: course.endDate,
                                                            assignType: assignmentType
                                                        });
                                                        autoAssignments.push({ ta: ta, course: course, assignType: assignmentType });
                                                    }
                                                }
                                            }
                                        }
                                        res.send(autoAssignments);
                                    });
                            });
                    });
            })
            .catch(function (error) {
                console.log('ERROR: ', error);
            });
    });
});

taManager.post('/assignTaToCourse', function (req, res) {
    var userId = req.body.userId;
    var courseId = req.body.courseId;
    var assignType = req.body.assignType;
    var giveWarnings = req.body.giveWarnings;
    if (giveWarnings.toUpperCase() === "TRUE") {
        db.task(t => {
            return t.one('SELECT "UserId" AS "userId", "FirstName" AS "firstName", "LastName" AS "lastName", "Email" AS "email", "StudentNumber" AS "studentNumber", "StudentType" AS "studentType" ' + 
                'FROM ' + schema + '."TeachingAssistant" WHERE "UserId" = $1;', [userId])
            .then(ta => {
                return t.one('SELECT "CourseId" AS "courseId", "CourseCode" AS "courseCode", "Title" AS "title", "StudentCount" AS "studentCount", "StartDate" AS "startDate", "EndDate" AS "endDate", ' +
                    '"HasLab" AS "hasLab", "IsActive" AS "isActive", (SELECT count(*) FROM ' + schema + '."CourseTaAssigns" WHERE "CourseId" = course."CourseId" AND "AssignType" = \'Half\') AS "halfAssignCount", ' +
                    '(SELECT count(*) FROM ' + schema + '."CourseTaAssigns" WHERE "CourseId" = course."CourseId" AND "AssignType" = \'Full\') AS "fullAssignCount" FROM ' + schema + '."Course" course WHERE "CourseId" = $1;', [courseId])
                .then(course => {
                    return getAssignmentSchedule(t)
                    .then(assignmentSchedule => {
                        ta = formatTa(ta, assignmentSchedule);
                        course = formatCourse(course);
                        var x = largestAssignTaToCourse(ta, course, assignmentSchedule);
                        var assignmentSizeDict = {
                            "FULL": 2,
                            "HALF": 1,
                            "": 0
                        };
                        if (assignmentSizeDict[x.toUpperCase()] >= assignmentSizeDict[assignType.toUpperCase()]) {
                            return assignTa(res, t, userId, courseId, assignType);
                        } else {
                            res.send({ warning: true });
                        }
                    });
                });
            });
        })
        .catch(function (error) {
            console.log('ERROR: ' + error);
            res.sendStatus(500);
        });
    } else {
        assignTa(res, db, userId, courseId, assignType);
    }
    
});

taManager.post('/unassignTaToCourse', function (req, res) {
    var assign = req.body;
    db.query('DELETE FROM ' + schema + '."CourseTaAssigns" WHERE "UserId" = $1 AND "CourseId" = $2', [assign.userId, assign.courseId])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/assignTaToSupervisor', function (req, res) {
    var assign = req.body;
    db.query('INSERT INTO ' + schema + '."SupervisorTaAssigns"("UserId", "SupervisorId") ' +
        'VALUES ($1, $2);', [assign.userId, assign.supervisorId])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/unassignTaToSupervisor', function (req, res) {
    var assign = req.body;
    db.query('DELETE FROM ' + schema + '."SupervisorTaAssigns" WHERE "UserId" = $1 AND "SupervisorId" = $2', [assign.userId, assign.supervisorId])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

taManager.post('/updateCourseTaAssignment', function (req, res) {
    var assign = req.body;
    db.query('UPDATE ' + schema + '."CourseTaAssigns" SET "AssignType" = $1 WHERE "UserId" = $2 AND "CourseId" = $3', [assign.assignType, assign.userId, assign.courseId])
        .then(function (data) {
            res.send();
        })
        .catch(function (error) {
            console.log('ERROR: ', error);
        });
});

// Listen on 8080
taManager.listen(PORT, function () {
    console.log('TA Manager listening on port ' + PORT);
});