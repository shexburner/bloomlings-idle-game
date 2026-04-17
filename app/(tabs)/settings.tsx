// =============================================================================
// Settings Tab — Sound, haptics, save/load/export controls
// =============================================================================

import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGameStore } from "~/state/store";
import {
  saveToDisk,
  exportSave,
  importSave,
  applySaveToStore,
} from "~/services/saveManager";

/** Color palette matching the app-wide dark theme. */
const COLORS = {
  background: "#0d1117",
  card: "#1a1a2e",
  cardBorder: "#2d4a3e",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  accent: "#4caf50",
  danger: "#e74c3c",
  inputBg: "#161b22",
  inputBorder: "#30363d",
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const sfxEnabled = useGameStore((s) => s.settings.sfxEnabled);
  const musicEnabled = useGameStore((s) => s.settings.musicEnabled);
  const hapticsEnabled = useGameStore((s) => s.settings.hapticsEnabled);
  const setSfxEnabled = useGameStore((s) => s.setSfxEnabled);
  const setMusicEnabled = useGameStore((s) => s.setMusicEnabled);
  const setHapticsEnabled = useGameStore((s) => s.setHapticsEnabled);

  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");

  const handleSave = useCallback(() => {
    const state = useGameStore.getState();
    saveToDisk(state);
    Alert.alert("Saved", "Your game has been saved.");
  }, []);

  const handleExport = useCallback(() => {
    const state = useGameStore.getState();
    const encoded = exportSave(state);
    setExportText(encoded);
    Alert.alert("Exported", "Your save data is shown below. Copy it to back up your progress.");
  }, []);

  const handleImport = useCallback(() => {
    if (!importText.trim()) {
      Alert.alert("Error", "Please paste a save code first.");
      return;
    }

    const save = importSave(importText.trim());
    if (!save) {
      Alert.alert("Error", "Invalid save data. Please check and try again.");
      return;
    }

    Alert.alert(
      "Import Save",
      "This will replace your current progress. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          style: "destructive",
          onPress: () => {
            applySaveToStore(save);
            setImportText("");
            Alert.alert("Imported", "Your save data has been loaded.");
          },
        },
      ]
    );
  }, [importText]);

  return (
    <ScrollView
      testID="settings-screen"
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={styles.title}>Settings</Text>

      {/* --- Audio & Feedback Section --- */}
      <Text style={styles.sectionHeader}>Audio & Feedback</Text>
      <View style={styles.card}>
        <SettingRow
          testID="settings-sfx-toggle"
          label="Sound Effects"
          value={sfxEnabled}
          onToggle={setSfxEnabled}
        />
        <View style={styles.separator} />
        <SettingRow
          testID="settings-music-toggle"
          label="Music"
          value={musicEnabled}
          onToggle={setMusicEnabled}
        />
        <View style={styles.separator} />
        <SettingRow
          testID="settings-haptics-toggle"
          label="Haptics"
          value={hapticsEnabled}
          onToggle={setHapticsEnabled}
        />
      </View>

      {/* --- Save & Data Section --- */}
      <Text style={styles.sectionHeader}>Save & Data</Text>
      <View style={styles.card}>
        <Pressable testID="settings-save" style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Game</Text>
        </Pressable>
        <View style={styles.separator} />
        <Pressable testID="settings-export" style={styles.button} onPress={handleExport}>
          <Text style={styles.buttonText}>Export Save</Text>
        </Pressable>
        {exportText.length > 0 && (
          <TextInput
            testID="settings-export-text"
            style={styles.codeField}
            value={exportText}
            multiline
            selectTextOnFocus
            editable={false}
          />
        )}
        <View style={styles.separator} />
        <Text style={styles.importLabel}>Import Save</Text>
        <TextInput
          testID="settings-import-input"
          style={styles.codeField}
          value={importText}
          onChangeText={setImportText}
          placeholder="Paste save code here..."
          placeholderTextColor={COLORS.textMuted}
          multiline
        />
        <Pressable
          testID="settings-import"
          style={[styles.button, styles.importButton]}
          onPress={handleImport}
        >
          <Text style={styles.buttonText}>Load Save</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SettingRowProps {
  testID?: string;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

function SettingRow({ testID, label, value, onToggle }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.inputBorder, true: COLORS.accent }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 12,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  importButton: {
    marginTop: 8,
  },
  importLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  codeField: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 12,
    padding: 12,
    marginTop: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },
});
