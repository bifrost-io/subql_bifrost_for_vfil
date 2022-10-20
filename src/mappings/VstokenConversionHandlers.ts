import { makeSureAccount, getPricision } from "./utils";
import { SubstrateEvent } from "@subql/types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import { Add } from "../types";
import { BigNumber } from "bignumber.js";

// Handing talbe【VstokenConversion】, Event【VsbondConvertToVsksm】
export async function handleVstokenConversionVsbondConvertToVsksm(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new Add(`${blockNumber.toString()}-${event.idx.toString()}`);
  const {
    event: {
      data: [address, , , vstokenAmount],
    },
  } = event;

  const account = (address as AccountId).toString();
  const amount = BigInt((vstokenAmount as Balance).toString());

  // Calculate exchange rate.
  const exchangeRate = new BigNumber(1);
  const precision = getPricision("KSM");
  const base = new BigNumber(amount.toString())
    .dividedBy(precision)
    .multipliedBy(exchangeRate);

  await makeSureAccount(account);

  record.accountId = account;
  record.event = "VsbondConvertToVsksm";
  record.token = "VSKSM";
  record.amount = amount;
  record.blockHeight = blockNumber;
  record.timestamp = event.block.timestamp;
  record.exchangeRate = exchangeRate.toNumber();
  record.base = base.toNumber();

  await record.save();
}

// Handing talbe【VstokenConversion】, Event【VsksmConvertToVsbond】
export async function handleVstokenConversionVsksmConvertToVsbond(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new Add(`${blockNumber.toString()}-${event.idx.toString()}`);
  const {
    event: {
      data: [address, , , vstokenAmount],
    },
  } = event;

  const account = (address as AccountId).toString();
  const amount = BigInt((vstokenAmount as Balance).toString());

  // Calculate exchange rate.
  const exchangeRate = new BigNumber(1);
  const precision = getPricision("KSM");
  const base = new BigNumber(amount.toString())
    .dividedBy(precision)
    .multipliedBy(exchangeRate);

  await makeSureAccount(account);

  record.accountId = account;
  record.event = "VsksmConvertToVsbond";
  record.token = "VSKSM";
  record.amount = amount;
  record.blockHeight = blockNumber;
  record.timestamp = event.block.timestamp;
  record.exchangeRate = exchangeRate.toNumber();
  record.base = base.toNumber();

  await record.save();
}
