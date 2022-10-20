import { makeSureAccount, getPricision } from "./utils";
import { SubstrateExtrinsic } from "@subql/types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import { Add } from "../types";
import { BigNumber } from "bignumber.js";

// swapExactAssetsForAssets, vsksmConvertToVsbond, vsksmConvertToVsbond, system.remarkWithEvent
const CALL_COMBO = ["0x5007", "0x7601", "0x7601", "0x0008"];
// "buyksmbond"
const BUY_BOND_REMARK = "0x6275796b736d626f6e64";

// Handing module【Utility】, event【BatchAll】
export async function handleSystemRemarkWithEvent(
  extrinsic: SubstrateExtrinsic
): Promise<void> {
  //   const record = new Add(extrinsic.block.block.header.hash.toString());
  //   record.field4 = extrinsic.block.timestamp;
  //   await record.save();
  const blockNumber = extrinsic.block.block.header.number.toNumber();
  const tx = extrinsic.extrinsic.method;
  const calls = JSON.parse(JSON.stringify(tx.args))[0];
  const callsLength = calls.length;

  if (callsLength == 4) {
    let flag = true;
    let remark = "";

    // check the calls pattern to see if it is a buy bond operation.
    for (let i = 0; i < callsLength; i++) {
      if (calls[i].callIndex != CALL_COMBO[i]) {
        flag = false;
        break;
      }

      // get the call remark
      if (i == 3) {
        remark = calls[i].args.remark;
      }
    }

    // Make sure it is the by bond batchAll call we need.
    if (flag && remark == BUY_BOND_REMARK) {
      const amountIn = calls[0].args.amount_in;
      const currencyAssetIndex = calls[0].args.path[0].assetIndex;

      // make sure the in currency is KSM.
      if (currencyAssetIndex == 516) {
        const record = new Add(
          `${blockNumber.toString()}-${extrinsic.idx.toString()}`
        );

        // get the call originator
        const {
          event: {
            data: [swapper],
          },
        } = extrinsic.events[0];

        const account = (swapper as AccountId).toString();
        const amount = BigInt((amountIn as Balance).toString());

        const exchangeRate = new BigNumber(1);
        const precision = getPricision("KSM");
        const base = new BigNumber(amount.toString())
          .dividedBy(precision)
          .multipliedBy(exchangeRate);

        await makeSureAccount(account);
        record.accountId = account;
        record.event = "BuyKsmBond";
        record.token = "KSM";
        record.amount = amount;
        record.blockHeight = blockNumber;
        record.timestamp = extrinsic.block.timestamp;
        record.exchangeRate = exchangeRate.toNumber();
        record.base = base.toNumber();

        await record.save();
      }
    }
  }
}
