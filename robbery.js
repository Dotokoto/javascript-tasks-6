'use strict';

var workDays = ['ПН', 'ВТ', 'СР'];
var MS_IN_MINUTE = 1000 * 60;

var moment = require('./moment');


// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();

    // 1. Читаем json
    // 2. Находим подходящий ближайший момент начала ограбления
    // 3. И записываем в appropriateMoment
    var schedule = JSON.parse(json);
    var freeTime = [];
    var robberNames = Object.keys(schedule);
    robberNames.forEach(function (name) {
        var robber = schedule[name];
        robber.forEach(function (time) {
            var timeFrom = moment();
            timeFrom.date = time.from;
            var timeTo = moment();
            timeTo.date = time.to;
            freeTime.push({
                name: name,
                time: timeFrom,
                free: false
            });
            freeTime.push({
                name: name,
                time: timeTo,
                free: true
            });
        });
    });
    workDays.forEach(function (day) {
        var timeFrom = moment();
        timeFrom.date = day + ' ' + workingHours.from;
        var timeTo = moment();
        timeTo.date = day + ' ' + workingHours.to;
        freeTime.push({
            name: 'bank',
            time: timeFrom,
            free: true
        });
        freeTime.push({
            name: 'bank',
            time: timeTo,
            free: false
        });
    });
    freeTime.sort(function (a, b) {
        a = a.time.date;
        b = b.time.date;
        if (a > b) {
            return 1;
        }
        if (a < b) {
            return -1;
        }
        if (a === b) {
            return 0;
        }
    });
    var freeStatus = {};
    robberNames.forEach(function (name) {
        freeStatus[name] = true;
    });
    freeStatus['bank'] = false;
    for (var i = 0; i < freeTime.length; i++) {
        var timeObject = freeTime[i];
        freeStatus[timeObject.name] = timeObject.free;
        var canRob = true;
        var names = robberNames.slice(0);
        names.push('bank');
        for (var j = 0; j < names.length; j++) {
            if (!freeStatus[names[j]]) {
                canRob = false;
            }
        }
        if (canRob) {
            var nextBusyTime = '';
            var j = i;
            while (!nextBusyTime && j < freeTime.length - 1) {
                j++;
                if (!freeTime[j].free) {
                    nextBusyTime = freeTime[j].time;
                }
            }
            if (!nextBusyTime) {
                appropriateMoment = timeObject.time;
                return appropriateMoment;
            }
            if ((nextBusyTime.date.getTime() - timeObject.time.date.getTime()) >=
                MS_IN_MINUTE * minDuration) {
                appropriateMoment = timeObject.time;
                return appropriateMoment;
            }
        }
    }
    return;
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }

    return 'Ограбление уже идёт!';
};

