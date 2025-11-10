import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TermsOfService = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Term of service</Text>

      {/* 1.1 Platform Description */}
      <Text style={styles.sectionTitle}>1.1 Platform Description</Text>
      <Text style={styles.text}>
        GO Pickup is a web and mobile application-based platform accessible at{" "}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("https://www.gopickup.com.ng")}
        >
          www.gopickup.com.ng
        </Text>{" "}
        which connects individuals or organizations requiring logistics and
        haulage services (“Senders”) with verified logistics professionals or
        vehicle owners (“Pilots”). Pilots can provide the following types of
        delivery services:
      </Text>

      <View style={styles.list}>
        <Text style={styles.bullet}>
          • On-Demand Jobs Delivery Service: Immediate or grouped order
          delivery.
        </Text>
        <Text style={styles.bullet}>
          • Scheduled Delivery Service: Future or recurring order delivery
          services.
        </Text>
        <Text style={styles.bullet}>
          • These services are collectively referred to as the “Services.”
        </Text>
      </View>

      {/* 1.2 Operator */}
      <Text style={styles.sectionTitle}>1.2 Operator</Text>
      <Text style={styles.text}>
        The platform is operated by GO Pickup Logistics Ltd. (“GO Pickup”).
        Access to and use of the platform or any of its associated features is
        governed by these General Terms and Conditions (the “General Terms”),
        which may be updated from time to time. By using the Application or
        accepting the Terms, you agree to be bound by the General Terms and any
        applicable Additional Terms. If you disagree, you must discontinue use
        immediately.
      </Text>

      {/* 1.3 Additional Terms */}
      <Text style={styles.sectionTitle}>1.3 Additional Terms</Text>
      <Text style={styles.text}>
        Some features may be governed by additional terms (“Additional Terms”).
        In the event of a conflict between General and Additional Terms, the
        Additional Terms will prevail.
      </Text>

      {/* 1.4 Changes to Terms */}
      <Text style={styles.sectionTitle}>1.4 Changes to Terms</Text>
      <Text style={styles.text}>
        GO Pickup reserves the right to amend these General and Additional
        Terms. Continued use after such changes constitutes acceptance.
      </Text>

      {/* 1.5 Privacy */}
      <Text style={styles.sectionTitle}>1.5 Privacy</Text>
      <Text style={styles.text}>
        Personal data is handled per the GO Pickup Privacy Policy.
      </Text>

      {/* 2. ACCOUNT REGISTRATION */}
      <Text style={[styles.title, { marginTop: 24 }]}>
        2. ACCOUNT REGISTRATION
      </Text>

      {/* 2.1 Required Information */}
      <Text style={styles.sectionTitle}>2.1 Required Information</Text>
      <Text style={styles.text}>
        To register an account (“Account”), you must provide:
      </Text>

      <View style={styles.list}>
        <Text style={styles.bullet}>
          • Full name, phone number, email address, location.
        </Text>
        <Text style={styles.bullet}>
          • Username and password, Nigerian Identity Number (NIN).
        </Text>
        <Text style={styles.bullet}>
          • For companies: CAC Registration Number, Vehicle type/model.
        </Text>
        <Text style={styles.bullet}>• Valid driver’s license.</Text>
      </View>

      {/* 2.2 Representation and Updates */}
      <Text style={styles.sectionTitle}>2.2 Representation and Updates</Text>
      <Text style={styles.text}>
        You agree that the information provided is accurate and will be updated
        as necessary.
      </Text>

      <Text style={styles.sectionTitle}>2.3 Communication and Consent</Text>
      <Text style={styles.text}>
        Your consent to receive communication via SMS, email, phone, or in-app
        notifications related to service use. as necessary.
      </Text>

      <Text style={styles.sectionTitle}>2.4 Eligibility</Text>
      <Text style={styles.text}>You may not use the platform if you.</Text>

      <view style={{backgroundColor:'red', flexDirection:'row', alignItems:'center'}}>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editText}>Continue</Text>
        </TouchableOpacity>
      </view>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  list: {
    marginTop: 6,
    marginBottom: 10,
  },
  bullet: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginLeft: 10,
  },
  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  editBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    alignItems: "center",
    width: 84,
  },
  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default TermsOfService;
