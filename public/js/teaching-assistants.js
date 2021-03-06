﻿'use strict';

var TaViewModel = function () {
    var self = this;
    self.taList = ko.observableArray();

    self.addTaModal = {
        userId: ko.observable(''),
        hasUserIdError: ko.observable(false),
        studentNumber: ko.observable(''),
        firstName: ko.observable(''),
        lastName: ko.observable(''),
        email: ko.observable(''),
        studentType: ko.observable(''),
        isActive: ko.observable(false)
    };

    self.editTaModal = {
        userId: ko.observable(''),
        hasUserIdError: ko.observable(false),
        studentNumber: ko.observable(''),
        firstName: ko.observable(''),
        lastName: ko.observable(''),
        email: ko.observable(''),
        studentType: ko.observable(''),
        isActive: ko.observable(false)
    };

    self.removeTaModal = {
        userId: ko.observable('')
    };

    self.viewCoursesModal = {
        name: ko.observable(''),
        userId: ko.observable(''),
        email: ko.observable(''),
        courseList: ko.observableArray([])
    };

    self.viewSupervisorsModal = {
        name: ko.observable(''),
        userId: ko.observable(''),
        email: ko.observable(''),
        supervisorList: ko.observableArray([])
    };

    self.populateTaList = function (tas) {
        self.taList.removeAll();
        tas.forEach(function (ta, i) {
            ta.isVisible = ko.observable(true);
            ta.name = (ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a');
            ta.numOfAssigns = ko.observable(+ta.numOfAssigns || 0);
            ta.maxAssigns = ko.observable(+ta.maxAssigns || 0);
            ta.assignFraction = ko.computed(function () {
                return ta.numOfAssigns() + '/' + ta.maxAssigns();
            });
            self.taList.push(ta);
        });
    };

    self.getTaList = function () {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getAllTas", true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) { 
                self.populateTaList(JSON.parse(xhttp.responseText));
                self.search(self.searchTerm());
            }
        };
        xhttp.send();
    };

    /* *
     * Add TA functions
     * */

    self.displayAddTaModal = function () {
        self.clearAddTaModal();
        $('#addTaModal').modal('show');
    };

    self.closeAddTaModal = function () {
        $('#addTaModal').modal('hide');
    };

    self.clearAddTaModal = function () {
        self.addTaModal.userId('');
        self.addTaModal.hasUserIdError(false);
        self.addTaModal.studentNumber('');
        self.addTaModal.firstName('');
        self.addTaModal.lastName('');
        self.addTaModal.email('');
        self.addTaModal.studentType('');
    };

    self.addTa = function (ta) {
        if (!ta.userId()) {
            self.addTaModal.hasUserIdError(true);
            return;
        }
        var xhttp = new XMLHttpRequest();
        var params =
            "userId=" + (ta.userId() || '') + "&" +
            "studentNumber=" + (ta.studentNumber() || '') + "&" +
            "firstName=" + (ta.firstName() || '') + "&" +
            "lastName=" + (ta.lastName() || '') + "&" +
            "email=" + (ta.email() || '') + "&" +
            "studentType=" + (ta.studentType() || '') + "&" +
            "isActive=" + (ta.isActive() || 'false');
        xhttp.open("POST", "addTa", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getTaList();
                self.closeAddTaModal();
            }
        };
        xhttp.send(params);
    };

    /* *
     * Edit TA functions
     * */

    self.displayEditTaModal = function (ta) {
        self.setEditTaModal(ta);
        $('#editTaModal').modal('show');
    };

    self.closeEditTaModal = function () {
        $('#editTaModal').modal('hide');
    };

    self.setEditTaModal = function (ta) {
        self.editTaModal.userId(ta.userId || '');
        self.editTaModal.studentNumber(ta.studentNumber || '');
        self.editTaModal.firstName(ta.firstName || '');
        self.editTaModal.lastName(ta.lastName || '');
        self.editTaModal.email(ta.email || '');
        self.editTaModal.studentType(ta.studentType || '');
        self.editTaModal.isActive(ta.isActive || false);
    };

    self.editTa = function (ta) {
        if (!ta.userId()) {
            alert("Could not edit teaching assistant.");
            return;
        }
        var xhttp = new XMLHttpRequest();
        var params =
            "userId=" + ta.userId() + '&' +
            "studentNumber=" + (ta.studentNumber() || '') + "&" +
            "firstName=" + (ta.firstName() || '') + "&" +
            "lastName=" + (ta.lastName() || '') + "&" +
            "email=" + (ta.email() || '') + "&" +
            "studentType=" + (ta.studentType() || '') + "&" +
            "isActive=" + (ta.isActive() || 'false');
        xhttp.open("POST", "editTa", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getTaList();
                self.closeEditTaModal();
            }
        };
        xhttp.send(params);
    };

    /* *
     * Remove TA functions
     * */

    self.removeTa = function (ta) {
        if (!ta.userId()) {
            alert("Could not remove teaching assistant.");
            return;
        }
        var xhttp = new XMLHttpRequest();
        var params = "userId=" + (ta.userId() || '');
        xhttp.open("POST", "removeTa", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getTaList();
                self.closeRemoveTaModal();
            }
        };
        xhttp.send(params);
    };

    self.displayRemoveTaModal = function (ta) {
        self.setRemoveTaModal(ta);
        $('#removeTaModal').modal('show');
    };

    self.closeRemoveTaModal = function () {
        $('#removeTaModal').modal('hide');
    };

    self.setRemoveTaModal = function (ta) {
        self.removeTaModal.userId(ta.userId);
    };

    /**
     * View Courses functions
     */

    self.closeViewCoursesModal = function () {
        $('#viewCoursesModal').modal('hide');
    };

    self.clearViewCoursesModal = function () {
        self.viewCoursesModal.courseList([]);
    };

    self.setViewCoursesModal = function (courses, ta) {
        self.viewCoursesModal.name((ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a'));
        self.viewCoursesModal.userId(ta.userId);
        self.viewCoursesModal.email(ta.email);
        self.viewCoursesModal.courseList(courses);
    };

    self.displayViewCoursesModal = function (ta) {
        self.clearViewCoursesModal();
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getAllCoursesForTa?userId=" + ta.userId, true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var courses = xhttp.responseText ? JSON.parse(xhttp.responseText) : [];
                courses.map(function (course) {
                    course.startDate = dateTools.convertPgpStringToTermYear(course.startDate);
                    course.endDate = dateTools.convertPgpStringToTermYear(course.endDate);
                });
                self.setViewCoursesModal(courses, ta);
                $('#viewCoursesModal').modal('show');
            }
        };
        xhttp.send();
    };

    /**
     * View Supervisors functions
     */

    self.closeViewSupervisorsModal = function () {
        $('#viewSupervisorsModal').modal('hide');
    };

    self.clearViewSupervisorsModal = function () {
        self.viewSupervisorsModal.supervisorList([]);
    };

    self.setViewSupervisorsModal = function (supervisors, ta) {
        self.viewSupervisorsModal.name((ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a'));
        self.viewSupervisorsModal.userId(ta.userId);
        self.viewSupervisorsModal.email(ta.email);
        self.viewSupervisorsModal.supervisorList(supervisors);
    };

    self.displayViewSupervisorsModal = function (ta) {
        self.clearViewSupervisorsModal();
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getAllSupervisorsForTa?userId=" + ta.userId, true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var supervisors = xhttp.responseText ? JSON.parse(xhttp.responseText) : [];
                supervisors.map(function (supervisor) {
                    supervisor.name = (supervisor.lastName || 'n/a') + ', ' + (supervisor.firstName || 'n/a')
                });
                self.setViewSupervisorsModal(supervisors, ta);
                $('#viewSupervisorsModal').modal('show');
            }
        };
        xhttp.send();
    };

    /**
     * Sort functions
     */

    self.userIdOrder = ko.observable('');
    self.userIdOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.taList(tableTools.sort(self.taList(), 'userId', newOrder, 'String'));
        }
    });

    self.nameOrder = ko.observable('');
    self.nameOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.taList(tableTools.sort(self.taList(), 'name', newOrder, 'String'));
        }
    });

    self.emailOrder = ko.observable('');
    self.emailOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.taList(tableTools.sort(self.taList(), 'email', newOrder, 'String'));
        }
    });

    self.studentTypeOrder = ko.observable('');
    self.studentTypeOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.taList(tableTools.sort(self.taList(), 'studentType', newOrder, 'String'));
        }
    });

    self.studentNumberOrder = ko.observable('');
    self.studentNumberOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.taList(tableTools.sort(self.taList(), 'studentNumber', newOrder, 'String'));
        }
    });

    self.isActiveOrder = ko.observable('');
    self.isActiveOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.taList(tableTools.sort(self.taList(), 'isActive', newOrder, 'Boolean'));
        }
    });

    var clearOrders = function () {
        self.userIdOrder('');
        self.nameOrder('');
        self.emailOrder('');
        self.studentNumberOrder('');
    };

    var orderDictionary = {
        'userId': 'userIdOrder',
        'name': 'nameOrder',
        'email': 'emailOrder',
        'studentType': 'studentTypeOrder',
        'studentNumber': 'studentNumberOrder',
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
        self.taList(tableTools.filter(self.taList(), self.searchColumn(), searchTerm));
    };

    var searchColumnLabelDictionary = {
        'userId': 'UserId',
        'name': 'Name',
        'email': 'Email',
        'studentType': 'Type',
        'studentNumber': 'Student Number'
    };

    self.searchColumn = ko.observable('userId');
    self.searchColumnLabel = ko.observable(searchColumnLabelDictionary['userId']);
    
    self.searchColumn.subscribe(function (newSearchColumn) {
        self.searchColumnLabel(searchColumnLabelDictionary[newSearchColumn]);
        self.search(self.searchTerm());
    });
    self.setSearchColumn = function (newSearchColumn) {
        self.searchColumn(newSearchColumn);
    };

    /**
     * PDF functions
     */

    self.printTaReport = function (ta) {
        pdfTools.printTaReport(ta.userId);
    };

    self.printAllTasReport = function () {
        pdfTools.printAllTasReport();
    };

    // Immediately load list of teaching asssistants
    self.getTaList();

    return self;
};

ko.applyBindings(new TaViewModel());