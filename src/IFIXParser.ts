/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { FIXParser } from './FIXParser';
import { Options as FIXParserBrowserOptions } from './FIXParserBrowser';
import { Field } from './fields/Field';
import { Message } from './message/Message';
import { FIXParserBase, Options as FIXParserOptions, Protocol } from './FIXParserBase';
import { MessageBuffer } from './util/MessageBuffer';
import { Parser } from './util/util';

export interface IFIXParser {
    host: string | null;
    port: number | null;
    protocol: Protocol | null;
    sender: string | null;
    target: string | null;
    heartBeatInterval: number;
    fixVersion: string;
    parserName: Parser;
    fixParserBase?: FIXParserBase;
    nextNumIn: number;
    nextNumOut?: number;
    heartBeatIntervalId: ReturnType<typeof setInterval> | null;
    connected: boolean;
    messageBuffer: MessageBuffer;
    fixParser?: FIXParser;

    connect?(options: FIXParserOptions | FIXParserBrowserOptions): void;
    getNextTargetMsgSeqNum(): number;
    setNextTargetMsgSeqNum(nextMsgSeqNum: number): number;
    getTimestamp(dateObject: Date): string;
    createMessage(...fields: Field[]): Message;
    parse(data: string): Message[];
    send(message: Message): void;
    isConnected(): boolean;
    close(): void;
    stopHeartbeat(): void;
    startHeartbeat(heartBeatInterval: number): void;
}
