var pdfTools = (function () {
    var getTaReportInfo = function (userId, onSuccess) {
        var xhttp1 = new XMLHttpRequest();
        xhttp1.open("GET", "getAllCoursesForTa?userId=" + userId, true);
        xhttp1.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var courses = xhttp1.responseText ? JSON.parse(xhttp1.responseText) : [];
                var xhttp2 = new XMLHttpRequest();
                xhttp2.open("GET", "getAllSupervisorsForTa?userId=" + userId, true);
                xhttp2.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var supervisors = xhttp2.responseText ? JSON.parse(xhttp2.responseText) : [];
                        var xhttp3 = new XMLHttpRequest();
                        xhttp3.open("GET", "getTa?userId=" + userId, true);
                        xhttp3.onreadystatechange = function () {
                            if (this.readyState === 4 && this.status === 200) {
                                var ta = xhttp3.responseText ? JSON.parse(xhttp3.responseText) : [];
                                ta = ta.length ? ta[0] : {};
                                onSuccess && onSuccess(ta, courses, supervisors);
                            }
                        };
                        xhttp3.send();
                    }
                };
                xhttp2.send();
            }
        };
        xhttp1.send();
    };

    var printTaReport = function (userId) {
        var onSuccess = function (ta, courses, supervisors) {
            var coursesTableContent = [];
            coursesTableContent.push([
                { text: 'Course Code', bold: true },
                { text: 'Title', bold: true },
                { text: 'Start Term', bold: true },
                { text: 'End Term', bold: true }
            ]);
            courses.forEach(function (course) {
                var row = [];
                row.push(course.courseCode || '');
                row.push(course.title || '');
                row.push(dateTools.convertPgpStringToTermYear(course.startDate) || '');
                row.push(dateTools.convertPgpStringToTermYear(course.endDate) || '');
                coursesTableContent.push(row);
            });

            var supervisorsTableContent = [];
            supervisorsTableContent.push([
                { text: 'Name', bold: true },
                { text: 'Email', bold: true }
            ]);
            supervisors.forEach(function (supervisor) {
                var row = [];
                row.push((supervisor.lastName || 'n/a') + ', ' + (supervisor.firstName || 'n/a'));
                row.push(supervisor.email || '');
                supervisorsTableContent.push(row);
            });

            var docDefinition = {
                info: {
                    title: 'TA Manager Report'
                },
                content: [
                    { text: (ta.lastName || 'n/a') + ', ' + (ta.firstName || 'n/a'), fontSize: 20, bold: true },
                    (ta.userId || '') + (ta.userId && ta.studentNumber ? ', ' : '') + (ta.studentNumber || ''),
                    ta.email || '',
                    ta.studentType || '',
                    ' ',
                    { text: 'Assigned Courses', fontSize: 16, bold: true },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', '*', '*', '*'],
                            body: coursesTableContent
                        }
                    },
                    ' ',
                    { text: 'Assigned Supervisors', fontSize: 16, bold: true },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', '*'],
                            body: supervisorsTableContent
                        }
                    }
                ]
            };

            pdfMake.createPdf(docDefinition).open();
        };
        getTaReportInfo(userId, onSuccess);
    };

    var pdfTools = {};
    pdfTools.printTaReport = printTaReport;
    return pdfTools;

}());

var module = module || {};
module.exports = dateTools;