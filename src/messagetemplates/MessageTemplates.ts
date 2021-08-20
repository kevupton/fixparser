/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { IFIXParser } from '../IFIXParser';
import { Field } from '../fields/Field';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { MessageEnum } from '../fieldtypes/MessageEnum';
import { Message } from '../message/Message';
import { LicenseManager } from '../licensemanager/LicenseManager';

export const heartBeat = (parser: IFIXParser, testReqId?: Field): Message => {
    if (!LicenseManager.validateLicense()) {
        return new Message();
    }
    const fields: Field[] = [
        new Field(FieldEnum.BeginString, parser.fixVersion),
        new Field(FieldEnum.MsgType, MessageEnum.Heartbeat),
        new Field(FieldEnum.MsgSeqNum, parser.getNextTargetMsgSeqNum()),
        new Field(FieldEnum.SenderCompID, parser.sender),
        new Field(FieldEnum.TargetCompID, parser.target),
        new Field(FieldEnum.SendingTime, parser.getTimestamp(new Date())),
    ];

    if (testReqId) {
        fields.push(testReqId);
    }

    return parser.createMessage(...fields);
};
