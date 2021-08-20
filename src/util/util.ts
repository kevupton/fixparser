/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
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
export const SOH: string = '\x01';
export const STRING_EQUALS: string = '=';
export const RE_BEGINSTRING: RegExp = /(?=8=FIX)/g;
export const RE_ESCAPE: RegExp = /[.*+?^${}()|[\]\\]/g;
export const RE_FIND: RegExp = /8=FIXT?\.\d\.\d([^\d]+)/i;

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

export const log = (...args: any): void | null =>
    loggingSettings.enabled ? console.log(`[${logTimestamp()}]`, ...args) : null;
export const logWarning = (...args: any): void | null =>
    loggingSettings.enabled ? console.warn(`[${logTimestamp()}]`, ...args) : null;
export const logError = (...args: any): void | null =>
    loggingSettings.enabled ? console.error(`[${logTimestamp()}]`, ...args) : null;
export const logInfo = (...args: any): void | null =>
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
