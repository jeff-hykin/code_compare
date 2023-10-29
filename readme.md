# What is this?

A tool for effectively creating a similarity matrix between many different files. It effectively ignores aspects that are common across all files by highlighting "rare" similarites (e.g. two files that are similar to each-other but not-similar to the rest of the group). Currently the tool supports python, but it is fairly generic and Javascript support is planned.

## How to use

```sh
# quick
code_compare --lang python --  ./file1.py ./file2.py ./file3.py ...

# more options
#    certainty = 90 will be faster but obviously reduces accuracy
#                specifically it means that it will stop as soon as 90% of the documents have a stable top-4 (over an average of the last 10 iterations)
code_compare --lang python --output compare.ignore --certainty 90 --  ./file1.py ./file2.py ./file3.py ...
```


## How to install

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



## How does it work?

1. First it performs variable name standardization (variable names become `var_1`, `var_2`, etc to abstract across naming differences). Note the code maintains its functionality; the variable scope is respected and the names are replaced using full language parsing (not regex find-and-replace)
2. Comments are removed
3. A code formatter is used standardized any whitespace/indentation/folding differences
4. The standardized/cleaned/formatted file is saved next to the original as `ORIGINA_NAME.standardized`
5. The core analysis is stocastic process:
- pick random string chunks (varying length)
- see what documents those string chunks can be found in
- chunks that only belong to 1 document (perfectly unique)
- chunks that belong to 100% of the documents (perfectly commonplace)
- the chunk-length is iteratively optimized to neither be unique or commonplace 
- two documents that share a chunk effectively get a +1 in similarity
- once each document's "top-4 most-similar other documents" have stablized, the process ends
6. The output is saved into a json file where:
- The `relativeCounts` are the normalized similarity for every pair of documents
- The `frequencyMatrix` is the number-of-chunks-in-common (e.g. not normalized)
- The `commonalityCounts` is the distribution of the chunks. The keys are number-of-documents, and the values are quantity of chunks. There will likely be a lot of chunks for `1` (e.g. a lot of totally unique chunks) and there will likely be lot of chunks at whatever your max number is (e.g. a lot of chunks appear in every document)