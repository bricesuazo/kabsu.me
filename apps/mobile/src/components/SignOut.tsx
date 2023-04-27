import React from "react";
import { Button, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export const SignOut = () => {
  const { isLoaded, signOut } = useAuth();
  if (!isLoaded) {
    return null;
  }
  return (
    <View>
      <Button
        title="Sign Out"
        onPress={() => {
          void (async () => await signOut())();
        }}
      />
    </View>
  );
};
