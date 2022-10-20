import { makeSureAccount, getPricision } from "./utils";
import { SubstrateEvent } from "@subql/types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import { Add } from "../types";
import { BigNumber } from "bignumber.js";

// Handing talbe【Salp】, event【Contributed】
export async function handleSalpContributed(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new Add(`${blockNumber.toString()}-${event.idx.toString()}`);
  const {
    event: {
      data: [contributor, , contributedAmount],
    },
  } = event;
  const account = (contributor as AccountId).toString();
  const amount = BigInt((contributedAmount as Balance).toString());

  const exchangeRate = new BigNumber(1);
  const precision = getPricision("KSM");
  const base = new BigNumber(amount.toString())
    .dividedBy(precision)
    .multipliedBy(exchangeRate);

  await makeSureAccount(account);
  record.accountId = account;
  record.event = "Contributed";
  record.token = "KSM";
  record.amount = amount;
  record.blockHeight = blockNumber;
  record.timestamp = event.block.timestamp;
  record.exchangeRate = exchangeRate.toNumber();
  record.base = base.toNumber();

  await record.save();
}

// Handing talbe【SalpLite】, event【Issued】
export async function handleSalpLiteIssued(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new Add(`${blockNumber.toString()}-${event.idx.toString()}`);
  const {
    event: {
      data: [contributor, , IssuedAmount],
    },
  } = event;
  const account = (contributor as AccountId).toString();
  const amount = BigInt((IssuedAmount as Balance).toString());

  // Calculate exchange rate.
  const exchangeRate = new BigNumber(1);
  const precision = getPricision("DOT");
  const base = new BigNumber(amount.toString())
    .dividedBy(precision)
    .multipliedBy(exchangeRate);

  await makeSureAccount(account);
  record.accountId = account;
  record.event = "Issued";
  record.token = "DOT";
  record.amount = amount;
  record.blockHeight = blockNumber;
  record.timestamp = event.block.timestamp;
  record.exchangeRate = exchangeRate.toNumber();
  record.base = base.toNumber();

  await record.save();
}
