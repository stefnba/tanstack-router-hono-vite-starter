/**
 * Pluralize a word based on the count.
 * @param count - The count of the word.
 * @param word - The word to pluralize.
 * @returns The pluralized word.
 */
export const pluralize = (count: number, word: string) => {
    return count === 1 ? word : `${word}s`;
};
