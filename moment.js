'use strict';

var MS_IN_DAY = 1000 * 60 * 60 * 24;
var MS_IN_HOUR = 1000 * 60 * 60;
var MS_IN_MINUTE = 1000 * 60;
var weekToDays = {
    'ПН': '02',
    'ВТ': '03',
    'СР': '04',
    'ЧТ': '05',
    'ПТ': '06',
    'СБ': '07',
    'ВС': '08'
};

var daysToWeek = {
    1: 'ВС',
    2: 'ПН',
    3: 'ВТ',
    4: 'СР',
    5: 'ЧТ',
    6: 'ПТ',
    7: 'СБ',
    8: 'ВС'
};

module.exports = function () {
    return {
        timezone: null,
        dateString: null,
        dateTime: null,
        dayOfWeek: null,

        get date() {
            return this.dateTime;
        },
        set date(string) {
            this.dateString = string;
            var dataParts = string.split(' ');
            var dayOfWeek = weekToDays[dataParts[0]];
            this.dayOfWeek = dayOfWeek;
            var sign = '+';
            if (dataParts[1].indexOf('-') > -1) {
                sign = '-';
            }
            var time = dataParts[1].split(sign);
            var timezone = time[1];
            this.timezone = sign + timezone;
            if (timezone.length < 2) {
                timezone = '0' + timezone;
            }
            timezone = sign + timezone;
            this.dateTime = new Date(Date.parse('2015-01-' + dayOfWeek + 'T' + time[0] +
                ':00.000' + timezone + ':00'));
        },

        format: function (pattern) {
            var localDate = new Date(this.date.getTime());
            var currentTimezoneMin = this.timezone * 60;
            localDate.setMinutes(currentTimezoneMin);
            var localDay = daysToWeek[localDate.getUTCDate()];
            var localHours = addZero(localDate.getUTCHours());
            var localMinutes = addZero(localDate.getUTCMinutes());
            pattern = pattern.replace(/%DD/g, localDay);
            pattern = pattern.replace(/%HH/g, addZero(localHours));
            pattern = pattern.replace(/%MM/g, addZero(localMinutes));
            return pattern;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            var milliseconds = this.date.getTime() - moment.date.getTime();
            var days = Number.parseInt(milliseconds / MS_IN_DAY);
            milliseconds = milliseconds % MS_IN_DAY;
            var hours = Number.parseInt(milliseconds / MS_IN_HOUR);
            milliseconds = milliseconds % MS_IN_HOUR;
            var minutes = Number.parseInt(milliseconds / MS_IN_MINUTE);
            var result = 'До ограбления: ';
            var word = '';
            switch (days.toString().substr(-1)) {
                case '1':
                    word = ' день';
                    break;
                case '2':
                case '3':
                case '4':
                    word = ' дня';
                    break;
                default:
                    word = ' дней';
            }
            if (days > 10 && days < 20) {
                word = ' дней';
            }
            if (days) {
                result += days + word;
            }
            switch (hours.toString().substr(-1)) {
                case '1':
                    word = ' час';
                    break;
                case '2':
                case '3':
                case '4':
                    word = ' часа';
                    break;
                default:
                    word = ' часов';
            }
            if (hours > 10 && hours < 20) {
                word = ' часов';
            }
            if (hours) {
                result += ' ' + hours + word;
            }
            switch (minutes.toString().substr(-1)) {
                case '1':
                    word = ' минута';
                    break;
                case '2':
                case '3':
                case '4':
                    word = ' минуты';
                    break;
                default:
                    word = ' минут';
            }
            if (minutes > 10 && minutes < 20) {
                word = ' минут';
            }
            if (minutes) {
                result += ' ' + minutes + word;
            }
            return result;
        }
    };
};

function addZero(timeStr) {
    if (timeStr.length < 2) {
        return '0' + timeStr;
    }
    return timeStr.toString();
}
