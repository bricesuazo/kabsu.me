"use client";

import { api } from "~/api/client";

function ClientFetch() {
  const clientFetch = api.auth.getMessageFromServer.useQuery();
  const secretMessage = api.auth.getSecretMessage.useQuery();
  return (
    <>
      <p>
        Client Fetch Message:{" "}
        {clientFetch.isLoading
          ? "Loading..."
          : !clientFetch.data
          ? "No data."
          : clientFetch.data}
      </p>

      <p>
        Secret Message:{" "}
        {secretMessage.isLoading
          ? "Loading..."
          : !secretMessage.data
          ? "No data."
          : secretMessage.data}
      </p>
    </>
  );
}

export default ClientFetch;
