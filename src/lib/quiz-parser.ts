export interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const parseQuizDescription = (description: string): ParsedQuestion[] => {
  try {
    const qBlocks = description
      .split("---")
      .filter((block) => block.includes("Q"));
    return qBlocks
      .map((block) => {
        const lines = block.trim().split("\n");
        const question = lines[0].replace(/### Q\d+: /, "").trim();
        const options = lines
          .filter((l) => l.startsWith("- "))
          .map((l) => l.replace("- ", "").replace(" (Correct)", "").trim());
        const correctAnswerLine = lines.find((l) => l.includes("(Correct)"));
        const correctAnswer = correctAnswerLine
          ? correctAnswerLine.replace("- ", "").replace(" (Correct)", "").trim()
          : "";
        const explanation =
          lines
            .find((l) => l.includes("**Explanation:**"))
            ?.replace("**Explanation:**", "")
            .trim() || "";

        return { question, options, correctAnswer, explanation };
      })
      .filter((q) => q.question && q.options.length > 0);
  } catch (error) {
    console.error("Failed to parse quiz content:", error);
    return [];
  }
};
