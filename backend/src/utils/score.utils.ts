export type SimilarityResult = {
  similarity: number;
};

export type ScoreInput = {
  biasScore: number;
  similarities: SimilarityResult[];
};

export function calculateScores(
  { biasScore, similarities }: ScoreInput,
  similarityThreshold = 0.75
) {
  if (similarities.length === 0) {
    return {
      biasScore,
      hallucinationScore: 1,
      sourceConfidence: 0
    };
  }

  const similarityValues = similarities.map((item) => item.similarity);
  const averageSimilarity =
    similarityValues.reduce((sum, value) => sum + value, 0) / similarities.length;
  const supportingSources = similarityValues.filter((value) => value >= similarityThreshold).length;

  return {
    biasScore,
    hallucinationScore: Number((1 - averageSimilarity).toFixed(2)),
    sourceConfidence: Number((supportingSources / similarities.length).toFixed(2))
  };
}
