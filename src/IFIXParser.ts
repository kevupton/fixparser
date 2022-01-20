/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Field } from './fields/Field';
import { FIXParser } from './FIXParser';
import { ConnectionType, FIXParserBase, Options as FIXParserOptions, Protocol } from './FIXParserBase';
import { Options as FIXParserBrowserOptions } from './FIXParserBrowser';
import { Message } from './message/Message';
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
    connectionType: ConnectionType;
    parserName: Parser;
    fixParserBase?: FIXParserBase;
    nextNumIn: number;
    nextNumOut?: number;
    messageCounter?: number;
    heartBeatIntervalId: ReturnType<typeof setInterval> | null;
    connected: boolean;
    messageBufferIn: MessageBuffer;
    messageBufferOut: MessageBuffer;
    fixParser?: FIXParser;
    isLoggedIn?: boolean;

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
