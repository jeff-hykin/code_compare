import { autoRenameVars, removeComments } from "https://raw.githubusercontent.com/jeff-hykin/code_unifier/bc9a70cc4ce8e71f38591a1c96e4fc22da20f50f/languages/python.js"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.47/main/file_system.js"
import { run, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo } from "https://deno.land/x/quickr@0.6.47/main/run.js"
import { zip, enumerate, count, permute, combinations, wrapAroundGet } from "https://deno.land/x/good@1.5.0.2/array.js"
import { parseCsv, createCsv } from "https://deno.land/x/good@1.5.0.2/csv.js"
import { stats, sum, spread, normalizeZeroToOne, roundedUpToNearest, roundedDownToNearest } from "https://deno.land/x/good@1.5.0.2/math.js"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString, regex, findAll, iterativelyFindAll, escapeRegexMatch, escapeRegexReplace, extractFirst, isValidIdentifier, removeCommonPrefix } from "https://deno.land/x/good@1.5.1.0/string.js"

import * as diff from "https://esm.sh/diff@5.1.0"

import { similarity,removeCommonSuffix } from "../tools.js"

const format = async (code)=>{
    return await run`black -c ${code} ${Stdout(returnAsString)}`
}

const standardize = async (code)=>{
    const { newCode, stackManager, varSelections } = autoRenameVars({
        code: await format(removeComments({code})),
        useGloballyUniqueNames: false,
        nameGenerator: (id)=>`var_${id}`,
    })
    return newCode
}

export async function compare(filePaths, certainty) {
    const fileContents = await Promise.all(
        filePaths.map(
            eachPath=>
                FileSystem.read(eachPath).then(async content=>{
                    if (!content) {
                        throw Error(`problem reading: ${eachPath}`)
                    }
                    content = await standardize(content)
                    const [ folders, itemName, itemExtensionWithDot ] = FileSystem.pathPieces(eachPath)
                    const path = `${folders.join("/")}/${itemName}.standardized${itemExtensionWithDot}`
                    await FileSystem.write({data: content, path})
                    return content
                })
        )
    )
    const documents = Object.fromEntries(zip(removeCommonSuffix(removeCommonPrefix(filePaths)), fileContents))
    return await similarity({documents,stabilityThreshold: certainty/100})
}