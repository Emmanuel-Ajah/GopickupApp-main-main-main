import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PlaceSuggestion, searchPlaces } from "../services/googlePlaces";

interface LocationAutocompleteInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace?: (place: PlaceSuggestion) => void;
  label?: string;
  hint?: string;
  containerStyle?: any;
  inputStyle?: any;
}

export default function LocationAutocompleteInput({
  placeholder = "Enter location",
  value,
  onChangeText,
  onSelectPlace,
  label,
  hint,
  containerStyle,
  inputStyle,
}: LocationAutocompleteInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<any>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleTextChange = (text: string) => {
    setQuery(text);
    onChangeText(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const places = await searchPlaces(text);
        setSuggestions(places);
      } catch (err) {
        console.warn("Autocomplete error:", err);
      } finally {
        setLoading(false);
      }
    }, 280);
  };

  const handleSelectSuggestion = (item: PlaceSuggestion) => {
    const selectedAddress = item.description || item.mainText;
    setQuery(selectedAddress);
    onChangeText(selectedAddress);
    if (onSelectPlace) {
      onSelectPlace(item);
    }
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputWrapper, inputStyle]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#C7C7CC"
          value={query}
          onChangeText={handleTextChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
        />
        {loading ? (
          <ActivityIndicator size="small" color="#389E23" style={styles.loader} />
        ) : query.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              onChangeText("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        ) : null}
      </View>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      {/* Floating Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => item.placeId || `${item.mainText}-${index}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.suggestionRow,
                  index < suggestions.length - 1 && styles.suggestionBorder,
                ]}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="location-outline" size={16} color="#389E23" />
                </View>
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.mainText} numberOfLines={1}>
                    {item.mainText}
                  </Text>
                  {item.secondaryText ? (
                    <Text style={styles.secondaryText} numberOfLines={1}>
                      {item.secondaryText}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 10,
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
  },
  loader: {
    marginLeft: 6,
  },
  hint: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 5,
  },
  dropdown: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
    maxHeight: 220,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EBF5EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  secondaryText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
