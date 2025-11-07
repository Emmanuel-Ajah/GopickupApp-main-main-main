import React from "react";

import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#439D25",
      }}
    >
      <StatusBar hidden={true} />
      <View
        style={[
          Styles.container,
          { marginTop: 100, paddingHorizontal: 30, paddingVertical: 30 },
        ]}
      >
        <Text
          style={{
            fontWeight: "700",
            fontSize: 22,
            color: "white",
            marginBottom: 20,
          }}
        >
          Sign in
        </Text>
        <View>
          <Text style={{ color: "white" }}>Name:</Text>
          <TextInput style={Styles.input} />
        </View>
        <View>
          <Text style={{ color: "white" }}>Email:</Text>
          <TextInput style={Styles.input} />
        </View>
        <View>
          <Text style={{ color: "white" }}>Phone No: +234</Text>
          <TextInput style={Styles.input} />
        </View>
        <View>
          <Text style={{ color: "white" }}>Date of Birth:</Text>
          <TextInput style={Styles.input} />
        </View>
        <View>
          <Text style={{ color: "white" }}>BVN:</Text>
          <TextInput style={Styles.input} />
        </View>
        <View>
          <Text style={{ color: "white" }}>Forget Password:</Text>
          <TextInput style={Styles.input} />
        </View>
        <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
          <TouchableOpacity
          style={{
            marginTop: 30,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            paddingVertical: 10,
            borderRadius: 100,
            width: 134,
            height: 50,
          }}
        >
          <Text style={{ fontSize: 19.11, fontWeight:900, color:'#439D25' }}>Sign in</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    backgroundColor: "#439D25",
    // borderRadius: 10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    elevation: 5,
    rowGap: 28,
    marginHorizontal: "auto",
    marginTop: 50,
    // paddingVertical: 20,
    // paddingHorizontal: 20,
    width: "90%",
  },
  input: {
    backgroundColor: "none",
    height: 20,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    outline: "none",
    marginTop: 5,
  },
});
