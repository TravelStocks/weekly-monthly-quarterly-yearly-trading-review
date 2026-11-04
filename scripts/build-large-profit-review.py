"""Build the >2% profit archive using the same reconciled trades as the loss archive."""
import importlib.util
from pathlib import Path
import sys

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('trade_review_builder', Path(__file__).with_name('build-large-loss-review.py'))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

if __name__ == '__main__':
    builder.build('profit')
