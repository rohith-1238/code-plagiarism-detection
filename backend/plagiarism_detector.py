"""
plagiarism_detector.py
======================
Core Machine Learning module for code plagiarism detection.

Pipeline:
  1. Preprocess code (remove comments, normalize, tokenize)
  2. Extract features (TF-IDF vectors)
  3. Compute similarity (Cosine + Jaccard)
  4. Return scored pairs with matching segments
"""

import re
import string
import numpy as np
from itertools import combinations
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ─────────────────────────────────────────────────────────────────────────────
# 1. CODE PREPROCESSOR
# ─────────────────────────────────────────────────────────────────────────────

class CodePreprocessor:
    """Cleans and normalises source code before feature extraction."""

    # Patterns for comment removal per language family
    _SINGLE_LINE_COMMENT = re.compile(r'//.*?$|#.*?$', re.MULTILINE)
    _MULTI_LINE_COMMENT  = re.compile(r'/\*.*?\*/', re.DOTALL)
    _PYTHON_DOCSTRING    = re.compile(r'(""".*?"""|\'\'\'.*?\'\'\')', re.DOTALL)

    # Variable / identifier normalisation
    _IDENTIFIER          = re.compile(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b')

    # Python reserved keywords (kept as-is)
    PYTHON_KEYWORDS = {
        'False','None','True','and','as','assert','async','await',
        'break','class','continue','def','del','elif','else','except',
        'finally','for','from','global','if','import','in','is','lambda',
        'nonlocal','not','or','pass','raise','return','try','while','with','yield',
    }

    # Common built-ins / types kept as-is
    BUILTINS = {
        'int','float','str','bool','list','dict','tuple','set','len',
        'range','print','input','type','isinstance','append','extend',
        'public','private','protected','static','void','class','new',
        'return','import','from','if','else','elif','for','while',
        'function','var','let','const','this','self',
    }

    def __init__(self, language: str = 'python'):
        self.language = language.lower()

    def remove_comments(self, code: str) -> str:
        """Strip single-line, multi-line, and docstring comments."""
        code = self._PYTHON_DOCSTRING.sub('', code)
        code = self._MULTI_LINE_COMMENT.sub('', code)
        code = self._SINGLE_LINE_COMMENT.sub('', code)
        return code

    def remove_whitespace(self, code: str) -> str:
        """Collapse extra whitespace; keep newlines for structure."""
        lines = [line.strip() for line in code.splitlines()]
        lines = [l for l in lines if l]          # drop empty lines
        return ' '.join(lines)

    def normalize_identifiers(self, code: str) -> str:
        """
        Replace user-defined identifiers with generic tokens (VAR_0, VAR_1, …).
        Keywords and built-ins are kept unchanged.
        """
        mapping = {}
        counter = [0]

        def replace(match):
            word = match.group(0)
            if word in self.PYTHON_KEYWORDS or word in self.BUILTINS:
                return word
            if word not in mapping:
                mapping[word] = f'VAR_{counter[0]}'
                counter[0] += 1
            return mapping[word]

        return self._IDENTIFIER.sub(replace, code)

    def tokenize(self, code: str) -> list[str]:
        """Split processed code into a list of tokens."""
        # Split on whitespace and punctuation
        tokens = re.findall(r'\b\w+\b|[^\w\s]', code)
        return [t for t in tokens if t.strip()]

    def preprocess(self, code: str) -> tuple[str, list[str]]:
        """
        Full preprocessing pipeline.
        Returns (clean_string, token_list).
        """
        code = self.remove_comments(code)
        code = self.remove_whitespace(code)
        code = self.normalize_identifiers(code)
        tokens = self.tokenize(code)
        clean = ' '.join(tokens)
        return clean, tokens


# ─────────────────────────────────────────────────────────────────────────────
# 2. SIMILARITY CALCULATOR
# ─────────────────────────────────────────────────────────────────────────────

class SimilarityCalculator:
    """Computes Cosine and Jaccard similarity between code documents."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            analyzer='word',
            ngram_range=(1, 3),          # unigrams + bigrams + trigrams
            min_df=1,
            sublinear_tf=True,
        )

    def cosine_similarity(self, texts: list[str]) -> np.ndarray:
        """Return an N×N cosine-similarity matrix for a list of texts."""
        if len(texts) < 2:
            return np.array([[1.0]])
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        return cosine_similarity(tfidf_matrix)

    @staticmethod
    def jaccard_similarity(tokens_a: list[str], tokens_b: list[str]) -> float:
        """Jaccard index on token sets."""
        set_a, set_b = set(tokens_a), set(tokens_b)
        if not set_a and not set_b:
            return 1.0
        intersection = set_a & set_b
        union = set_a | set_b
        return len(intersection) / len(union) if union else 0.0

    @staticmethod
    def find_matching_segments(tokens_a: list[str], tokens_b: list[str],
                               min_length: int = 5) -> list[dict]:
        """
        Detect common contiguous token sequences (≥ min_length tokens).
        Returns a list of {segment, length} dicts.
        """
        matches = []
        i = 0
        while i < len(tokens_a):
            j = 0
            while j < len(tokens_b):
                # Find the length of common sequence starting at i, j
                length = 0
                while (i + length < len(tokens_a) and
                       j + length < len(tokens_b) and
                       tokens_a[i + length] == tokens_b[j + length]):
                    length += 1
                if length >= min_length:
                    segment = ' '.join(tokens_a[i:i + length])
                    matches.append({'segment': segment, 'length': length})
                    j += length
                else:
                    j += 1
            i += 1
        # Deduplicate by segment text
        seen, unique = set(), []
        for m in matches:
            if m['segment'] not in seen:
                seen.add(m['segment'])
                unique.append(m)
        return sorted(unique, key=lambda x: x['length'], reverse=True)[:10]


# ─────────────────────────────────────────────────────────────────────────────
# 3. PLAGIARISM DETECTOR  (main API)
# ─────────────────────────────────────────────────────────────────────────────

class PlagiarismDetector:
    """
    Orchestrates preprocessing, feature extraction, and similarity scoring
    for a collection of code files.
    """

    def __init__(self, language: str = 'python'):
        self.preprocessor = CodePreprocessor(language)
        self.calculator   = SimilarityCalculator()

    def analyze(self, files: dict[str, str]) -> dict:
        """
        Analyse plagiarism across multiple code files.

        Parameters
        ----------
        files : dict  {filename: code_string}

        Returns
        -------
        dict with keys:
            file_names       – list of filenames
            pairs            – list of pairwise results
            overall_score    – highest similarity score found
            similarity_matrix – N×N matrix (list-of-lists)
        """
        if len(files) < 2:
            return {'error': 'At least 2 files required for comparison.'}

        names  = list(files.keys())
        codes  = list(files.values())

        # Preprocess every file
        processed_texts  = []
        processed_tokens = []
        for code in codes:
            clean, tokens = self.preprocessor.preprocess(code)
            processed_texts.append(clean)
            processed_tokens.append(tokens)

        # Cosine similarity matrix
        cos_matrix = self.calculator.cosine_similarity(processed_texts)

        # Build pairwise results
        pairs = []
        max_score = 0.0

        for (i, j) in combinations(range(len(names)), 2):
            cos_score     = float(cos_matrix[i, j]) * 100          # → percentage
            jac_score     = self.calculator.jaccard_similarity(
                                processed_tokens[i], processed_tokens[j]) * 100
            # Weighted average (cosine weighted more heavily)
            combined_score = round(0.7 * cos_score + 0.3 * jac_score, 2)
            max_score = max(max_score, combined_score)

            matches = self.calculator.find_matching_segments(
                processed_tokens[i], processed_tokens[j])

            pairs.append({
                'file1':            names[i],
                'file2':            names[j],
                'cosine_similarity':  round(cos_score, 2),
                'jaccard_similarity': round(jac_score, 2),
                'combined_score':   combined_score,
                'verdict':          self._verdict(combined_score),
                'matching_segments': matches,
                'token_count_1':    len(processed_tokens[i]),
                'token_count_2':    len(processed_tokens[j]),
            })

        # N×N matrix as list-of-lists (for heatmap)
        sim_matrix = [
            [round(float(cos_matrix[i, j]) * 100, 2) for j in range(len(names))]
            for i in range(len(names))
        ]

        return {
            'file_names':       names,
            'pairs':            sorted(pairs, key=lambda x: x['combined_score'], reverse=True),
            'overall_score':    round(max_score, 2),
            'similarity_matrix': sim_matrix,
        }

    @staticmethod
    def _verdict(score: float) -> str:
        if score >= 80:
            return 'HIGH PLAGIARISM'
        elif score >= 50:
            return 'MODERATE PLAGIARISM'
        elif score >= 20:
            return 'LOW SIMILARITY'
        else:
            return 'ORIGINAL'
