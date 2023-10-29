rm ./code_examples/**/*.standardized.py 2>/dev/null
deno run -A ./compare.js --lang python --output compare.ignore --  ./code_examples/real.ignore/**/DPLL.py 