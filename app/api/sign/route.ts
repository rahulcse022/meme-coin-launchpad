import { NextResponse } from "next/server";
import { pinata } from "@/lib/pinata";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const keyData = await pinata.keys.create({
      keyName: Date.now().toString(),
      permissions: {
        endpoints: {
          pinning: {
            pinFileToIPFS: true,
          },
        },
      },
      maxUses: 1,
    });
    return NextResponse.json(keyData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { text: "Error creating API Key" },
      { status: 500 }
    );
  }
}
