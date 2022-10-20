import { SubstrateEvent } from "@subql/types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import { BifrostTransferToMiner, BifrostRedeem } from "../types";
import { FIL_CURRENCY } from "./constants";

// Handing talbe【SLP】, Event【Refund】
export async function handleSlpRefund(event: SubstrateEvent): Promise<void> {
  //   logger.info(`${event}`);
  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new BifrostRedeem(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );

  const {
    event: {
      data: [currencyId, , , tokenAmount],
    },
  } = evt;

  // If the minting currency is FIL
  if (currencyId == FIL_CURRENCY) {
    record.event = "Refund";
    // Store currencyId as a JSON string.
    record.currencyId = JSON.stringify(currencyId);
    record.amount = (tokenAmount as Balance).toString();
    record.blockHeight = blockNumber;
    // Transfer Date type to Unix timestamp type.
    record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);

    await record.save();
  }
}

// Handing talbe【SLP】, Event【TransferTo】
export async function handleSlpTransferTo(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new BifrostTransferToMiner(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );

  const {
    event: {
      data: [currencyId, from, to, tokenAmount],
    },
  } = evt;

  // If the minting currency is FIL
  if (currencyId == FIL_CURRENCY) {
    record.blockHeight = blockNumber;
    record.amount = (tokenAmount as Balance).toString();

    // Store currencyId and locations as a JSON string.
    record.currencyId = JSON.stringify(currencyId);
    record.fromLocation = JSON.stringify(from);
    record.toLocation = JSON.stringify(to);

    // Transfer Date type to Unix timestamp type.
    record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);
    record.filecoinMultisigTxId = null;

    await record.save();
  }
}
