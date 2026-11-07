import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { acceptQuote, getMyOrders, recordPayment } from '../services/api';
import PaystackPaymentModal from './PaystackPaymentModal';

export default function OrderHistory({ notifications = false }: { notifications?: boolean }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<any | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { setOrders((await getMyOrders()).data); }
    catch { setError('Could not load orders. Check your connection and sign in again if needed.'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handlePaySuccess = async (data: { reference: string }) => {
    if (!paymentOrder) return;
    const orderToPay = paymentOrder;
    setPaymentOrder(null);
    try {
      const haptic = (await import('../utils/haptics')).default;
      await haptic.successNotification();
      await recordPayment(orderToPay._id, { reference: data.reference, paymentMethod: 'Paystack' });
      Alert.alert('Payment Successful', `Your payment for #${orderToPay.trackingId} was confirmed via Paystack!`);
      await refresh();
    } catch (err: any) {
      Alert.alert('Payment Notice', err.response?.data?.message || 'Payment recorded on Paystack, syncing update.');
      await refresh();
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 20 }}>
          {notifications ? 'Delivery updates' : 'My orders'}
        </Text>
        {loading && <ActivityIndicator size="large" color="#439D25" />}
        {!!error && <TouchableOpacity onPress={refresh}><Text style={{ color: '#E53935', marginVertical: 10 }}>{error} Tap to retry.</Text></TouchableOpacity>}
        {!loading && !error && !orders.length && <Text style={{ color: '#666', marginTop: 10 }}>No orders yet. Book a delivery or order materials from Home.</Text>}
        {orders.map((order) => {
          const payableAmount = order.negotiatedPrice > 0 ? order.negotiatedPrice : (order.totalAmount > 0 ? order.totalAmount : 0);
          const isPaid = order.paymentStatus === 'Paid';

          return (
            <View key={order._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text selectable style={styles.trackingId}>{order.trackingId}</Text>
                <View style={[styles.paymentBadge, isPaid ? styles.paidBadge : styles.unpaidBadge]}>
                  <Ionicons name={isPaid ? "checkmark-circle" : "time-outline"} size={13} color={isPaid ? "#439D25" : "#D97706"} />
                  <Text style={[styles.paymentBadgeText, isPaid ? styles.paidBadgeText : styles.unpaidBadgeText]}>
                    {isPaid ? "Paid" : "Unpaid"}
                  </Text>
                </View>
              </View>

              <Text style={{ color: '#439D25', fontWeight: '700', marginVertical: 6 }}>{order.status}</Text>
              <Text style={{ color: '#333', fontSize: 13, marginBottom: 4 }}>{order.pickupLocation} → {order.deliveryLocation}</Text>
              <Text style={{ color: '#555', fontSize: 13 }}>Materials: ₦{order.totalAmount.toLocaleString()}</Text>
              <Text style={{ color: '#111', fontWeight: '600', marginTop: 2 }}>
                {order.negotiatedPrice > 0 ? `Quote total: ₦${order.negotiatedPrice.toLocaleString()}` : 'Awaiting delivery quote'}
              </Text>

              {order.events?.map((event: any, index: number) => (
                <Text key={index} style={{ marginTop: 6, fontSize: 11, color: '#777' }}>
                  {event.status} · {new Date(event.at).toLocaleString()}
                </Text>
              ))}

              {/* Accept Quote Action */}
              {!notifications && order.status === 'Pending Negotiation' && order.negotiatedPrice > 0 && (
                <TouchableOpacity
                  disabled={busy !== null}
                  style={styles.acceptBtn}
                  onPress={async () => {
                    const haptic = (await import('../utils/haptics')).default;
                    await haptic.mediumImpact();
                    setBusy(order._id);
                    try {
                      await acceptQuote(order._id);
                      await haptic.successNotification();
                      await refresh();
                    } catch (err: any) {
                      await haptic.errorNotification();
                      Alert.alert('Error', err.response?.data?.message || 'Unable to accept quote');
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  <Text style={styles.acceptBtnText}>{busy === order._id ? 'Accepting…' : 'Accept quote'}</Text>
                </TouchableOpacity>
              )}

              {/* Pay with Paystack Button */}
              {!isPaid && payableAmount > 0 && (
                <TouchableOpacity
                  style={styles.paystackBtn}
                  onPress={async () => {
                    const haptic = (await import('../utils/haptics')).default;
                    await haptic.mediumImpact();
                    setPaymentOrder(order);
                  }}
                >
                  <Ionicons name="card-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.paystackBtnText}>
                    Pay ₦{payableAmount.toLocaleString()} with Paystack
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Paystack Payment Modal */}
      {paymentOrder && (
        <PaystackPaymentModal
          visible={!!paymentOrder}
          amount={paymentOrder.negotiatedPrice > 0 ? paymentOrder.negotiatedPrice : paymentOrder.totalAmount}
          email={paymentOrder.user?.email || 'customer@gopickup.com.ng'}
          reference={`pay_${paymentOrder.trackingId}_${Date.now()}`}
          title={`Pay #${paymentOrder.trackingId}`}
          onSuccess={handlePaySuccess}
          onClose={() => setPaymentOrder(null)}
          metadata={{ orderId: paymentOrder._id, trackingId: paymentOrder.trackingId }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F9EF',
    padding: 18,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2F0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trackingId: {
    fontWeight: '800',
    fontSize: 16,
    color: '#000',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  paidBadge: {
    backgroundColor: '#E6F6E6',
  },
  unpaidBadge: {
    backgroundColor: '#FEF3C7',
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paidBadgeText: {
    color: '#439D25',
  },
  unpaidBadgeText: {
    color: '#D97706',
  },
  acceptBtn: {
    backgroundColor: '#439D25',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  paystackBtn: {
    backgroundColor: '#0BA4DB',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  paystackBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
