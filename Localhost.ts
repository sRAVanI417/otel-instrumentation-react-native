// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";

const getLocalhost = async (): Promise<string> => {
    console.log("in localhost method");
  const isEmulator = await DeviceInfo.isEmulator();
  console.log("is it emulator?"+DeviceInfo.isEmulator());

  // The Android emulator has a special loopback for localhost
  // https://developer.android.com/studio/run/emulator-networking#networkaddresses
  return Platform.OS === "android" && isEmulator ? "10.0.2.2" : "localhost";
};

export default getLocalhost;