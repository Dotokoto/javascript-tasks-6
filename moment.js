'use strict';

var bankTimezone = '+5';

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
            var currentTimezone = this.timezone * 60;
            localDate.setMinutes(localDate.getUTCMinutes() + currentTimezone - bankTimezone * 60);
            var localDay = daysToWeek[localDate.getDate()];
            var localHours = addZero(localDate.getHours());
            var localMinutes = addZero(localDate.getMinutes());
            pattern = pattern.replace(/%DD/g, localDay);
            pattern = pattern.replace(/%HH/g, addZero(localHours));
            pattern = pattern.replace(/%MM/g, addZero(localMinutes));
            return pattern;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
        }
    };
};

function addZero(timeStr) {
    if (timeStr.length < 2) {
        return '0' + timeStr;
    }
    return timeStr.toString();
}
