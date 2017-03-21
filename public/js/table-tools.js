var tableTools = (function () {
    var filterNumber = function (table, column, searchTerm, criteria) {
        if (criteria.toUpperCase() === 'EQUALS') {
            return table.filter(function (row) {
                return row[column] === +searchTerm;
            });
        } else if (criteria.toUpperCase() === '!EQUALS') {
            return table.filter(function (row) {
                return row[column] !== +searchTerm;
            });
        } else if (criteria.toUpperCase() === 'LESS') {
            return table.filter(function (row) {
                return row[column] < +searchTerm;
            });
        } else if (criteria.toUpperCase() === 'GREATER') {
            return table.filter(function (row) {
                return row[column] > +searchTerm;
            });
        } else {
            return table;
        }
        
    };

    var filterString = function (table, column, searchTerm, criteria) {
        searchTerm = searchTerm.toUpperCase();
        if (criteria.toUpperCase() === 'CONTAINS') {
            return table.filter(function (row) {
                row[column].toUpperCase().includes(searchTerm);
            });
        } else if (criteria.toUpperCase() === '!CONTAINS') {
            return table.filter(function (row) {
                !row[column].toUpperCase().includes(searchTerm);
            });
        } else if (criteria.toUpperCase() === 'EQUALS') {
            return table.filter(function (row) {
                return row[column].toUpperCase() === searchTerm;
            });
        } else if (criteria.toUpperCase() === '!EQUALS') {
            return table.filter(function (row) {
                return row[column].toUpperCase() !== searchTerm;
            });
        } else {
            return table;
        }
    };

    var filter = function (table, column, searchTerm) {
        searchTerm = searchTerm.toUpperCase();
        table.forEach(function (row, i, table) {
            table[i].isVisible(row[column].toUpperCase().includes(searchTerm));
        });
        return table;
    };
    
    var sortNumber = function (table, column, order) {
        if (order.toUpperCase() === 'ASC') {
            return table.sort(function (a, b) {
                return a[column] - b[column];
            });
        } else if (order.toUpperCase() === 'DESC') {
            return table.sort(function (a, b) {
                return b[column] - a[column];
            });
        } else {
            return table;
        }
    };

    var sortString = function (table, column, order) {
        if (order.toUpperCase() === 'ASC') {
            return table.sort(function (a, b) {
                if (a[column].toUpperCase() > b[column].toUpperCase()) {
                    return 1;
                } else if (a[column].toUpperCase() === b[column].toUpperCase()) {
                    return 0;
                } else {
                    return -1;
                }
            });
        } else if (order.toUpperCase() === 'DESC') {
            return table.sort(function (a, b) {
                if (a[column].toUpperCase() > b[column].toUpperCase()) {
                    return -1;
                } else if (a[column].toUpperCase() === b[column].toUpperCase()) {
                    return 0;
                } else {
                    return 1;
                }
            });
        } else {
            return table;
        }
    };

    /**
     * Sorts a table based on column
     * @param {Array} table - table to be sorted
     * @param {String} column - column to sort by
     * @param {String} order - 'ASC' or 'DESC', for ascending or descending
     * @param {String} dataType - the data type of the column i.e. 'Number', 'String'...
     * @return {Object} the sorted table
     */
    var sort = function (table, column, order, dataType) {
        if (dataType.toUpperCase() === 'NUMBER' || dataType.toUpperCase() === 'BOOLEAN' || dataType.toUpperCase() === 'DATE') {
            return sortNumber(table, column, order);
        } else if (dataType.toUpperCase() === 'STRING') {
            return sortString(table, column, order);
        } else {
            return table;
        }
    };

    var tableTools = {};
    tableTools.sort = sort;
    tableTools.filter = filter;
    return tableTools;
}());

var module = module || {};
module.exports = tableTools;