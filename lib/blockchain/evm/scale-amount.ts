export function scaleTokenAmount(amount: bigint, decimals: number) {
  let scale = BigInt(1);

  for (let i = 0; i < decimals; i += 1) {
    scale *= BigInt(10);
  }

  return amount * scale;
}
