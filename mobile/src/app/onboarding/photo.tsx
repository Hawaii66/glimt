import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { useAppColors } from "@/lib/theme";
import { APP_HOME } from "@/lib/routes";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "convex/_generated/api";

export default function PhotoScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.current);
  const displayName = useOnboardingStore((state) => state.displayName);
  const username = useOnboardingStore((state) => state.username);
  const localAvatarUri = useOnboardingStore((state) => state.localAvatarUri);
  const setLocalAvatarUri = useOnboardingStore(
    (state) => state.setLocalAvatarUri,
  );
  const [error, setError] = useState<string | null>(null);

  const pickImage = async (useCamera: boolean) => {
    setError(null);

    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(
        useCamera
          ? "Camera permission is required to take a photo."
          : "Photo library permission is required to choose a photo.",
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (!result.canceled && result.assets[0]?.uri) {
      setLocalAvatarUri(result.assets[0].uri);
    }
  };

  if (authLoading || (isAuthenticated && user === undefined)) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding/sign-in" />;
  }

  if (user?.onboardingComplete) {
    return <Redirect href={APP_HOME} />;
  }

  if (!displayName.trim()) {
    return <Redirect href="/onboarding/setup" />;
  }

  if (!username.trim()) {
    return <Redirect href="/onboarding/username" />;
  }

  return (
    <OnboardingScreen
      onNext={() => {
        router.push("/onboarding/theme");
      }}
    >
      <Text style={[styles.label, { color: colors.text }]}>Profile photo</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Add a photo or skip to leave your avatar empty.
      </Text>

      <Pressable
        style={[styles.actionButton, { borderColor: colors.textMuted }]}
        onPress={() => {
          void pickImage(false);
        }}
      >
        <Text style={[styles.actionText, { color: colors.text }]}>
          Choose photo
        </Text>
      </Pressable>

      <Pressable
        style={[styles.actionButton, { borderColor: colors.textMuted }]}
        onPress={() => {
          void pickImage(true);
        }}
      >
        <Text style={[styles.actionText, { color: colors.text }]}>
          Take photo
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          setLocalAvatarUri(null);
          router.push("/onboarding/theme");
        }}
      >
        <Text style={[styles.skip, { color: colors.textMuted }]}>Skip</Text>
      </Pressable>

      {localAvatarUri ? (
        <Text style={[styles.selected, { color: colors.textMuted }]}>
          Photo selected
        </Text>
      ) : null}

      {error ? (
        <Text style={[styles.error, { color: "#ef4444" }]}>{error}</Text>
      ) : null}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    fontSize: 14,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  skip: {
    fontSize: 15,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  selected: {
    fontSize: 14,
    textAlign: "center",
  },
  error: {
    fontSize: 14,
    textAlign: "center",
  },
});
