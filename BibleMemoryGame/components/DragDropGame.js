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

const { width: screenWidth } = Dimensions.get('window');

const DragDropGame = ({ profile, onBack, onUpdateProfile }) => {
    const [verses, setVerses] = useState([]);
    const [references, setReferences] = useState([]);
    const [matches, setMatches] = useState([]);
    const [score, setScore] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const timerRef = useRef(null);
    const referenceRefs = useRef({});
    const scrollViewRef = useRef(null);
    const scrollYOffset = useRef(0);

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

        const shuffledRefs = [...selectedVerses]
            .sort(() => Math.random() - 0.5)
            .map((verse, index) => ({
                id: `ref-${index}`,
                reference: verse.reference,
            }));

        setReferences(shuffledRefs);
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

    const calculateScore = () => {
        const baseScore = 100;
        const timeBonus = Math.max(50 - timeElapsed, 10);
        return baseScore + timeBonus;
    };

    const checkForMatch = (verse, dropX, dropY) => {
        // Check each reference to see if the verse was dropped on it
        for (let ref of references) {
            if (isMatched(ref.id)) continue;

            const refElement = referenceRefs.current[ref.id];
            if (!refElement) continue;

            refElement.measure((fx, fy, width, height, px, py) => {
                if (
                    dropX >= px &&
                    dropX <= px + width &&
                    dropY >= py &&
                    dropY <= py + height
                ) {
                    // Check if it's the correct match
                    if (verse.reference === ref.reference) {
                        const newMatch = {
                            verseId: verse.id,
                            referenceId: ref.id,
                            timestamp: Date.now(),
                            score: calculateScore(),
                        };

                        const newMatches = [...matches, newMatch];
                        setMatches(newMatches);
                        setScore(prev => prev + calculateScore());

                        if (newMatches.length === verses.length) {
                            setTimeout(() => completeGame(newMatches), 500);
                        }
                    } else {
                        Alert.alert('Try Again! 🤔', 'That verse doesn\'t match this reference.');
                    }
                }
            });
        }
    };

    const completeGame = (finalMatches) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setGameCompleted(true);

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
        initializeGame();
        startTimer();
    };

    const isMatched = (itemId) => {
        return matches.some(match =>
            match.verseId === itemId || match.referenceId === itemId
        );
    };

    const DraggableVerse = ({ verse }) => {
        const pan = useRef(new Animated.ValueXY()).current;
        const [isDragging, setIsDragging] = useState(false);
        const dragStartY = useRef(0);

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: () => !isMatched(verse.id),
                onStartShouldSetPanResponderCapture: () => !isMatched(verse.id),
                onMoveShouldSetPanResponder: (evt, gestureState) => {
                    return !isMatched(verse.id) && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
                },
                onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                    return !isMatched(verse.id) && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
                },
                onPanResponderGrant: (evt) => {
                    setIsDragging(true);
                    setScrollEnabled(false);
                    dragStartY.current = scrollYOffset.current;
                    pan.setOffset({
                        x: 0,
                        y: 0,
                    });
                    pan.setValue({ x: 0, y: 0 });
                },
                onPanResponderMove: (evt, gestureState) => {
                    pan.setValue({ x: gestureState.dx, y: gestureState.dy });

                    if (scrollViewRef.current) {
                        const screenHeight = Dimensions.get('window').height;
                        const currentY = evt.nativeEvent.pageY;

                        if (currentY > screenHeight - 150) {
                            const newOffset = dragStartY.current + Math.abs(gestureState.dy);
                            scrollViewRef.current.scrollTo({
                                y: newOffset,
                                animated: false,
                            });
                        }
                        else if (currentY < 250) {
                            const newOffset = Math.max(0, dragStartY.current - Math.abs(gestureState.dy));
                            scrollViewRef.current.scrollTo({
                                y: newOffset,
                                animated: false,
                            });
                        }
                    }
                },
                onPanResponderRelease: (evt) => {
                    setIsDragging(false);
                    setScrollEnabled(true);

                    const dropX = evt.nativeEvent.pageX;
                    const dropY = evt.nativeEvent.pageY;

                    checkForMatch(verse, dropX, dropY);

                    pan.flattenOffset();
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                        friction: 5,
                    }).start();
                },
                onPanResponderTerminate: () => {
                    setIsDragging(false);
                    setScrollEnabled(true);
                    pan.flattenOffset();
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start();
                },
            })
        ).current;

        if (isMatched(verse.id)) {
            return (
                <View style={[styles.verseCard, styles.matchedCard]}>
                    <Text style={styles.verseText}>{verse.text}</Text>
                    <Text style={styles.matchedLabel}>✓ Matched!</Text>
                </View>
            );
        }

        return (
            <Animated.View
                style={[
                    styles.verseCard,
                    isDragging && styles.draggingCard,
                    {
                        transform: [
                            { translateX: pan.x },
                            { translateY: pan.y },
                            { scale: isDragging ? 1.05 : 1 },
                        ],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                <Text style={styles.dragIcon}>☰</Text>
                <Text style={styles.verseText}>{verse.text}</Text>
                <Text style={styles.dragHint}>Hold & drag to match</Text>
            </Animated.View>
        );
    };

    const ReferenceDropZone = ({ reference }) => {
        return (
            <View
                ref={(ref) => {
                    if (ref) {
                        referenceRefs.current[reference.id] = ref;
                    }
                }}
                style={[
                    styles.referenceCard,
                    isMatched(reference.id) && styles.matchedCard,
                ]}
            >
                <Text style={styles.referenceText}>{reference.reference}</Text>
                {!isMatched(reference.id) && (
                    <Text style={styles.dropHint}>Drop verse here</Text>
                )}
                {isMatched(reference.id) && (
                    <Text style={styles.matchedLabel}>✓ Matched!</Text>
                )}
            </View>
        );
    };

    if (gameCompleted) {
        return (
            <View style={styles.container}>
                <View style={styles.completionScreen}>
                    <Text style={styles.completionTitle}>🎉 Wonderful!</Text>
                    <Text style={styles.completionSubtitle}>You matched all the verses!</Text>
                    <Text style={styles.completionScore}>Score: {score}</Text>
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
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.gameInfo}>
                    <Text style={styles.scoreText}>Score: {score}</Text>
                    <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
                </View>
            </View>

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
                    {matches.length} of {verses.length} matches found
                </Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.gameArea}
                contentContainerStyle={styles.gameContent}
                scrollEnabled={scrollEnabled}
                scrollEventThrottle={16}
                onScroll={(event) => {
                    if (scrollEnabled) {
                        scrollYOffset.current = event.nativeEvent.contentOffset.y;
                    }
                }}
                nestedScrollEnabled={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.instructionBox}>
                    <Text style={styles.instructionTitle}>📖 How to Play:</Text>
                    <Text style={styles.instructionText}>
                        Press and hold a verse card, then drag it to the matching reference below
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>📝 Bible Verses</Text>
                <View style={styles.versesColumn}>
                    {verses.map((verse) => (
                        <DraggableVerse key={verse.id} verse={verse} />
                    ))}
                </View>

                <Text style={styles.sectionTitle}>📍 References</Text>
                <View style={styles.referencesColumn}>
                    {references.map((ref) => (
                        <ReferenceDropZone key={ref.id} reference={ref} />
                    ))}
                </View>
            </ScrollView>
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
        paddingTop: 10,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    timerText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
    progressContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    progressBar: {
        height: 10,
        backgroundColor: '#ecf0f1',
        borderRadius: 5,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: 10,
        backgroundColor: '#2ecc71',
        borderRadius: 5,
    },
    progressText: {
        fontSize: 13,
        color: '#7f8c8d',
        textAlign: 'center',
        fontWeight: '500',
    },
    gameArea: {
        flex: 1,
    },
    gameContent: {
        padding: 20,
        paddingBottom: 40,
    },
    instructionBox: {
        backgroundColor: '#fff3cd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 14,
        color: '#856404',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16,
        marginTop: 20,
    },
    versesColumn: {
        gap: 16,
        marginBottom: 30,
    },
    referencesColumn: {
        gap: 16,
        marginBottom: 40,
    },
    verseCard: {
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#2196f3',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    draggingCard: {
        backgroundColor: '#bbdefb',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderColor: '#1976d2',
    },
    dragIcon: {
        fontSize: 20,
        color: '#1976d2',
        textAlign: 'center',
        marginBottom: 8,
    },
    verseText: {
        fontSize: 15,
        color: '#1a237e',
        lineHeight: 22,
        fontWeight: '500',
    },
    dragHint: {
        fontSize: 11,
        color: '#1976d2',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    referenceCard: {
        backgroundColor: '#fff9e6',
        borderRadius: 12,
        padding: 20,
        borderWidth: 3,
        borderColor: '#ff9800',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 90,
    },
    referenceText: {
        fontSize: 18,
        color: '#e65100',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    dropHint: {
        fontSize: 12,
        color: '#f57c00',
        marginTop: 8,
        fontStyle: 'italic',
    },
    matchedCard: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4caf50',
        borderStyle: 'solid',
    },
    matchedLabel: {
        fontSize: 14,
        color: '#2e7d32',
        fontWeight: 'bold',
        marginTop: 8,
        textAlign: 'center',
    },
    completionScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    completionTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
        textAlign: 'center',
    },
    completionSubtitle: {
        fontSize: 18,
        color: '#7f8c8d',
        marginBottom: 24,
        textAlign: 'center',
    },
    completionScore: {
        fontSize: 28,
        color: '#3498db',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    completionTime: {
        fontSize: 20,
        color: '#7f8c8d',
        marginBottom: 40,
    },
    completionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    playAgainButton: {
        backgroundColor: '#3498db',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
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
        paddingHorizontal: 32,
    },
    menuText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DragDropGame;