// Bible verse data organized by difficulty level

const beginnerVerses = [
    {
        text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        reference: "John 3:16",
        category: "salvation"
    },
    {
        text: "Jesus said to him, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
        reference: "John 14:6",
        category: "salvation"
    },
    {
        text: "The Lord is my shepherd, I lack nothing.",
        reference: "Psalm 23:1",
        category: "comfort"
    },
    {
        text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
        reference: "Joshua 1:9",
        category: "courage"
    },
    {
        text: "In the beginning God created the heavens and the earth.",
        reference: "Genesis 1:1",
        category: "creation"
    },
    {
        text: "Jesus Christ is the same yesterday and today and forever.",
        reference: "Hebrews 13:8",
        category: "character"
    },
    {
        text: "For by grace you have been saved through faith, and this is not your own doing; it is the gift of God.",
        reference: "Ephesians 2:8",
        category: "salvation"
    },
];

const intermediateVerses = [
    {
        text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
        reference: "Proverbs 3:5-6",
        category: "trust"
    },
    {
        text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
        reference: "Romans 8:28",
        category: "comfort"
    },
    {
        text: "I can do all this through him who gives me strength.",
        reference: "Philippians 4:13",
        category: "strength"
    },
    {
        text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
        reference: "Philippians 4:6",
        category: "anxiety"
    },
    {
        text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
        reference: "Matthew 6:33",
        category: "priorities"
    },
    {
        text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
        reference: "1 Corinthians 13:4",
        category: "love"
    },
    {
        text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
        reference: "Joshua 1:9",
        category: "courage"
    },
    {
        text: "Cast all your anxiety on him because he cares for you.",
        reference: "1 Peter 5:7",
        category: "anxiety"
    },
    {
        text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
        reference: "Zephaniah 3:17",
        category: "love"
    },
];

const advancedVerses = [
    {
        text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
        reference: "2 Corinthians 5:17",
        category: "salvation"
    },
    {
        text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work.",
        reference: "2 Timothy 3:16-17",
        category: "scripture"
    },
    {
        text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me.",
        reference: "2 Corinthians 12:9",
        category: "grace"
    },
    {
        text: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it.",
        reference: "1 Corinthians 10:13",
        category: "temptation"
    },
    {
        text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.",
        reference: "Galatians 5:22-23",
        category: "spirit"
    },
    {
        text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.",
        reference: "Matthew 6:34",
        category: "anxiety"
    },
    {
        text: "Train up a child in the way he should go; even when he is old he will not depart from it.",
        reference: "Proverbs 22:6",
        category: "wisdom"
    },
    {
        text: "Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they will be comforted.",
        reference: "Matthew 5:3-4",
        category: "beatitudes"
    },
    {
        text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
        reference: "Ephesians 2:10",
        category: "purpose"
    },
    {
        text: "Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.",
        reference: "Philippians 4:8",
        category: "mindset"
    },

    // These will always be growing, even if I have to put the whole Bible here...
];

// Helper function to get verses based on age group
export const getVersesForAgeGroup = (ageGroup) => {
    switch (ageGroup) {
        case 'beginner':
            return beginnerVerses;
        case 'intermediate':
            return intermediateVerses;
        case 'advanced':
            return advancedVerses;
        default:
            return intermediateVerses;
    }
};

// Get verses by category
export const getVersesByCategory = (category, ageGroup = 'intermediate') => {
    const verses = getVersesForAgeGroup(ageGroup);
    return verses.filter(verses => verses.category == category);
};

// Get random verses
export const getRandomVerses = (count, ageGroup = 'intermediate') => {
    const verses = getVersesForAgeGroup(ageGroup);
    const shuffled = [...verses].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
};

// Get all categories for an age group
export const getCategoriesForAgeGroup = (ageGroup) => {
    const verses = getVersesForAgeGroup(ageGroup);
    const categories = [...new Set(verses.map(verse => verse.category))];
    return categories;
};

// Search verses by text content
export const searchVerses = (searchTerm, ageGroup = 'intermediate') => {
    const verses = getVersesForAgeGroup(ageGroup);
    return verses.filter(verse => 
        verse.text.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
        verse.getVersesForAgeGroup.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    );
};

export default {
    beginnerVerses,
    intermediateVerses,
    advancedVerses,
    getVersesForAgeGroup,
    getVersesByCategory,
    getRandomVerses,
    getCategoriesForAgeGroup,
    searchVerses,
};
