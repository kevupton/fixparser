/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { EventEmitter } from 'events';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { Socket } from 'net';
import { connect as TLSConnect, ConnectionOptions, TLSSocket } from 'tls';
import { URL } from 'url';
import WebSocket from 'ws';

import { Field } from './fields/Field';
import * as Constants from './fieldtypes';
import { FIXParserBase, Options, Protocol } from './FIXParserBase';
import { IFIXParser } from './IFIXParser';
import { LicenseManager } from './licensemanager/LicenseManager';
import { Message } from './message/Message';
import { heartBeat } from './messagetemplates/MessageTemplates';
import { clientProcessMessage } from './util/ClientMessageProcessor';
import { FrameDecoder } from './util/FrameDecoder';
import { MessageBuffer } from './util/MessageBuffer';
import {
    DEFAULT_FIX_VERSION,
    DEFAULT_HEARTBEAT_SECONDS,
    log,
    logError,
    loggingSettings,
    Parser,
    timestamp,
    Version,
    version,
} from './util/util';

export default class FIXParser extends EventEmitter implements IFIXParser {
    public static version: Version = version;

    public parserName: Parser = 'FIXParser';
    public fixParserBase: FIXParserBase = new FIXParserBase();
    public nextNumIn: number = 1;
    public nextNumOut: number = 1;
    public heartBeatIntervalId: ReturnType<typeof setInterval> | null = null;
    public socket: Socket | WebSocket | TLSSocket | null = null;
    public connected: boolean = false;
    public host: string | null = null;
    public port: number | null = null;
    public protocol: Protocol | null = 'tcp';
    public sender: string | null = null;
    public target: string | null = null;
    public heartBeatInterval: number = DEFAULT_HEARTBEAT_SECONDS;
    public fixVersion: string = DEFAULT_FIX_VERSION;
    public messageBuffer: MessageBuffer = new MessageBuffer();

    public connect({
        host = 'localhost',
        port = 9878,
        protocol = 'tcp',
        sender = 'SENDER',
        target = 'TARGET',
        heartbeatIntervalSeconds = DEFAULT_HEARTBEAT_SECONDS,
        fixVersion = this.fixVersion,
        tlsKey = null,
        tlsCert = null,
        tlsUseSNI = false,
        logging = true,
        proxy = null,
    }: Options = {}): void {
        if (!LicenseManager.validateLicense()) {
            return;
        }
        this.fixVersion = fixVersion;
        this.fixParserBase.fixVersion = fixVersion;
        this.protocol = protocol;
        this.sender = sender;
        this.target = target;
        this.heartBeatInterval = heartbeatIntervalSeconds;
        loggingSettings.enabled = logging;

        if (protocol === 'tcp') {
            this.socket = new Socket();
            this.socket.setEncoding('ascii');
            this.socket.pipe(new FrameDecoder()).on('data', (data: string) => {
                const messages: Message[] = this.parse(data.toString());
                let i: number = 0;
                for (i; i < messages.length; i++) {
                    clientProcessMessage(this, messages[i]);
                    this.emit('message', messages[i]);
                }
            });
            this.socket.on('close', () => {
                this.connected = false;
                this.emit('close');
                this.stopHeartbeat();
            });
            this.socket.on('error', (error) => {
                this.connected = false;
                this.emit('error', error);
                this.stopHeartbeat();
            });
            this.socket.on('timeout', () => {
                this.connected = false;
                const socket: Socket = this.socket! as Socket;
                this.emit('timeout');
                socket.end();
                this.stopHeartbeat();
            });
            this.socket.connect(port, host, () => {
                this.connected = true;
                log(`FIXParser (${this.protocol!.toUpperCase()}): -- Connected`);
                this.emit('open');
            });
        } else if (protocol === 'websocket') {
            const connectionString =
                host.indexOf('ws://') === -1 && host.indexOf('wss://') === -1
                    ? `ws://${host}:${port}`
                    : `${host}:${port}`;
            if (proxy) {
                const proxyUrl: URL = new URL(proxy);
                const agent: HttpsProxyAgent = new HttpsProxyAgent(proxyUrl);
                this.socket = new WebSocket(connectionString, { agent });
            } else {
                this.socket = new WebSocket(connectionString);
            }
            this.socket.on('open', () => {
                log(`FIXParser (${this.protocol!.toUpperCase()}): -- Connected`);
                this.connected = true;
                this.emit('open');
            });
            this.socket.on('message', (data: string | Buffer) => {
                const messages = this.parse(data.toString());
                let i: number = 0;
                for (i; i < messages.length; i++) {
                    clientProcessMessage(this, messages[i]);
                    this.emit('message', messages[i]);
                }
            });
            this.socket.on('close', () => {
                this.connected = false;
                this.emit('close');
                this.stopHeartbeat();
            });
        } else if (protocol === 'ssl-tcp' || protocol === 'tls-tcp') {
            const options: ConnectionOptions = {
                host,
                port,
                rejectUnauthorized: false,
            };

            if (tlsKey && tlsCert) {
                options.key = tlsKey as any;
                options.cert = tlsCert as any;
            }

            if (tlsUseSNI) {
                options.servername = host;
            }

            this.socket = TLSConnect(port, host, options, () => {
                this.connected = true;
                this.emit('open');
                log(`FIXParser (${this.protocol!.toUpperCase()}): -- Connected through TLS`);

                process.stdin.pipe(this.socket as TLSSocket);
                process.stdin.resume();
            });
            this.socket.setEncoding('utf8');
            this.socket.on('data', (data: string) => {
                const messages: Message[] = this.parse(data.toString());
                let i: number = 0;
                for (i; i < messages.length; i++) {
                    clientProcessMessage(this, messages[i]);
                    this.emit('message', messages[i]);
                }
            });
            this.socket.on('error', (error: Error) => {
                this.connected = false;
                this.emit('error', error);
                this.stopHeartbeat();
            });
            this.socket.on('close', () => {
                this.connected = false;
                this.emit('close');
                this.stopHeartbeat();
            });
            this.socket.on('timeout', () => {
                const socket: TLSSocket = this.socket! as TLSSocket;
                this.connected = false;
                this.emit('timeout');
                socket.end();
                this.stopHeartbeat();
            });
        }
    }

    public getNextTargetMsgSeqNum(): number {
        return this.nextNumOut;
    }

    public setNextTargetMsgSeqNum(nextMsgSeqNum: number): number {
        this.nextNumOut = nextMsgSeqNum;
        return this.nextNumOut;
    }

    public getTimestamp(dateObject = new Date()): string {
        return timestamp(dateObject);
    }

    public createMessage(...fields: Field[]): Message {
        const message: Message = new Message(this.fixVersion, ...fields);
        message.messageSequence = this.getNextTargetMsgSeqNum();
        return message;
    }

    public parse(data: string): Message[] {
        return this.fixParserBase.parse(data);
    }

    public send(message: Message): void {
        if (!LicenseManager.validateLicense()) {
            return;
        }
        const encodedMessage: string = message.encode();
        if (this.protocol === 'tcp' && this.connected) {
            this.setNextTargetMsgSeqNum(this.getNextTargetMsgSeqNum() + 1);
            (this.socket! as Socket).write(encodedMessage);
            this.messageBuffer.add(message.clone());
            log(`FIXParser (${this.protocol.toUpperCase()}): >> sent`, encodedMessage.replace(/\x01/g, '|'));
        } else if (this.protocol === 'websocket' && (this.socket! as WebSocket).readyState === WebSocket.OPEN) {
            this.setNextTargetMsgSeqNum(this.getNextTargetMsgSeqNum() + 1);
            (this.socket! as WebSocket).send(encodedMessage);
            this.messageBuffer.add(message.clone());
            log(`FIXParser (${this.protocol.toUpperCase()}): >> sent`, encodedMessage.replace(/\x01/g, '|'));
        } else if ((this.protocol === 'ssl-tcp' || this.protocol === 'tls-tcp') && this.connected) {
            this.setNextTargetMsgSeqNum(this.getNextTargetMsgSeqNum() + 1);
            (this.socket! as TLSSocket).write(encodedMessage);
            this.messageBuffer.add(message.clone());
            log(`FIXParser (${this.protocol.toUpperCase()}): >> sent`, encodedMessage.replace(/\x01/g, '|'));
        } else {
            logError(
                `FIXParser (${this.protocol!.toUpperCase()}): -- Could not send message, no connection`,
                encodedMessage.replace(/\x01/g, '|'),
            );
        }
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public close(): void {
        if (this.protocol === 'tcp') {
            const socket: Socket = this.socket! as Socket;
            if (socket) {
                socket.destroy();
                this.connected = false;
            } else {
                logError(`FIXParser (${this.protocol.toUpperCase()}): -- Could not close socket, connection not open`);
            }
        } else if (this.protocol === 'websocket') {
            const socket: WebSocket = this.socket! as WebSocket;
            if (socket) {
                try {
                    socket.close();
                } catch (error) {
                    logError(`FIXParser (${this.protocol.toUpperCase()}): -- Could not close socket,`, error);
                }
                this.connected = false;
            } else {
                logError(`FIXParser (${this.protocol.toUpperCase()}): -- Could not close socket, connection not open`);
            }
        } else if (this.protocol === 'ssl-tcp' || this.protocol === 'tls-tcp') {
            const socket: TLSSocket = this.socket! as TLSSocket;
            if (socket) {
                socket.destroy();
                this.connected = false;
            } else {
                logError(`FIXParser (${this.protocol.toUpperCase()}): -- Could not close socket, connection not open`);
            }
        }
    }

    public stopHeartbeat(): void {
        clearInterval(this.heartBeatIntervalId!);
    }

    public startHeartbeat(heartBeatInterval: number = this.heartBeatInterval): void {
        this.stopHeartbeat();
        log(`FIXParser (${this.protocol!.toUpperCase()}): -- Heartbeat configured to ${heartBeatInterval} seconds`);
        this.heartBeatInterval = heartBeatInterval;
        this.heartBeatIntervalId = setInterval(() => {
            const heartBeatMessage: Message = heartBeat(this);
            this.send(heartBeatMessage);
            const encodedMessage: string = heartBeatMessage.encode();
            log(`FIXParser (${this.protocol!.toUpperCase()}): >> sent Heartbeat`, encodedMessage.replace(/\x01/g, '|'));
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
export { LicenseManager } from './licensemanager/LicenseManager';
export { Constants };
export { Field };
export { Message };
export { FIXParser };

(global as any).FIXParser = FIXParser;
