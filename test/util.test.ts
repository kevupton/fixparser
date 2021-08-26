// 2001-12-17T09:30:47-05:00

import { parseUTCTimestamp } from '../src/util/util';

describe('util', () => {
    describe('#parseUTCTimestamp', () => {
        const expectedDate = new Date(2001, 11, 17, 9, 30, 47);
        const expectedDateWithMs = new Date(2001, 11, 17, 9, 30, 47, 123);

        it('should return the original string when parsing fails', () => {
            expect(parseUTCTimestamp('unknown')).toEqual('unknown');
            expect(parseUTCTimestamp('YYYYMMDD-HH:MM:SS')).toEqual('YYYYMMDD-HH:MM:SS');
            expect(parseUTCTimestamp('YYYYMMDD-HH:MM:SS.sss')).toEqual('YYYYMMDD-HH:MM:SS.sss');
            expect(parseUTCTimestamp('YYYY-MM-DDTHH:MM:SS-05:00')).toEqual('YYYY-MM-DDTHH:MM:SS-05:00');
            expect(parseUTCTimestamp('YYYY-MM-DDTHH:MM:SS.sss-05:00')).toEqual('YYYY-MM-DDTHH:MM:SS.sss-05:00');
        });
        it('should have parsed a valid date string YYYYMMDD-HH:MM:SS', () => {
            const date: Date = parseUTCTimestamp('20011217-09:30:47') as Date;
            expect(date.getFullYear()).toEqual(expectedDate.getFullYear());
            expect(date.getMonth()).toEqual(expectedDate.getMonth());
            expect(date.getDate()).toEqual(expectedDate.getDate());
            expect(date.getHours()).toEqual(expectedDate.getHours());
            expect(date.getMinutes()).toEqual(expectedDate.getMinutes());
            expect(date.getSeconds()).toEqual(expectedDate.getSeconds());
            expect(date.getMilliseconds()).toEqual(0);
        });
        it('should have parsed a valid date string YYYYMMDD-HH:MM:SS.sss', () => {
            const date: Date = parseUTCTimestamp('20011217-09:30:47.123') as Date;
            expect(date.getFullYear()).toEqual(expectedDateWithMs.getFullYear());
            expect(date.getMonth()).toEqual(expectedDateWithMs.getMonth());
            expect(date.getDate()).toEqual(expectedDateWithMs.getDate());
            expect(date.getHours()).toEqual(expectedDateWithMs.getHours());
            expect(date.getMinutes()).toEqual(expectedDateWithMs.getMinutes());
            expect(date.getSeconds()).toEqual(expectedDateWithMs.getSeconds());
            expect(date.getMilliseconds()).toEqual(expectedDateWithMs.getMilliseconds());
        });
        it('should have parsed a valid date string YYYY-MM-DDTHH:MM:SS-05:00', () => {
            const date: Date = parseUTCTimestamp('2001-12-17T09:30:47-05:00') as Date;
            expect(date.getFullYear()).toEqual(expectedDate.getFullYear());
            expect(date.getMonth()).toEqual(expectedDate.getMonth());
            expect(date.getDate()).toEqual(expectedDate.getDate());
            expect(date.getHours()).toEqual(expectedDate.getHours());
            expect(date.getMinutes()).toEqual(expectedDate.getMinutes());
            expect(date.getSeconds()).toEqual(expectedDate.getSeconds());
        });
        it('should have parsed a valid date string YYYY-MM-DDTHH:MM:SS.sss-05:00', () => {
            const date: Date = parseUTCTimestamp('2001-12-17T09:30:47.123-05:00') as Date;
            expect(date.getFullYear()).toEqual(expectedDateWithMs.getFullYear());
            expect(date.getMonth()).toEqual(expectedDateWithMs.getMonth());
            expect(date.getDate()).toEqual(expectedDateWithMs.getDate());
            expect(date.getHours()).toEqual(expectedDateWithMs.getHours());
            expect(date.getMinutes()).toEqual(expectedDateWithMs.getMinutes());
            expect(date.getSeconds()).toEqual(expectedDateWithMs.getSeconds());
        });
    });
});
