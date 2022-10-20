import { Account } from "../types";
import { BigNumber } from "bignumber.js";

// token precisions
export const TEN_ZEROS = 10000000000;
export const TWELVE_ZEROS = 1000000000000;
export const EIGHTEEN_ZEROS = 1000000000000000000;

// If the account doesn't exist, create one in the Account table.
export async function makeSureAccount(account: string): Promise<void> {
  const checkAccount = await Account.get(account);

  if (!checkAccount) {
    await new Account(account).save();
  }
}

export function sortZenlinkAssetId(id_1: number, id_2: number) {
  let c_discr_1 = (id_1 & 0x0000_0000_0000_ff00) >> 8;
  let c_discr_2 = (id_2 & 0x0000_0000_0000_ff00) >> 8;

  let t_discr_1 = (id_1 & 0x0000_0000_0000_00ff) >> 0;
  let t_discr_2 = (id_2 & 0x0000_0000_0000_00ff) >> 0;

  if (c_discr_1 > c_discr_2) {
    return false;
  } else if (c_discr_1 == c_discr_2 && t_discr_1 > t_discr_2) {
    return false;
  } else {
    return true;
  }
}

// Convert from Zenlink AssetId to Bifrost Currency.
export function convertFromZenlinkAssetId(id: number) {
  let c_discr = (id & 0x0000_0000_0000_ff00) >> 8;
  let t_discr = (id & 0x0000_0000_0000_00ff) >> 0;

  let tokenName;
  switch (t_discr) {
    case 0:
      tokenName = "BNC";
      break;
    case 1:
      tokenName = "BNC";
      break;
    case 2:
      tokenName = "KUSD";
      break;
    case 3:
      tokenName = "DOT";
      break;
    case 4:
      tokenName = "KSM";
      break;
    case 5:
      tokenName = "ETH";
      break;
    case 6:
      tokenName = "KAR";
      break;
    case 7:
      tokenName = "ZLK";
      break;
    case 8:
      tokenName = "PHA";
      break;
    case 9:
      tokenName = "RMRK";
      break;
    case 10:
      tokenName = "MOVR";
      break;
    default:
      tokenName = null;
  }

  let tokenType, prefix;
  switch (c_discr) {
    case 0:
      tokenType = "Native";
      prefix = "";
      break;
    case 1:
      tokenType = "VToken";
      prefix = "V";
      break;
    case 2:
      tokenType = "Token";
      prefix = "";
      break;
    case 3:
      tokenType = "Stable";
      prefix = "";
      break;
    case 4:
      tokenType = "VSToken";
      prefix = "VS";
      break;
    default:
      tokenType = null;
      prefix = "";
  }

  return { tokenType, tokenName, prefix };
}

export function getPricision(token: string) {
  switch (token) {
    case "BNC":
      return new BigNumber(TWELVE_ZEROS);
    case "KSM":
      return new BigNumber(TWELVE_ZEROS);
    case "DOT":
      return new BigNumber(TEN_ZEROS);
    case "MOVR":
      return new BigNumber(EIGHTEEN_ZEROS);
    default:
      return new BigNumber(TWELVE_ZEROS);
  }
}
