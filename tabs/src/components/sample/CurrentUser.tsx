import React from "react";

export function CurrentUser(props: { userName?: string }) {
  const { userName } = {
    userName: "",
    ...props,
  };
  return (
    <div>
      <h2>Get the current user using sso token</h2>
      <p>Access basic information about the user like this:</p>
      {!!userName && (
        <p>
          The currently logged in user's name is <b>{userName}</b>
        </p>
      )}
    </div>
  );
}
