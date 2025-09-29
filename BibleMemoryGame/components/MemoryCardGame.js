import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const MemoryCardGame = ({ profile, onBack, onUpdateProfile }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>🃏 Memory Card Game</Text>
                <Text style={styles.subtitle}>Coming Soon!</Text>
                <Text style={styles.description}>
                    This exciting memory matching game is under development.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    backButton: {
        padding: 8,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        fontSize: 16,
        color: '#3498db',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 24,
        color: '#3498db',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
    },
});

export default MemoryCardGame;