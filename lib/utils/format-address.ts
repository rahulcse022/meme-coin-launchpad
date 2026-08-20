export function formatAddress(address: string, chars = 4) {
  if (address.length <= chars * 2 + 2) {
    return address;
  }

  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
