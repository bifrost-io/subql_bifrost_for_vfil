import { SubstrateEvent } from "@subql/types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import {
  BifrostCrossedIn,
  BifrostCrossedOut,
  BifrostLinkedAccountRegistered,
} from "../types";
import { FIL_CURRENCY } from "./constants";

// Handing talbe【CrossInOut】, Event【CrossedIn】
export async function handleCrossInOutCrossedIn(
  event: SubstrateEvent
): Promise<void> {
  logger.info(`${event}`);
  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new BifrostCrossedIn(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );

  const {
    event: {
      data: [currencyId, address, location, tokenAmount, maybeRemark],
    },
  } = evt;

  // If the minting currency is FIL
  if (JSON.stringify(currencyId) == JSON.stringify(FIL_CURRENCY)) {
    record.block_height = blockNumber;
    record.account_id = (address as AccountId).toString();
    record.amount = (tokenAmount as Balance).toString();

    // Store currencyId as a JSON string.
    record.currency_id = JSON.stringify(currencyId);
    record.location = JSON.stringify(location);

    if (maybeRemark.isSome) {
      record.remark = maybeRemark.unwrap();
    } else {
      record.remark = null;
    }

    // Transfer Date type to Unix timestamp type.
    record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);

    await record.save();
  }
}

// Handing talbe【CrossInOut】, Event【CrossedOut】
export async function handleCrossInOutCrossedOut(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new BifrostCrossedOut(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );

  const {
    event: {
      data: [currencyId, address, location, tokenAmount],
    },
  } = evt;

  // If the minting currency is FIL
  if (JSON.stringify(currencyId) == JSON.stringify(FIL_CURRENCY)) {
    record.account_id = (address as AccountId).toString();
    record.amount = (tokenAmount as Balance).toString();
    record.block_height = blockNumber;

    // Store currencyId as a JSON string.
    record.currency_id = JSON.stringify(currencyId);
    record.location = JSON.stringify(location);

    // Transfer Date type to Unix timestamp type.
    record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);

    record.filecoin_multisig_cid = null;

    await record.save();
  }
}

// Handing module【CrossInOut】, Event【LinkedAccountRegistered】
export async function handleCrossInOutLinkedAccountRegistered(
  event: SubstrateEvent
): Promise<void> {
  logger.info(`${event}`);
  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new BifrostLinkedAccountRegistered(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );

  const {
    event: {
      data: [currencyId, address, location],
    },
  } = evt;

  if (JSON.stringify(currencyId) == JSON.stringify(FIL_CURRENCY)) {
    record.account_id = (address as AccountId).toString();
    record.block_height = blockNumber;

    // Store currencyId as a JSON string.
    record.currency_id = JSON.stringify(currencyId);
    record.location = JSON.stringify(location);

    // Transfer Date type to Unix timestamp type.
    record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);

    record.fee_airdrop_tx_hash = null;

    await record.save();
  }
}
