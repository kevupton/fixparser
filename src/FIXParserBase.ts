/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Enums as EnumsCache } from './enums/Enums';
import { Field } from './fields/Field';
import { Fields as FieldsCache } from './fields/Fields';
import { FieldEnum } from './fieldtypes/FieldEnum';
import { Message } from './message/Message';
import { DEFAULT_FIX_VERSION, RE_ESCAPE, RE_FIND, SOH, STRING_EQUALS } from './util/util';

export type Protocol = 'tcp' | 'ssl-tcp' | 'tls-tcp' | 'websocket';
export type ConnectionType = 'acceptor' | 'initiator';

export type Options = {
    host?: string;
    port?: number;
    protocol?: Protocol;
    sender?: string;
    target?: string;
    heartbeatIntervalSeconds?: number;
    fixVersion?: string;
    tlsKey?: unknown | null;
    tlsCert?: unknown | null;
    tlsUseSNI?: boolean;
    logging?: boolean;
    proxy?: string | null;
    onReady?: () => void;
    onMessage?: (message: Message) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error?: Error) => void;
};

export class FIXParserBase {
    public fixVersion: string = DEFAULT_FIX_VERSION;
    public message: Message | null = null;
    public messageTags: string[] = [];
    public messageString: string = '';
    public fields: FieldsCache = new FieldsCache();
    public enums: EnumsCache = new EnumsCache();

    public processMessage(): void {
        const matches: RegExpExecArray | null = RE_FIND.exec(this.messageString);
        if (matches && matches.length === 2) {
            const stringData: string = this.messageString.replace(
                new RegExp(matches[1].replace(RE_ESCAPE, '\\$&'), 'g'),
                SOH,
            );
            this.message!.setString(stringData);
            this.messageTags = stringData.split(SOH);
        } else {
            this.message = null;
            this.messageTags = [];
        }
    }

    public processFields(): void {
        let tag: number;
        let value: string | number | null;
        let i: number = 0;
        let equalsOperator: number;
        let field: Field;

        for (i; i < this.messageTags.length - 1; i++) {
            equalsOperator = this.messageTags[i].indexOf(STRING_EQUALS);

            tag = Number(this.messageTags[i].substring(0, equalsOperator));
            value = this.messageTags[i].substring(equalsOperator + 1);

            field = new Field(tag, value);

            this.fields.processField(this.message!, field);
            this.enums.processEnum(field);

            if (field.tag === FieldEnum.BeginString) {
                this.message!.fixVersion = String(field.value);
            } else if (field.tag === FieldEnum.BodyLength) {
                this.message!.validateBodyLength(value);
            } else if (field.tag === FieldEnum.CheckSum) {
                this.message!.validateChecksum(value);
            }

            this.message!.addField(field);
        }
    }

    public parse(data: string): Message[] {
        let i: number = 0;

        const messageStrings = data ? data.split('8=FIX') : [];
        const messages = [];

        for (i; i < messageStrings.length; i++) {
            this.message = new Message(this.fixVersion);
            this.messageString = `8=FIX${messageStrings[i]}`;
            if (this.messageString.indexOf(SOH) > -1) {
                this.message.setString(this.messageString);
                this.messageTags = this.messageString.split(SOH);
            } else {
                this.processMessage();
            }

            if (this.message) {
                this.processFields();
                messages.push(this.message);
            }
        }

        return messages;
    }
}
