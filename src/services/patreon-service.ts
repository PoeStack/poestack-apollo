import { Logger } from './logger';
import { singleton } from "tsyringe";
import fetch from "node-fetch";

@singleton()
export default class PatreonService {
  public async fetchMembers() {
    const creatorAccessToken = await this.refreshCreatorToken();

    const queryUrl =
      "https://www.patreon.com/api/oauth2/v2/campaigns/10394655/members?include=currently_entitled_tiers,user&fields%5Btier%5D=title,amount_cents&fields%5Bmember%5D=lifetime_support_cents,currently_entitled_amount_cents";
    const membersResp = await fetch(queryUrl, {
      headers: { Authorization: `Bearer ${creatorAccessToken}` },
    });
    const membersJson = await membersResp.json();
    const members = membersJson.data.map((e) => ({
      userId: e.relationships.user.data.id,
      currentSupportCents: e.attributes.currently_entitled_amount_cents,
      lifetimeSupportCents: e.attributes.lifetime_support_cents,
    }));

    Logger.info(members);
  }

  public async refreshCreatorToken(): Promise<string> {
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
          grant_type: "refresh_token",
          refresh_token: process.env.PATREON_CREATOR_REFRESH_TOKEN,
        }),
      }
    );
    const authCodeJson = await codeExchangeResp.json();
    return authCodeJson.access_token;
  }

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
