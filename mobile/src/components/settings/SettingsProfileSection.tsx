import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import { useAvatarPicker } from "@/hooks/useAvatarPicker";
import { useCurrentUserAccentTheme } from "@/hooks/useCurrentUserAccentTheme";
import { getAccentTheme } from "@/lib/accent-themes";
import { getConvexErrorMessage } from "@/lib/convexError";
import { uploadAvatarToStorage } from "@/lib/uploadAvatar";
import { useAppColors } from "@/lib/theme";
import { api } from "convex/_generated/api";

export function SettingsProfileSection() {
  const colors = useAppColors();
  const user = useQuery(api.users.current);
  const { accentTheme } = useCurrentUserAccentTheme();
  const gradientColors = getAccentTheme(accentTheme).gradientColors;
  const updateName = useMutation(api.users.updateName);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const generateAvatarUploadUrl = useMutation(api.users.generateAvatarUploadUrl);
  const { pickImage, error: pickerError } = useAvatarPicker();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const trimmedName = name.trim();
  const nameChanged = trimmedName !== (user?.name ?? "").trim();
  const canSaveName = nameChanged && trimmedName.length > 0 && !savingName;

  const previewAvatarUri = localAvatarUri ?? user?.avatarUrl ?? null;
  const previewDisplayName = isEditing ? trimmedName || user?.name : user?.name;
  const hasAvatar = Boolean(previewAvatarUri);

  const openEditor = () => {
    setName(user?.name ?? "");
    setIsEditing(true);
  };

  const closeEditor = () => {
    setName(user?.name ?? "");
    setIsEditing(false);
  };

  const handleSaveName = async () => {
    if (!canSaveName) {
      return;
    }

    setSavingName(true);
    try {
      await updateName({ name: trimmedName });
    } catch (saveError) {
      Alert.alert(
        "Could not update name",
        getConvexErrorMessage(saveError, "Could not update your display name."),
      );
    } finally {
      setSavingName(false);
    }
  };

  const handlePickAvatar = async (useCamera: boolean) => {
    if (savingAvatar) {
      return;
    }

    const uri = await pickImage(useCamera);
    if (!uri) {
      return;
    }

    setLocalAvatarUri(uri);
    setSavingAvatar(true);

    try {
      const avatarStorageId = await uploadAvatarToStorage({
        localUri: uri,
        generateUploadUrl: () => generateAvatarUploadUrl(),
      });
      await updateAvatar({ avatarStorageId });
      setLocalAvatarUri(null);
    } catch (saveError) {
      setLocalAvatarUri(null);
      Alert.alert(
        "Could not update photo",
        getConvexErrorMessage(saveError, "Could not update your profile photo."),
      );
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (savingAvatar || !hasAvatar) {
      return;
    }

    setSavingAvatar(true);
    setLocalAvatarUri(null);

    try {
      await updateAvatar({ avatarStorageId: null });
    } catch (saveError) {
      Alert.alert(
        "Could not remove photo",
        getConvexErrorMessage(saveError, "Could not remove your profile photo."),
      );
    } finally {
      setSavingAvatar(false);
    }
  };

  return (
    <View style={styles.section}>
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.accountSection}
      >
        <ProfilePreview
          embedded
          onGradientBackground
          showEditIcon={!isEditing}
          onAvatarPress={isEditing ? undefined : openEditor}
          profile={{
            displayName: previewDisplayName,
            username: user?.username,
            avatarUri: previewAvatarUri,
          }}
        />
      </LinearGradient>

      {isEditing ? (
        <>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Display name
            </Text>
            <View style={styles.nameRow}>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.nameInput,
                  {
                    color: colors.text,
                    borderColor: colors.surfaceBorder,
                    backgroundColor: colors.fill,
                  },
                ]}
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                onSubmitEditing={() => {
                  void handleSaveName();
                }}
              />
              <Pressable
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: colors.text,
                    opacity: canSaveName ? 1 : 0.45,
                  },
                ]}
                onPress={handleSaveName}
                disabled={!canSaveName}
              >
                {savingName ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text
                    style={[styles.saveButtonText, { color: colors.background }]}
                  >
                    Save
                  </Text>
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Profile photo
            </Text>
            <Pressable
              style={[styles.actionButton, { borderColor: colors.surfaceBorder }]}
              onPress={() => {
                void handlePickAvatar(false);
              }}
              disabled={savingAvatar}
            >
              {savingAvatar ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Choose photo
                </Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.actionButton, { borderColor: colors.surfaceBorder }]}
              onPress={() => {
                void handlePickAvatar(true);
              }}
              disabled={savingAvatar}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>
                Take photo
              </Text>
            </Pressable>

            {hasAvatar ? (
              <Pressable
                onPress={() => {
                  void handleRemoveAvatar();
                }}
                disabled={savingAvatar}
              >
                <Text style={[styles.removeText, { color: colors.textMuted }]}>
                  Remove photo
                </Text>
              </Pressable>
            ) : null}

            {pickerError ? (
              <Text style={[styles.errorText, { color: "#ef4444" }]}>
                {pickerError}
              </Text>
            ) : null}
          </View>

          <Pressable
            style={[styles.doneButton, { borderColor: colors.surfaceBorder }]}
            onPress={closeEditor}
          >
            <Text style={[styles.doneButtonText, { color: colors.text }]}>
              Done
            </Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  accountSection: {
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  nameRow: {
    flexDirection: "row",
    gap: 10,
  },
  nameInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  saveButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
  removeText: {
    fontSize: 15,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  doneButton: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
