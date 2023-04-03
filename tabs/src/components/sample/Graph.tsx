import "./Graph.css";
import { useGraphWithCredential } from "@microsoft/teamsfx-react";
import { Button } from "@fluentui/react-northstar";
import { Design } from './Design';
import { useContext } from "react";
import { TeamsFxContext } from "../Context";

import {
  AuthProviderCallback,
  Client} from '@microsoft/microsoft-graph-client';

import { AuthenticationProvider } from "@microsoft/microsoft-graph-client";
import axios from "axios";

class MyAuthenticationProvider implements AuthenticationProvider {
  private token: string;
  public constructor(token: string){
    this.token = token;
  }
	public async getAccessToken(): Promise<string> {
    return this.token;
  }
}

async function testProxyGraphApi(ssoToken: string) {
  const client = Client.init({
    baseUrl: "https://test-apim-rentu.azure-api.net/",
    authProvider: (done: AuthProviderCallback) => {
      done(null, ssoToken);
    }
  })
  const profile = await client.api("/me").get();
  console.log(profile);
}

export function Graph() {
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const { loading, error, data, reload } = useGraphWithCredential(
    async (graph, teamsUserCredential, scope) => {
      const ssoToken = (await teamsUserCredential.getToken(""))!.token;
      const result = await axios.get("https://test-apim-rentu.azure-api.net/v1.0/me", { headers: { "Authorization": `Bearer ${ssoToken}` } });
      const profile = result.data;
      return { profile };
    },
    { scope: ["User.Read"], credential: teamsUserCredential }
  );

  return (
    <div>
      <h2>Get the user's profile using APIM with obo flow</h2>
      <div className="section-margin">
        <p>Click below to authorize button to grant permission to using Microsoft Graph.</p>
        <pre>{`credential.login(scope);`}</pre>
        <Button primary content="Authorize" disabled={loading} onClick={reload} />
        <p>GET my profile using Graph API from APIM using OBO flow</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
