import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { acceptQuote, getMyOrders } from '../services/api';

export default function OrderHistory({ notifications = false }: { notifications?: boolean }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { setOrders((await getMyOrders()).data); }
    catch { setError('Could not load orders. Check your connection and sign in again if needed.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  return <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 110 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
    <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 20 }}>{notifications ? 'Delivery updates' : 'My orders'}</Text>
    {loading && <ActivityIndicator />}
    {!!error && <TouchableOpacity onPress={refresh}><Text>{error} Tap to retry.</Text></TouchableOpacity>}
    {!loading && !error && !orders.length && <Text>No orders yet. Book a delivery or order materials from Home.</Text>}
    {orders.map(order => <View key={order._id} style={{ backgroundColor: '#F0F9EF', padding: 18, marginBottom: 14, borderRadius: 14 }}>
      <Text selectable style={{ fontWeight: '800' }}>{order.trackingId}</Text>
      <Text style={{ color: '#439D25', marginVertical: 8 }}>{order.status}</Text>
      <Text>{order.pickupLocation} → {order.deliveryLocation}</Text>
      <Text>Materials: ₦{order.totalAmount.toLocaleString()}</Text>
      <Text>{order.negotiatedPrice > 0 ? `Quote total: ₦${order.negotiatedPrice.toLocaleString()}` : 'Awaiting delivery quote'}</Text>
      <Text>Payment: {order.paymentStatus}</Text>
      {order.events?.map((event: any, index: number) => <Text key={index} style={{ marginTop: 8 }}>{event.status} · {new Date(event.at).toLocaleString()}</Text>)}
      {!notifications && order.status === 'Pending Negotiation' && order.negotiatedPrice > 0 && <TouchableOpacity disabled={busy !== null} onPress={async () => {
        const haptic = (await import('../utils/haptics')).default;
        await haptic.mediumImpact();
        setBusy(order._id);
        try {
          await acceptQuote(order._id);
          await haptic.successNotification();
          await refresh();
        }
        catch (error: any) {
          await haptic.errorNotification();
          Alert.alert('Error', error.response?.data?.message || 'Unable to accept quote');
        }
        finally { setBusy(null); }
      }}><Text style={{ paddingVertical: 15, fontWeight: '700', color: '#439D25' }}>{busy === order._id ? 'Accepting…' : 'Accept quote'}</Text></TouchableOpacity>}
    </View>)}
  </ScrollView>;
}
