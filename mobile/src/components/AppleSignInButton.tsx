import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import * as AppleAuthentication from "expo-apple-authentication";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";

type AppleSignInButtonProps = {
  onError?: (message: string) => void;
  onSuccess?: () => void;
};

export function AppleSignInButton({
  onError,
  onSuccess,
}: AppleSignInButtonProps) {
  const colors = useAppColors();
  const { signIn } = useAuthActions();
  const initSignIn = useMutation(api.auth.providers.apple.initSignIn);
  const [loading, setLoading] = useState(false);

  if (Platform.OS !== "ios") {
    return (
      <Text style={[styles.unavailable, { color: colors.textMuted }]}>
        Sign in with Apple is available on iOS only.
      </Text>
    );
  }

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        throw new Error("Sign in with Apple is not available on this device.");
      }

      const { verifierId, nonce } = await initSignIn();
      const credential = await AppleAuthentication.signInAsync({
        nonce,
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });
      const givenName = credential.fullName?.givenName?.trim();
      const familyName = credential.fullName?.familyName?.trim();
      const name = [givenName, familyName].filter(Boolean).join(" ");

      await signIn("apple", {
        verifierId,
        authorizationCode: credential.authorizationCode!,
        ...(name ? { additionalFields: { name } } : {}),
      });
      onSuccess?.();
    } catch (error) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : undefined;

      if (code === "ERR_REQUEST_CANCELED") {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Could not sign in with Apple.";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={styles.button}
          onPress={() => {
            void handleSignIn();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 320,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "100%",
    height: 44,
  },
  unavailable: {
    fontSize: 14,
    textAlign: "center",
  },
});
