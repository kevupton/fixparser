/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Field } from '../fields/Field';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { MessageEnum } from '../fieldtypes/MessageEnum';
import { IFIXParser } from '../IFIXParser';
import { Message } from '../message/Message';
import { log } from '../util/util';

export const handleFirstMessage = (parser: IFIXParser, message: Message): boolean => {
    if (message.getField(FieldEnum.MsgType)!.value! === MessageEnum.Logon) {
        return true;
    } else {
        const firstMessageNotALogon = parser.createMessage(
            new Field(FieldEnum.MsgType, MessageEnum.Logout),
            new Field(FieldEnum.MsgSeqNum, parser.getNextTargetMsgSeqNum()),
            new Field(
                FieldEnum.SenderCompID,
                message.getField(FieldEnum.SenderCompID)
                    ? message.getField(FieldEnum.SenderCompID)!.value!.toString()
                    : parser.sender,
            ),
            new Field(FieldEnum.SendingTime, parser.getTimestamp(new Date())),
            new Field(
                FieldEnum.TargetCompID,
                message.getField(FieldEnum.TargetCompID)
                    ? message.getField(FieldEnum.TargetCompID)!.value!.toString()
                    : parser.target,
            ),
            new Field(FieldEnum.Text, 'First message not a Logon'),
        );
        parser.send(firstMessageNotALogon);
        log(`FIXServer (${parser.protocol!.toUpperCase()}): >> sent Logout`);
        parser.stopHeartbeat();
        parser.close();
        return false;
    }
};
