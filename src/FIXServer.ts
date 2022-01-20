/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { createServer as createNetServer, Server, Socket } from 'net';
import Websocket, { ServerOptions } from 'ws';

import { Field } from './fields/Field';
import * as Constants from './fieldtypes';
import FIXParser from './FIXParser';
import { ConnectionType, Options as FIXParserOptions, Protocol } from './FIXParserBase';
import { IFIXParser } from './IFIXParser';
import { LicenseManager } from './licensemanager/LicenseManager';
import { Message } from './message/Message';
import { heartBeat } from './messagetemplates/MessageTemplates';
import { serverProcessMessage } from './session/ServerMessageProcessor';
import { FrameDecoder } from './util/FrameDecoder';
import { MessageBuffer } from './util/MessageBuffer';
import {
    DEFAULT_FIX_VERSION,
    DEFAULT_HEARTBEAT_SECONDS,
    log,
    logError,
    loggingSettings,
    Parser,
    READY_MS,
    Version,
    version,
} from './util/util';

type Options = Pick<
    FIXParserOptions,
    | 'host'
    | 'port'
    | 'protocol'
    | 'sender'
    | 'target'
    | 'heartbeatIntervalSeconds'
    | 'fixVersion'
    | 'logging'
    | 'onMessage'
    | 'onOpen'
    | 'onError'
    | 'onClose'
    | 'onReady'
>;

export default class FIXServer implements IFIXParser {
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
    public messageCounter: number = 0;
    public heartBeatIntervalId: ReturnType<typeof setInterval> | null = null;
    public messageBufferIn: MessageBuffer = new MessageBuffer();
    public messageBufferOut: MessageBuffer = new MessageBuffer();
    public socket: WebSocket | Socket | null = null;
    public isLoggedIn: boolean = false;
    public connectionType: ConnectionType = 'acceptor';

    private static onMessageCallback: Options['onMessage'] = () => {};
    private static onOpenCallback: Options['onOpen'] = () => {};
    private static onErrorCallback: Options['onError'] = () => {};
    private static onCloseCallback: Options['onClose'] = () => {};
    private static onReadyCallback: Options['onReady'] = () => {};

    public createServer(
        {
            host = this.host,
            port = this.port,
            protocol = this.protocol,
            sender = this.sender,
            target = this.target,
            heartbeatIntervalSeconds = DEFAULT_HEARTBEAT_SECONDS,
            fixVersion = this.fixVersion,
            logging = true,
            onMessage,
            onOpen,
            onError,
            onClose,
            onReady,
        }: Options = {
            onMessage: FIXServer.onMessageCallback,
            onOpen: FIXServer.onOpenCallback,
            onError: FIXServer.onErrorCallback,
            onClose: FIXServer.onCloseCallback,
            onReady: FIXServer.onReadyCallback,
        },
    ): void {
        if (!LicenseManager.validateLicense()) {
            return;
        }
        this.connectionType = 'acceptor';
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

        if (onMessage !== undefined) {
            FIXServer.onMessageCallback = onMessage;
        }

        if (onOpen !== undefined) {
            FIXServer.onOpenCallback = onOpen;
        }

        if (onError !== undefined) {
            FIXServer.onErrorCallback = onError;
        }

        if (onClose !== undefined) {
            FIXServer.onCloseCallback = onClose;
        }

        if (onReady !== undefined) {
            FIXServer.onReadyCallback = onReady;
        }

        this.initialize();
    }

    private initialize() {
        this.messageCounter = 0;
        if (this.protocol === 'tcp') {
            this.server = createNetServer((socket: Socket) => {
                this.socket = socket;
                this.socket.pipe(new FrameDecoder()).on('data', (data: string) => {
                    this.connected = true;
                    const messages = this.parse(data.toString());
                    let i: number = 0;
                    for (i; i < messages.length; i++) {
                        serverProcessMessage(this, messages[i]);
                        this.messageBufferIn.add(messages[i]);
                        FIXServer.onMessageCallback?.(messages[i]);
                    }
                });
                this.socket.on('connect', () => {
                    log(`FIXServer (${this.protocol.toUpperCase()}): -- Connection established`);
                    this.connected = true;
                    FIXServer.onOpenCallback?.();
                });
                this.socket.on('close', () => {
                    this.connected = false;
                    this.stopHeartbeat();
                    this.resetSession();
                    log(`FIXServer (${this.protocol.toUpperCase()}): -- Closed connection`);
                    FIXServer.onCloseCallback?.();
                });
                this.socket.on('timeout', () => {
                    this.connected = false;
                    this.stopHeartbeat();
                    this.close();
                    this.resetSession();
                    logError(`FIXServer (${this.protocol.toUpperCase()}): -- Connection timeout`);
                    FIXServer.onCloseCallback?.();
                });
                this.socket.on('error', (error: Error) => {
                    this.connected = false;
                    this.stopHeartbeat();
                    this.close();
                    this.resetSession();
                    logError(`FIXServer (${this.protocol.toUpperCase()}): -- Error`, error);
                    FIXServer.onErrorCallback?.(error);
                });
            });
            this.server.listen(this.port, this.host, () => {
                log(
                    `FIXServer (${this.protocol.toUpperCase()}): -- Listening for connections at ${this.host}:${
                        this.port
                    }...`,
                );
                setTimeout(() => FIXServer.onReadyCallback?.(), READY_MS);
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
                        serverProcessMessage(this, messages[i]);
                        this.messageBufferIn.add(messages[i]);
                        FIXServer.onMessageCallback?.(messages[i]);
                    }
                });
            });
            this.server.on('close', () => {
                this.connected = false;
                this.stopHeartbeat();
                FIXServer.onCloseCallback?.();
                log(`FIXServer (${this.protocol.toUpperCase()}): -- Closed connection`);
            });
            this.server.on('error', (error) => {
                this.connected = false;
                this.stopHeartbeat();
                this.close();
                FIXServer.onErrorCallback?.(error);
                logError(`FIXServer (${this.protocol.toUpperCase()}): -- Error`);
            });
            this.server.on('listening', () => {
                log(
                    `FIXServer (${this.protocol.toUpperCase()}): -- Listening for connections at ${this.host}:${
                        this.port
                    }...`,
                );
                setTimeout(() => FIXServer.onReadyCallback?.(), READY_MS);
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
                this.messageBufferOut.add(message.clone());
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
                        this.messageBufferOut.add(message.clone());
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
        this.isLoggedIn = false;
        this.messageCounter = 0;
    }

    public close(): void {
        if (this.protocol === 'tcp') {
            const socket: Socket = this.socket! as Socket;
            const server: Server = this.server! as Server;
            if (socket && socket.end) {
                socket.end(() => {
                    if (server) {
                        server.close(() => {
                            log(`FIXServer (${this.protocol.toUpperCase()}): -- Ended session`);
                            this.initialize();
                        });
                    }
                });
            }
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
export { Options } from './FIXParserBase';
export { LicenseManager } from './licensemanager/LicenseManager';
export { Constants };
export { Field };
export { Message };
export { FIXServer };
