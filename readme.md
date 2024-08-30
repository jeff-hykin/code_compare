# What is this?

A tool for finding "rare" similarities between many different files.
- Text that shows up in all/most the files is ignored
- Text that is highly unique (ex: text that exists in two and only two files) is highly scored
- Larger strings of "rare" text are scored higher than shorter strings

Works with plaintext files, has special enhancements (formatting) for python, and in the future you can expect enhancements for other languages.

## How to use

```shell
# quick
code_compare --lang python --  ./file1.py ./file2.py ./file3.py ...
code_compare --lang none --  ./file1.txt ./file2.txt ./file3.txt ...

# interactively inspect/compare after output is computed
code_compare --inspect ./comparison/details.json

# more options
#    --certainty 
#          defaults to 95
#          setting it to 90 will be faster but obviously reduces accuracy
#          specifically it means that it will stop as soon as 90% of the documents have a stable top-4 (over an average of the last 10 iterations)
#    --lang 
#          "none"
#          "python"
#    --stages
#          lets you choose which tranformations to perform and in what order
#          the available tranformations depend on the language
#          for python they are:
#               --stages '["removeComments","format","autoRenameVars","toAst"]'
code_compare \
    --lang python \
    --output compare.ignore \
    --certainty 90 \
    -- ./file1.py ./file2.py ./file3.py ...
```


## How to install

1. Get Deno:

```sh
s=https://deno.land/install.sh;sh -s v1.36.1 <<<"$(curl -fsSL $s || wget -qO- $s)"
export PATH="$HOME/.deno/bin:$PATH"
```

2. Get python black (if you want the enhanced python support)

`pip install black`

3. Then install code_compare:

```sh
deno install -n code_compare -Af https://deno.land/x/code_compare/compare.js
```



## How does it work?

1. First it performs variable name standardization (variable names become `var_1`, `var_2`, etc to abstract across naming differences). Note the code maintains its functionality; the variable scope is respected and the names are replaced using full language parsing (not regex find-and-replace)
2. Comments are removed
3. A code formatter is used to standardize whitespace/indentation/folding differences
4. That standardized version of the file is then saved next to the original as `ORIGINAL_NAME.standardized`
5. Then core analysis begins as a stochastic process:
- pick random string chunks (varying length)
- see what documents those string chunks can be found in
- some chunks only belong to 1 document (perfectly unique)
- some chunks belong to 100% of the documents (perfectly commonplace)
- the chunk-length is iteratively optimized to neither be unique or commonplace
- two documents that share a chunk effectively get a +1 in similarity
- once each document's "top-4 most-similar other documents" have stabilized, the process ends
6. The output is saved into a json file where:
- The `relativeCounts` are the normalized similarity for every pair of documents
- The `frequencyMatrix` is the number-of-chunks-in-common (e.g. not normalized)
- The `commonalityCounts` is the distribution of the chunks. The keys are number-of-documents, and the values are quantity of chunks. There will likely be a lot of chunks for `1` (e.g. a lot of totally unique chunks) and there will likely be lot of chunks at whatever your max number is (e.g. a lot of chunks appear in every document)
