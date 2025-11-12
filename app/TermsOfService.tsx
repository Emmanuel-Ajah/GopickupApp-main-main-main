// TermsOfServiceScreen.js
import React from "react";
import { ScrollView, StyleSheet, Text, Linking, TouchableOpacity } from "react-native";

const TermsOfService = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>

      <Text style={styles.sectionTitle}>1. Platform Description</Text>
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
        vehicle owners (“Pilots”).
      </Text>
      <Text style={styles.text}>
        Pilots can provide the following delivery services:
        {"\n"}• On-Demand Jobs Delivery Service: Immediate or grouped order
        delivery.
        {"\n"}• Scheduled Delivery Service: Future or recurring order delivery
        services.
        {"\n"}These services are collectively referred to as the “Services.”
      </Text>

      <Text style={styles.sectionTitle}>2. Operator</Text>
      <Text style={styles.text}>
        The platform is operated by GO Pickup Logistics Ltd. (“GO Pickup”).
        Access to and use of the platform is governed by these General Terms and
        Conditions, which may be updated from time to time. By using the
        Application or accepting these Terms, you agree to be bound by them. If
        you disagree, you must discontinue use immediately.
      </Text>

      <Text style={styles.sectionTitle}>3. Account Registration</Text>
      <Text style={styles.text}>
        To register an account, you must provide accurate information including:
        full name, phone number, email address, location, username, password,
        and Nigerian Identity Number (NIN).
        {"\n\n"}For companies: CAC Registration Number, vehicle type/model, and
        a valid driver’s license.
      </Text>
      <Text style={styles.text}>
        By registering, you agree that all information is true and will be kept
        up to date. You also consent to receive communications via SMS, email,
        phone, or in-app notifications related to your service use.
      </Text>

      <Text style={styles.sectionTitle}>4. Relationship</Text>
      <Text style={styles.text}>
        GO Pickup acts only as a facilitator between Senders and Pilots. Pilots
        are independent contractors and not employees. GO Pickup does not
        directly provide delivery services.
      </Text>

      <Text style={styles.sectionTitle}>5. Pilot Obligations</Text>
      <Text style={styles.text}>
        Pilots must:
        {"\n"}• Maintain account confidentiality.
        {"\n"}• Deliver services lawfully, professionally, and diligently.
        {"\n"}• Enable GPS tracking during deliveries.
        {"\n"}• Avoid misuse, impersonation, or unethical conduct.
        {"\n"}• Not reverse-engineer or exploit the platform.
      </Text>

      <Text style={styles.sectionTitle}>6. Insurance and Risk</Text>
      <Text style={styles.text}>
        Pilots are required to maintain valid vehicle and third-party insurance,
        workers’ compensation (if applicable), and any other coverages as
        required by law. Pilots bear all risks associated with service delivery.
      </Text>

      <Text style={styles.sectionTitle}>7. Payments</Text>
      <Text style={styles.text}>
        GO Pickup acts as an agent to collect payments from Senders. Payouts to
        Pilots are processed within 48 hours of job completion. Tax invoices are
        issued by GO Pickup on behalf of the Pilot.
      </Text>

      <Text style={styles.sectionTitle}>8. Reviews and Ratings</Text>
      <Text style={styles.text}>
        Senders may rate Pilots as Good, Neutral, or Bad. These reviews affect a
        Pilot’s visibility and credibility on the platform. GO Pickup reserves
        the right to moderate reviews as per its Review Policy.
      </Text>

      <Text style={styles.sectionTitle}>
        9. License and Intellectual Property
      </Text>
      <Text style={styles.text}>
        The platform and its contents are owned by GO Pickup and are protected
        under Nigerian law. Users are granted a limited, non-transferable right
        to use the platform. You must not reproduce, reverse-engineer, or
        redistribute any part of it without permission.
      </Text>

      <Text style={styles.sectionTitle}>10. Non-Solicitation</Text>
      <Text style={styles.text}>
        Pilots may not bypass the platform to work directly with Senders for 12
        months after introduction.
      </Text>

      <Text style={styles.sectionTitle}>11. Disclaimers and Limitations</Text>
      <Text style={styles.text}>
        GO Pickup provides the platform “as is” and disclaims liability for
        indirect or consequential damages. Liability is limited to the most
        recent commission fee earned. GO Pickup is not liable for external
        events, user actions, or force majeure.
      </Text>

      <Text style={styles.sectionTitle}>12. Indemnity</Text>
      <Text style={styles.text}>
        Pilots indemnify GO Pickup against any claims arising from their actions
        or omissions, except where GO Pickup is directly at fault.
      </Text>

      <Text style={styles.sectionTitle}>13. Dispute Resolution</Text>
      <Text style={styles.text}>
        Disputes must be reported within 72 hours of delivery. GO Pickup may
        mediate and temporarily freeze accounts pending resolution. Legal action
        can only proceed after good-faith mediation.
      </Text>

      <Text style={styles.sectionTitle}>14. Termination</Text>
      <Text style={styles.text}>
        Users may terminate their account by giving two weeks’ notice. GO Pickup
        may suspend or terminate accounts for breach, inactivity, or at its
        discretion.
      </Text>

      <Text style={styles.sectionTitle}>15. Governing Law</Text>
      <Text style={styles.text}>
        These Terms are governed by Nigerian law, with exclusive jurisdiction in
        the courts of Abuja.
      </Text>

      <Text style={styles.sectionTitle}>16. Contact Information</Text>
      <Text style={styles.text}>
        For inquiries, contact GO Pickup at:
        {"\n"}Email:{" "}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("mailto:support@gopickup.com")}
        >
          support@gopickup.com
        </Text>
      </Text>

      <Text style={styles.text}>Last updated: November 2025</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    marginTop: 8,
  },
  link: {
    color: "#007BFF",
    textDecorationLine: "underline",
  },
});

export default TermsOfService;
