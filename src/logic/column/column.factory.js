'use strict';
gantt.factory('GanttColumn', [ 'moment', function(moment) {
    // Used to display the Gantt grid and header.
    // The columns are generated by the column generator.
    var Column = function(date, endDate, left, width, calendar, timeFramesWorkingMode, timeFramesNonWorkingMode, columnMagnetValue, columnMagnetUnit) {
        this.date = date;
        this.endDate = endDate;
        this.left = left;
        this.width = width;
        this.calendar = calendar;
        this.duration = this.endDate.diff(this.date, 'milliseconds');
        this.timeFramesWorkingMode = timeFramesWorkingMode;
        this.timeFramesNonWorkingMode = timeFramesNonWorkingMode;
        this.timeFrames = [];
        this.visibleTimeFrames = [];
        this.daysTimeFrames = {};
        this.cropped = false;
        this.columnMagnetValue = columnMagnetValue;
        this.columnMagnetUnit = columnMagnetUnit;
        this.originalSize = {left: this.left, width: this.width};
        this.updateTimeFrames();
    };

    var getDateKey = function(date) {
        return date.year() + '-' + date.month() + '-' + date.date();
    };

    Column.prototype.updateTimeFrames = function() {
        var self = this;

        if (self.calendar !== undefined && (self.timeFramesNonWorkingMode !== 'hidden' || self.timeFramesWorkingMode !== 'hidden')) {
            var buildPushTimeFrames = function(timeFrames, startDate, endDate) {
                return function(timeFrame) {
                    var start = timeFrame.start;
                    if (start === undefined) {
                        start = startDate;
                    }

                    var end = timeFrame.end;
                    if (end === undefined) {
                        end = endDate;
                    }

                    if (start < self.date) {
                        start = self.date;
                    }

                    if (end > self.endDate) {
                        end = self.endDate;
                    }

                    timeFrame = timeFrame.clone();

                    timeFrame.start = moment(start);
                    timeFrame.end = moment(end);

                    timeFrames.push(timeFrame);
                };
            };

            var cDate = self.date;
            var cDateStartOfDay = moment(cDate).startOf('day');
            var cDateNextDay = cDateStartOfDay.add(1, 'day');
            while (cDate < self.endDate) {
                var timeFrames = self.calendar.getTimeFrames(cDate);
                var nextCDate = moment.min(cDateNextDay, self.endDate);
                timeFrames = self.calendar.solve(timeFrames, cDate, nextCDate);
                var cTimeFrames = [];
                angular.forEach(timeFrames, buildPushTimeFrames(cTimeFrames, cDate, nextCDate));
                self.timeFrames = self.timeFrames.concat(cTimeFrames);

                var cDateKey = getDateKey(cDate);
                self.daysTimeFrames[cDateKey] = cTimeFrames;

                cDate = nextCDate;
                cDateStartOfDay = moment(cDate).startOf('day');
                cDateNextDay = cDateStartOfDay.add(1, 'day');
            }

            angular.forEach(self.timeFrames, function(timeFrame) {
                var positionDuration = timeFrame.start.diff(self.date, 'milliseconds');
                var position = positionDuration / self.duration * self.width;

                var timeFrameDuration = timeFrame.end.diff(timeFrame.start, 'milliseconds');
                var timeFramePosition = timeFrameDuration / self.duration * self.width;

                var hidden = false;
                if (timeFrame.working && self.timeFramesWorkingMode !== 'visible') {
                    hidden = true;
                } else if (!timeFrame.working && self.timeFramesNonWorkingMode !== 'visible') {
                    hidden = true;
                }

                if (!hidden) {
                    self.visibleTimeFrames.push(timeFrame);
                }

                timeFrame.hidden = hidden;
                timeFrame.left = position;
                timeFrame.width = timeFramePosition;
                timeFrame.originalSize = {left: timeFrame.left, width: timeFrame.width};
            });

            if (self.timeFramesNonWorkingMode === 'cropped' || self.timeFramesWorkingMode === 'cropped') {
                var timeFramesWidth = 0;
                angular.forEach(self.timeFrames, function(timeFrame) {
                    if (!timeFrame.working && self.timeFramesNonWorkingMode !== 'cropped' ||
                        timeFrame.working && self.timeFramesWorkingMode !== 'cropped') {
                        timeFramesWidth += timeFrame.width;
                    }
                });

                if (timeFramesWidth !== self.width) {
                    var croppedRatio = self.width / timeFramesWidth;
                    var croppedWidth = 0;
                    var originalCroppedWidth = 0;

                    var allCropped = true;

                    angular.forEach(self.timeFrames, function(timeFrame) {
                        if (!timeFrame.working && self.timeFramesNonWorkingMode !== 'cropped' ||
                            timeFrame.working && self.timeFramesWorkingMode !== 'cropped') {
                            timeFrame.left = (timeFrame.left - croppedWidth) * croppedRatio;
                            timeFrame.width = timeFrame.width * croppedRatio;
                            timeFrame.originalSize.left = (timeFrame.originalSize.left - originalCroppedWidth) * croppedRatio;
                            timeFrame.originalSize.width = timeFrame.originalSize.width * croppedRatio;
                            timeFrame.cropped = false;
                            allCropped = false;
                        } else {
                            croppedWidth += timeFrame.width;
                            originalCroppedWidth += timeFrame.originalSize.width;
                            timeFrame.left = undefined;
                            timeFrame.width = 0;
                            timeFrame.originalSize = {left: undefined, width: 0};
                            timeFrame.cropped = true;
                        }
                    });

                    self.cropped = allCropped;
                } else {
                    self.cropped = false;
                }
            }
        }
    };

    Column.prototype.clone = function() {
        return new Column(moment(this.date), moment(this.endDate), this.left, this.width, this.calendar);
    };

    Column.prototype.containsDate = function(date) {
        return date > this.date && date <= this.endDate;
    };

    Column.prototype.equals = function(other) {
        return this.date === other.date;
    };

    Column.prototype.getMagnetDate = function(date) {
        if (this.columnMagnetValue > 0 && this.columnMagnetUnit !== undefined) {
            date = moment(date);
            var value = date.get(this.columnMagnetUnit);
            var magnetValue = Math.round(value/this.columnMagnetValue) * this.columnMagnetValue;
            date.startOf(this.columnMagnetUnit);
            date.set(this.columnMagnetUnit, magnetValue);
            return date;
        }
        return date;
    };

    var getDateByPositionUsingTimeFrames = function(timeFrames, position) {
        for (var i=0; i < timeFrames.length; i++) {
            // TODO: performance optimization could be done.
            var timeFrame = timeFrames[i];
            if (!timeFrame.cropped && position >= timeFrame.left && position <= timeFrame.left + timeFrame.width) {
                var positionDuration = timeFrame.getDuration() / timeFrame.width * (position - timeFrame.left);
                var date = moment(timeFrame.start).add(positionDuration, 'milliseconds');
                return date;
            }
        }
    };

    Column.prototype.getDateByPosition = function(position, magnet) {
        var positionDuration;
        var date;

        if (position < 0) {
            position = 0;
        }
        if (position > this.width) {
            position = this.width;
        }

        if (this.timeFramesNonWorkingMode === 'cropped' || this.timeFramesWorkingMode === 'cropped') {
            date = getDateByPositionUsingTimeFrames(this.timeFrames, position);
        }

        if (date === undefined) {
            positionDuration = this.duration / this.width * position;
            date = moment(this.date).add(positionDuration, 'milliseconds');
        }

        if (magnet) {
            return this.getMagnetDate(date);
        }

        return date;
    };

    Column.prototype.getDayTimeFrame = function(date) {
        var dtf = this.daysTimeFrames[getDateKey(date)];
        if (dtf === undefined) {
            return [];
        }
        return dtf;
    };

    Column.prototype.getPositionByDate = function(date) {
        var positionDuration;
        var position;

        if (this.timeFramesNonWorkingMode === 'cropped' || this.timeFramesWorkingMode === 'cropped') {
            var croppedDate = date;
            var timeFrames = this.getDayTimeFrame(croppedDate);
            for (var i=0; i < timeFrames.length; i++) {
                var timeFrame = timeFrames[i];
                if (croppedDate >= timeFrame.start && croppedDate <= timeFrame.end) {
                    if (timeFrame.cropped) {
                        if (timeFrames.length > i+1) {
                            croppedDate = timeFrames[i+1].start;
                        } else {
                            croppedDate = timeFrame.end;
                        }
                    } else {
                        positionDuration = croppedDate.diff(timeFrame.start, 'milliseconds');
                        position = positionDuration / timeFrame.getDuration() * timeFrame.width;
                        return this.left + timeFrame.left + position;
                    }
                }
            }
        }

        positionDuration = date.diff(this.date, 'milliseconds');
        position = positionDuration / this.duration * this.width;

        if (position < 0) {
            position = 0;
        }

        if (position > this.width) {
            position = this.width;
        }

        return this.left + position;
    };

    return Column;
}]);
