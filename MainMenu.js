import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';

const MainMenu = ({ profile, onGameModeSelect, onBackToProfiles }) => {
    const gameModesOrder = [
        {
            id: 'dragdrop',
            title: 'Drag & Drop',
            description: 'Match verses to their references by dragging',
            icon: '🎯',
            difficulty: 'Easy',
            estimatedTime: '3-5 min',
        },
        {
            id: 'memory',
            title: 'Memory Cards',
            description: 'Classic concentration game with Bible Verses',
            icon: '🃏',
            difficulty: 'Medium',
            estimatedTime: '5-8 min',
        },
        {
            id: 'quiz',
            title: 'Multiple Choice',
            description: 'Choose the correct reference for each verse',
            icon: '📝',
            difficulty: 'Easy',
            estimatedTime: '2-4 min',
        },
        {
            id: 'timed',
            title: 'Timed Challenge',
            description: 'Race against the clock for bonus points',
            icon: '⏱️',
            difficulty: 'Hard',
            estimatedTime: '3-6 min',
        },

    ];
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return '#2ecc71';
            case 'Medium': return '#f39c12';
            case 'Hard': return '#e74c3c';
            default: return '#95a5a6';
        }
    };
}

return (
    <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={onBackToProfiles}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.profileHeader}>
                <View style={[styles.profileAvatar, { backgroundColor: profile.avatarColor }]}>
                    <Text style={styles.profileAvatarText}>
                        {profile.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.profileName}>{profile.name}!</Text>
                </View>
            </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{profile.stats.gamesPlayed}</Text>
                <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{profile.stats.totalScore}</Text>
                <Text style={styles.statLabel}>Total Score</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{profile.stats.versesMemorized.length}</Text>
                <Text style={styles.statLabel}>Verses</Text>
            </View>
        </View>

        {/* Game Modes */}
        <Text style={styles.sectionTitle}>Choose Your Game</Text>

        <ScrollView style={styles.gamesList} showsVerticalScrollIndicator={false}>
            {gameModesOrder.map((mode) => (
                <TouchableOpacity
                    key={mode.id}
                    style={styles.gameModeCard}
                    onPress={() => onGameModeSelect(mode.id)}
                    activeOpacity={0.8}
                >
                    <View style={styles.gameModeHeader}>
                        <View style={styles.gameModeIcon}>
                            <Text style={styles.gameModeIconText}>{mode.icon}</Text>
                        </View>
                        <View style={styles.gameModeInfo}>
                            <Text style={styles.gameModeTitle}>{mode.title}</Text>
                            <Text style={styles.gameModeDescription}>{mode.description}</Text>
                        </View>
                    </View>

                    <View style={styles.gameModeDetails}>
                        <View style={styles.difficultyBadge}>
                            <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(mode.difficulty) }]} />
                            <Text style={styles.difficultyText}>{mode.difficulty}</Text>
                        </View>
                        <Text style={styles.estimatedTime}>{mode.estimatedTime}</Text>
                    </View>
                </TouchableOpacity>
            ))}

            {/* Versus Mode Section */}
            <View style={styles.versusSection}>
                <Text style={styles.versusSectionTitle}>🏆 Multiplayer Modes</Text>

                <TouchableOpacity
                    style={styles.versusCard}
                    onPress={() => onGameModeSelect('versus')}
                >
                    <Text style={styles.versusTitle}>Versus Mode</Text>
                    <Text style={styles.versusDescription}>
                        Compete with friends and family
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.helperCard}
                    onPress={() => onGameModeSelect('helper')}
                >
                    <Text style={styles.helperTitle}>Helper Mode</Text>
                    <Text style={styles.helperDescription}>
                        Play with guidance from others
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#3498db',
        fontWeight: '600',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginRight: 40, // Offset for back button
    },
    profileAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileAvatarText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    welcomeText: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3498db',
    },
    statLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    gamesList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    gameModeCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gameModeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    gameModeIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#ecf0f1',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    gameModeIconText: {
        fontSize: 24,
    },
    gameModeInfo: {
        flex: 1,
    },
    gameModeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    gameModeDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
    gameModeDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    difficultyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    difficultyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    difficultyText: {
        fontSize: 12,
        color: '#7f8c8d',
        fontWeight: '600',
    },
    estimatedTime: {
        fontSize: 12,
        color: '#95a5a6',
    },
    versusSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    versusSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
    },
    versusCard: {
        backgroundColor: '#e74c3c',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    versusTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    versusDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    helperCard: {
        backgroundColor: '#2ecc71',
        borderRadius: 12,
        padding: 16,
    },
    helperTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    helperDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
});

export default MainMenu;
