/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { EventEmitter } from 'events';
import { createServer as createNetServer, Server, Socket } from 'net';
import Websocket, { ServerOptions } from 'ws';

import { Field } from './fields/Field';
import * as Constants from './fieldtypes';
import { MessageEnum } from './fieldtypes/MessageEnum';
import FIXParser from './FIXParser';
import { Options as FIXParserOptions, Protocol } from './FIXParserBase';
import { IFIXParser } from './IFIXParser';
import { LicenseManager } from './licensemanager/LicenseManager';
import { Message } from './message/Message';
import { heartBeat } from './messagetemplates/MessageTemplates';
import { handleLogon } from './session/SessionLogon';
import { handleLogout } from './session/SessionLogout';
import { handleResendRequest } from './session/SessionResendRequest';
import { handleSequence } from './session/SessionSequence';
import { handleSequenceReset } from './session/SessionSequenceReset';
import { handleTestRequest } from './session/SessionTestRequest';
import { FrameDecoder } from './util/FrameDecoder';
import { MessageBuffer } from './util/MessageBuffer';
import {
    DEFAULT_FIX_VERSION,
    DEFAULT_HEARTBEAT_SECONDS,
    log,
    logError,
    loggingSettings,
    Parser,
    Version,
    version,
} from './util/util';

type Options = Pick<
    FIXParserOptions,
    'host' | 'port' | 'protocol' | 'sender' | 'target' | 'heartbeatIntervalSeconds' | 'fixVersion' | 'logging'
>;

export default class FIXServer extends EventEmitter implements IFIXParser {
    public static version: Version = version;

    public parserName: Parser = 'FIXServer';
    public fixParser: FIXParser = new FIXParser();
    public host: string = 'localhost';
    public port: number = 9878;
    public protocol: Protocol = 'tcp';
    public server: Server | Websocket.Server | null = null;
    public connected: boolean = false;
    public sender: string = '';
    public target: string = '';
    public heartBeatInterval: number = DEFAULT_HEARTBEAT_SECONDS;
    public fixVersion: string = DEFAULT_FIX_VERSION;
    public nextNumIn: number = 1;
    public heartBeatIntervalId: ReturnType<typeof setInterval> | null = null;
    public messageBuffer: MessageBuffer = new MessageBuffer();

    private socket: WebSocket | Socket | null = null;

    public createServer({
        host = this.host,
        port = this.port,
        protocol = this.protocol,
        sender = this.sender,
        target = this.target,
        heartbeatIntervalSeconds = DEFAULT_HEARTBEAT_SECONDS,
        fixVersion = this.fixVersion,
        logging = true,
    }: Options = {}): void {
        if (!LicenseManager.validateLicense()) {
            return;
        }
        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.sender = sender;
        this.target = target;
        this.fixParser.sender = sender;
        this.fixParser.target = target;
        this.heartBeatInterval = heartbeatIntervalSeconds;
        this.fixVersion = fixVersion;
        loggingSettings.enabled = logging;
        this.initialize();
    }

    private initialize() {
        if (this.protocol === 'tcp') {
            this.server = createNetServer((socket: Socket) => {
                this.socket = socket;
                this.socket.pipe(new FrameDecoder()).on('data', (data: string) => {
                    this.connected = true;
                    const messages = this.parse(data.toString());
                    let i: number = 0;
                    for (i; i < messages.length; i++) {
                        this.processMessage(messages[i]);
                        this.emit('message', messages[i]);
                    }
                });
                this.socket.on('connect', () => {
                    log(`FIXServer (${this.protocol.toUpperCase()}): -- Connection established`);
                    this.connected = true;
                    this.emit('open');
                });
                this.socket.on('close', () => {
                    this.connected = false;
                    this.stopHeartbeat();
                    this.resetSession();
                    log(`FIXServer (${this.protocol.toUpperCase()}): -- Closed connection`);
                    this.emit('close');
                });
                this.socket.on('timeout', () => {
                    this.connected = false;
                    this.stopHeartbeat();
                    this.close();
                    this.resetSession();
                    logError(`FIXServer (${this.protocol.toUpperCase()}): -- Connection timeout`);
                    this.emit('close');
                });
                this.socket.on('error', (error: Error) => {
                    this.connected = false;
                    this.stopHeartbeat();
                    this.close();
                    this.resetSession();
                    logError(`FIXServer (${this.protocol.toUpperCase()}): -- Error`, error);
                    this.emit('error', error);
                });
            });
            this.server.listen(this.port, this.host, () => {
                log(
                    `FIXServer (${this.protocol.toUpperCase()}): -- Listening for connections at ${this.host}:${
                        this.port
                    }...`,
                );
            });
        } else if (this.protocol === 'websocket') {
            const serverOptions: ServerOptions = {
                host: this.host,
                port: this.port,
            };
            this.server = new Websocket.Server(serverOptions);
            this.server.on('connection', (socket) => {
                this.connected = true;
                socket.on('message', (data: string | Buffer) => {
                    const messages = this.parse(data.toString());
                    let i: number = 0;
                    for (i; i < messages.length; i++) {
                        this.processMessage(messages[i]);
                        this.emit('message', messages[i]);
                    }
                });
            });
            this.server.on('close', () => {
                this.connected = false;
                this.stopHeartbeat();
                this.emit('close');
                log(`FIXServer (${this.protocol.toUpperCase()}): -- Closed connection`);
            });
            this.server.on('error', (error) => {
                this.connected = false;
                this.stopHeartbeat();
                this.close();
                this.emit('error', error);
                logError(`FIXServer (${this.protocol.toUpperCase()}): -- Error`);
            });
            this.server.on('listening', () => {
                log(
                    `FIXServer (${this.protocol.toUpperCase()}): -- Listening for connections at ${this.host}:${
                        this.port
                    }...`,
                );
            });
        } else {
            logError(`FIXServer: Create server, invalid protocol: ${this.protocol.toUpperCase()}`);
        }
    }

    public getNextTargetMsgSeqNum(): number {
        return this.fixParser.getNextTargetMsgSeqNum();
    }

    public setNextTargetMsgSeqNum(nextMsgSeqNum: number): number {
        return this.fixParser.setNextTargetMsgSeqNum(nextMsgSeqNum);
    }

    public getTimestamp(dateObject = new Date()): string {
        return this.fixParser.getTimestamp(dateObject);
    }

    public createMessage(...fields: Field[]): Message {
        return this.fixParser.createMessage(...fields);
    }

    public parse(data: string): Message[] {
        return this.fixParser.parse(data);
    }

    public send(message: Message): void {
        if (!LicenseManager.validateLicense()) {
            return;
        }
        if (this.protocol === 'tcp') {
            const socket: Socket = this.socket! as Socket;
            const encodedMessage: string = message.encode();
            this.fixParser.setNextTargetMsgSeqNum(this.fixParser.getNextTargetMsgSeqNum() + 1);
            if (!socket.write(encodedMessage)) {
                logError(`FIXServer (${this.protocol.toUpperCase()}): -- Could not send message, socket not open`);
            } else {
                this.messageBuffer.add(message.clone());
                log(`FIXServer (${this.protocol.toUpperCase()}): >> sent`, encodedMessage.replace(/\x01/g, '|'));
            }
        } else if (this.protocol === 'websocket') {
            const server: Websocket.Server = this.server! as Websocket.Server;
            const encodedMessage: string = message.encode();
            if (server && server.clients && server.clients.size > 0) {
                server.clients.forEach((client: Websocket) => {
                    if (client.readyState === client.OPEN) {
                        this.fixParser.setNextTargetMsgSeqNum(this.fixParser.getNextTargetMsgSeqNum() + 1);
                        client.send(encodedMessage);
                        this.messageBuffer.add(message.clone());
                        log(
                            `FIXServer (${this.protocol.toUpperCase()}): >> sent`,
                            encodedMessage.replace(/\x01/g, '|'),
                        );
                    }
                });
            } else {
                logError(
                    `FIXServer (${this.protocol.toUpperCase()}): -- Could not send message, socket not connected`,
                    message,
                );
            }
        }
    }

    public isConnected(): boolean {
        return this.connected;
    }

    private resetSession() {
        this.nextNumIn = 1;
    }

    public close(): void {
        if (this.protocol === 'tcp') {
            const socket: Socket = this.socket! as Socket;
            const server: Server = this.server! as Server;
            socket.end(() => {
                if (server) {
                    server.close(() => {
                        log(`FIXServer (${this.protocol.toUpperCase()}): -- Ended session`);
                        this.initialize();
                    });
                }
            });
        } else if (this.protocol === 'websocket') {
            const server: Websocket.Server = this.server! as Websocket.Server;
            if (server) {
                server.clients.forEach((client: Websocket) => {
                    client.close();
                });
                server.close(() => {
                    log(`FIXServer (${this.protocol.toUpperCase()}): -- Ended session`);
                    this.initialize();
                });
            }
        }
    }

    public destroy(): void {
        if (this.protocol === 'tcp') {
            const socket: Socket = this.socket! as Socket;
            const server: Server = this.server! as Server;
            socket.destroy();
            server.close(() => {
                log(`FIXServer (${this.protocol.toUpperCase()}): -- Destroyed`);
            });
        } else if (this.protocol === 'websocket') {
            const server: Websocket.Server = this.server! as Websocket.Server;
            if (server) {
                server.clients.forEach((client: Websocket) => {
                    client.close();
                });
                server.close(() => {
                    log(`FIXServer (${this.protocol.toUpperCase()}): -- Destroyed`);
                });
            }
        }
    }

    public stopHeartbeat(): void {
        clearInterval(this.heartBeatIntervalId!);
    }

    public startHeartbeat(heartBeatInterval: number = this.heartBeatInterval): void {
        this.stopHeartbeat();
        log(`FIXServer (${this.protocol.toUpperCase()}): -- Heartbeat configured to ${heartBeatInterval} seconds`);
        this.heartBeatInterval = heartBeatInterval;
        this.heartBeatIntervalId = setInterval(() => {
            const heartBeatMessage: Message = heartBeat(this);
            this.send(heartBeatMessage);
            const encodedMessage: string = heartBeatMessage.encode();
            log(`FIXServer (${this.protocol.toUpperCase()}): >> sent Heartbeat`, encodedMessage.replace(/\x01/g, '|'));
        }, this.heartBeatInterval * 1000);
    }

    private processMessage(message: Message): void {
        if (!LicenseManager.validateLicense()) {
            return;
        }
        log(`FIXServer (${this.protocol.toUpperCase()}): << received ${message.description}`);
        handleSequence(this, message);
        if (message.messageType === MessageEnum.SequenceReset) {
            handleSequenceReset(this, message);
        } else if (message.messageType === MessageEnum.TestRequest) {
            handleTestRequest(this, message);
        } else if (message.messageType === MessageEnum.Logon) {
            handleLogon(this, this.messageBuffer, message);
        } else if (message.messageType === MessageEnum.Logout) {
            handleLogout(this, message);
        } else if (message.messageType === MessageEnum.ResendRequest) {
            handleResendRequest(this, this.messageBuffer, message);
        }
        this.nextNumIn++;
    }
}

export { AllocPositionEffectEnum as AllocPositionEffect } from './fieldtypes/AllocPositionEffectEnum';
export { EncryptMethodEnum as EncryptMethod } from './fieldtypes/EncryptMethodEnum';
export { ExecTypeEnum as ExecType } from './fieldtypes/ExecTypeEnum';
export { FieldEnum as Fields } from './fieldtypes/FieldEnum';
export { HandlInstEnum as HandlInst } from './fieldtypes/HandlInstEnum';
export { MarketDepthEnum as MarketDepth } from './fieldtypes/MarketDepthEnum';
export { MDEntryTypeEnum as MDEntryType } from './fieldtypes/MDEntryTypeEnum';
export { MDUpdateTypeEnum as MDUpdateType } from './fieldtypes/MDUpdateTypeEnum';
export { MessageEnum as Messages } from './fieldtypes/MessageEnum';
export { OrderStatusEnum as OrderStatus } from './fieldtypes/OrderStatusEnum';
export { OrderTypesEnum as OrderTypes } from './fieldtypes/OrderTypesEnum';
export { SideEnum as Side } from './fieldtypes/SideEnum';
export { SubscriptionRequestTypeEnum as SubscriptionRequestType } from './fieldtypes/SubscriptionRequestTypeEnum';
export { TimeInForceEnum as TimeInForce } from './fieldtypes/TimeInForceEnum';
export { Protocol } from './FIXParserBase';
export { LicenseManager } from './licensemanager/LicenseManager';
export { Constants };
export { Field };
export { Message };
export { FIXServer };
