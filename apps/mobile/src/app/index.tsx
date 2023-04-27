import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";

import { api } from "~/utils/api";
import SignInScreen from "~/components/SignIn";
import { SignOut } from "~/components/SignOut";

const Index = () => {
  const message = api.auth.getMessageFromServer.useQuery();
  const secretMessage = api.auth.getSecretMessage.useQuery();
  return (
    <SafeAreaView className="p-4">
      <SignedIn>
        <Text>You are Signed in</Text>
        <SignOut />
      </SignedIn>
      <SignedOut>
        <SignInScreen />
      </SignedOut>
      <Text>
        Message:{" "}
        {!message.data
          ? "No message"
          : message.isLoading
          ? "Loading..."
          : message.data}
      </Text>
      <Text>
        Secret Message:{" "}
        {!secretMessage.data
          ? "No secret Message"
          : secretMessage.isLoading
          ? "Loading..."
          : secretMessage.data}
      </Text>
    </SafeAreaView>
  );
};

export default Index;
