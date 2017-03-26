'use strict';

var SupervisorViewModel = function () {
    var self = this;
    self.supervisorList = ko.observableArray();

    self.addSupervisorModal = {
        firstName: ko.observable(''),
        lastName: ko.observable(''),
        email: ko.observable('')
    };

    self.editSupervisorModal = {
        supervisorId: ko.observable(null),
        firstName: ko.observable(''),
        lastName: ko.observable(''),
        email: ko.observable('')
    };

    self.removeSupervisorModal = {
        supervisorId: ko.observable(null)
    };

    self.assignTaModal = {
        assignedTas: ko.observableArray(),
        unassignedTas: ko.observableArray(),
        searchTerm: ko.observable(''),
        searchColumn: ko.observable('userId'),
        searchColumnLabel: ko.observable('User Id'),
        supervisorId: ko.observable(null)
    };

    self.populateSupervisorList = function (supervisors) {
        self.supervisorList.removeAll();
        supervisors.forEach(function (supervisor, i) {
            supervisor.isVisible = ko.observable(true);
            supervisor.name = (supervisor.lastName || 'n/a') + ', ' + (supervisor.firstName || 'n/a');
            supervisor.taList = ko.observableArray();
            self.getTasForSupervisor(supervisor);
            self.supervisorList.push(supervisor);
        });
    };

    self.getSupervisorList = function () {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getAllSupervisors", true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) { 
                self.populateSupervisorList(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.send();
    };

    self.getTasForSupervisor = function (supervisor) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getAllTasForSupervisor?supervisorId=" + supervisor.supervisorId, true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var taList = JSON.parse(xhttp.responseText) || [];
                taList.forEach(function (ta) {
                    ta.name = (ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a');
                });
                supervisor.taList(taList);
            }
        };
        xhttp.send();
    };

    /* *
     * Add Supervisor functions
     * */

    self.displayAddSupervisorModal = function () {
        self.clearAddSupervisorModal();
        $('#addSupervisorModal').modal('show');
    };

    self.closeAddSupervisorModal = function () {
        $('#addSupervisorModal').modal('hide');
    };

    self.clearAddSupervisorModal = function () {
        self.addSupervisorModal.firstName('');
        self.addSupervisorModal.lastName('');
        self.addSupervisorModal.email('');
    };

    self.addSupervisor = function (supervisor) {
        var xhttp = new XMLHttpRequest();
        var params =
            "firstName=" + (supervisor.firstName() || '') + "&" +
            "lastName=" + (supervisor.lastName() || '') + "&" +
            "email=" + (supervisor.email() || '');
        xhttp.open("POST", "addSupervisor", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getSupervisorList();
                self.closeAddSupervisorModal();
            }
        };
        xhttp.send(params);
    };

    /* *
     * Edit Supervisor functions
     * */

    self.displayEditSupervisorModal = function (supervisor) {
        self.setEditSupervisorModal(supervisor);
        $('#editSupervisorModal').modal('show');
    };

    self.closeEditSupervisorModal = function () {
        $('#editSupervisorModal').modal('hide');
    };

    self.setEditSupervisorModal = function (supervisor) {
        self.editSupervisorModal.supervisorId(supervisor.supervisorId || null);
        self.editSupervisorModal.firstName(supervisor.firstName || '');
        self.editSupervisorModal.lastName(supervisor.lastName || '');
        self.editSupervisorModal.email(supervisor.email || '');
    };

    self.editSupervisor = function (supervisor) {
        if (!supervisor.supervisorId()) {
            alert("Could not edit supervisor.");
            return;
        }

        var xhttp = new XMLHttpRequest();
        var params =
            "supervisorId=" + supervisor.supervisorId() + "&" +
            "firstName=" + (supervisor.firstName() || '') + "&" +
            "lastName=" + (supervisor.lastName() || '') + "&" +
            "email=" + (supervisor.email() || '');
        xhttp.open("POST", "editSupervisor", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getSupervisorList();
                self.closeEditSupervisorModal();
            }
        };
        xhttp.send(params);
    };

    /* *
     * Remove Supervisor functions
     * */

    self.removeSupervisor = function (supervisor) {
        if (!supervisor.supervisorId()) {
            alert("Could not remove supervisor.");
            return;
        }
        var xhttp = new XMLHttpRequest();
        var params = "supervisorId=" + (supervisor.supervisorId() || '');
        xhttp.open("POST", "removeSupervisor", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.getSupervisorList();
                self.closeRemoveSupervisorModal();
            }
        };
        xhttp.send(params);
    };

    self.displayRemoveSupervisorModal = function (supervisor) {
        self.setRemoveSupervisorModal(supervisor);
        $('#removeSupervisorModal').modal('show');
    };

    self.closeRemoveSupervisorModal = function () {
        $('#removeSupervisorModal').modal('hide');
    };

    self.setRemoveSupervisorModal = function (supervisor) {
        self.removeSupervisorModal.supervisorId(supervisor.supervisorId);
    };

    /**
     * TA Assignment Functions
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

    self.displayAssignTaModal = function (supervisor) {
        self.setAssignTaModal(supervisor);
        $('#assignTaModal').modal('show');
    };

    self.closeAssignTaModal = function () {
        $('#assignTaModal').modal('hide');
    };

    self.assignTaModal.setUnassignedTaList = function (taList) {
        self.assignTaModal.unassignedTas.removeAll();
        taList.forEach(function (ta, i) {
            ta.isVisible = ko.observable(true);
            ta.name = (ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a');
            self.assignTaModal.unassignedTas.push(ta);
        });
    };

    self.assignTaModal.loadUnassignedTaList = function (supervisorId) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "getUnassignedTasForSupervisor?supervisorId=" + supervisorId, true);
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.assignTaModal.setUnassignedTaList(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.send();
    };

    self.setAssignTaModal = function (supervisor) {
        self.assignTaModal.loadUnassignedTaList(supervisor.supervisorId);
        self.assignTaModal.assignedTas(supervisor.taList().slice(0));
        self.assignTaModal.searchTerm('');
        self.assignTaModal.searchColumn('userId');
        self.assignTaModal.searchColumnLabel('User Id');
        self.assignTaModal.supervisorId(supervisor.supervisorId || null);
    };

    self.assignTaModal.moveTaToAssigned = function (ta) {
        var isUserTa = function (x) {
            return ta.userId === x.userId;
        };
        var isSelectedSupervisor = function (supervisor) {
            return supervisor.supervisorId === self.assignTaModal.supervisorId();
        };
        self.assignTaModal.unassignedTas.remove(isUserTa);
        self.assignTaModal.assignedTas.push(ta);
        self.supervisorList().find(isSelectedSupervisor).taList.push(ta);
    };

    self.assignTaModal.moveTaToUnassigned = function (ta) {
        var isUserTa = function (x) {
            return ta.userId === x.userId;
        };
        var isSelectedSupervisor = function (supervisor) {
            return supervisor.supervisorId === self.assignTaModal.supervisorId();
        };
        ta.isVisible = ko.observable(true);
        self.assignTaModal.assignedTas.remove(isUserTa);
        self.assignTaModal.unassignedTas.push(ta);
        self.supervisorList().find(isSelectedSupervisor).taList.remove(isUserTa);
    };

    self.assignTa = function (ta) {
        var xhttp = new XMLHttpRequest();
        var params =
            "supervisorId=" + (self.assignTaModal.supervisorId() || '') + "&" +
            "userId=" + (ta.userId || '');
        xhttp.open("POST", "assignTaToSupervisor", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.assignTaModal.moveTaToAssigned(ta);
            }
        };
        xhttp.send(params);
    };

    self.unassignTa = function (ta) {
        var xhttp = new XMLHttpRequest();
        var params =
            "supervisorId=" + (self.assignTaModal.supervisorId() || '') + "&" +
            "userId=" + (ta.userId || '');
        xhttp.open("POST", "unassignTaToSupervisor", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                self.assignTaModal.moveTaToUnassigned(ta);
            }
        };
        xhttp.send(params);
    };

    /**
     * Sort functions
     */

    self.nameOrder = ko.observable('');
    self.nameOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.supervisorList(tableTools.sort(self.supervisorList(), 'name', newOrder, 'String'));
        }
    });

    self.emailOrder = ko.observable('');
    self.emailOrder.subscribe(function (newOrder) {
        if (newOrder === 'ASC' || newOrder === 'DESC') {
            self.supervisorList(tableTools.sort(self.supervisorList(), 'email', newOrder, 'String'));
        }
    });

    var clearOrders = function () {
        self.nameOrder('');
        self.emailOrder('');
    };

    var orderDictionary = {
        'name': 'nameOrder',
        'email': 'emailOrder'
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
        self.supervisorList(tableTools.filter(self.supervisorList(), self.searchColumn(), searchTerm));
    };

    var searchColumnLabelDictionary = {
        'name': 'Name',
        'email': 'Email'
    };

    self.searchColumn = ko.observable('name');
    self.searchColumnLabel = ko.observable(searchColumnLabelDictionary['name']);
    self.searchColumn.subscribe(function (newSearchColumn) {
        self.searchColumnLabel(searchColumnLabelDictionary[newSearchColumn]);
        self.search(self.searchTerm());
    });
    self.setSearchColumn = function (newSearchColumn) {
        self.searchColumn(newSearchColumn);
    };

    // Immediately load list of courses
    self.getSupervisorList();

    return self;
};

ko.applyBindings(new SupervisorViewModel());