import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    TextInput,
    Alert,
} from 'react-native';

const ProfileSelection = ({ profiles, onProfileSelect, onSaveProfiles }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileAge, setNewProfileAge] = useState('');

    const avatarColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
    ];

    const getAgeGroup = (age) => {
        if (age >= 2 && age <= 4) return 'beginner';
        if (age >= 5 && age <= 7) return 'intermediate';
        if (age >= 8) return 'advanced'; // I don't want an age restriction, will adjust for ages further down the road.
        return 'intermediate'; // default
    };

    const getDifficultyLabel = (age) => {
        const group = getAgeGroup(age);
        switch(group) {
            case 'beginner': return 'Beginner (Ages 2-4)';
            case 'intermediate': return 'Intermediate (Ages 5-7)';
            case 'advanced': return 'Advanced (Ages 8-12)';
            default: return 'Intermediate';
        }
    };
    
    const createProfile = () => {
        if (!newProfileName.trim()) {
            Alert.alert('Error', 'Please enter a name.');
            return;
        }

        const age = parseInt(newProfileAge);
        if (!age || age < 2) {
            Alert.alert('Error', 'This app is designed for ages 2+');
            return;
        }

        const newProfile = {
            id: Date.now().toString(),
            name: newProfileName.trim(),
            age: age,
            ageGroup: getAgeGroup(age),
            avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
            stats: {
                gamesPlayed: 0,
                totalScore: 0,
                bestTime: null,
                favoriteMode: null,
                versesMemorized: [],
            },
            progress: {
                unlockedVerses: [],
                currentLevel: 1,
            },
            createdAt: new Date().toISOString,
        };

        const updatedProfiles = [...profiles, newProfile];
        onSaveProfiles(updatedProfiles);

        setNewProfileName('');
        setNewProfileAge('');
        setShowCreateModal(false);
    };

    const deleteProfile = (profileId) => {
        Alert.alert(
            'Delete Profile',
            'Are you sure you want to delete this profile? All progess will be lost.',
            [
                { text: 'Cancel', style:'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedProfiles = profiles.filter(p => p.id != profileId);
                        onSaveProfiles(updatedProfiles);
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bible Memory Game</Text>
            <Text style={styles.subtitle}>Choose Your Profile</Text>

            <ScrollView style={styles.profileList} showsVerticalScrollIndicator={false}>
                {profiles.map((profile) => (
                    <TouchableOpacity
                        key={profile.id}
                        style={styles.profileCard}
                        onPress={() => onProfileSelect(profile)}
                        onLongPress={() => deleteProfile(profile.id)}
                    >
                        <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
                            <Text style={styles.avatarText}>
                                {profile.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{profile.name}</Text>
                            <Text style={styles.profileAge}>{getDifficultyLabel(profile.age)}</Text>
                            <Text style={styles.profileStats}>
                                Games: {profile.stats.gamesPlayed} • Score: {profile.stats.totalScore}
                            </Text>
                        </View>

                        <View style={styles.arrowContainer}>
                            <Text style={styles.arrow}>→</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={styles.createProfileCard}
                    onPress={() => setShowCreateModal(true)}
                >
                    <View style={styles.createProfileIcon}>
                        <Text style={styles.createProfileText}>+</Text>
                    </View>
                    <Text style={styles.createProfileLabel}>Create New Profile</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={showCreateModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create New Profile</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter name"
                            value={newProfileName}
                            onChangeText={setNewProfileName}
                            maxLength={20}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Enter age (2-12)"
                            value={newProfileAge}
                            onChangeText={setNewProfileAge}
                            keyboardType="numeric"
                            maxLength={2}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowCreateModal(false);
                                    setNewProfileName('');
                                    setNewProfileAge('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.createButton]}
                                onPress={createProfile}
                            >
                                <Text style={styles.createButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
        marginTop: 40,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        color: '#7f8c8d',
        marginBottom: 30,
    },
    profileList: {
        flex: 1,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
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
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    profileAge: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
    profileStats: {
        fontSize: 12,
        color: '#95a5a6',
        marginTop: 4,
    },
    arrowContainer: {
        padding: 8,
    },
    arrow: {
        fontSize: 20,
        color: '#bdc3c7',
    },
    createProfileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#3498db',
        borderStyle: 'dashed',
    },
    createProfileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    createProfileText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    createProfileLabel: {
        fontSize: 16,
        color: '#3498db',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        width: '80%',
        maxWidth: 300,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#2c3e50',
    },
    input: {
        borderWidth: 1,
        borderColor: '#bdc3c7',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ecf0f1',
        marginRight: 8,
    },
    createButton: {
        backgroundColor: '#3498db',
        marginLeft: 8,
    },
    cancelButtonText: {
        color: '#7f8c8d',
        fontWeight: '600',
    },
    createButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default ProfileSelection;
