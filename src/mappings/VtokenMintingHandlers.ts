import { SubstrateEvent } from "@subql/types";
import { Balance } from "@polkadot/types/interfaces";
import { BifrostMint, BifrostRedeem } from "../types";
import { FIL_CURRENCY } from "./constants";

// Handing talbe【VtokenMinting】, Event【Minted】
export async function handleVtokenMintingMinted(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new BifrostMint(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );

  const {
    event: {
      data: [, currencyId, tokenAmount],
    },
  } = evt;

  // If the minting currency is FIL
  if (JSON.stringify(currencyId) == JSON.stringify(FIL_CURRENCY)) {
    record.event = "Minted";
    // Store currencyId as a JSON string.
    record.currency_id = JSON.stringify(currencyId);
    record.amount = (tokenAmount as Balance).toString();
    record.block_height = blockNumber;
    // Transfer Date type to Unix timestamp type.
    record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);

    await record.save();
  }
}

// Handing talbe【VtokenMinting】, Event【Redeemed】
export async function handleVtokenMintingRedeemed(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new BifrostRedeem(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );

  const {
    event: {
      data: [, currencyId, tokenAmount],
    },
  } = evt;

  // If the minting currency is FIL
  if (JSON.stringify(currencyId) == JSON.stringify(FIL_CURRENCY)) {
    record.event = "Redeemed";
    // Store currencyId as a JSON string.
    record.currency_id = JSON.stringify(currencyId);
    record.amount = (tokenAmount as Balance).toString();
    record.block_height = blockNumber;
    // Transfer Date type to Unix timestamp type.
    record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);

    await record.save();
  }
}
