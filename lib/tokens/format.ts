export function formatTokenAmount(value: string | number | bigint) {
  try {
    const asBigInt = typeof value === "bigint" ? value : BigInt(String(value));
    return new Intl.NumberFormat("en-US").format(asBigInt);
  } catch {
    return String(value);
  }
}

export function formatPercent(value: number) {
  return `${value}%`;
}

export function allocationTotal(values: {
  creatorAllocation: number;
  liquidityAllocation: number;
  communityAllocation: number;
  burnAllocation: number;
}) {
  return (
    Number(values.creatorAllocation || 0) +
    Number(values.liquidityAllocation || 0) +
    Number(values.communityAllocation || 0) +
    Number(values.burnAllocation || 0)
  );
}
