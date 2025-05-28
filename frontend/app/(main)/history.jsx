import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState, useCallback } from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function History() {
  const [sortOption, setSortOption] = useState('Newest');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async (email, fromRefresh = false) => {
    try {
      if (!email) {
        setError('User email not found.');
        setReports([]);
        if (!fromRefresh) setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(`http://192.168.145.91:8000/reports/${email}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('No reports found for this user.');
          setReports([]);
        } else {
          setError('An error occurred while fetching reports.');
          setReports([]);
        }
      } else {
        const data = await response.json();
        const fetchedReports = data.reports || [];
        if (fetchedReports.length === 0) {
          setError('No reports found for this user.');
        } else {
          setReports(fetchedReports);
          setError(null);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports.');
      setReports([]);
    } finally {
      if (!fromRefresh) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('userEmail').then((email) => {
      fetchReports(email);
    });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    AsyncStorage.getItem('userEmail').then((email) => {
      fetchReports(email, true);
    });
  }, []);

  const sortedData = [...reports].sort((a, b) => {
    const dateA = new Date(a.submission_date);
    const dateB = new Date(b.submission_date);

    if (sortOption === 'Newest') return dateB - dateA;
    if (sortOption === 'Oldest') return dateA - dateB;
    if (sortOption === 'Severity') {
      const order = { Severe: 1, Moderate: 2, Mild: 3 };
      return (order[a.severity] || 99) - (order[b.severity] || 99);
    }
    if (sortOption === 'Status') {
      const order = { pending: 1, resolved: 2 };
      return (order[a.status?.toLowerCase()] || 99) - (order[b.status?.toLowerCase()] || 99);
    }
    return 0;
  });

  const totalReports = reports.length;
  const pendingReports = reports.filter(item => item.status?.toLowerCase() === 'pending').length;
  const resolvedReports = reports.filter(item => item.status?.toLowerCase() === 'resolved').length;

  // Helper function to format date in IST
  const formatDateIST = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor="#ffffff"
          colors={['#ffffff']}
          progressBackgroundColor="#1f2937"
        />
      }
    >
      <Text style={styles.title}>History</Text>

      <View style={styles.statsContainer}>
        <StatCard title="Total" count={totalReports} color="#8b5cf6" />
        <StatCard title="Pending" count={pendingReports} color="#d97706" />
        <StatCard title="Resolved" count={resolvedReports} color="#059669" />
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={sortOption}
          style={styles.picker}
          dropdownIconColor="white"
          mode="dropdown"
          onValueChange={(itemValue) => setSortOption(itemValue)}
        >
          <Picker.Item label="Sort by Newest" value="Newest" />
          <Picker.Item label="Sort by Oldest" value="Oldest" />
          <Picker.Item label="Sort by Severity" value="Severity" />
          <Picker.Item label="Sort by Status" value="Status" />
        </Picker>
      </View>

      {loading && (
        <ActivityIndicator 
          size="large" 
          color="#8b5cf6" 
          style={{ marginTop: 20 }} 
        />
      )}

      {!loading && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && !error && sortedData.length === 0 && (
        <Text style={styles.noDataText}>No reports available yet.</Text>
      )}

      {!loading &&
        !error &&
        sortedData.map((item, index) => (
          <DetailsCard
            key={`${item._id || item.id || index}`}
            severity={item.severity}
            damageType={item.damage_type}
            status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            location={item.address}
            description={item.summary}
            date={formatDateIST(item.submission_date)}
            imgBase64={item.image_base64}
            imgType={item.image_type}
          />
        ))}
    </ScrollView>
  );
}

function StatCard({ title, count, color }) {
  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statCount}>{count}</Text>
    </View>
  );
}

const DetailsCard = ({
  severity,
  damageType,
  status,
  location,
  description,
  date,
  imgBase64,
  imgType,
}) => {
  const severityColors = {
    Severe: '#dc2626',
    Moderate: '#eab308',
    Minor: '#22c55e',
  };

  const statusColors = {
    Pending: '#ca8a04',
    Resolved: '#16a34a',
  };

  const imageUri = imgBase64 ? `data:${imgType || 'image/jpeg'};base64,${imgBase64}` : null;

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={cardStyles.image} resizeMode="cover" />
        ) : (
          <View style={[cardStyles.image, cardStyles.noImageContainer]}>
            <Text style={cardStyles.noImageText}>No Image</Text>
          </View>
        )}
      </View>

      <View style={cardStyles.content}>
        <View style={cardStyles.topSection}>
          <Text numberOfLines={2} ellipsizeMode="tail" style={cardStyles.description}>
            <Text style={cardStyles.summaryLabel}>Summary: </Text>
            {description}
          </Text>

          <View style={cardStyles.locationRow}>
            <Entypo name="location-pin" size={14} color="#94a3b8" />
            <Text numberOfLines={1} ellipsizeMode="tail" style={cardStyles.locationText}>
              {location}
            </Text>
          </View>

          <Text style={cardStyles.dateText}>{date}</Text>
        </View>

        <View style={cardStyles.labelsRow}>
          <View style={[cardStyles.label, { backgroundColor: severityColors[severity] || '#6b7280' }]}>
            <Text style={cardStyles.labelText}>{severity}</Text>
          </View>
          <View style={[cardStyles.label, { backgroundColor: statusColors[status] || '#6b7280' }]}>
            <Text style={cardStyles.labelText}>{status}</Text>
          </View>
          {damageType && (
            <View style={[cardStyles.label, { backgroundColor: '#111827' }]}>
              <Text style={cardStyles.labelText}>{damageType}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 100,
    minHeight: '100%',
  },
  title: {
    color: 'white',
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  statsContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '31%',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statCount: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pickerContainer: {
    width: '90%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  picker: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    width: '90%',
  },
  noDataText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});

const cardStyles = StyleSheet.create({
  card: {
    width: '90%',
    height: 160,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 16,
  },
  imageContainer: {
    width: '40%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  content: {
    width: '60%',
    padding: 12,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 18,
  },
  summaryLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  dateText: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  label: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  labelText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
});