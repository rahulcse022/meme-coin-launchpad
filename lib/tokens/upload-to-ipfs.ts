export async function uploadToIpfs(file: File): Promise<string> {
  const signResponse = await fetch("/api/sign", { method: "POST" });
  if (!signResponse.ok) {
    throw new Error("Failed to sign IPFS upload request.");
  }
  const signData = await signResponse.json();
  const jwt = signData.JWT;
  if (!jwt) {
    throw new Error("Could not retrieve single-use upload token from backend.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const uploadResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`IPFS Upload failed: ${errorText}`);
  }

  const uploadData = await uploadResponse.json();
  const cid = uploadData.IpfsHash;

  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

export type UploadMetadataInput = {
  name: string;
  symbol: string;
  description: string;
  logoFile: File;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
};

export async function uploadMetadataToIpfs(params: UploadMetadataInput): Promise<string> {
  // 1. Upload logo image
  const logoUrl = await uploadToIpfs(params.logoFile);

  // 2. Build Metaplex / Standard metadata JSON
  const metadata = {
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    image: logoUrl,
    external_url: params.website || undefined,
    extensions: {
      website: params.website || undefined,
      twitter: params.twitter || undefined,
      telegram: params.telegram || undefined,
      discord: params.discord || undefined,
    },
  };

  // Convert JSON object to File
  const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: "application/json",
  });
  const jsonFile = new File([jsonBlob], "metadata.json", {
    type: "application/json",
  });

  // 3. Upload metadata JSON
  const metadataUrl = await uploadToIpfs(jsonFile);
  return metadataUrl;
}
