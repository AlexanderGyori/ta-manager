'use strict';

var CourseViewModel = function () {
    var self = this;
    self.courseList = ko.observableArray();

    self.addCourseModal = {
        isVisible: ko.observable(false),
        courseCode: ko.observable(''),
        hasCourseCodeError: ko.observable(false),
        title: ko.observable(''),
        startDate: ko.observable(null),
        endDate: ko.observable(null),
        hasLab: ko.observable(false),
        isActive: ko.observable(false)
    };
    self.addCourseModal.isVisible.subscribe(function (isVisible) {
        if (isVisible) {
            $('#addCourseModal').modal('show');
        } else {
            $('#addCourseModal').modal('hide');
        }
    });

    self.editCourseModal = {
        isVisible: ko.observable(false),
        courseId: ko.observable(null),
        courseCode: ko.observable(''),
        hasCourseCodeError: ko.observable(false),
        title: ko.observable(''),
        startDate: ko.observable(null),
        endDate: ko.observable(null),
        hasLab: ko.observable(false),
        isActive: ko.observable(false)
    };
    self.editCourseModal.isVisible.subscribe(function (isVisible) {
        if (isVisible) {
            $('#editCourseModal').modal('show');
        } else {
            $('#editCourseModal').modal('hide');
        }
    });

    self.removeCourseModal = {
        isVisible: ko.observable(false),
        courseId: ko.observable(null)
    }
    self.removeCourseModal.isVisible.subscribe(function (isVisible) {
        if (isVisible) {
            $('#removeCourseModal').modal('show');
        } else {
            $('#removeCourseModal').modal('hide');
        }
    });

    self.populateCourseList = function (courses) {
        self.courseList.removeAll();
        courses.forEach(function (val) {
            self.courseList.push(val);
        });
    };

    self.getCourseList = function () {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getAllCourses", true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) { // TODO: ADD LOADING GIF HERE
                self.populateCourseList(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.send();
    };

    /* *
     * Add Course functions
     * */

    self.displayAddCourseModal = function () {
        self.clearAddCourseModal();
        self.addCourseModal.isVisible(true);
    };

    self.closeAddCourseModal = function () {
        self.addCourseModal.isVisible(false);
    };

    self.clearAddCourseModal = function () {
        self.addCourseModal.courseCode('');
        self.addCourseModal.hasCourseCodeError(false);
        self.addCourseModal.title('');
        self.addCourseModal.startDate(null);
        self.addCourseModal.endDate(null);
        self.addCourseModal.hasLab(false);
        self.addCourseModal.isActive(false);
    };

    self.addCourse = function (course) {
        if (!course.courseCode()) {
            self.addCourseModal.hasCourseCodeError(true);
            return;
        }
        var xhttp = new XMLHttpRequest();
        var params =
            "courseCode=" + (course.courseCode() || '') + "&" +
            "title=" + (course.title() || '') + "&" +
            "startDate=" + (course.startDate() || '') + "&" +
            "endDate=" + (course.endDate() || '') + "&" +
            "hasLab=" + (course.hasLab() || false) + "&" +
            "isActive=" + (course.isActive() || false);
        xhttp.open("POST", "addCourse", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getCourseList();
                alert("Successfully added course!");
                self.closeAddCourseModal();
            }
        };
        xhttp.send(params);
    };

    /* *
     * Edit Course functions
     * */

    self.displayEditCourseModal = function (course) {
        self.setEditCourseModal(course)
        self.editCourseModal.isVisible(true);
    };

    self.closeEditCourseModal = function () {
        self.editCourseModal.isVisible(false);
    };

    self.setEditCourseModal = function (course) {
        self.editCourseModal.courseId(course.courseId || null);
        self.editCourseModal.courseCode(course.courseCode || '');
        self.editCourseModal.title(course.title || '');
        self.editCourseModal.startDate(course.startDate || '');
        self.editCourseModal.endDate(course.endDate || '');
        self.editCourseModal.hasLab(course.hasLab || false);
        self.editCourseModal.isActive(course.isActive || false);
    };

    self.editCourse = function (course) {
        if (!course.courseId()) {
            alert("Could not edit course.");
            return;
        }

        var xhttp = new XMLHttpRequest();
        var params =
            "courseId=" + course.courseId() + "&" +
            "courseCode=" + (course.courseCode() || '') + "&" +
            "title=" + (course.title() || '') + "&" +
            "startDate=" + (course.startDate() || '') + "&" +
            "endDate=" + (course.endDate() || '') + "&" +
            "hasLab=" + (course.hasLab() || false) + "&" +
            "isActive=" + (course.isActive() || false);
        xhttp.open("POST", "editCourse", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getCourseList();
                alert("Successfully editted course!");
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
                alert("Successfully removed course!");
                self.closeRemoveCourseModal();
            }
        };
        xhttp.send(params);
    };

    self.displayRemoveCourseModal = function (course) {
        self.setRemoveCourseModal(course);
        self.removeCourseModal.isVisible(true);
    };

    self.closeRemoveCourseModal = function () {
        self.removeCourseModal.isVisible(false);
    };

    self.setRemoveCourseModal = function (course) {
        self.removeCourseModal.courseId(course.courseId);
    };

    // Immediately load list of courses
    self.getCourseList();

    return self;
};

ko.applyBindings(new CourseViewModel());