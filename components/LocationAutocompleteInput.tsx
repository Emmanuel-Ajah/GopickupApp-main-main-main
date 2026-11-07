import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PlaceSuggestion, searchPlaces } from "../services/googlePlaces";
import haptic from "../utils/haptics";

interface LocationAutocompleteInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace?: (place: PlaceSuggestion) => void;
  label?: string;
  hint?: string;
  containerStyle?: any;
  inputStyle?: any;
  showGpsButton?: boolean;
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
  showGpsButton = true,
}: LocationAutocompleteInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
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

  const handleSelectSuggestion = async (item: PlaceSuggestion) => {
    await haptic.selection();
    const selectedAddress = item.description || item.mainText;
    setQuery(selectedAddress);
    onChangeText(selectedAddress);
    if (onSelectPlace) {
      onSelectPlace(item);
    }
    setShowDropdown(false);
    setSuggestions([]);
  };

  // GPS Current Location Detection
  const handleDetectLocation = async () => {
    await haptic.mediumImpact();
    setDetectingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        await haptic.warningNotification();
        Alert.alert(
          "Location Permission",
          "Permission to access device location was denied. Please type your location manually."
        );
        setDetectingGps(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const street = place.street || place.name || "";
        const city = place.city || place.subregion || place.district || "";
        const region = place.region || place.country || "";
        const country = place.country || "Nigeria";

        const formatted = [street, city, region, country]
          .filter(Boolean)
          .join(", ");

        const resolvedAddress = formatted || `${city}, ${country}`;
        setQuery(resolvedAddress);
        onChangeText(resolvedAddress);
        setShowDropdown(false);
        setSuggestions([]);

        if (onSelectPlace) {
          onSelectPlace({
            description: resolvedAddress,
            mainText: street || city || "Current Location",
            secondaryText: [city, region, country].filter(Boolean).join(", "),
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
        await haptic.successNotification();
      } else {
        await haptic.errorNotification();
        Alert.alert("Location", "Could not resolve your address. Please enter it manually.");
      }
    } catch (err) {
      console.warn("GPS detection error:", err);
      await haptic.errorNotification();
      Alert.alert(
        "Location Error",
        "Could not detect current location. Please verify GPS is enabled."
      );
    } finally {
      setDetectingGps(false);
    }
  };

  return (
    <View
      style={[
        styles.wrapper,
        containerStyle,
        {
          zIndex: showDropdown && suggestions.length > 0 ? 1000 : 1,
          elevation: showDropdown && suggestions.length > 0 ? 20 : 1,
        },
      ]}
    >
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputWrapper, inputStyle]}>
        <Ionicons
          name="location-outline"
          size={18}
          color="#389E23"
          style={styles.leadingIcon}
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={handleTextChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
        />

        {loading ? (
          <ActivityIndicator size="small" color="#389E23" style={styles.actionBtn} />
        ) : detectingGps ? (
          <ActivityIndicator size="small" color="#439D25" style={styles.actionBtn} />
        ) : (
          <View style={styles.actionsRow}>
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery("");
                  onChangeText("");
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                style={styles.actionBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Clear location"
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}

            {showGpsButton && (
              <TouchableOpacity
                onPress={handleDetectLocation}
                style={styles.gpsBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Use current GPS location"
              >
                <Ionicons name="locate" size={18} color="#439D25" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      {/* Floating Suggestions Dropdown using ScrollView (no VirtualizedList nesting) */}
      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={item.placeId || `${item.mainText}-${index}`}
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
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
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
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  leadingIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionBtn: {
    padding: 2,
  },
  gpsBtn: {
    padding: 3,
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
  },
  hint: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 5,
  },
  dropdown: {
    position: "absolute",
    top: 76,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 25,
    zIndex: 9999,
    maxHeight: 220,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 220,
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
