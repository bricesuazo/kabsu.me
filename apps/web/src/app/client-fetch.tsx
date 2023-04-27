"use client";

import { api } from "~/api/client";

function ClientFetch() {
  const clientFetch = api.auth.getMessageFromServer.useQuery();
  const clientFetch2 = api.auth.getMessageFromServer2.useQuery();
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
        Client Fetch Message2:{" "}
        {clientFetch2.isLoading
          ? "Loading..."
          : !clientFetch2.data
          ? "No data."
          : clientFetch2.data}
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
