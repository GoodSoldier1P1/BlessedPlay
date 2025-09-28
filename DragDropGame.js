import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Animated,
    PanResponder,
    Alert,
} from 'react-native';

import { getVersesForAgeGroup } from '../data/verseData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DragDropGame = ({ profile, onBack, onUpdateProfile }) => {
    const [verses, setVerses] = useState([]);
    const [references, setReferences] = useState([]);
    const [matches, setMatches] = useState([]);
    const [score, setScore] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropZones, setDropZones] = useState({});
    const [gameCompleted, setGameCompleted] = useState(false);

    const timerRef = useRef(null);
    const panRef = useRef(null);

    useEffect(() => {
        initializeGame();
        startTimer();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const initializeGame = () => {
        const gameVerses = getVersesForAgeGroup(profile.ageGroup);
        const shuffledVerses = [...gameVerses].sort(() => Math.random() - 0.5);
        const selectedVerses = shuffledVerses.slice(0, getVerseCount(profile.ageGroup));

        setVerses(selectedVerses.map((verse, index) => ({
            ...verse,
            id: `verse-${index}`,
        })));

        // Shuffle references separately
        const shuffleRefs = [...selectedVerses]
            .sort(() => Math.random() - 0.5)
            .map((verse, index) => ({
                id: `ref-{index}`,
                reference: verse.reference,
                originalId: selectedVerses.findIndex(v => v.reference == verse.reference),
            }));

        setReferences(shuffledRefs);
        setGameStartTime(Date.now());
    };

    const getVerseCount = (ageGroup) => {
        switch (ageGroup) {
            case 'beginner': return 3;
            case 'intermediate': return 5;
            case 'advanced': return 7;
            default: return 5;
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateScore = (timeBonus = true) => {
        const baseScore = 100;
        const timeScore = timeBonus ? Math.max(50 - timeElapsed, 10) : 0;
        return baseScore + timeScore;
    };

    const handleDragStart = (item, type) => {
        setDraggedItem({ ...item, type });
    };

    const handleDrop = (targetItem, targetType) => {
        if (!draggedItem) return;

        // Only allow verse to reference matching
        if (draggedItem.type == 'verse' && targetType == 'reference') {
            const verseIndex = draggedItem.originalId || verses.findIndex(v => v.id == draggedItem.id);
            const isCorrectMatch = references[targetItem.originalId]?.reference == verses[verseIndex]?.reference;

            if (isCorrectMatch) {
                handleCorrectMatch(draggedItem, targetItem);
            } else {
                handleIncorrectMatch();
            }
        } else if (draggedItem.type == 'reference' && targetType == 'verse') {
            const refIndex = draggedItem.originalId;
            const verseIndex = targetItem.originalId || verses.findIndex(v => v.id == targetItem.id);
            const isCorrectMatch = verses[verseIndex]?.reference == references[refIndex]?.reference;

            if (isCorrectMatch) {
                handleCorrectMatch(targetItem, draggedItem);
            } else {
                handleIncorrectMatch();
            }
        }

        setDraggedItem(null);
    };

    const handleCorrectMatch = (verse, reference) => {
        const newMatch = {
            verseId: verse.id,
            referenceId: reference.id,
            timestamp: Date.now(),
            score: calculateScore(),
        };

        const newMatches = [...matches, newMatch];
        setMatches(newMatches);
        setScore(prev => prev + calculateScore());

        // Check if game is completed
        if (newMatches.length == verses.length) {
            completedGame(newMatches);
        }
    };

    const handleIncorrectMatch = () => {
        // Visual Feedback for incorrect match
        //could add shake animation or red flash
        console.log('Incorrect match');
    };

    const completeGame = (finalMatches) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setGameCompleted(true);

        //Update profile stats
        const updatedProfile = {
            ...profile,
            stats: {
                ...profile.stats,
                gamesPlayed: profile.stats.gamesPlayed + 1,
                totalScore: profile.stats.totalScore + score,
                bestTime: profile.stats.bestTime ? Math.min(profile.stats.bestTime, timeElapsed) : timeElapsed,
            },
        };

        onUpdateProfile(updatedProfile);
    };

    const restartGame = () => {
        setMatches([]);
        setScore(0);
        setTimeElapsed(0);
        setGameCompleted(false);
        setDraggedItem(null);
        initializeGame();
        startTimer();
    };

    const isMatched = (itemId, type) => {
        return matches.some(match =>
            (type == 'verse' && match.verseId == itemId) ||
            (type == 'references' && match.referenceId == itemId)
        );
    };
    const DraggableItem = ({ item, type, children }) => {
        const pan = useRef(new Animated.ValueXY()).current;
        const scale = useRef(new Animated.Value(1)).current;

        const panResponder = useRef(
            PanResponder.create({
                onMoveShouldSetPanResponder: () => !isMatched(item.id, type),
                onPanResponderGrant: () => {
                    handleDragStart(item, type);
                    Animated.spring(scale, { toValue: 1.1, useNativeDriver: false }).start();
                },
                onPanResponderMove: Animated.event(
                    [null, { dx: pan.x, dy: pan.y }],
                    { useNativeDriver: false }
                ),
                onPanResponderRelease: (evt, gestureState) => {
                    Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();

                    // Find drop target based on gesture position
                    const dropTarget = findDropTarget(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
                    if (dropTarget) {
                        handleDrop(dropTarget.item, dropTarget.type);
                    }

                    // Reset position
                    Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
                    setDraggedItem(null);
                },
            })
        ).current;

        const animatedStyle = {
            transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { scale: scale },
            ],
        };

        return (
            <Animated.View
                style={[animatedStyle, isMatched(item.id, type) && styles.matchedItem]}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        );
    };

    const findDropTarget = (x, y) => {
        // This would need to be implemented with proper coordinate checking
        // For now, return null - in a real implementation, you'd check coordinates
        // against registered drop zone positions
        return null;
    };

    if (gameCompleted) {
        return (
            <View style={styles.container}>
                <View style={styles.completionScreen}>
                    <Text style={styles.completionTitle}>🎉 Great Job!</Text>
                    <Text style={styles.completionScore}>Final Score: {score}</Text>
                    <Text style={styles.completionTime}>Time: {formatTime(timeElapsed)}</Text>

                    <View style={styles.completionButtons}>
                        <TouchableOpacity style={styles.playAgainButton} onPress={restartGame}>
                            <Text style={styles.playAgainText}>Play Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuButton} onPress={onBack}>
                            <Text style={styles.menuText}>Main Menu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.gameInfo}>
                    <Text style={styles.scoreText}>Score: {score}</Text>
                    <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${(matches.length / verses.length) * 100}%` }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {matches.length} of {verses.length} matches
                </Text>
            </View>

            <ScrollView style={styles.gameArea}>
                {/* Verses Section */}
                <Text style={styles.sectionTitle}>Bible Verses</Text>
                <View style={styles.itemsContainer}>
                    {verses.map((verse) => (
                        <DraggableItem key={verse.id} item={verse} type="verse">
                            <View style={[styles.verseCard, isMatched(verse.id, 'verse') && styles.matchedCard]}>
                                <Text style={styles.verseText}>{verse.text}</Text>
                            </View>
                        </DraggableItem>
                    ))}
                </View>

                {/* References Section */}
                <Text style={styles.sectionTitle}>References</Text>
                <View style={styles.itemsContainer}>
                    {references.map((ref) => (
                        <DraggableItem key={ref.id} item={ref} type="reference">
                            <View style={[styles.referenceCard, isMatched(ref.id, 'reference') && styles.matchedCard]}>
                                <Text style={styles.referenceText}>{ref.reference}</Text>
                            </View>
                        </DraggableItem>
                    ))}
                </View>
            </ScrollView>

            {/* Hint Button */}
            <TouchableOpacity style={styles.hintButton} onPress={() => { }}>
                <Text style={styles.hintButtonText}>💡 Hint</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#3498db',
        fontWeight: '600',
    },
    gameInfo: {
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    timerText: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    progressContainer: {
        padding: 20,
        backgroundColor: 'white',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#ecf0f1',
        borderRadius: 4,
        marginBottom: 8,
    },
    progressFill: {
        height: 8,
        backgroundColor: '#3498db',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
    },
    gameArea: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
        marginTop: 20,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    verseCard: {
        width: (screenWidth - 60) / 2,
        backgroundColor: '#e8f4fd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#3498db',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    verseText: {
        fontSize: 14,
        color: '#2c3e50',
        textAlign: 'center',
        lineHeight: 20,
    },
    referenceCard: {
        width: (screenWidth - 60) / 2,
        backgroundColor: '#fef9e7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#f39c12',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    referenceText: {
        fontSize: 16,
        color: '#2c3e50',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    matchedCard: {
        backgroundColor: '#d5f4e6',
        borderColor: '#2ecc71',
    },
    matchedItem: {
        opacity: 0.6,
    },
    hintButton: {
        backgroundColor: '#9b59b6',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        margin: 20,
        alignSelf: 'center',
    },
    hintButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    completionScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    completionTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    completionScore: {
        fontSize: 24,
        color: '#3498db',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    completionTime: {
        fontSize: 18,
        color: '#7f8c8d',
        marginBottom: 40,
    },
    completionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    playAgainButton: {
        backgroundColor: '#3498db',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    playAgainText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    menuButton: {
        backgroundColor: '#95a5a6',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    menuText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});


export default DragDropGame
