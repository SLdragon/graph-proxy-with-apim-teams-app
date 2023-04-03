import "./Graph.css";
import { Button } from "@fluentui/react-northstar";
import { useContext, useState } from "react";
import { TeamsFxContext } from "../Context";

import {
  AuthProviderCallback,
  Client
} from '@microsoft/microsoft-graph-client';

import axios from "axios";

async function callGraphApiUsingSDK(ssoToken: string) {
  // Not work, no sso token in Auth header
  const apimBaseUrl = process.env.REACT_APP_APIM_URL;
  const client = Client.init({
    baseUrl: apimBaseUrl,
    authProvider: (done: AuthProviderCallback) => {
      done(null, ssoToken);
    }
  })
  const profile = await client.api("/me").get();
  console.log(profile);
}

export function Graph() {
  const { teamsUserCredential } = useContext(TeamsFxContext);
  if (!teamsUserCredential) {
    throw new Error("TeamsFx SDK is not initialized.");
  }
  const [profileData, setProfileData] = useState("");

  teamsUserCredential.getToken("").then((tokenResult) => {
    const ssoToken = tokenResult?.token;

    const apimBaseUrl = process.env.REACT_APP_APIM_URL;
    try {
      if (!apimBaseUrl) {
        setProfileData("You need to set REACT_APP_APIM_URL env in tabs/.env.teamsfx.local to make it work");
      }
      else {
        axios.get(apimBaseUrl + "/me", { headers: { "Authorization": `Bearer ${ssoToken}` } }).then((result) => {
          const profile = result.data;
          setProfileData(JSON.stringify(profile, null, 2));
        }).catch((err) => {
          if (err.response.status === 401) {
            setProfileData("You need click Authorize button first to view your profile");
            return;
          }
          setProfileData(JSON.stringify(err, null, 2))
        });
      }
    }
    catch (err: any) {
      if (err.response.status === 401) {
        return "You need click Authorize button first to view your profile";
      }
      return err;
    }
  })

  const loginFunc = async () => {
    const scope = ["User.Read"];
    await teamsUserCredential.login(scope);
  }

  return (
    <div>
      <h2>Get the user's profile using APIM with OBO flow</h2>
      <p>Click below to authorize button to grant permission to using Microsoft Graph.</p>
      <Button primary content="Authorize" onClick={loginFunc} />
      <p>GET my profile using Graph API from APIM using OBO flow</p>
      <pre>{profileData}</pre>
    </div>
  );
}
