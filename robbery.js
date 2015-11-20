'use strict';

var workDays = ['ПН', 'ВТ', 'СР'];
var MS_IN_MINUTE = 1000 * 60;

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var schedule = JSON.parse(json);
    var robberNames = Object.keys(schedule);
    var freeTime = getFreeTime(schedule, workingHours);
    var freeStatus = setFreeStatus(robberNames, 'bank');
    for (var i = 0; i < freeTime.length; i++) {
        var timeObject = freeTime[i];
        freeStatus[timeObject.name] = timeObject.free;
        if (!checkFreeStatus(freeStatus)) {
            continue;
        }
        var nextBusyTime = findNextBusyTime(freeTime, i);
        if (!nextBusyTime ||
            (nextBusyTime.date.getTime() - timeObject.time.date.getTime()) >=
            MS_IN_MINUTE * minDuration) {
            appropriateMoment = timeObject.time;
            return appropriateMoment;
        }
    }
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }
    return 'Ограбление уже идёт!';
};

function sortDate(a, b) {
    a = a.time.date.getTime();
    b = b.time.date.getTime();
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    if (a === b) {
        return 0;
    }
}

function getTimeSegments(timeArray, name, isFreeTime) {
    var freeTime = [];
    timeArray.forEach(function (time) {
        var timeFrom = moment();
        timeFrom.date = time.from;
        var timeTo = moment();
        timeTo.date = time.to;
        if (timeTo.date.getTime() < timeFrom.date.getTime()) {
            timeTo.date.setDate(timeTo.date.getDate() + 7);
        }
        freeTime.push({
            name: name,
            time: timeFrom,
            free: isFreeTime
        });
        freeTime.push({
            name: name,
            time: timeTo,
            free: !isFreeTime
        });
    });
    return freeTime;
}

function findNextBusyTime(freeTime, index) {
    var nextBusyTime = '';
    var j = index;
    while (!nextBusyTime && j < freeTime.length - 1) {
        j++;
        if (!freeTime[j].free) {
            nextBusyTime = freeTime[j].time;
        }
    }
    return nextBusyTime;
}

function setFreeStatus(robbers, bankName) {
    var freeStatus = {};
    robbers.forEach(function (name) {
        freeStatus[name] = true;
    });
    freeStatus[bankName] = false;
    return freeStatus;
}

function checkFreeStatus(freeStatus) {
    for (var status in freeStatus) {
        if (!freeStatus[status]) {
            return false;
        }
    }
    return true;
}

function getFreeTime(schedule, workingHours) {
    var robberNames = Object.keys(schedule);
    var freeTime = [];
    robberNames.forEach(function (name) {
        var robber = schedule[name];
        var temp = getTimeSegments(robber, name, false);
        freeTime = freeTime.concat(temp);
    });
    var temp = [];
    workDays.forEach(function (day) {
        temp.push({from: day + ' ' + workingHours.from,
            to: day + ' ' + workingHours.to});
    });
    freeTime = freeTime.concat(getTimeSegments(temp, 'bank', true));
    freeTime.sort(sortDate);
    return freeTime;
}
