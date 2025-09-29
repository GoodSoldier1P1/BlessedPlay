import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ProfileSelection from './components/ProfileSelection';
import MainMenu from './components/MainMenu';
import DragDropGame from './components/DragDropGame';
import MemoryCardGame from './components/MemoryCardGame';
import QuizGame from './components/QuizGame';
import TimedChallenge from './components/TimedChallenge';

const App = () => {
    const [currentScreen, setCurrentScreen] = useState('profiles');
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [gameMode, setGameMode] = useState(null);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            const savedProfiles = await AsyncStorage.getItem('userProfiles');
            if (savedProfiles) {
                setProfiles(JSON.parse(savedProfiles));
            }
        } catch (error) {
            console.log('Error loading profiles:', error);
        }
    };

    const saveProfiles = async (newProfiles) => {
        try {
            await AsyncStorage.setItem('userProfiles', JSON.stringify(newProfiles));
            setProfiles(newProfiles);
        } catch (error) {
            console.log('Error saving profiles:', error);
        }
    };

    const handleProfileSelect = (profile) => {
        setSelectedProfile(profile);
        setCurrentScreen('menu');
    };

    const handleGameModeSelect = (mode) => {
        setGameMode(mode);
        setCurrentScreen('game');
    };

    const handleBackToMenu = () => {
        setCurrentScreen('menu');
        setGameMode(null);
    };

    const handleBackToProfiles = () => {
        setCurrentScreen('profiles');
        setSelectedProfile(null);
        setGameMode(null);
    };

    const renderCurrentScreen = () => {
        switch (currentScreen) {
            case 'profiles':
                return (
                    <ProfileSelection
                        profiles={profiles}
                        onProfileSelect={handleProfileSelect}
                        onSaveProfiles={saveProfiles}
                    />
                );

            case 'menu':
                return (
                    <MainMenu
                        profile={selectedProfile}
                        onGameModeSelect={handleGameModeSelect}
                        onBackToProfiles={handleBackToProfiles}
                    />
                );

            case 'game':
                return renderGame();

            default:
                return null;
        }
    };

    const renderGame = () => {
        const gameProps = {
            profile: selectedProfile,
            onBack: handleBackToMenu,
            onUpdateProfile: updateProfile,
        };

        switch (gameMode) {
            case 'dragdrop':
                return <DragDropGame {...gameProps} />;
            case 'memory':
                return <MemoryCardGame {...gameProps} />;
            case 'quiz':
                return <QuizGame {...gameProps} />;
            case 'timed':
                return <TimedChallenge {...gameProps} />;
            default:
                return null;
        }
    };

    const updateProfile = async (updatedProfile) => {
        const updatedProfiles = profiles.map(profile =>
            profile.id === updatedProfile.id ? updatedProfile : profile
        );
        await saveProfiles(updatedProfiles);
        setSelectedProfile(updatedProfile);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
            {renderCurrentScreen()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
});

export default App;