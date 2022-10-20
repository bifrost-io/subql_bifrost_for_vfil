import { SubstrateBlock } from "@subql/types";
import { CurrentBlock } from "../types";

// Used to update current block.
export async function handleBlock(block: SubstrateBlock): Promise<void> {
  //Create a new starterEntity with ID using block hash
  let record = await CurrentBlock.get("1");
  if (!record) {
    record = new CurrentBlock("1");
  }
  //Record block number
  record.current = block.block.header.number.toNumber();
  await record.save();
}
