import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "~/utils/api";

const Index = () => {
  const message = api.auth.getMessageFromServer.useQuery();
  return (
    <SafeAreaView className="">
      <Text>
        Message:{" "}
        {!message.data
          ? "No message"
          : message.isLoading
          ? "Loading..."
          : message.data}
      </Text>
    </SafeAreaView>
  );
};

export default Index;
