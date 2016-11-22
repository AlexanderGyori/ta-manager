var viewModel = (function () {
    var courseList = ko.observableArray();

    var exports = {};
    exports.courseList = courseList;
    return exports;
}());

ko.applyBindings(viewModel);

var populateCourseList = function (courses) {
    viewModel.courseList.removeAll();
    courses.forEach(function (val) {
        viewModel.courseList.push(val);
    });
};

var loadCourseList = function () {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "getAllCourses", true);
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) { // TODO: ADD LOADING GIF HERE
            populateCourseList(JSON.parse(xhttp.responseText));
        }
    };
    xhttp.send();
};

var addCourse = function (course) {
    // test code, remove
    course = {
        courseCode: "test",
        title: "test",
        startDate: null,
        endDate: null,
        hasLab: true,
        isActive: true
    };

    var xhttp = new XMLHttpRequest();
    var params =
        "courseCode=" + (course.courseCode || '') + "&" + 
        "title=" + (course.title || '') + "&" + 
        "startDate=" + (course.startDate || '') + "&" +
        "endDate=" + (course.endDate || '') + "&" +
        "hasLab=" + (course.hasLab || '') + "&" +
        "isActive=" + (course.isActive || '');
    xhttp.open("POST", "addCourse", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            alert("Successfully added course!");
        }
    };
    console.log("params " + params);
    xhttp.send(params);
};

loadCourseList();