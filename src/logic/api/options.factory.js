'use strict';
gantt.factory('GanttOptions', ['moment', function(moment) {
    return {initialize: function(options) {
        options.api = options.api || angular.noop();

        options.data = options.data || [];

        options.timespans = options.timespans || [];

        options.sortMode = options.sortMode || 'name';

        options.filterTask = options.filterTask || undefined;
        options.filterTaskComparator = options.filterTaskComparator || undefined;

        options.filterRow = options.filterRow || undefined;
        options.filterRowComparator = options.filterRowComparator || undefined;

        options.viewScale = options.viewScale || 'day';
        options.columnMagnet = options.columnMagnet || '15 minutes';
        options.columnWidth = options.columnWidth || undefined;

        options.fromDate = options.fromDate || undefined;
        options.toDate = options.toDate || undefined;

        options.allowTaskMoving = options.allowTaskMoving !== false || true;
        options.allowTaskResizing = options.allowTaskResizing !== false || true;
        options.allowTaskRowSwitching = options.allowTaskRowSwitching !== false || true;
        options.allowRowSorting = options.allowRowSorting !== false || true;
        options.allowLabelsResizing = options.allowLabelsResizing !== false || true;

        options.currentDate = options.currentDate || 'line';
        options.currentDateValue = options.currentDateValue || moment();

        options.autoExpand = options.autoExpand || 'none';
        options.taskOutOfRange = options.taskOutOfRange || 'truncate';

        options.maxHeight = options.maxHeight || 0;

        options.labelsWidth = options.labelsWidth || undefined;

        options.showLabelsColumn = options.showLabelsColumn !== false || true;
        options.showTooltips = options.showTooltips !== false || true;

        options.headers = options.headers || undefined;
        options.headersFormats = options.headersFormats || undefined;

        options.timeFrames = options.timeFrames || [];
        options.dateFrames = options.dateFrames || [];

        options.timeFramesWorkingMode = options.timeFramesWorkingMode || 'hidden';
        options.timeFramesNonWorkingMode = options.timeFramesNonWorkingMode || 'visible';

        options.tooltipDateFormat = options.tooltipDateFormat || 'MMM DD, HH:mm';

        return options;
    }
    };
}]);
