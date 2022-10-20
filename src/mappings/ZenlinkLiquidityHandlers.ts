import {
  makeSureAccount,
  getPricision,
  sortZenlinkAssetId,
  convertFromZenlinkAssetId,
} from "./utils";
import { SubstrateEvent } from "@subql/types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import { Add, Subtract } from "../types";
import { BigNumber } from "bignumber.js";

// Rule: liquidity_pair_1 should ordered before liquidity_pair_2 by zenlink index.
const LIQUIDITY_PAIR_TOKEN_NAME_1 = ["KSM"];
const LIQUIDITY_PAIR_TOKEN_NAME_2 = ["VSKSM"];
const RECORD_TOKEN = [1]; // pair_1 or pair_2 token should be used to calculate.
const EXCHANGE_RATE = [1];

// Handing talbe【ZenlinkProtocol】, Event【LiquidityAdded】
export async function handleZenlinkProtocolLiquidityAdded(
  event: SubstrateEvent
): Promise<void> {
  // logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  const evt = JSON.parse(JSON.stringify(event));
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new Add(`${blockNumber.toString()}-${event.idx.toString()}`);
  const {
    event: {
      data: [
        address,
        { assetIndex: tokenIndex_1 },
        { assetIndex: tokenIndex_2 },
        tokenAmount_1,
        tokenAmount_2,
      ],
    },
  } = evt;

  // VToken is sorted before Token. Token is sorted before VsToken.
  const { tokenName1, firstTokenAmount, tokenName2, secondTokenAmount } =
    getTokenTypesAndNames(
      tokenIndex_1,
      tokenIndex_2,
      tokenAmount_1,
      tokenAmount_2
    );

  for (let i = 0; i < LIQUIDITY_PAIR_TOKEN_NAME_1.length; i++) {
    if (
      LIQUIDITY_PAIR_TOKEN_NAME_1[i] == tokenName1 &&
      LIQUIDITY_PAIR_TOKEN_NAME_2[i] == tokenName2
    ) {
      let tokenAmount, tokenName;
      if (RECORD_TOKEN[i] == 1) {
        tokenAmount = firstTokenAmount;
        tokenName = tokenName1;
      } else {
        tokenAmount = secondTokenAmount;
        tokenName = tokenName2;
      }

      const account = (address as AccountId).toString();
      const amount = BigInt((tokenAmount as Balance).toString());

      const exchangeRate = EXCHANGE_RATE[i];
      const precision = getPricision(tokenName.toUpperCase());
      const base = new BigNumber(amount.toString())
        .dividedBy(precision)
        .multipliedBy(exchangeRate);

      await makeSureAccount(account);

      record.accountId = account;
      record.event = "LiquidityAdded";
      record.token = tokenName.toUpperCase();
      record.amount = amount;
      record.blockHeight = blockNumber;
      record.timestamp = event.block.timestamp;
      record.exchangeRate = exchangeRate;
      record.base = base.toNumber();

      await record.save();

      break;
    }
  }
}

// Handing talbe【ZenlinkProtocol】, Event【LiquidityRemoved】
export async function handleZenlinkProtocolLiquidityRemoved(
  event: SubstrateEvent
): Promise<void> {
  // logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  const evt = JSON.parse(JSON.stringify(event));
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new Subtract(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );
  const {
    event: {
      data: [
        address,
        ,
        { assetIndex: tokenIndex_1 },
        { assetIndex: tokenIndex_2 },
        tokenAmount_1,
        tokenAmount_2,
      ],
    },
  } = evt;

  const { tokenName1, firstTokenAmount, tokenName2, secondTokenAmount } =
    getTokenTypesAndNames(
      tokenIndex_1,
      tokenIndex_2,
      tokenAmount_1,
      tokenAmount_2
    );

  for (let i = 0; i < LIQUIDITY_PAIR_TOKEN_NAME_1.length; i++) {
    if (
      LIQUIDITY_PAIR_TOKEN_NAME_1[i] == tokenName1 &&
      LIQUIDITY_PAIR_TOKEN_NAME_2[i] == tokenName2
    ) {
      let tokenAmount, tokenName;
      if (RECORD_TOKEN[i] == 1) {
        tokenAmount = firstTokenAmount;
        tokenName = tokenName1;
      } else {
        tokenAmount = secondTokenAmount;
        tokenName = tokenName2;
      }

      const account = (address as AccountId).toString();
      const amount = BigInt((tokenAmount as Balance).toString());

      const exchangeRate = EXCHANGE_RATE[i];
      const precision = getPricision(tokenName.toUpperCase());
      const base = new BigNumber(amount.toString())
        .dividedBy(precision)
        .multipliedBy(exchangeRate)
        .multipliedBy(-1);

      await makeSureAccount(account);

      record.accountId = account;
      record.event = "LiquidityRemoved";
      record.token = tokenName.toUpperCase();
      record.amount = amount;
      record.blockHeight = blockNumber;
      record.timestamp = event.block.timestamp;
      record.exchangeRate = exchangeRate;
      record.base = base.toNumber();

      await record.save();

      break;
    }
  }
}

function getTokenTypesAndNames(
  tokenIndex_1: number,
  tokenIndex_2: number,
  tokenAmount_1: Balance,
  tokenAmount_2: Balance
) {
  // VToken is sorted before Token.
  let ordered = sortZenlinkAssetId(tokenIndex_1, tokenIndex_2);
  let firstIndex, secondIndex, firstTokenAmount, secondTokenAmount;
  if (ordered) {
    firstIndex = tokenIndex_1;
    secondIndex = tokenIndex_2;
    firstTokenAmount = tokenAmount_1;
    secondTokenAmount = tokenAmount_2;
  } else {
    firstIndex = tokenIndex_2;
    secondIndex = tokenIndex_1;
    firstTokenAmount = tokenAmount_2;
    secondTokenAmount = tokenAmount_1;
  }

  // Check if this is vtoken/token pair. If yes, continue
  const { tokenName: tokenName1, prefix: prefix1 } =
    convertFromZenlinkAssetId(firstIndex);
  const { tokenName: tokenName2, prefix: prefix2 } =
    convertFromZenlinkAssetId(secondIndex);

  const tk_name_1 = `${prefix1}${tokenName1.toUpperCase()}`;
  const tk_name_2 = `${prefix2}${tokenName2.toUpperCase()}`;

  return {
    tokenName1: tk_name_1,
    firstTokenAmount,
    tokenName2: tk_name_2,
    secondTokenAmount,
  };
}
