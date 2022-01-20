/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Field } from './fields/Field';
import * as Constants from './fieldtypes';
import { ConnectionType, FIXParserBase, Options as FIXParserOptions, Protocol } from './FIXParserBase';
import { IFIXParser } from './IFIXParser';
import { LicenseManager } from './licensemanager/LicenseManager';
import { Message } from './message/Message';
import { heartBeat } from './messagetemplates/MessageTemplates';
import { clientProcessMessage } from './session/ClientMessageProcessor';
import { MessageBuffer } from './util/MessageBuffer';
import {
    DEFAULT_FIX_VERSION,
    DEFAULT_HEARTBEAT_SECONDS,
    log,
    logError,
    Parser,
    timestamp,
    Version,
    version,
} from './util/util';

export type Options = Pick<
    FIXParserOptions,
    | 'host'
    | 'port'
    | 'sender'
    | 'target'
    | 'heartbeatIntervalSeconds'
    | 'fixVersion'
    | 'onMessage'
    | 'onOpen'
    | 'onError'
    | 'onClose'
    | 'onReady'
>;

export default class FIXParserBrowser implements IFIXParser {
    public static version: Version = version;
    public parserName: Parser = 'FIXParserBrowser';
    public fixParserBase: FIXParserBase = new FIXParserBase();
    public nextNumIn: number = 1;
    public nextNumOut: number = 1;
    public heartBeatIntervalId: ReturnType<typeof setInterval> | null = null;
    public socket: WebSocket | null = null;
    public connected: boolean = false;
    public host: string | null = null;
    public port: number | null = null;
    public protocol: Protocol | null = 'websocket';
    public sender: string | null = null;
    public target: string | null = null;
    public heartBeatInterval: number = DEFAULT_HEARTBEAT_SECONDS;
    public fixVersion: string = DEFAULT_FIX_VERSION;
    public messageBufferIn: MessageBuffer = new MessageBuffer();
    public messageBufferOut: MessageBuffer = new MessageBuffer();
    public connectionType: ConnectionType = 'initiator';

    private static onMessageCallback: Options['onMessage'] = () => {};
    private static onOpenCallback: Options['onOpen'] = () => {};
    private static onErrorCallback: Options['onError'] = () => {};
    private static onCloseCallback: Options['onClose'] = () => {};
    private static onReadyCallback: Options['onReady'] = () => {};

    public connect(
        {
            host = 'localhost',
            port = 9878,
            sender = 'SENDER',
            target = 'TARGET',
            heartbeatIntervalSeconds = DEFAULT_HEARTBEAT_SECONDS,
            fixVersion = this.fixVersion,
            onMessage,
            onOpen,
            onError,
            onClose,
            onReady,
        }: Options = {
            onMessage: FIXParserBrowser.onMessageCallback,
            onOpen: FIXParserBrowser.onOpenCallback,
            onError: FIXParserBrowser.onErrorCallback,
            onClose: FIXParserBrowser.onCloseCallback,
            onReady: FIXParserBrowser.onReadyCallback,
        },
    ): void {
        if (!LicenseManager.validateLicense()) {
            return;
        }
        this.connectionType = 'initiator';
        this.host = host;
        this.port = port;
        this.protocol = 'websocket';
        this.sender = sender;
        this.target = target;
        this.heartBeatInterval = heartbeatIntervalSeconds;
        this.fixVersion = fixVersion;
        this.fixParserBase.fixVersion = fixVersion;

        if (onMessage !== undefined) {
            FIXParserBrowser.onMessageCallback = onMessage;
        }

        if (onOpen !== undefined) {
            FIXParserBrowser.onOpenCallback = onOpen;
        }

        if (onError !== undefined) {
            FIXParserBrowser.onErrorCallback = onError;
        }

        if (onClose !== undefined) {
            FIXParserBrowser.onCloseCallback = onClose;
        }

        if (onReady !== undefined) {
            FIXParserBrowser.onReadyCallback = onReady;
        }

        this.socket = new WebSocket(
            this.host.indexOf('ws://') === -1 && this.host.indexOf('wss://') === -1
                ? `ws://${this.host}:${this.port}`
                : `${this.host}:${this.port}`,
        );

        this.socket.addEventListener('open', (event) => {
            this.connected = true;
            log(
                `FIXParser (${this.protocol!.toUpperCase()}): -- Connected: ${event}, readyState: ${
                    this.socket!.readyState
                }`,
            );
            FIXParserBrowser.onOpenCallback?.();
        });
        this.socket.addEventListener('close', (event) => {
            this.connected = false;
            log(
                `FIXParser (${this.protocol!.toUpperCase()}): -- Connection closed: ${event}, readyState: ${
                    this.socket!.readyState
                }`,
            );
            FIXParserBrowser.onCloseCallback?.();
            this.stopHeartbeat();
        });
        this.socket.addEventListener('message', (event) => {
            const messages = this.fixParserBase.parse(event.data as string);
            let i: number = 0;
            for (i; i < messages.length; i++) {
                clientProcessMessage(this, messages[i]);
                this.messageBufferIn.add(messages[i]);
                FIXParserBrowser.onMessageCallback?.(messages[i]);
            }
        });
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
        return new Message(this.fixVersion, ...fields);
    }

    public parse(data: string): Message[] {
        return this.fixParserBase.parse(data);
    }

    public send(message: Message): void {
        if (!LicenseManager.validateLicense()) {
            return;
        }
        if (this.socket!.readyState === 1) {
            this.setNextTargetMsgSeqNum(this.getNextTargetMsgSeqNum() + 1);
            this.socket!.send(message.encode());
            this.messageBufferOut.add(message.clone());
        } else {
            logError(
                `FIXParser (${this.protocol!.toUpperCase()}): -- Could not send message, socket not open`,
                message,
            );
        }
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public close(): void {
        this.socket!.close();
        this.connected = false;
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
            log(`FIXParser (${this.protocol!.toUpperCase()}): >> sent Heartbeat`);
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
export { FIXParserBrowser as FIXParser };

/**
 * Export FIXParser to the window object.
 */
(global as any).FIXParser = FIXParserBrowser;
