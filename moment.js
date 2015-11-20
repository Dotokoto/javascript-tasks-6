'use strict';

var MS_IN_DAY = 1000 * 60 * 60 * 24;
var MS_IN_HOUR = 1000 * 60 * 60;
var MS_IN_MINUTE = 1000 * 60;
var weekToDays = {
    'ПН': '01',
    'ВТ': '02',
    'СР': '03',
    'ЧТ': '04',
    'ПТ': '05',
    'СБ': '06',
    'ВС': '07'
};

var daysToWeek = {
    1: 'ПН',
    2: 'ВТ',
    3: 'СР',
    4: 'ЧТ',
    5: 'ПТ',
    6: 'СБ',
    7: 'ВС'
};

var dayCase = ['день', 'дня', 'дней'];
var hourCase = ['час', 'часа', 'часов'];
var minuteCase = ['минута', 'минуты', 'минут'];

module.exports = function () {
    return {
        timezone: null,
        dateTime: null,

        get date() {
            return this.dateTime;
        },

        set date(rawDateTime) {
            var dateParts = rawDateTime.split(' ');
            var timeObject = getTime(dateParts[1]);
            this.timezone = timeObject.timezone;
            this.dateTime = new Date(Date.parse('2015-01-' + weekToDays[dateParts[0]] + 'T' +
                timeObject.time + ':00.000' + this.timezone + ':00'));
        },

        format: function (pattern) {
            var localDate = new Date(this.date.getTime());
            var currentTimezoneMin = this.timezone * 60;
            localDate.setMinutes(currentTimezoneMin);
            var localDay = localDate.getUTCDate();
            if (localDay > 7) {
                localDay = localDay % 7;
            }
            localDay = daysToWeek[localDay];
            var localHours = addZero(localDate.getUTCHours());
            var localMinutes = addZero(localDate.getUTCMinutes());
            pattern = pattern.replace(/%DD/g, localDay).replace(/%HH/g, localHours).
                replace(/%MM/g, localMinutes);
            return pattern;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            var dateParts = getTimeDiff(moment.date, this.date);
            var days = dateParts.days;
            var hours = dateParts.hours;
            var minutes = dateParts.minutes;
            var result = 'До ограбления: ';
            var word;
            if (days) {
                word = getDeclension(days, dayCase);
                result += days + ' ' + word;
            }
            result += days && hours ? ' ' : '';
            if (hours) {
                word = getDeclension(hours, hourCase);
                result += hours + ' ' + word;
            }
            result += minutes && (days || hours) ? ' ' : '';
            if (minutes) {
                word = getDeclension(minutes, minuteCase);
                result += minutes + ' ' + word;
            }
            return result;
        }
    };
};

function addZero(timeStr) {
    timeStr = timeStr.toString();
    if (timeStr.length < 2) {
        return '0' + timeStr;
    }
    return timeStr;
}

function getTime(timePart) {
    if (timePart.length <= 4) {
        return [timePart, '+00'];
    }
    var sign = '+';
    if (timePart.indexOf('-') > -1) {
        sign = '-';
    }
    var splittedTime = timePart.split(sign);
    var time = splittedTime[0];
    var timezone = sign + addZero(splittedTime[1]);
    return {time: time, timezone: timezone};
}

function getDeclension(time, cases) {
    var word;
    switch (time.toString().substr(-1)) {
        case '1':
            word = cases[0];
            break;
        case '2':
        case '3':
        case '4':
            word = cases[1];
            break;
        default:
            word = cases[2];
    }
    if (time.toString().substr(-2) >= 11 && time.toString().substr(-2) <= 14) {
        word = cases[2];
    }
    return word;
}

function getTimeDiff(firstDate, secondDate) {
    var milliseconds = secondDate.getTime() - firstDate.getTime();
    var days = Number.parseInt(milliseconds / MS_IN_DAY);
    milliseconds = milliseconds % MS_IN_DAY;
    var hours = Number.parseInt(milliseconds / MS_IN_HOUR);
    milliseconds = milliseconds % MS_IN_HOUR;
    var minutes = Number.parseInt(milliseconds / MS_IN_MINUTE);
    return {days: days, hours: hours, minutes: minutes};
}
