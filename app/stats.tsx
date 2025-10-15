// app/stats.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { themeColors, useTimer } from "../components/TimerContext";

export default function StatsScreen() {
  const { settings, workouts, deleteWorkout, updateWorkoutDifficulty } = useTimer();
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

  // Calculate statistics
  const totalWorkouts = workouts.length;
  const totalRoundsCompleted = workouts.reduce((sum, w) => sum + w.completedRounds, 0);
  const totalTimeSpent = workouts.reduce((sum, w) => sum + w.totalTime, 0);
  const averageRounds = totalWorkouts > 0 ? (totalRoundsCompleted / totalWorkouts).toFixed(1) : 0;

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '😅';
      case 'hard': return '🔥';
      default: return '❓';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteWorkout(id)
        },
      ]
    );
  };

  const handleDifficultyChange = (id: string, difficulty: 'easy' | 'medium' | 'hard') => {
    updateWorkoutDifficulty(id, difficulty);
    setSelectedWorkout(null);
  };

  const renderWorkoutItem = ({ item }: { item: any }) => (
    <View style={styles.workoutCard}>
      <View style={styles.workoutHeader}>
        <View style={styles.workoutHeaderLeft}>
          <Text style={styles.workoutDate}>{formatDate(item.date)}</Text>
          <Text style={styles.workoutTime}>{formatTime(item.date)}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.workoutStats}>
        <View style={styles.statItem}>
          <Ionicons name="barbell-outline" size={20} color="#fff" />
          <Text style={styles.statText}>
            {item.completedRounds}/{item.totalRounds} rounds
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color="#fff" />
          <Text style={styles.statText}>{formatDuration(item.totalTime)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.difficultyButton,
          { backgroundColor: getDifficultyColor(item.difficulty) }
        ]}
        onPress={() => setSelectedWorkout(item.id)}
      >
        <Text style={styles.difficultyText}>
          {getDifficultyIcon(item.difficulty)} {item.difficulty?.toUpperCase() || 'SET DIFFICULTY'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={themeColors[settings.theme]} style={styles.container}>
      <Text style={styles.title}>Workout Stats</Text>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="trophy" size={28} color="#FFD700" />
          <Text style={styles.summaryNumber}>{totalWorkouts}</Text>
          <Text style={styles.summaryLabel}>Total{'\n'}Workouts</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="flame" size={28} color="#FF6B6B" />
          <Text style={styles.summaryNumber}>{totalRoundsCompleted}</Text>
          <Text style={styles.summaryLabel}>Total{'\n'}Rounds</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="time" size={28} color="#4ECDC4" />
          <Text style={styles.summaryNumber}>
            {Math.floor(totalTimeSpent / 60)}m
          </Text>
          <Text style={styles.summaryLabel}>Total{'\n'}Time</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="stats-chart" size={28} color="#95E1D3" />
          <Text style={styles.summaryNumber}>{averageRounds}</Text>
          <Text style={styles.summaryLabel}>Avg{'\n'}Rounds</Text>
        </View>
      </View>

      {/* Workout History */}
      <Text style={styles.sectionTitle}>Recent Workouts</Text>
      
      {workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="fitness-outline" size={64} color="rgba(255,255,255,0.5)" />
          <Text style={styles.emptyText}>No workouts yet</Text>
          <Text style={styles.emptySubtext}>Complete your first workout to see stats!</Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Difficulty Selection Modal */}
      <Modal
        visible={selectedWorkout !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedWorkout(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedWorkout(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How was this workout?</Text>
            
            <TouchableOpacity
              style={[styles.difficultyOption, { backgroundColor: '#4CAF50' }]}
              onPress={() => selectedWorkout && handleDifficultyChange(selectedWorkout, 'easy')}
            >
              <Text style={styles.difficultyOptionText}>😊 Easy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.difficultyOption, { backgroundColor: '#FF9800' }]}
              onPress={() => selectedWorkout && handleDifficultyChange(selectedWorkout, 'medium')}
            >
              <Text style={styles.difficultyOptionText}>😅 Medium</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.difficultyOption, { backgroundColor: '#F44336' }]}
              onPress={() => selectedWorkout && handleDifficultyChange(selectedWorkout, 'hard')}
            >
              <Text style={styles.difficultyOptionText}>🔥 Hard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedWorkout(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  
  summaryContainer: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  summaryCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    flex: 1,
    justifyContent: 'center',
    minHeight: 100,
  },
  summaryNumber: { fontSize: 22, fontWeight: "bold", color: "#fff", marginTop: 6, marginBottom: 4 },
  summaryLabel: { fontSize: 10, color: "#fff", textAlign: "center", lineHeight: 14 },

  sectionTitle: { fontSize: 22, fontWeight: "600", color: "#fff", marginBottom: 15 },
  
  listContainer: { paddingBottom: 100 },
  workoutCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  workoutHeaderLeft: { flex: 1 },
  workoutDate: { fontSize: 18, fontWeight: "600", color: "#fff" },
  workoutTime: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  
  workoutStats: { marginBottom: 12 },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statText: { fontSize: 15, color: "#fff", marginLeft: 10 },

  difficultyButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  difficultyText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 20, fontWeight: "600", color: "#fff", marginTop: 20 },
  emptySubtext: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "80%",
  },
  modalTitle: { fontSize: 20, fontWeight: "600", marginBottom: 20, textAlign: "center" },
  difficultyOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  difficultyOptionText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cancelButton: {
    padding: 15,
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: { color: "#666", fontSize: 16, fontWeight: "600" },
});