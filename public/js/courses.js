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
        courseId: ko.observable(null),
        courseCode: ko.observable(''),
        courseTitle: ko.observable(''),
        title: ko.observable('')
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

    self.termReportModal = {
        startDateTerm: ko.observable(''),
        startDateTermLabel: ko.observable('Term'),
        startDateYear: ko.observable(''),
        endDateTerm: ko.observable(''),
        endDateTermLabel: ko.observable('Term'),
        endDateYear: ko.observable(''),
        hasDateError: ko.observable(false)
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
            if (this.readyState === 4 && this.status === 200) { 
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
                    ta.assignType = ko.observable(ta.assignType || '');
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
        var startDate = {
            term: course.startDateTerm(),
            year: course.startDateYear()
        };
        var endDate = {
            term: course.endDateTerm(),
            year: course.endDateYear()
        };

        course.hasCourseCodeError(!course.courseCode());
        course.hasDateError(!dateTools.isDateRangeValid(startDate, endDate));
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
            alert('Course is invalid. Please try refreshing.');
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

    self.assignTaModal.setPreviouslyTaught = function (previouslyAssignedTas) {
        var addPreviouslyAssigned = function (ta) {
            var wasPreviouslyAssigned = function (previouslyAssignedTa) {
                return previouslyAssignedTa.userId === ta.userId;
            };
            ta.previouslyAssigned = ko.observable(previouslyAssignedTas.some(wasPreviouslyAssigned));
        };

        self.assignTaModal.unassignedTas().forEach(addPreviouslyAssigned);
        self.assignTaModal.assignedTas().forEach(addPreviouslyAssigned);
        var oldUnassigned = self.assignTaModal.unassignedTas().slice(0); // This is the only way I could make it so that the arrays update
        var oldAssigned = self.assignTaModal.assignedTas().slice(0);
        self.assignTaModal.unassignedTas([]);
        self.assignTaModal.assignedTas([]);
        self.assignTaModal.unassignedTas(oldUnassigned);
        self.assignTaModal.assignedTas(oldAssigned);
    };

    self.assignTaModal.setUnassignedTaList = function (taList) {
        self.assignTaModal.unassignedTas.removeAll();
        taList.forEach(function (ta) {
            ta.isVisible = ko.observable(true);
            ta.assignType = ko.observable("Full");
            ta.name = (ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a');
            self.assignTaModal.unassignedTas.push(ta);
        });
    };

    self.assignTaModal.setAssignedTaList = function (taList, previouslyAssignedTas) {
        self.assignTaModal.assignedTas.removeAll();
        taList.forEach(function (ta) {
            self.assignTaModal.assignedTas.push(ta);
        });
    };


    self.assignTaModal.loadTaLists = function (course) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getUnassignedTasForCourse?courseId=" + course.courseId, true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var unassignedTas = xhttp.responseText ? JSON.parse(xhttp.responseText) : [];
                var xhttp2 = new XMLHttpRequest();
                xhttp2.open("GET", "getPreviouslyTaughtForCourse?courseCode=" + course.courseCode, true);
                xhttp2.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var previouslyAssignedTas = xhttp2.responseText ? JSON.parse(xhttp2.responseText) : [];
                        self.assignTaModal.setUnassignedTaList(unassignedTas);
                        self.assignTaModal.setAssignedTaList(course.taList().slice(0));
                        self.assignTaModal.setPreviouslyTaught(previouslyAssignedTas);
                    }
                }
                xhttp2.send();
            }
        };
        xhttp.send();
    };

    self.setAssignTaModal = function (course) {
        self.assignTaModal.loadTaLists(course);
        self.assignTaModal.searchTerm('');
        self.assignTaModal.searchColumn('userId');
        self.assignTaModal.searchColumnLabel('User Id');
        self.assignTaModal.courseId(course.courseId || null);
        self.assignTaModal.courseCode(course.courseCode || '');
        self.assignTaModal.courseTitle(course.title || '');
        if (course.courseCode && course.title) {
            self.assignTaModal.title(course.courseCode + ' - ' + course.title);
        } else if (course.courseCode || course.title) {
            self.assignTaModal.title(course.CourseCode + course.title);
        } else {
            self.assignTaModal.title('');
        }
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
                var xhttp2 = new XMLHttpRequest();
                xhttp2.open("GET", "getPreviouslyTaughtForCourse?courseCode=" + self.assignTaModal.courseCode(), true);
                xhttp2.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var previouslyAssignedTas = xhttp2.responseText ? JSON.parse(xhttp2.responseText) : [];
                        self.assignTaModal.moveTaToUnassigned(ta.userId);
                        self.assignTaModal.setPreviouslyTaught(previouslyAssignedTas);
                    }
                }
                xhttp2.send();
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
     * Term Report functions
     */
    
    self.termReportModal.clearTermReportModal = function () {
        self.termReportModal.startDateTerm('');
        self.termReportModal.startDateTermLabel('Term');
        self.termReportModal.startDateYear('');
        self.termReportModal.endDateTerm('');
        self.termReportModal.endDateTermLabel('Term');
        self.termReportModal.endDateYear('');
        self.termReportModal.hasDateError(false);
    };

    self.displayTermReportModal = function () {
        self.termReportModal.clearTermReportModal();
        $('#termReportModal').modal('show');
    };

    self.closeTermReportModal = function () {
        $('#termReportModal').modal('hide');
    };

    self.termReportModal.setStartDateTerm = function (term) {
        self.termReportModal.startDateTerm(term);
    };

    self.termReportModal.setEndDateTerm = function (term) {
        self.termReportModal.endDateTerm(term);
    };

    self.termReportModal.startDateTerm.subscribe(function (newTerm) {
        self.termReportModal.startDateTermLabel(newTerm || 'Term');
    });

    self.termReportModal.endDateTerm.subscribe(function (newTerm) {
        self.termReportModal.endDateTermLabel(newTerm || 'Term');
    });

    self.termReportModal.printTermReport = function () {
        var startDate = {
            term: self.termReportModal.startDateTerm(),
            year: self.termReportModal.startDateYear()
        };
        var endDate = {
            term: self.termReportModal.endDateTerm(),
            year: self.termReportModal.endDateYear()
        };
        self.termReportModal.hasDateError(!dateTools.isDateRangeValid(startDate, endDate));
        if (self.termReportModal.hasDateError()) {
            return;
        } else {
            pdfTools.printTermReport(startDate, endDate);
        }
    };

    /**
     * Sort functions
     */

    var createOrderSubscribe = function (observableArray, columnName, columnType) {
        return function (newOrder) {
            if (newOrder === 'ASC' || newOrder === 'DESC') {
                observableArray(tableTools.sort(observableArray(), columnName, newOrder, columnType));
            }
        };
    };

    self.courseCodeOrder = ko.observable('');
    self.courseCodeOrder.subscribe(createOrderSubscribe(self.courseList, 'courseCode', 'String'));

    self.titleOrder = ko.observable('');
    self.titleOrder.subscribe(createOrderSubscribe(self.courseList, 'title', 'String'));

    self.studentCountOrder = ko.observable('');
    self.studentCountOrder.subscribe(createOrderSubscribe(self.courseList, 'studentCount', 'Number'));

    self.startDateOrder = ko.observable('');
    self.startDateOrder.subscribe(createOrderSubscribe(self.courseList, 'startDate', 'Date'));

    self.endDateOrder = ko.observable('');
    self.endDateOrder.subscribe(createOrderSubscribe(self.courseList, 'endDate', 'Date'));

    self.hasLabOrder = ko.observable('');
    self.hasLabOrder.subscribe(createOrderSubscribe(self.courseList, 'hasLab', 'Boolean'));

    self.isActiveOrder = ko.observable('');
    self.isActiveOrder.subscribe(createOrderSubscribe(self.courseList, 'isActive', 'Boolean'));

    self.assignTaModal.unassignedUserIdOrder = ko.observable('');
    self.assignTaModal.unassignedUserIdOrder.subscribe(createOrderSubscribe(self.assignTaModal.unassignedTas, 'userId', 'String'));

    self.assignTaModal.unassignedNameOrder = ko.observable('');
    self.assignTaModal.unassignedNameOrder.subscribe(createOrderSubscribe(self.assignTaModal.unassignedTas, 'name', 'String'));

    self.assignTaModal.unassignedEmailOrder = ko.observable('');
    self.assignTaModal.unassignedEmailOrder.subscribe(createOrderSubscribe(self.assignTaModal.unassignedTas, 'email', 'String'));

    self.assignTaModal.unassignedIsActiveOrder = ko.observable('');
    self.assignTaModal.unassignedIsActiveOrder.subscribe(createOrderSubscribe(self.assignTaModal.unassignedTas, 'isActive', 'Boolean'));

    self.assignTaModal.assignedUserIdOrder = ko.observable('');
    self.assignTaModal.assignedUserIdOrder.subscribe(createOrderSubscribe(self.assignTaModal.assignedTas, 'userId', 'String'));

    self.assignTaModal.assignedNameOrder = ko.observable('');
    self.assignTaModal.assignedNameOrder.subscribe(createOrderSubscribe(self.assignTaModal.assignedTas, 'name', 'String'));

    self.assignTaModal.assignedEmailOrder = ko.observable('');
    self.assignTaModal.assignedEmailOrder.subscribe(createOrderSubscribe(self.assignTaModal.assignedTas, 'email', 'String'));

    self.assignTaModal.assignedIsActiveOrder = ko.observable('');
    self.assignTaModal.assignedIsActiveOrder.subscribe(createOrderSubscribe(self.assignTaModal.assignedTas, 'isActive', 'Boolean'));

    self.assignTaModal.clearUnassignedOrders = function () {
        self.assignTaModal.unassignedUserIdOrder('');
        self.assignTaModal.unassignedNameOrder('');
        self.assignTaModal.unassignedEmailOrder('');
        self.assignTaModal.unassignedIsActiveOrder('');
    };

    self.assignTaModal.clearAssignedOrders = function () {
        self.assignTaModal.assignedUserIdOrder('');
        self.assignTaModal.assignedNameOrder('');
        self.assignTaModal.assignedEmailOrder('');
        self.assignTaModal.assignedIsActiveOrder('');
    };

    self.assignTaModal.changeUnassignedOrder = function (orderName) {
        var selectedOrder = self.assignTaModal[orderName]();
        if (!selectedOrder || selectedOrder === 'DESC') {
            self.assignTaModal.clearUnassignedOrders();
            self.assignTaModal[orderName]('ASC');
        } else {
            self.assignTaModal.clearUnassignedOrders();
            self.assignTaModal[orderName]('DESC');
        }
    };

    self.assignTaModal.changeAssignedOrder = function (orderName) {
        var selectedOrder = self.assignTaModal[orderName]();
        if (!selectedOrder || selectedOrder === 'DESC') {
            self.assignTaModal.clearAssignedOrders();
            self.assignTaModal[orderName]('ASC');
        } else {
            self.assignTaModal.clearAssignedOrders();
            self.assignTaModal[orderName]('DESC');
        }
    };

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
            clearOrders();
            self[orderDictionary[columnName]]('ASC');
        } else {
            clearOrders();
            self[orderDictionary[columnName]]('DESC');
        }
    };

    var clearAssignTaModalOrders = function () {
        self.courseCodeOrder('');
        self.titleOrder('');
        self.startDateOrder('');
        self.endDateOrder('');
        self.hasLabOrder('');
        self.isActiveOrder('');
    };

    self.changeOrder = function (selectedOrder) {
        var selectedOrder = self[orderDictionary[columnName]]();
        if (!selectedOrder || selectedOrder === 'DESC') {
            clearAssignTaModalOrders();
            self[orderDictionary[columnName]]('ASC');
        } else {
            clearAssignTaModalOrders();
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
        'As well, a course may have one TA for up to every 50 students in the course. i.e. A course with 65 students may have 2 TAs. TAs with a green background have taught this course before.'
});

ko.applyBindings(new CourseViewModel());