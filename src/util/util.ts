/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
export type Version = {
    version: string;
    build: string;
};

export const version: Version = {
    version: process.env.__PACKAGE_VERSION__!,
    build: process.env.__BUILD_TIME__!,
};

export type Parser = 'FIXServer' | 'FIXParser' | 'FIXParserBrowser';
export const DEFAULT_FIX_VERSION: string = 'FIX.5.0SP2';
export const DEFAULT_HEARTBEAT_SECONDS: number = 30;
export const SOH: string = '\x01';
export const STRING_EQUALS: string = '=';
export const RE_ESCAPE: RegExp = /[.*+?^${}()|[\]\\]/g;
export const RE_FIND: RegExp = /8=FIXT?\.\d\.\d([^\d]+)/i;
export const READY_MS: number = 100;

export const loggingSettings = {
    enabled: true,
};

const logTimestamp = (): string => {
    const date = new Date();
    return `${date
        .toLocaleString('en-us', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/(\d+)\/(\d+)\/(\d+)/, '$3$1$2')}-${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes(),
    ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padEnd(9, '0')}`;
};

export const log = (...args: unknown[]): void | null =>
    loggingSettings.enabled ? console.log(`[${logTimestamp()}]`, ...args) : null;
export const logWarning = (...args: unknown[]): void | null =>
    loggingSettings.enabled ? console.warn(`[${logTimestamp()}]`, ...args) : null;
export const logError = (...args: unknown[]): void | null =>
    loggingSettings.enabled ? console.error(`[${logTimestamp()}]`, ...args) : null;
export const logInfo = (...args: unknown[]): void | null =>
    loggingSettings.enabled ? console.info(`[${logTimestamp()}]`, ...args) : null;

export const pad = (value: number, size: number): string => {
    const paddedString = `00${value}`;
    return paddedString.substr(paddedString.length - size);
};

export const adjustForTimezone = (date: Date): Date => {
    const timeOffsetInMS = date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() + timeOffsetInMS);
    return date;
};

export const timestamp = (dateObject: Date): string => {
    if (isNaN(dateObject.getTime())) {
        logError('Invalid date specified!');
    }
    const date = adjustForTimezone(dateObject);
    return `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}-${pad(
        date.getHours(),
        2,
    )}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}.${pad(date.getMilliseconds(), 3)}`;
};

export const parseUTCTimestamp = (dateString: string): Date | string => {
    if (!dateString || dateString === '') {
        logError('Invalid date specified!');
    }
    let date: Date | null = null;
    if (dateString.length === 17) {
        // 20011217-09:30:47
        date = new Date(
            Date.UTC(
                Number(dateString.substring(0, 4)), // 2001
                Number(dateString.substring(4, 6)) - 1, // 12
                Number(dateString.substring(6, 8)), // 17
                Number(dateString.substring(9, 11)), // 09
                Number(dateString.substring(12, 14)), // 30
                Number(dateString.substring(15, 17)), // 47
            ),
        );
    } else if (dateString.length === 21) {
        // 20011217-09:30:47.123
        date = new Date(
            Date.UTC(
                Number(dateString.substring(0, 4)), // 2001
                Number(dateString.substring(4, 6)) - 1, // 12
                Number(dateString.substring(6, 8)), // 17
                Number(dateString.substring(9, 11)), // 09
                Number(dateString.substring(12, 14)), // 30
                Number(dateString.substring(15, 17)), // 47
                Number(dateString.substring(18, 21)), // 123
            ),
        );
    } else if (dateString.length === 25) {
        // 2001-12-17T09:30:47-05:00
        date = new Date(
            Date.UTC(
                Number(dateString.substring(0, 4)), // 2001
                Number(dateString.substring(5, 7)) - 1, // 12
                Number(dateString.substring(8, 10)), // 17
                Number(dateString.substring(11, 13)), // 09
                Number(dateString.substring(14, 16)), // 30
                Number(dateString.substring(17, 19)), // 47
            ),
        );
    } else if (dateString.length === 29) {
        // 2001-12-17T09:30:47.123-05:00
        date = new Date(
            Date.UTC(
                Number(dateString.substring(0, 4)), // 2001
                Number(dateString.substring(5, 7)) - 1, // 12
                Number(dateString.substring(8, 10)), // 17
                Number(dateString.substring(11, 13)), // 09
                Number(dateString.substring(14, 16)), // 30
                Number(dateString.substring(17, 19)), // 47
                Number(dateString.substring(20, 23)), // 123
            ),
        );
    }
    if (date !== null && !isNaN(date.getTime())) {
        return date;
    } else {
        return dateString;
    }
};
