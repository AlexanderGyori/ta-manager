'use strict';

var CourseViewModel = function () {
    var self = this;
    self.courseList = ko.observableArray();

    /**
     * Modal models
     */

    self.addCourseModal = {
        courseCode: ko.observable(''),
        hasCourseCodeError: ko.observable(false),
        title: ko.observable(''),
        studentCount: ko.observable(''),
        startDateTerm: ko.observable(''),
        startDateTermLabel: ko.observable('Term'),
        startDateYear: ko.observable(''),
        endDateTerm: ko.observable(''),
        endDateTermLabel: ko.observable('Term'),
        endDateYear: ko.observable(''),
        hasDateError: ko.observable(false),
        hasLab: ko.observable(false),
        isActive: ko.observable(false)
    };

    self.addCourseModal.studentCount.subscribe(function (newCount) {
        self.addCourseModal.studentCount(Math.abs(Math.trunc(+newCount)));
    });
    self.addCourseModal.startDateYear.subscribe(function (newYear) {
        self.addCourseModal.startDateYear(Math.abs(Math.trunc(+newYear)));
    });
    self.addCourseModal.endDateYear.subscribe(function (newYear) {
        self.addCourseModal.endDateYear(Math.abs(Math.trunc(+newYear)));
    });

    self.editCourseModal = {
        courseId: ko.observable(null),
        courseCode: ko.observable(''),
        hasCourseCodeError: ko.observable(false),
        title: ko.observable(''),
        studentCount: ko.observable(''),
        startDateTerm: ko.observable(''),
        startDateTermLabel: ko.observable('Term'),
        startDateYear: ko.observable(''),
        endDateTerm: ko.observable(''),
        endDateTermLabel: ko.observable('Term'),
        endDateYear: ko.observable(''),
        hasDateError: ko.observable(false),
        hasLab: ko.observable(false),
        isActive: ko.observable(false)
    };

    self.editCourseModal.studentCount.subscribe(function (newCount) {
        self.editCourseModal.studentCount(Math.abs(Math.trunc(+newCount)));
    });
    self.editCourseModal.startDateYear.subscribe(function (newYear) {
        self.editCourseModal.startDateYear(Math.abs(Math.trunc(+newYear)));
    });
    self.editCourseModal.endDateYear.subscribe(function (newYear) {
        self.editCourseModal.endDateYear(Math.abs(Math.trunc(+newYear)));
    });

    self.assignTaModal = {
        assignedTas: ko.observableArray(),
        unassignedTas: ko.observableArray(),
        searchTerm: ko.observable(''),
        searchColumn: ko.observable('userId'),
        searchColumnLabel: ko.observable('User Id'),
        courseId: ko.observable(null)
    };

    self.removeCourseModal = {
        courseId: ko.observable(null)
    };

    self.autoAssignModal = {
        courseList: ko.observableArray()
    };

    self.assignmentWarningModal = {
        courseId: ko.observable(),
        userId: ko.observable(),
        assignType: ko.observable()
    };

    self.populateCourseList = function (courses) {
        self.courseList.removeAll();
        courses.forEach(function (course) {
            course.isVisible = ko.observable(true);
            course.taList = ko.observableArray();
            course.startDate = (course.startDate ? dateTools.convertPgpStringToDate(course.startDate) : null);
            course.startDateTerm = (course.startDate ? dateTools.convertDateToTerm(course.startDate) : '');
            course.startDateYear = (course.startDate ? course.startDate.getFullYear() : '');
            course.startDateTermYear = (course.startDate ? course.startDateTerm + ', ' + course.startDateYear : '');
            course.endDate = (course.endDate ? dateTools.convertPgpStringToDate(course.endDate) : null);
            course.endDateTerm = (course.endDate ? dateTools.convertDateToTerm(course.endDate) : '');
            course.endDateYear = (course.endDate ? course.endDate.getFullYear() : '');
            course.endDateTermYear = (course.endDate ? course.endDateTerm + ', ' + course.endDateYear : '');
            self.getTasInCourse(course);
            self.courseList.push(course);
        });
    };

    self.getCourseList = function () {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getAllCourses", true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) { // TODO: ADD LOADING GIF HERE
                self.populateCourseList(JSON.parse(xhttp.responseText));
                self.search(self.searchTerm());
            }
        };
        xhttp.send();
    };

    self.getTasInCourse = function (course) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getAllTasForCourse?courseId="+course.courseId, true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var taList = JSON.parse(xhttp.responseText) || [];
                taList.forEach(function (ta) {
                    ta.name = (ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a');
                });
                course.taList(taList);
            }
        };
        xhttp.send();
    };

    /* *
     * Add Course functions
     * */

    self.displayAddCourseModal = function () {
        self.clearAddCourseModal();
        $('#addCourseModal').modal('show');
    };

    self.closeAddCourseModal = function () {
        $('#addCourseModal').modal('hide');
    };

    self.clearAddCourseModal = function () {
        self.addCourseModal.courseCode('');
        self.addCourseModal.hasCourseCodeError(false);
        self.addCourseModal.title('');
        self.addCourseModal.studentCount('');
        self.addCourseModal.startDateTerm('');
        self.addCourseModal.startDateTermLabel('Term');
        self.addCourseModal.startDateYear('');
        self.addCourseModal.endDateTerm('');
        self.addCourseModal.endDateTermLabel('Term');
        self.addCourseModal.endDateYear('');
        self.addCourseModal.hasDateError(false);
        self.addCourseModal.hasLab(false);
        self.addCourseModal.isActive(false);
    };

    self.addCourseModal.setStartDateTerm = function (term) {
        self.addCourseModal.startDateTerm(term);
    };

    self.addCourseModal.setEndDateTerm = function (term) {
        self.addCourseModal.endDateTerm(term);
    };

    self.addCourseModal.startDateTerm.subscribe(function (newTerm) {
        self.addCourseModal.startDateTermLabel(newTerm || 'Term');
    });

    self.addCourseModal.endDateTerm.subscribe(function (newTerm) {
        self.addCourseModal.endDateTermLabel(newTerm || 'Term');
    });

    var courseModalIsValid = function (course) {
        course.hasCourseCodeError(!course.courseCode());
        course.hasDateError(!((course.startDateTerm() && course.startDateYear() && course.endDateTerm() && course.endDateYear()) || (!course.startDateTerm() && !course.startDateYear() && !course.endDateTerm() && !course.endDateYear())));
        return !(course.hasCourseCodeError() || course.hasDateError());
    };

    self.addCourse = function (course) {
        if (!courseModalIsValid(course)) {
            return;
        }
        
        var xhttp = new XMLHttpRequest();
        var params =
            "courseCode=" + (course.courseCode() || '') + "&" +
            "title=" + (course.title() || '') + "&" +
            "studentCount=" + (Math.trunc(+course.studentCount()) || '') + "&" +
            "startDate=" + (course.startDateTerm() && course.startDateYear() ? dateTools.buildStartDatePgpString(course.startDateTerm(), course.startDateYear()) : '') + "&" +
            "endDate=" + (course.endDateTerm() && course.endDateYear() ? dateTools.buildEndDatePgpString(course.endDateTerm(), course.endDateYear()) : '') + "&" +
            "hasLab=" + (course.hasLab() || false) + "&" +
            "isActive=" + (course.isActive() || false);
        xhttp.open("POST", "addCourse", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getCourseList();
                self.closeAddCourseModal();
            }
        };
        xhttp.send(params);
    };

    /* *
     * Edit Course functions
     * */

    self.displayEditCourseModal = function (course) {
        self.setEditCourseModal(course);
        $('#editCourseModal').modal('show');
    };

    self.closeEditCourseModal = function () {
        $('#editCourseModal').modal('hide');
    };

    self.setEditCourseModal = function (course) {
        self.editCourseModal.courseId(course.courseId || null);
        self.editCourseModal.courseCode(course.courseCode || '');
        self.editCourseModal.title(course.title || '');
        self.editCourseModal.studentCount(course.studentCount || '');
        self.editCourseModal.startDateTerm(course.startDateTerm || '');
        self.editCourseModal.startDateTermLabel(course.startDateTerm || 'Term');
        self.editCourseModal.startDateYear(course.startDateYear || '');
        self.editCourseModal.endDateTerm(course.endDateTerm || '');
        self.editCourseModal.endDateYear(course.endDateYear || '');
        self.editCourseModal.hasDateError(false);
        self.editCourseModal.hasLab(course.hasLab || false);
        self.editCourseModal.isActive(course.isActive || false);
    };

    self.editCourseModal.setStartDateTerm = function (term) {
        self.editCourseModal.startDateTerm(term);
    };

    self.editCourseModal.setEndDateTerm = function (term) {
        self.editCourseModal.endDateTerm(term);
    };

    self.editCourseModal.startDateTerm.subscribe(function (newTerm) {
        self.editCourseModal.startDateTermLabel(newTerm || 'Term');
    });

    self.editCourseModal.endDateTerm.subscribe(function (newTerm) {
        self.editCourseModal.endDateTermLabel(newTerm || 'Term');
    });

    self.editCourse = function (course) {
        if (!course.courseId()) {
            alert('Course is invalid.');
        } else if (!courseModalIsValid(course)) {
            return;
        }

        var xhttp = new XMLHttpRequest();
        var params =
            "courseId=" + course.courseId() + "&" +
            "courseCode=" + (course.courseCode() || '') + "&" +
            "title=" + (course.title() || '') + "&" +
            "studentCount=" + (Math.trunc(+course.studentCount()) || '') + "&" +
            "startDate=" + (course.startDateTerm() && course.startDateYear() ? dateTools.buildStartDatePgpString(course.startDateTerm(), course.startDateYear()) : '') + "&" +
            "endDate=" + (course.endDateTerm() && course.endDateYear() ? dateTools.buildEndDatePgpString(course.endDateTerm(), course.endDateYear()) : '') + "&" +
            "hasLab=" + (course.hasLab() || false) + "&" +
            "isActive=" + (course.isActive() || false);
        xhttp.open("POST", "editCourse", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getCourseList();
                self.closeEditCourseModal();
            }
        };
        xhttp.send(params);
    };

    /* *
     * Remove Course functions
     * */

    self.removeCourse = function (course) {
        if (!course.courseId()) {
            alert("Could not remove course.");
            return;
        }
        var xhttp = new XMLHttpRequest();
        var params = "courseId=" + (course.courseId() || '');
        xhttp.open("POST", "removeCourse", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getCourseList();
                self.closeRemoveCourseModal();
            }
        };
        xhttp.send(params);
    };

    self.displayRemoveCourseModal = function (course) {
        self.setRemoveCourseModal(course);
        $('#removeCourseModal').modal('show');
    };

    self.closeRemoveCourseModal = function () {
        $('#removeCourseModal').modal('hide');
    };

    self.setRemoveCourseModal = function (course) {
        self.removeCourseModal.courseId(course.courseId);
    };

    /**
     * TA Assign Modal functions
     */

    var assignSearchColumnLabelDictionary = {
        'userId': 'User Id',
        'name': 'Name',
        'email': 'Email',
        'studentNumber': 'Student Number'
    };

    self.assignTaModal.search = function (searchTerm) {
        self.assignTaModal.unassignedTas(tableTools.filter(self.assignTaModal.unassignedTas(), self.assignTaModal.searchColumn(), searchTerm));
    };
    self.assignTaModal.searchTerm.subscribe(function (newSearchTerm) {
        self.assignTaModal.search(newSearchTerm);
    });
    self.assignTaModal.clearSearchTerm = function () {
        self.assignTaModal.searchTerm('');
    };

    self.assignTaModal.searchColumn.subscribe(function (newSearchColumn) {
        self.assignTaModal.searchColumnLabel(assignSearchColumnLabelDictionary[newSearchColumn]);
        self.assignTaModal.search(self.assignTaModal.searchTerm());
    });
    self.assignTaModal.setSearchColumn = function (newSearchColumn) {
        self.assignTaModal.searchColumn(newSearchColumn);
    };

    self.displayAssignTaModal = function (course) {
        self.setAssignTaModal(course);
        $('#assignTaModal').modal('show');
    };

    self.closeAssignTaModal = function () {
        $('#assignTaModal').modal('hide');
    };

    self.assignTaModal.setUnassignedTaList = function (taList) {
        self.assignTaModal.unassignedTas.removeAll();
        taList.forEach(function (ta, i) {
            ta.isVisible = ko.observable(true);
            ta.assignType = ko.observable("Full");
            ta.name = (ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a');
            self.assignTaModal.unassignedTas.push(ta);
        });
    };

    self.assignTaModal.loadUnassignedTaList = function (courseId) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getUnassignedTasForCourse?courseId="+courseId, true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.assignTaModal.setUnassignedTaList(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.send();
    };

    self.setAssignTaModal = function (course) {
        self.assignTaModal.loadUnassignedTaList(course.courseId);
        self.assignTaModal.assignedTas(course.taList().slice(0).map(function (ta) {
            ta.assignType = ko.observable(ta.assignType);
            return ta;
        }));
        self.assignTaModal.searchTerm('');
        self.assignTaModal.searchColumn('userId');
        self.assignTaModal.searchColumnLabel('User Id');
        self.assignTaModal.courseId(course.courseId || null);
    };

    self.pushTaToCourseList = function (courseId, ta) {
        var isSelectedCourse = function (course) {
            return course.courseId === courseId;
        };
        self.courseList().find(isSelectedCourse).taList.push(ta);
    };

    self.removeTaFromCourse = function (courseId, ta) {
        var isSelectedCourse = function (course) {
            return course.courseId === courseId;
        };
        var isUserTa = function (x) {
            return ta.userId === x.userId;
        };
        self.courseList().find(isSelectedCourse).taList.remove(isUserTa);
    };

    self.assignTaModal.moveTaToAssigned = function (userId) {
        var isUserTa = function (ta) {
            return userId === ta.userId;
        };
        var ta = self.assignTaModal.unassignedTas().find(isUserTa);
        self.assignTaModal.unassignedTas.remove(isUserTa);
        self.assignTaModal.assignedTas.push(ta);
        self.pushTaToCourseList(self.assignTaModal.courseId(), ta);
    };

    self.assignTaModal.moveTaToUnassigned = function (userId) {
        var isUserTa = function (ta) {
            return userId === ta.userId;
        };
        var ta = self.assignTaModal.assignedTas().find(isUserTa);
        ta.isVisible = ko.observable(true);
        self.assignTaModal.assignedTas.remove(isUserTa);
        self.assignTaModal.unassignedTas.push(ta);
        self.removeTaFromCourse(self.assignTaModal.courseId(), ta);
    };

    self.assignTaModal.toggleAssignType = function (ta) {
        ta.assignType(ta.assignType().toUpperCase() === "FULL" ? "Half" : "Full");
    };

    self.assignTa = function (userId, courseId, assignType, giveWarnings, onSuccess) {
        var xhttp = new XMLHttpRequest();
        var params =
            "courseId=" + (courseId || '') + "&" +
            "userId=" + (userId || '') + "&" +
            "assignType=" + (assignType || "FULL") + "&" +
            "giveWarnings=" + giveWarnings;
        xhttp.open("POST", "assignTaToCourse", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var result = !!xhttp.responseText ? JSON.parse(xhttp.responseText) : {};
                if (!result.warning) {
                    onSuccess && onSuccess();
                } else {
                    self.setAssignmentWarningModal(courseId, userId, assignType);
                    self.displayAssignmentWarningModal();
                }
                
            }
        };
        xhttp.send(params);
    };

    self.unassignTa = function (ta) {
        var xhttp = new XMLHttpRequest();
        var params =
            "courseId=" + (self.assignTaModal.courseId() || '') + "&" +
            "userId=" + (ta.userId || '');
        xhttp.open("POST", "unassignTaToCourse", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.assignTaModal.moveTaToUnassigned(ta.userId);
            }
        };
        xhttp.send(params);
    };

    self.assignTaModal.updateCourseTaAssignment = function (ta) {
        var xhttp = new XMLHttpRequest();
        var params =
            "assignType=" + (ta.assignType().toUpperCase() === "FULL" ? "Half" : "Full") + "&" + // send the opposite value of what is currently selected, but do not change the selection
            "courseId=" + (self.assignTaModal.courseId() || '') + "&" +
            "userId=" + (ta.userId || '');
        xhttp.open("POST", "updateCourseTaAssignment", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.assignTaModal.toggleAssignType(ta);
            }
        };
        xhttp.send(params);
    };

    self.setAssignmentWarningModal = function (courseId, userId, assignType) {
        self.assignmentWarningModal.courseId(courseId);
        self.assignmentWarningModal.userId(userId);
        self.assignmentWarningModal.assignType(assignType);
    };

    self.displayAssignmentWarningModal = function () {
        $('#assignmentWarningModal').modal('show');
    };

    self.closeAssignmentWarningModal = function () {
        $('#assignmentWarningModal').modal('hide');
    };

    self.assignmentWarningModal.confirmAssignment = function () {
        self.assignTaModal.moveTaToAssigned(self.assignmentWarningModal.userId());
        self.closeAssignmentWarningModal();
    };

    

    /**
     * Auto Assignment Functions
     */

    self.clearAutoAssignModal = function () {
        self.autoAssignModal.courseList.removeAll();
    };

    self.closeAutoAssignModal = function () {
        $('#autoAssignModal').modal('hide');
    };

    self.setAutoAssignModal = function (assignments) {
        assignments.forEach(function (assignment) {
            if (!self.autoAssignModal.courseList().some(function (course) {
                return course.courseId === assignment.course.courseId;
            })) {
                var newCourse = assignment.course;
                newCourse.startDateTermYear = dateTools.convertDateToTermYear(dateTools.convertPgpStringToDate(newCourse.startDate));
                newCourse.endDateTermYear = dateTools.convertDateToTermYear(dateTools.convertPgpStringToDate(newCourse.endDate));
                newCourse.taList = ko.observableArray();
                newCourse.taList(assignments.filter(function (assignment) {
                    return assignment.course.courseId === newCourse.courseId;
                }).map(function (assignment) {
                    var ta = assignment.ta;
                    ta.assignType = assignment.assignType;
                    ta.name = (ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a');
                    return ta;
                }));
                self.autoAssignModal.courseList.push(newCourse);
            }
        });
    };

    self.displayAutoAssignModal = function () {
        $('#autoAssignModal').modal('show');
    };

    self.confirmAutoAssigns = function (courseList) {
        courseList.forEach(function (course) {
            course.taList().forEach(function (ta) {
                var onSuccess = function () {
                    self.pushTaToCourseList(course.courseId, ta);
                };
                self.assignTa(ta.userId, course.courseId, ta.assignType, false, onSuccess);
            });
        });
        self.closeAutoAssignModal();
    };

    self.autoAssignTas = function () {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "autoAssignTas", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var assignments = JSON.parse(xhttp.responseText);
                self.clearAutoAssignModal();
                self.setAutoAssignModal(assignments);
                self.displayAutoAssignModal();
            }
        };
        xhttp.send();
    };

    /**
     * Sort functions
     */

    self.courseCodeOrder = ko.observable('');
    self.courseCodeOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.courseList(tableTools.sort(self.courseList(), 'courseCode', newOrder, 'String'));
        }
    });

    self.titleOrder = ko.observable('');
    self.titleOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.courseList(tableTools.sort(self.courseList(), 'title', newOrder, 'String'));
        }
    });

    self.studentCountOrder = ko.observable('');
    self.studentCountOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.courseList(tableTools.sort(self.courseList(), 'studentCount', newOrder, 'Number'));
        }
    });

    self.startDateOrder = ko.observable('');
    self.startDateOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.courseList(tableTools.sort(self.courseList(), 'startDate', newOrder, 'Date'));
        }
    });

    self.endDateOrder = ko.observable('');
    self.endDateOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.courseList(tableTools.sort(self.courseList(), 'endDate', newOrder, 'Date'));
        }
    });

    self.hasLabOrder = ko.observable('');
    self.hasLabOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.courseList(tableTools.sort(self.courseList(), 'hasLab', newOrder, 'Boolean'));
        }
    });

    self.isActiveOrder = ko.observable('');
    self.isActiveOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.courseList(tableTools.sort(self.courseList(), 'isActive', newOrder, 'Boolean'));
        }
    });

    var clearOrders = function () {
        self.courseCodeOrder('');
        self.titleOrder('');
        self.startDateOrder('');
        self.endDateOrder('');
        self.hasLabOrder('');
        self.isActiveOrder('');
    };

    var orderDictionary = {
        'courseCode': 'courseCodeOrder',
        'title': 'titleOrder',
        'studentCount': 'studentCountOrder',
        'startDate': 'startDateOrder',
        'endDate': 'endDateOrder',
        'hasLab': 'hasLabOrder',
        'isActive': 'isActiveOrder'
    };

    self.changeOrder = function (columnName) {
        var selectedOrder = self[orderDictionary[columnName]]();
        if (!selectedOrder || selectedOrder === 'DESC') {
            clearOrders(columnName);
            self[orderDictionary[columnName]]('ASC');
        } else {
            clearOrders(columnName);
            self[orderDictionary[columnName]]('DESC');
        }
    };

    /**
     * Filter functions
     */

    self.searchTerm = ko.observable('');
    self.searchTerm.subscribe(function (newSearchTerm) {
        self.search(newSearchTerm);
    });
    self.clearSearchTerm = function () {
        self.searchTerm('');
    };
    self.search = function (searchTerm) {
        self.courseList(tableTools.filter(self.courseList(), self.searchColumn(), searchTerm));
    };

    var searchColumnLabelDictionary = {
        'courseCode': 'Course Code',
        'title': 'Title'
    };

    self.searchColumn = ko.observable('courseCode');
    self.searchColumnLabel = ko.observable(searchColumnLabelDictionary['courseCode']);
    self.searchColumn.subscribe(function (newSearchColumn) {
        self.searchColumnLabel(searchColumnLabelDictionary[newSearchColumn]);
        self.search(self.searchTerm());
    });
    self.setSearchColumn = function (newSearchColumn) {
        self.searchColumn(newSearchColumn);
    };

    /**
     * Passport Test functions
     */

    self.testLogin = function () {
        var xhttp = new XMLHttpRequest();
        var params =
            "username=agyori" +
            "&password=aPass";
        xhttp.open("POST", "login", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log(xhttp.responseText);
            }
        };
        xhttp.send(params);
    };

    self.testProfile = function () {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "profile", true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log(xhttp.responseText);
            }
        };
        xhttp.send();
    };

    self.testLogout = function () {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "logout", true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log(xhttp.responseText);
            }
        };
        xhttp.send();
    };

    /**
     * PDF functions
     */

    self.pdfTest = function () {
        var docDefinition = {
            content: [
              {
                  //layout: 'lightHorizontalLines', // optional
                  table: {
                      // headers are automatically repeated if the table spans over multiple pages
                      // you can declare how many rows should be treated as headers
                      headerRows: 1,
                      widths: ['*', 'auto', 100, '*'],

                      body: [
                        ['First', 'Second', 'Third', 'The last one'],
                        ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
                        [{ text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4']
                      ]
                  }
              }
            ]
        };
        pdfMake.createPdf(docDefinition).open();
    };

    self.printCourseReport = function () {

    };

    self.printCourseAssignedReport = function (course) {
        pdfTools.printCourseAssignedReport(course.courseId);
    };

    self.printCoursePreviouslyAssignedReport = function (course) {
        pdfTools.printCoursePreviouslyAssignedReport(course.courseId);
    };


    // Immediately load list of courses
    self.getCourseList();

    return self;
};
$('.popoverBtn').popover({
    placement: 'left',
    content: 'For a recommended assignment, a PhD student may have up to 8 different (full) 140hr assignments, while a Masters student may have up to 3 different 140hr assignments. ' + 
        'As well, a course may have one TA for up to every 50 students in the course. i.e. A course with 65 students may have 2 TAs.'
});

ko.applyBindings(new CourseViewModel());