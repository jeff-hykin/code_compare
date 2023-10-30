# rm ./code_examples/**/*.standardized.py 2>/dev/null
deno run -A ./compare.js --lang python --output compare.ast.ignore --stages '["removeComments","format","toAst"]' --certainty 95 --  ./code_examples/real.ignore/**/DPLL.py 
# code_compare --lang python --output compare.ignore --certainty 4 --  ./code_examples/real.ignore/**/DPLL.py 