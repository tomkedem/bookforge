"""
Tests for markdown asterisk cleanup functions.
Ensures Word formatting artifacts are properly cleaned.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from pipeline.ingest import _clean_markdown_asterisks
from pipeline.parse import _clean_markdown_final, _clean_heading


class TestCleanMarkdownAsterisks:
    """Tests for ingest.py _clean_markdown_asterisks function."""
    
    def test_four_asterisks_become_two(self):
        assert _clean_markdown_asterisks("****text****") == "**text**"
    
    def test_adjacent_bold_merged(self):
        result = _clean_markdown_asterisks("**word1****word2**")
        assert "****" not in result
    
    def test_spaced_markers_become_space(self):
        assert _clean_markdown_asterisks("** **") == ""
    
    def test_hebrew_prefix_moved_inside(self):
        result = _clean_markdown_asterisks("ה**טקסט**")
        assert result == "**הטקסט**"
    
    def test_colon_pattern_fixed(self):
        result = _clean_markdown_asterisks("**:**")
        assert result == ":"


class TestCleanMarkdownFinal:
    """Tests for parse.py _clean_markdown_final function."""
    
    def test_colon_pattern(self):
        assert _clean_markdown_final("**:**") == ":"
        assert _clean_markdown_final("text**:**") == "text:"
    
    def test_trailing_period(self):
        result = _clean_markdown_final("text**.")
        assert result.endswith(".")
        assert "**" not in result
    
    def test_comma_between_bold(self):
        result = _clean_markdown_final("**a**, **b**")
        assert "**, **" not in result
    
    def test_fragmented_bold_merged(self):
        result = _clean_markdown_final("**first** **second**")
        # Should merge into single bold or clean up
        assert "** **" not in result
    
    def test_hebrew_prefix_fixed(self):
        result = _clean_markdown_final("ה**טקסט**")
        assert result == "**הטקסט**"
    
    def test_quotes_cleaned(self):
        result = _clean_markdown_final('"**text**"')
        assert result == '"text"'
    
    def test_four_plus_asterisks(self):
        result = _clean_markdown_final("text****more")
        assert "****" not in result
    
    def test_label_pattern(self):
        # Pattern: שלב א**: should become **שלב א:
        result = _clean_markdown_final(" שלב א**:")
        assert "**:" not in result
    
    def test_multiple_spaces_cleaned(self):
        result = _clean_markdown_final("text  with   spaces")
        assert "  " not in result


class TestCleanHeading:
    """Tests for parse.py _clean_heading function."""
    
    def test_removes_all_asterisks(self):
        result = _clean_heading("**פרק 1**: מבוא")
        assert "*" not in result
        assert "פרק 1: מבוא" in result
    
    def test_removes_triple_asterisks(self):
        result = _clean_heading("***bold italic***")
        assert "*" not in result
    
    def test_cleans_multiple_spaces(self):
        result = _clean_heading("word1  word2   word3")
        assert "  " not in result


# Run tests with pytest
if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
