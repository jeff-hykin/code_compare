### What is this?

A tool for effectively creating a dependency matrix between many different files. Things that common to the whole group of files are effectively ignored. Currently the tool supports python, but it is fairly generic and Javascript support is planned for the future.

### How does it work?

1. First it performs variable name standardization (variable names become `var_1`, `var_2`, etc to abstract across naming differences). Note the code maintains its functionality as variable scope is repspected (full language parsing, not regex find-and-replace)
2. Comments are removed
3. A code formatter is used standardized any whitespace/indentation/folding differences
4. The core step is stocastic process:
- pick random string chunks (varying length)
- seeing what documents those string chunks belong to
- chunks that only belong to 1 document are "boring"
- chunks that belong to 100% of the documents are "boring"
- the chunk-length is optimized to prefer non-boring chunks
- two documents that share a chunk are considered more similar
- once each document's "top-4 most-similar other documents" have stablized, the process ends
5. The output is saved into a json file where:
- The `relativeCounts` can be thought of as simply a similarity score for every pair
- The `frequencyMatrix` is the number-of-chunks-in-common for every pairwise combination
- The `commonalityCounts` is the distribution of the chunks. The keys are number-of-documents, and the values are quantity of chunks. There will likely be a lot of chunks for `1` (e.g. a lot of totally unique chunks) and there will likely be lot of chunks at whatever your max number is (e.g. a lot of chunks appear in every document)

### How to install

1. Get Deno:

```sh
s=https://deno.land/install.sh;sh -s v1.36.1 <<<"$(curl -fsSL $s || wget -qO- $s)"
export PATH="$HOME/.deno/bin:$PATH"
```

2. Get python black 

`pip install black`

3. Then install code_compare:

```sh
deno install -n code_compare -A https://deno.land/x/code_compare/compare.js
```

### How to use

```sh
# quick
code_compare --lang python --  ./file1.py ./file2.py ./file3.py ...
# more options
#    certainty = 90 will be faster but obviously reduces accuracy
#                specifically it means that it will stop as soon as 90% of the document have a stable top-4 (over an average of the last 10 iterations)
code_compare --lang python --output compare.ignore --certainty 90 --  ./file1.py ./file2.py ./file3.py ...
```
