/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Field } from '../fields/Field';
import { EncryptMethodEnum } from '../fieldtypes/EncryptMethodEnum';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { MessageEnum } from '../fieldtypes/MessageEnum';
import { IFIXParser } from '../IFIXParser';
import { Message } from '../message/Message';
import { MessageBuffer } from '../util/MessageBuffer';
import { log, logWarning } from '../util/util';

export const handleLogon = (parser: IFIXParser, messageBuffer: MessageBuffer, message: Message): boolean => {
    if (parser.isLoggedIn) {
        if (parser.connectionType === 'acceptor') {
            if (
                message.getField(FieldEnum.ResetSeqNumFlag) &&
                message.getField(FieldEnum.ResetSeqNumFlag)!.value!.toString() === 'Y'
            ) {
                log(`FIXServer (${parser.protocol!.toUpperCase()}): -- Logon acknowledged by acceptor.`);
                parser.nextNumIn = 1;
            }
        } else {
            log(`FIXServer (${parser.protocol!.toUpperCase()}): -- Logon acknowledged by initiator.`);
        }
        return true;
    }

    const fixVersion: string | null = String(message.getField(FieldEnum.BeginString)!.value);
    let validSender: boolean = true;
    let validTarget: boolean = true;

    if (fixVersion) {
        log(`FIXServer (${parser.protocol!.toUpperCase()}): -- FIX version set to ${fixVersion}`);
        parser.fixVersion = fixVersion;
        if (parser.fixParser) {
            parser.fixParser.fixVersion = fixVersion;
        }
    }

    const target: string | null = message.getField(FieldEnum.TargetCompID)
        ? message.getField(FieldEnum.TargetCompID)!.value!.toString()
        : parser.sender;
    const sender: string | null = message.getField(FieldEnum.SenderCompID)
        ? message.getField(FieldEnum.SenderCompID)!.value!.toString()
        : parser.target;
    if (target && target !== parser.sender) {
        logWarning(
            `FIXServer (${parser.protocol!.toUpperCase()}): -- Expected TargetCompID=${
                parser.sender
            }, but got ${target}`,
        );
        validTarget = false;
    }
    if (sender && sender !== parser.target) {
        logWarning(
            `FIXServer (${parser.protocol!.toUpperCase()}): -- Expected SenderCompID=${
                parser.target
            }, but got ${sender}`,
        );
        validSender = false;
    }

    if (validSender && validTarget) {
        if (parser.connectionType === 'acceptor') {
            parser.nextNumIn = 1;
            parser.setNextTargetMsgSeqNum(1);

            const logonAcknowledge = parser.createMessage(
                new Field(FieldEnum.MsgType, MessageEnum.Logon),
                new Field(FieldEnum.MsgSeqNum, parser.getNextTargetMsgSeqNum()),
                new Field(FieldEnum.SenderCompID, target),
                new Field(FieldEnum.SendingTime, parser.getTimestamp(new Date())),
                new Field(FieldEnum.TargetCompID, sender),
                new Field(FieldEnum.ResetSeqNumFlag, 'Y'),
                new Field(FieldEnum.EncryptMethod, EncryptMethodEnum.None),
                new Field(
                    FieldEnum.HeartBtInt,
                    message.getField(FieldEnum.HeartBtInt)
                        ? (message.getField(FieldEnum.HeartBtInt)!.value as number)
                        : parser.heartBeatInterval,
                ),
            );
            parser.send(logonAcknowledge);
            log(`FIXServer (${parser.protocol!.toUpperCase()}): >> sent Logon acknowledge`);
        } else {
            if (
                message.getField(FieldEnum.ResetSeqNumFlag) &&
                message.getField(FieldEnum.ResetSeqNumFlag)!.value!.toString() === 'Y'
            ) {
                log(
                    `FIXServer (${parser.protocol!.toUpperCase()}): -- Logon contains ResetSeqNumFlag=Y, resetting sequence numbers to 1`,
                );
                parser.nextNumIn = 1;
                parser.setNextTargetMsgSeqNum(2);
            }
        }

        parser.isLoggedIn = true;
        log(`FIXServer (${parser.protocol!.toUpperCase()}): >> Logon successful by ${parser.connectionType}`);
        const heartBeatInterval: number = message.getField(FieldEnum.HeartBtInt)
            ? Number(message.getField(FieldEnum.HeartBtInt)!.value!)
            : parser.heartBeatInterval;
        parser.heartBeatInterval = heartBeatInterval;
        if (parser.fixParser) {
            parser.fixParser.heartBeatInterval = heartBeatInterval;
        }
        parser.startHeartbeat(heartBeatInterval);
        return true;
    } else {
        const logonReject = parser.createMessage(
            new Field(FieldEnum.MsgType, MessageEnum.Logout),
            new Field(FieldEnum.MsgSeqNum, parser.getNextTargetMsgSeqNum()),
            new Field(FieldEnum.SenderCompID, validSender ? sender : 'INVALID_SENDER'),
            new Field(FieldEnum.SendingTime, parser.getTimestamp(new Date())),
            new Field(FieldEnum.TargetCompID, validTarget ? target : 'INVALID_TARGET'),
            new Field(FieldEnum.Text, 'Invalid Logon TARGET or SENDER.'),
        );
        parser.isLoggedIn = false;
        parser.send(logonReject);
        logWarning(`FIXServer (${parser.protocol!.toUpperCase()}): >> sent Logout due to invalid Logon`);
        parser.stopHeartbeat();
        parser.close();
        return false;
    }
};
