import { Platform } from "react-native";
import ExpoGaodeMapModule from "expo-gaode-map";

let configured = false;

export function configureAmapNativePrivacy(): boolean {
  if (configured || Platform.OS === "web") {
    return ExpoGaodeMapModule.getPrivacyStatus().isReady;
  }

  ExpoGaodeMapModule.setPrivacyConfig({
    hasShow: true,
    hasContainsPrivacy: true,
    hasAgree: true
  });
  configured = true;
  return ExpoGaodeMapModule.getPrivacyStatus().isReady;
}
