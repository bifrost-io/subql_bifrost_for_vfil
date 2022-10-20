import { SubstrateEvent } from "@subql/types";
import { makeSureAccount, getPricision } from "./utils";
import {
  ParachainStaking,
  StakingAccumulated,
  PersonalTotalAccumultated,
} from "../types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import { BigNumber } from "bignumber.js";

// Handing talbe【ParachainStaking】, event【Delegation】
export async function handleParachainStakingDelegation(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new ParachainStaking(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );
  const {
    event: {
      data: [delegator, lockedAmount],
    },
  } = event;
  const account = (delegator as AccountId).toString();

  // populate ParachainStaking table
  const amount = BigInt((lockedAmount as Balance).toString());
  await makeSureAccount(account);
  record.accountId = account;
  record.event = "Delegation";
  record.token = "BNC";
  record.amount = amount;
  record.blockHeight = blockNumber;
  record.timestamp = event.block.timestamp;
  await record.save();

  // add amount to the personalTotalAccumultated table
  const personalAccumulated = await populatePersonalTotalAccumultated(
    account,
    amount,
    1
  );

  // add record to the StakingAccumultated table
  await populateStakingAccumultated(account, blockNumber, personalAccumulated);
}

// Handing talbe【ParachainStaking】, event【DelegationIncreased】
export async function handleParachainStakingDelegationIncreased(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new ParachainStaking(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );
  const {
    event: {
      data: [delegator, , increasedAmount],
    },
  } = event;
  const account = (delegator as AccountId).toString();
  const amount = BigInt((increasedAmount as Balance).toString());
  await makeSureAccount(account);
  record.accountId = account;
  record.event = "DelegationIncreased";
  record.token = "BNC";
  record.amount = amount;
  record.blockHeight = blockNumber;
  record.timestamp = event.block.timestamp;
  await record.save();

  // add amount to the personalTotalAccumultated table
  const personalAccumulated = await populatePersonalTotalAccumultated(
    account,
    amount,
    1
  );

  // add record to the StakingAccumultated table
  await populateStakingAccumultated(account, blockNumber, personalAccumulated);
}

// Handing talbe【ParachainStaking】, event【DelegationDecreased】
export async function handleParachainStakingDelegationDecreased(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new ParachainStaking(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );
  const {
    event: {
      data: [delegator, , decreasedAmount],
    },
  } = event;
  const account = (delegator as AccountId).toString();
  const amount = BigInt((decreasedAmount as Balance).toString());
  await makeSureAccount(account);
  record.accountId = account;
  record.event = "DelegationDecreased";
  record.token = "BNC";
  record.amount = amount;
  record.blockHeight = blockNumber;
  record.timestamp = event.block.timestamp;
  await record.save();

  // add amount to the personalTotalAccumultated table
  const personalAccumulated = await populatePersonalTotalAccumultated(
    account,
    amount,
    -1
  );

  // add record to the StakingAccumultated table
  await populateStakingAccumultated(account, blockNumber, personalAccumulated);
}

// Handing talbe【ParachainStaking】, event【DelegationRevoked】
export async function handleParachainStakingDelegationRevoked(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new ParachainStaking(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );
  const {
    event: {
      data: [delegator, , revokedAmount],
    },
  } = event;
  const account = (delegator as AccountId).toString();
  const amount = BigInt((revokedAmount as Balance).toString());
  await makeSureAccount(account);
  record.accountId = account;
  record.event = "DelegationRevoked";
  record.token = "BNC";
  record.amount = amount;
  record.blockHeight = blockNumber;
  record.timestamp = event.block.timestamp;
  await record.save();

  // add amount to the personalTotalAccumultated table
  const personalAccumulated = await populatePersonalTotalAccumultated(
    account,
    amount,
    -1
  );

  // add record to the StakingAccumultated table
  await populateStakingAccumultated(account, blockNumber, personalAccumulated);
}

/************************** */
/* 辅助函数
/************************** */

async function populatePersonalTotalAccumultated(
  account: string,
  amount: BigInt,
  sign: number
) {
  const precision = getPricision("BNC");
  // add or subtract
  const adjustedAmount = new BigNumber(amount.toString())
    .dividedBy(precision)
    .multipliedBy(sign)
    .toNumber();

  let personalAccumulatedRecord = await PersonalTotalAccumultated.get(
    `${account}`
  );
  if (!personalAccumulatedRecord) {
    personalAccumulatedRecord = new PersonalTotalAccumultated(`${account}`);
    personalAccumulatedRecord.accumulated = adjustedAmount;
  } else {
    personalAccumulatedRecord.accumulated =
      personalAccumulatedRecord.accumulated + adjustedAmount;
  }
  const personalAccumulated = personalAccumulatedRecord.accumulated;
  personalAccumulatedRecord.save();

  return personalAccumulated;
}

async function populateStakingAccumultated(
  account: string,
  blockNumber: number,
  personalAccumulated: number
) {
  const accumulatedRecord = new StakingAccumulated(
    `${blockNumber.toString()}-${account}`
  );
  accumulatedRecord.accountId = account;
  accumulatedRecord.changeBlock = blockNumber;
  accumulatedRecord.accumulated = personalAccumulated;
  logger.info(`personalAccumulated: ${personalAccumulated}`);
  accumulatedRecord.save();
}
