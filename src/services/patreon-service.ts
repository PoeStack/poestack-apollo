import { json } from "body-parser";
import { singleton } from "tsyringe";
import fetch from "node-fetch";

@singleton()
export default class PatreonService {
  public async exchangeCode(code: string): Promise<string> {
    const codeExchangeResp = await fetch(
      "https://www.patreon.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id:
            "E5M8jm9CyVp1tRXqkZEFCDS3iHrAP2MJYPzgvMbxBBRrB_ZFO_Hdu50wSxqzrrBC",
          client_secret: process.env.PATREON_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: "https://poestack.com/patreon/connected",
        }),
      }
    );
    const authCodeJson = await codeExchangeResp.json();

    const accessToekn = authCodeJson?.access_token;

    const identityResp = await fetch(
      "https://www.patreon.com/api/oauth2/v2/identity",
      {
        headers: {
          Authorization: `Bearer ${accessToekn}`,
        },
      }
    );
    const identityJson = await identityResp.json();
    return identityJson.data.id;
  }
}
